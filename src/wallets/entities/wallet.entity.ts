export class WalletEntity {
    /**
     * Wallet ID.
     * @example "018f2f5a-3b4c-7d5e-8f6a-1b2c3d4e5f60"
     */
    id: string

    /**
     * Current balance, in the smallest currency unit.
     * @example 1500
     */
    balance: number

    /**
     * ID of the user who owns this wallet.
     * @example "018f2f5a-1a2b-7c3d-9e4f-5a6b7c8d9e0f"
     */
    userId: string

    /**
     * When the wallet was created.
     * @example "2026-09-16T03:36:02.810Z"
     */
    createAt: Date

    constructor(partial: Partial<WalletEntity>) {
    Object.assign(this, partial);
  }
}
