import { config as dotEnvConfig } from 'dotenv';

dotEnvConfig();

const PORT = Number(process.env.PORT || 8080);
const NODE_ENV = process.env.NODE_ENV;

export const config = {
  PORT,
  NODE_ENV,
};
