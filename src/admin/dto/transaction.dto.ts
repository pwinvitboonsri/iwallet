import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Status, TransactionType } from '../../generated/prisma/enums.js';

export class TransactionDto {
  /**
   * Filter by transaction status. Omit to include all statuses.
   * @example "COMPLETED"
   */
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  /**
   * Filter by transaction type. Omit to include all types.
   * @example "DEPOSIT"
   */
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  /**
   * Page number to fetch, starting at 1.
   * @example 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  /**
   * Number of transactions per page (max 100).
   * @example 20
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
