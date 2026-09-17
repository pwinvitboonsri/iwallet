import { IsInt, IsNotEmpty, IsPositive, IsUUID } from "class-validator";

export class DepositDto {
    /**
     * Amount to deposit, in the smallest currency unit (integer, no decimals).
     * @example 1000
     */
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    amount: number

    /**
     * Client-generated UUID v7 used to make retries of this request safe.
     * Sending the same key again returns the original transaction instead of depositing twice.
     * @example "018f2f6c-1a2b-7c3d-9e4f-5a6b7c8d9e0f"
     */
    @IsNotEmpty()
    @IsUUID(7)
    idempotencyKey: string
}
