import { config as dotEnvConfig } from 'dotenv';

dotEnvConfig();

const PORT = Number(process.env.PORT || 8080);
const NODE_ENV = process.env.NODE_ENV;
const TABLE_NAME = process.env.TABLE_NAME;
const REGION = process.env.REGION;

export const config = {
  PORT,
  NODE_ENV,
  TABLE_NAME,
  REGION,
};
