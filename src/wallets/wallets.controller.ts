import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WalletsService } from './wallets.service.js';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard.js';
import { WalletEntity } from './entities/wallet.entity.js';
import { TransactionEntity } from './entities/transaction.entity.js';
import { TransactionDto } from './dto/transaction.dto.js';
import { DepositDto } from './dto/deposit.dto.js';
import { WithdrawDto } from './dto/withdraw.dto.js';
import { TransferDto } from './dto/transfer.dto.js';
import { Throttle } from '@nestjs/throttler';
import { UserThrottlerGuard } from '../auth/guard/user-throttler.guard.js';

@ApiTags('wallets')
@ApiBearerAuth('access-token')
@Controller('wallets')
@UseGuards(JwtAuthGuard, UserThrottlerGuard)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get('me')
  @ApiResponse({ status: 200, description: "The logged-in user's wallet.", type: WalletEntity })
  async getMyWallet(@Req() req: any) {
    const wallet = await this.walletsService.findByUserId(req.user.id);
    return new WalletEntity(wallet);
  }

  @Get('me/transaction')
  @ApiResponse({ status: 200, description: "Paginated transaction history for the logged-in user's wallet." })
  async getMyTransaction(@Req() req: any, @Query() query: TransactionDto) {
    const result = await this.walletsService.findMyTransaction(
      req.user.id,
      query.page ? query.page : 1,
      query.limit ? query.limit : 20,
    );

    return {
      ...result,
      data: result.data.map((t) => new TransactionEntity(t)),
    };
  }

  @Post('deposit')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiResponse({ status: 201, description: 'Deposit completed.', type: TransactionEntity })
  @ApiResponse({ status: 429, description: 'Too many requests.' })
  async deposit(@Req() req: any, @Body() dto: DepositDto) {
    const result = await this.walletsService.deposit(
      req.user.id,
      dto,
      dto.idempotencyKey,
    );

    return new TransactionEntity(result);
  }

  @Post('withdraw')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiResponse({ status: 201, description: 'Withdrawal completed.', type: TransactionEntity })
  @ApiResponse({ status: 400, description: 'Insufficient balance.' })
  @ApiResponse({ status: 429, description: 'Too many requests.' })
  async withdraw(@Req() req: any, @Body() dto: WithdrawDto) {
    const result = await this.walletsService.withdraw(
      req.user.id,
      dto,
      dto.idempotencyKey
    )

    return new TransactionEntity(result)
  }

  @Post('transfer')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiResponse({ status: 201, description: 'Transfer completed.', type: TransactionEntity })
  @ApiResponse({ status: 400, description: 'Insufficient balance or invalid recipient.' })
  @ApiResponse({ status: 429, description: 'Too many requests.' })
  async transfer(@Req() req: any, @Body() dto: TransferDto) {
    const result = await this.walletsService.transfer(
      req.user.id,
      dto,
      dto.idempotencyKey,
    );

    return new TransactionEntity(result)
  }
}
