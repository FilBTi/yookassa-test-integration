import { Module } from '@nestjs/common';
import { MerchantController } from './app.controller';
import { MerchantService } from './app.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [MerchantController],
  providers: [MerchantService],
})
export class AppModule {}
