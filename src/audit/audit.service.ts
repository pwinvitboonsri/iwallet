import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class AuditService {
  async log(
    tx: Prisma.TransactionClient,
    params: {
      actorUserId: string;
      action: string;
      metadata: Prisma.InputJsonValue;
    },
  ) {
    return tx.auditLog.create({
      data: {
        actorUser: {
          connect: {
            id: params.actorUserId,
          },
        },
        action: params.action,
        metadata: params.metadata,
      },
    });
  }
}
