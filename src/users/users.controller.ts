import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { RegisterEntity } from './entities/register.entity.js';
import { LoginDto } from './dto/login.dto.js';
import { LoginResponseEntity } from './entities/login-response.entity.js';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'User registered, with a wallet created automatically.', type: RegisterEntity })
  @ApiResponse({ status: 409, description: 'Email already registered.' })
  async create(@Body() createUserDto: RegisterDto) {
    const user = await this.usersService.create(createUserDto)
    return new RegisterEntity(user)
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'User found.', type: RegisterEntity })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return new RegisterEntity(user);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Login successful, returns a JWT.', type: LoginResponseEntity })
  @ApiResponse({ status: 401, description: 'Invalid email or password.' })
  async login(@Body() dto: LoginDto) {
    return this.usersService.login(dto)
  }
}
