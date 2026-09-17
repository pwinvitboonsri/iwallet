import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module.js';

// Minimal UUID v7 generator (timestamp-based, RFC 9562) — good enough for test fixtures.
function uuidv7(): string {
  const timestamp = BigInt(Date.now());
  const bytes = new Uint8Array(16);

  bytes[0] = Number((timestamp >> 40n) & 0xffn);
  bytes[1] = Number((timestamp >> 32n) & 0xffn);
  bytes[2] = Number((timestamp >> 24n) & 0xffn);
  bytes[3] = Number((timestamp >> 16n) & 0xffn);
  bytes[4] = Number((timestamp >> 8n) & 0xffn);
  bytes[5] = Number(timestamp & 0xffn);

  const rand = crypto.getRandomValues(new Uint8Array(10));
  bytes.set(rand, 6);

  bytes[6] = (bytes[6] & 0x0f) | 0x70; // version 7
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

describe('Wallets concurrency (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let initialBalance: number;

  const WITHDRAW_AMOUNT = 10;
  const CONCURRENT_REQUESTS = 50;
  // unique email per run so re-running the suite doesn't collide on "already exists"
  const testEmail = `concurrency-${Date.now()}@test.com`;
  const testPassword = 'password123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // register a fresh user + wallet just for this test
    await request(app.getHttpServer())
      .post('/users')
      .send({ email: testEmail, password: testPassword })
      .expect(201);

    // deposit enough to allow exactly 10 successful withdraws out of 50 attempts
    const loginRes = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: testEmail, password: testPassword })
      .expect(200);

    accessToken = loginRes.body.access_token;

    await request(app.getHttpServer())
      .post('/wallets/deposit')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ amount: WITHDRAW_AMOUNT * 10, idempotencyKey: uuidv7() })
      .expect(201);

    const walletRes = await request(app.getHttpServer())
      .get('/wallets/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    initialBalance = walletRes.body.balance;
  });

  afterAll(async () => {
    await app.close();
  });

  it('does not allow balance to go negative under concurrent withdrawals', async () => {
    const requests = Array.from({ length: CONCURRENT_REQUESTS }, (_, i) =>
      request(app.getHttpServer())
        .post('/wallets/withdraw')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: WITHDRAW_AMOUNT,
          // each concurrent request needs its OWN idempotency key —
          // otherwise they'd all be treated as retries of the same operation
          idempotencyKey: uuidv7(),
        }),
    );

    const results = await Promise.all(requests);

    const succeeded = results.filter((r) => r.status === 200 || r.status === 201);
    const failed = results.filter((r) => r.status >= 400);

    const walletRes = await request(app.getHttpServer())
      .get('/wallets/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const finalBalance = walletRes.body.balance;
    const actualSpend = initialBalance - finalBalance;
    const expectedSpend = succeeded.length * WITHDRAW_AMOUNT;

    console.log(`Initial balance: ${initialBalance}`);
    console.log(`Succeeded: ${succeeded.length}, Failed: ${failed.length}`);
    console.log(`Final balance: ${finalBalance}`);

    // the core assertion: balance must never go negative
    expect(finalBalance).toBeGreaterThanOrEqual(0);

    // the stronger assertion: spend must exactly match successful withdrawals
    // (catches lost updates / race conditions even if balance happens to stay >= 0)
    expect(actualSpend).toBe(expectedSpend);
  }, 30000);
});
