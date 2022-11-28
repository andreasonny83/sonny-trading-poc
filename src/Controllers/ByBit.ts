import { Request, Response, Router } from 'express';
import { DynamoDB } from 'aws-sdk';
import { config } from '../config';
import axios from 'axios';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'verbose',
  format: winston.format.simple(),
  defaultMeta: { service: 'sonny-trading-service' },
  transports: [
    new winston.transports.File({
      filename: 'debug.log',
      maxsize: 10000000,
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export class ByBit {
  public path = '/';
  public router = Router();

  constructor() {
    this.initRoutes();
  }

  public initRoutes() {
    this.router.post('/bybit', this.index);
  }

  async index(req: Request, res: Response) {
    logger.info(`Request: ${JSON.stringify(req.body, null, 2)}`);
    // logger.info(`Env Variables: ${JSON.stringify(process.env, null, 2)}`);

    const input: any = req?.body || '{}';

    if (!input?.SYMBOL) {
      logger.error('Missing required parameter: SYMBOL');
      return res.status(400).json({});
    }

    const SYMBOL = input?.SYMBOL || 'BTCUSD';
    const CATEGORY = input?.CATEGORY || 'inverse';
    const TRIGGER = input?.TRIGGER || 'N/A';
    const API_URL = `https://api.bybit.com/derivatives/v3/public/tickers?symbol=${SYMBOL}&category=${CATEGORY}`;

    const client = new DynamoDB.DocumentClient({
      region: config.REGION,
    });

    const date = new Date();
    const timestamp = Date.now();
    let apiRes: any = {};

    try {
      apiRes = await axios.get(API_URL);
      logger.info('API response', apiRes.data);
      if (apiRes.data.retMsg !== 'OK') {
        throw new Error('Invalid request');
      }
    } catch (err) {
      logger.error(err);
      return res.status(400).json({});
    }

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

    logger.info(`Params: ${JSON.stringify(params, null, 2)}`);
    try {
      await client.put(params).promise();
    } catch (err) {
      logger.error(err);
      return res.status(400).json({});
    }

    return res.status(200).json({});
  }
}
