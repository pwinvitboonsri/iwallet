import { NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';

const getWallet = async (
  client: Prisma.TransactionClient | PrismaService,
  where: Prisma.WalletWhereUniqueInput,
) => {
  const wallet = await client.wallet.findUnique({ where });
  if (!wallet) throw new NotFoundException('Wallet not found');

  return wallet;
};

export default getWallet