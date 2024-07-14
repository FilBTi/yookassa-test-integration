import { Module } from '@nestjs/common';
import { MerchantModule } from './merchant/merchant.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [MerchantModule, ConfigModule.forRoot({
    envFilePath: '.env'
    }),
    
  ],
})
export class AppModule {}
