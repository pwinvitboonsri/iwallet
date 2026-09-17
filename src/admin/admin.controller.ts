import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service.js';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard.js';
import { UserThrottlerGuard } from '../auth/guard/user-throttler.guard.js';
import { Role } from '../generated/prisma/enums.js';
import { Roles } from '../common/decorator/roles.decorator.js';
import { TransactionDto } from './dto/transaction.dto.js';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, UserThrottlerGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('wallets/:id')
  @ApiResponse({ status: 200, description: 'Wallet found.' })
  @ApiResponse({ status: 403, description: 'Admin role required.' })
  @ApiResponse({ status: 404, description: 'Wallet not found.' })
  async getWallet(@Param('id') id: string) {
    const result = await this.adminService.getWallet(id);

    return result;
  }

  @Get('transactions')
  @ApiResponse({ status: 200, description: 'Paginated, optionally filtered transaction list.' })
  @ApiResponse({ status: 403, description: 'Admin role required.' })
  async getTransaction(@Query() query: TransactionDto) {
    return this.adminService.getTransactions(
      query.status,
      query.type,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }
}
