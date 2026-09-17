import { Injectable, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Status, TransactionType } from '../generated/prisma/enums.js';
import { paginate } from '../common/pagination/pagination.js';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getWallet(id: string) {
    return this.prisma.wallet.findUnique({ where: { id } });
  }

  async getTransactions(
    status: Status | undefined,
    type: TransactionType | undefined,
    page: number,
    limit: number,
  ) {
    const where = {
      ...(status && { status }),
      ...(type && { type }),
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
}
