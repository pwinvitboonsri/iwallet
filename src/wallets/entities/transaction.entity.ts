import { Status, TransactionType } from "../../generated/prisma/enums.js"

export class TransactionEntity {
    /**
     * Transaction ID.
     * @example "018f2f6a-2b3c-7d4e-8f5a-1b2c3d4e5f60"
     */
    id: string

    /**
     * Kind of transaction.
     * @example "TRANSFER"
     */
    type: TransactionType

    /**
     * Amount moved, in the smallest currency unit.
     * @example 500
     */
    amount: number

    /**
     * Source wallet ID. Null for deposits.
     * @example "018f2f5a-3b4c-7d5e-8f6a-1b2c3d4e5f60"
     */
    fromWalletId: string | null

    /**
     * Destination wallet ID. Null for withdrawals.
     * @example "018f2f5a-4c5d-7e6f-8a7b-2c3d4e5f6071"
     */
    toWalletId: string | null

    /**
     * Final state of the transaction.
     * @example "COMPLETED"
     */
    status: Status

    /**
     * When the transaction was recorded.
     * @example "2026-09-16T03:36:02.810Z"
     */
    createAt: Date

    constructor(partial: Partial<TransactionEntity>) {
        Object.assign(this, partial)
    }
}
