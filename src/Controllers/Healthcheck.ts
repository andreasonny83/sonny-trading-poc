import { Request, Response, Router } from 'express';

export class HealthCheck {
  public path = '/';
  public router = Router();

  constructor() {
    this.initRoutes();
  }

  public initRoutes() {
    this.router.get('/healthcheck', this.index);
  }

  index = (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
    });
  };
}
