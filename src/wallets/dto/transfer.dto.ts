import { IsInt, IsNotEmpty, IsPositive, IsUUID } from "class-validator"

export class TransferDto {
    /**
     * Amount to transfer, in the smallest currency unit (integer, no decimals).
     * @example 500
     */
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    amount: number

    /**
     * Client-generated UUID v7 used to make retries of this request safe.
     * Sending the same key again returns the original transaction instead of transferring twice.
     * @example "018f2f6c-1a2b-7c3d-9e4f-5a6b7c8d9e0f"
     */
    @IsNotEmpty()
    @IsUUID(7)
    idempotencyKey: string

    /**
     * Wallet ID of the recipient.
     * @example "018f2f5a-3b4c-7d5e-8f6a-1b2c3d4e5f60"
     */
    @IsNotEmpty()
    @IsUUID(7)
    toWalletId: string
}
