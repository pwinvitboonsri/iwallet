-- This is an empty migration.
ALTER TABLE "Wallet" ADD CONSTRAINT "balance_non_negative" CHECK ("balance" >= 0);
ALTER TABLE "Transaction" ADD CONSTRAINT "amount_non_negative" CHECK ("amount" >= 0);
