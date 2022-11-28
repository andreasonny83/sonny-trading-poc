import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import { App } from './App';
import { config } from './config';
import { HealthCheck } from './Controllers/Healthcheck';

const { PORT } = config;

if (!PORT) {
  console.error('Error: A port must be provided');

  process.exit(1);
}

const middleWares = [helmet(), cors(), morgan('dev'), express.json()];

if (config.NODE_ENV === 'development') {
  middleWares.push(morgan('dev'));
}

const app = new App({
  controllers: [new HealthCheck()],
  middleWares: [helmet(), cors(), morgan('dev'), express.json()],
  port: PORT,
});

app.listen();
