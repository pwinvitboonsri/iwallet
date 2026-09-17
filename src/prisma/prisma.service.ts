import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const adapter = new PrismaPg({ connectionString });
    super({ adapter });
  }

  async onModuleInit() {
      console.log(`🔑 Try to connect DB`)
      try {
        await this.$connect()
        console.log(`🔑 DB connected successfully`)
      } catch (err) {
        console.error(`☠️🔑 DB Failed to connect`)
        throw err
      }
  }

  async onModuleDestroy() {
      console.log(`🔐 Try to disconnect DB`)
      try {
        await this.$disconnect()
        console.log(`🔐 DB disconnected successfully`)
      } catch (err) {
        console.error(`☠️🔐 DB Failed to disconnect`)
        throw err
      }
  }
}
