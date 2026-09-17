import { TransactionEntity } from './transaction.entity.js';

export class PaginatedTransactionsEntity {
  data: TransactionEntity[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor(
    data: TransactionEntity[],
    total: number,
    page: number,
    limit: number,
  ) {
    this.data = data;
    this.meta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
