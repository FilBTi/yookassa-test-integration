import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Param,
  Get,
} from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { PaymentDto } from './types/dto/payments.dto';
import { Response } from 'express';
import { CreateWithdrawal } from './types/dto/withdrawal.dto';

@Controller()
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Post('/payments')
  async sendPayment(@Body() createPayment: PaymentDto, @Res() res: Response) {
    try {
      const {confirmation} = await this.merchantService.createPayment(createPayment);
      res.status(HttpStatus.OK).redirect(confirmation.confirmation_url);
    } catch {
      res.status(HttpStatus.METHOD_NOT_ALLOWED).send(Error);
    }
  }

  @Post('/withdrawal')
  async handelWithdrawal(
    @Body() createWithdrawal: CreateWithdrawal,
    @Res() res: Response,
  ) {
    try {
      const result = await this.merchantService.createPayout(createWithdrawal);
      res.status(HttpStatus.CREATED).send(result);
    } catch {
      res.status(HttpStatus.BAD_REQUEST).send(Error);
    }
  }

  @Get('/payments/:id')
  async checkPayStatus(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.merchantService.checkPayment(id);
      res.status(HttpStatus.OK).send(result);
    } catch {
      res.status(HttpStatus.NOT_FOUND).send(Error);
    }
  }

  @Get('/withdrawal/:id')
  async checkWithdrawalStatus(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.merchantService.checkPayout(id);
      res.status(HttpStatus.OK).send(result);
    } catch {
      res.status(HttpStatus.NOT_FOUND).send(Error);
    }
  }
}
