import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { paginate } from '../common/pagination/pagination.js';
import { DepositDto } from './dto/deposit.dto.js';
import { AuditService } from '../audit/audit.service.js';
import { WithdrawDto } from './dto/withdraw.dto.js';
import { TransferDto } from './dto/transfer.dto.js';
import getWallet from './function/getWallet.js';
import checkTransaction from './function/checkTransaction.js';

@Injectable()
export class WalletsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findByUserId(id: string) {
    const wallet = await getWallet(this.prisma, { userId: id });

    return {
      id: wallet.id,
      balance: wallet.balance,
      userId: wallet.userId,
      createdAt: wallet.createAt,
    };
  }

  async findMyTransaction(userId: string, page: number, limit: number) {
    const wallet = await getWallet(this.prisma, { userId });

    const where = {
      OR: [{ fromWalletId: wallet.id }, { toWalletId: wallet.id }],
    };

    return paginate(
      () =>
        this.prisma.transaction.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createAt: 'desc' },
        }),
      () => this.prisma.transaction.count({ where }),
      page,
      limit,
    );
  }

  async deposit(userId: string, dto: DepositDto, idempotencyKey: string) {
    return this.prisma.$transaction(async (tx) =>
      checkTransaction(tx, { idempotencyKey }, async () => {
        const wallet = await getWallet(tx, { userId });

        const updatedWallet = await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: { increment: dto.amount } },
        });

        const transaction = await tx.transaction.create({
          data: {
            type: 'DEPOSIT',
            amount: dto.amount,
            toWalletId: wallet.id,
            status: 'COMPLETED',
            idempotencyKey,
          },
        });

        await this.auditService.log(tx, {
          actorUserId: userId,
          action: 'DEPOSIT',
          metadata: {
            walletId: wallet.id,
            amount: dto.amount,
            newBalance: updatedWallet.balance,
            transactionId: transaction.id,
          },
        });

        return transaction;
      }),
    );
  }

  async withdraw(userId: string, dto: WithdrawDto, idempotencyKey: string) {
    return this.prisma.$transaction(async (tx) => {
      return checkTransaction(tx, { idempotencyKey }, async () => {
        const wallet = await getWallet(tx, { userId });

        if (wallet.balance < dto.amount) throw new BadRequestException('Balance not enough')

        const updatedWallet = await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: {
              decrement: dto.amount,
            },
          },
        });

        const transaction = await tx.transaction.create({
          data: {
            type: 'WITHDRAW',
            amount: dto.amount,
            fromWalletId: wallet.id,
            status: 'COMPLETED',
            idempotencyKey,
          },
        });

        await this.auditService.log(tx, {
          actorUserId: userId,
          action: 'WITHDRAW',
          metadata: {
            walletId: wallet.id,
            amount: dto.amount,
            newBalance: updatedWallet.balance,
            transactionId: transaction.id,
          },
        });

        return transaction;
      });
    });
  }

  async transfer(userId: string, dto: TransferDto, idempotencyKey: string) {
    return this.prisma.$transaction(async (tx) => {
      return checkTransaction(tx, { idempotencyKey }, async () => {
        const fromWallet = await getWallet(tx, { userId });
        const toWallet = await getWallet(tx, { id: dto.toWalletId });

        if (fromWallet.balance < dto.amount) throw new BadRequestException('Balance not enough')

        const updatedFromWallet = await tx.wallet.update({
          where: { id: fromWallet.id },
          data: {
            balance: {
              decrement: dto.amount,
            },
          },
        });

        const updatedToWallet = await tx.wallet.update({
          where: { id: toWallet.id },
          data: {
            balance: {
              increment: dto.amount,
            },
          },
        });

        const transaction = await tx.transaction.create({
          data: {
            type: 'TRANSFER',
            amount: dto.amount,
            fromWalletId: fromWallet.id,
            toWalletId: toWallet.id,
            status: 'COMPLETED',
            idempotencyKey,
          },
        });

        await this.auditService.log(tx, {
          actorUserId: userId,
          action: 'TRANSFER',
          metadata: {
            fromWalletId: fromWallet.id,
            toWalletId: toWallet.id,
            amount: dto.amount,
            fromNewBalance: updatedFromWallet.balance,
            toNewBalance: updatedToWallet.balance,
            transactionId: transaction.id,
          },
        });

        return transaction;
      });
    });
  }
}
