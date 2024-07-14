import { Module } from '@nestjs/common';
import { MerchantController } from './merchant.controller';
import { MerchantService } from './merchant.service';
import { HttpModule } from '@nestjs/axios';
import { randomUUID } from 'crypto';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        headers: {          
          'Idempotence-Key': randomUUID(),
          'Content-Type': 'application/json',
        },
      }),
      inject: [MerchantService]
    })],
  controllers: [MerchantController],
  providers: [MerchantService],
})
export class MerchantModule {}
