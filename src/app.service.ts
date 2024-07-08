import { Injectable } from '@nestjs/common';
import { iPayments } from './interfaces/ipayments';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { iPayout } from './interfaces/ipayout';

@Injectable()
export class MerchantService {
  constructor(private readonly httpService: HttpService) {}

  async CreateRequest(url: string, method: string, data?: any, headers?: any) {
    try {
      if (method === 'get') {
        const makeRequest = this.httpService.request({
          method,
          url,
        });
        const result = await lastValueFrom(makeRequest);
        return result;
      }

      const makeRequest = this.httpService.request({
        method,
        url,
        headers,
        data,
      });
      const result = await lastValueFrom(makeRequest);
      return result;
    } catch {
      console.log(Error);
      throw { Error };
    }
  }

  async CreatePayment(payments: iPayments) {
    try {
      const { value, currency, type } = payments;

      const amount = {
        value,
        currency,
      };

      const payment_method_data = { type };

      const url = 'https://api.yookassa.ru/v3/payments';

      const redirectConf = {
        type: 'redirect',
        return_url: 'https://www.example.com/return_url',
      };
      const description = `This payment in ${amount.value} ${amount.currency}`;

      const requestData = {
        amount,
        payment_method_data,
        confirmation: redirectConf,
        description,
      };

      const requestHeader = {
        'Idempotence-Key': 'Key_for_test',
        'Content-Type': 'application/json',
      };

      const req = await this.CreateRequest(
        url,
        'post',
        requestData,
        requestHeader,
      );
      const { data } = req;

      if (!data) {
        throw { message: 'No data' };
      }

      const { id, status, confirmation } = data;

      return {
        id,
        status,
        amount,
        type,
        confirmation,
      };
    } catch {
      return Error;
    }
  }

  async CheckPayment(orderId: string) {
    try {
      const url = `https://api.yookassa.ru/v3/payments/${orderId}`;
      const req = await this.CreateRequest(url, 'get');
      const { data } = req;

      if (!data) {
        throw { message: 'No data' };
      }

      const { status, amount } = data;

      return {
        orderId,
        status,
        amount,
      };
    } catch {
      console.log(Error);
      return Error;
    }
  }

  async CreatePayout(payout: iPayout) {
    try {
      const { value, currency, payout_token, order_id } = payout;

      const url = 'https://api.yookassa.ru/v3/payouts';

      const amount = { value, currency };
      const description = `payout ${order_id}`;

      const requestData = {
        amount,
        payout_token,
        description,
        metadata: { order_id },
      };

      const requestHeader = {
        'Idempotence-Key': 'key_for_test',
        'Content-Type': 'application/json',
      };

      const result = await this.CreateRequest(
        url,
        'post',
        requestData,
        requestHeader,
      );
      const { data } = result;

      if (!data) {
        throw Error;
      }

      const { id, status } = data;

      return {
        id,
        status,
        amount,
      };
    } catch {
      return Error;
    }
  }

  async CheckPayout(orderId: string) {
    try {
      const url = `https://api.yookassa.ru/v3/payouts/${orderId}`;
      const req = await this.CreateRequest(url, 'get');
      const { data } = req;

      const { status, amount } = data;

      return {
        orderId,
        status,
        amount,
      };
    } catch {
      return Error;
    }
  }
}
