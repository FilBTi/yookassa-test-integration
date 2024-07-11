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

      const headers = {
        'Idempotence-Key': randomUUID(),
        'Content-Type': 'application/json',
      };

      const makeRequest = this.httpService.request({
        method,
        url,
        headers,
        data,
      });
      return await lastValueFrom(makeRequest);
    } catch(err) {
      console.log(err.message);
    }
  }

  async createPayment( { count, currency, type, fullName, number }: Payments) {
    try {
      const value = count.toFixed(2);

      const phone = `7${number}`;

      const payment_method_data = { type };

      const requestData = {
        amount: {
          value,
          currency,
        },
        payment_method_data,
        confirmation: {
          type: 'redirect',
          return_url: 'https://www.example.com/return_url'},
        receipt: {
          customer: {
            full_name: fullName,
            phone
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
      
      const { id, status, amount, confirmation } = data;

      return {
        id,
        status,
        amount,
        confirmation,
      };
    } catch(err) {
      console.log(err.message);
    }
  }
  

  async checkPayment(orderId: string) {
    try {
      const req = await this.createRequest(`${process.env.PAYMENTS_CHECK_URL}${orderId}`, 'get');
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
    } catch(err) {
      console.log(err.message);
    }
  }

  async createPayout({ count, currency, payout_token, order_id }: Payout) {
    try {
      const value = count.toFixed(2);

      const requestData = {
        amount: { value, currency },
        payout_token,
        description: `payout ${order_id}`,
        metadata: { order_id },
      };

      const result = await this.createRequest(
        process.env.PAYOUT_URL,
        'post',
        requestData,
      );
      const { data } = result;

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
      const req = await this.createRequest(`${process.env.PAYOUT_CHECK_URL}${orderId}`, 'get');
      const { data } = req;

      const {amount, status ,payout_destination_data} = data;

      return {
        orderId,
        status,
        amount,
        payout_destination_data
      };
    } catch(err) {
      console.log(err.message)
    }
  }
}
