import { Prisma } from '../../generated/prisma/client.js';

const checkTransaction = async <T>(
  client: Prisma.TransactionClient,
  where: Prisma.TransactionWhereUniqueInput,
  work: () => Promise<T>,
): Promise<T> => {
  const transaction = await client.transaction.findUnique({ where });
  if (transaction) return transaction as T;

  try {
    return work();
  } catch (e: any) {
    if (e.code === 'P2002') {
    return (await client.transaction.findUnique({ where })) as T;
  }
  throw e;
  }
};

export default checkTransaction;
