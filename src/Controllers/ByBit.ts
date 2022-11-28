import { Request, Response, Router } from 'express';
import { DynamoDB } from 'aws-sdk';
import { config } from '../config';
import axios from 'axios';

export class ByBit {
  public path = '/';
  public router = Router();

  constructor() {
    this.initRoutes();
  }

  private getDynamoDbClient(): DynamoDB.DocumentClient {
    if (config.NODE_ENV === 'dev') {
      return new DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000',
        accessKeyId: 'DEFAULT_ACCESS_KEY',
        secretAccessKey: 'DEFAULT_SECRET',
      });
    }

    return new DynamoDB.DocumentClient({
      region: config.REGION,
    });
  }

  public initRoutes() {
    this.router.post('/bybit', this.index);
    this.router.get('/bybit', this.index);
  }

  async index(req: Request, res: Response) {
    console.log(`Request: ${JSON.stringify(req.body, null, 2)}`);
    // console.log(`Env Variables: ${JSON.stringify(process.env, null, 2)}`);

    const input: any = req?.body || '{}';

    if (!input?.SYMBOL) {
      console.log('Cronjob trigger');
      return res.status(200).json({});
    }

    const SYMBOL = input?.SYMBOL || 'BTCUSD';
    const CATEGORY = input?.CATEGORY || 'inverse';
    const TRIGGER = input?.TRIGGER || 'N/A';
    const API_URL = `https://api.bybit.com/derivatives/v3/public/tickers?symbol=${SYMBOL}&category=${CATEGORY}`;

    const client = this.getDynamoDbClient();
    const date = new Date();
    const timestamp = Date.now();
    const apiRes: any = await axios.get(API_URL);

    const askPrice = apiRes.data.result.list[0].askPrice;
    const markPrice = apiRes.data.result.list[0].markPrice;

    const params = {
      TableName: `${config.TABLE_NAME}`,
      Item: {
        id: String(timestamp),
        date: String(date),
        timestamp: String(timestamp),
        askPrice: String(askPrice),
        markPrice: String(markPrice),
        symbol: String(SYMBOL),
        category: String(CATEGORY),
        trigger: String(TRIGGER),
      },
    };

    await client.put(params).promise();

    return res.status(200).json({});
  }
}