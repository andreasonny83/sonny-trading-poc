import express, { Application } from 'express';

interface AppInit {
  /**
   * The port where your application will listen
   *
   * Example:
   *
   *    port: 3000
   *
   */
  port: number;

  /**
   * Define a list of Express middlewares
   *
   * Example:
   *
   *    middleWares: [
   *      helmet(),
   *      cors(),
   *      morgan("dev"),
   *      express.json(),
   *     ]
   *
   */
  middleWares: any[];

  /**
   * Define a list of Express controllers
   *
   * Example:
   *
   *    controllers: [
   *      new HomeController(),
   *      new HealthCheckController()
   *     ]
   *
   */
  controllers: any[];
}

export class App {
  public app: Application;
  public port: number;

  constructor(appInit: AppInit) {
    this.app = express();
    this.port = appInit.port;

    this.middleWares(appInit.middleWares);
    this.routes(appInit.controllers);
  }

  private middleWares(middleWares: any[]): void {
    middleWares.forEach((middleWare) => {
      this.app.use(middleWare);
    });
  }

  private routes(controllers: any[]): void {
    controllers.forEach((controller) => {
      this.app.use('/', controller.router);
    });
  }

  public listen(): void {
    this.app.listen(this.port, (error?: any) => {
      if (error) {
        return console.error(error);
      }

      console.log(`\n⚡️ Server started at http://localhost:${this.port} in "%s" mode`, this.app.get('env'));
      console.log('   Press CTRL-C to stop\n');
    });
  }
}
