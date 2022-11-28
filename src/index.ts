import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import { App } from './App';
import { config } from './config';
import { HealthCheck } from './Controllers/Healthcheck';
import { ByBit } from './Controllers/ByBit';

const { PORT } = config;

if (!PORT) {
  console.error('Error: A port must be provided');

  process.exit(1);
}

const middleWares = [helmet(), cors(), express.json()];

if (config.NODE_ENV === 'dev') {
  middleWares.push(morgan('dev'));
}

const app = new App({
  controllers: [new HealthCheck(), new ByBit()],
  middleWares,
  port: PORT,
});

app.listen();
