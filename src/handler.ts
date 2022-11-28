import { Handler, APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import axios from 'axios';

const TABLE_NAME = process.env.TABLE_NAME;
const REGION = process.env.REGION;
const NODE_ENV = process.env.NODE_ENV;

const getDynamoDbClient = (): DynamoDB.DocumentClient => {
  if (NODE_ENV === 'dev') {
    return new DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000',
      accessKeyId: 'DEFAULT_ACCESS_KEY',
      secretAccessKey: 'DEFAULT_SECRET',
    });
  }

  return new DynamoDB.DocumentClient({
    region: REGION,
  });
};

export const run: Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2> = async (event, context) => {
  // console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  // console.log(`Context: ${JSON.stringify(context, null, 2)}`);
  // console.log(`Env Variables: ${JSON.stringify(process.env, null, 2)}`);

  const input = JSON.parse(event?.body || '{}');

  if (!input?.SYMBOL) {
    console.log('Cronjob trigger');
    return {
      body: '',
      statusCode: 200,
    };
  }

  const SYMBOL = input?.SYMBOL || 'BTCUSD';
  const CATEGORY = input?.CATEGORY || 'inverse';
  const TRIGGER = input?.TRIGGER || 'N/A';
  const API_URL = `https://api.bybit.com/derivatives/v3/public/tickers?symbol=${SYMBOL}&category=${CATEGORY}`;

  const client = getDynamoDbClient();
  const date = new Date();
  const timestamp = Date.now();
  const apiRes: any = await axios.get(API_URL);

  const askPrice = apiRes.data.result.list[0].askPrice;
  const markPrice = apiRes.data.result.list[0].markPrice;

  const params = {
    TableName: TABLE_NAME,
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

  const response = {
    body: '',
    statusCode: 200,
  };

  return response;
};
