import { Injectable } from '@nestjs/common';
import { Payments } from './types/interfaces/payments.interface';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Payout } from './types/interfaces/payout.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class MerchantService {
  constructor(private readonly httpService: HttpService) {}

  async createRequest(url: string, method: string, data?: Record<string, unknown>) {
    try {

      const makeRequest = this.httpService.request({
        method,
        url,
        // headers,
        data,
      });
      return await lastValueFrom(makeRequest);
    } catch(err) {
      console.log(err.message);
    }
  }

  async createPayment( { count, currency, type, fullName, number }: Payments) {
      const value = count.toFixed(2);

      const amount = {
        value,
        currency,
      };

      const requestData = {
        amount,
        payment_method_data: { type },
        confirmation: {
          type: 'redirect',
          return_url: 'https://www.example.com/return_url'},
        receipt: {
          customer: {
            full_name: fullName,
            phone: `7${number}`
          }
        },
        items: [
            {
              "description": "Пополнение",
              "quantity": "1.00",
              amount: {
                value,
                currency,
              },
              "vat_code": "2",
              "payment_mode": "full_prepayment",
              "payment_subject": "commodity"
            }
          ]
      };

      const req = await this.createRequest(
        process.env.PAYMENTS_URL,
        'post',
        requestData
      );

      const { data } = req;

      if (!data) {
        throw new Error('No data');
      }
      
      const { id, status, confirmation } = data;

      return {
        id,
        status,
        amount,
        confirmation,
      };
  }
  

  async checkPayment(orderId: string) {
    try {
      const { data } = await this.createRequest(`${process.env.PAYMENTS_CHECK_URL}${orderId}`, 'get');

      if (!data) {
        throw { message: 'No data' };
      }

      const { status, amount } = data;

      return {
        orderId,
        status,
        amount,
      };
    } catch(err) {
      console.log(err.message);
    }
  }

  async createPayout({ count, currency, payoutToken, orderId }: Payout) {
    try {
      const value = count.toFixed(2);

      const requestData = {
        amount: { value, currency },
        payoutToken,
        description: `payout ${orderId}`,
        metadata: { orderId },
      };

      const { data } = await this.createRequest(
        process.env.PAYOUT_URL,
        'post',
        requestData,
      );

      if (!data) {
        throw Error;
      }

      const { id, status, amount } = data;

      return {
        id,
        status,
        amount,
      };
    } catch(err) {
      console.log(err.message)
    }
  }

  async checkPayout(orderId: string) {
    try {
      const { data } = await this.createRequest(`${process.env.PAYOUT_CHECK_URL}${orderId}`, 'get');

      const {amount, status ,payoutDestinationData} = data;

      return {
        orderId,
        status,
        amount,
        payoutDestinationData
      };
    } catch(err) {
      console.log(err.message)
    }
  }
}
