import { NextFunction, Request, Response, Router } from 'express';
import { HttpStatus } from '../../common/constants';
import { succeeded } from '../../common/helper';

const HealthController: Router = Router();

HealthController.get(
  '/',
  async (_req: Request, res: Response, _next: NextFunction) => {
    return succeeded(res, HttpStatus.OK, 'Ping.', {
      state: 'up',
    });
  }
);

export default HealthController;
