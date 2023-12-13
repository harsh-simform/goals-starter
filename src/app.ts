/* eslint-disable import/first */
import express, { Application, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import routes from './common/routes';
import { HttpStatus } from './common/constants';
import { logger, failed } from './common/helper';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: 'Too many requests from your IP, please try again after a minute',
});

// Boot express
const app: Application = express();

// Initialize Middleware //
// Setup API logs
app.use(morgan('combined'));
// Setup common security protection
app.use(helmet());
// Setup Cross Origin access
app.use(cors());
// Set requests rate limit
app.use(limiter);
// Setup requests format parsing (Only JSON requests will be valid)
app.use(express.urlencoded({ limit: '1gb', extended: true }));
app.use(express.json());

// Application routing
routes(app);

// Error Handlers
app.use((req: Request, res: Response, next: NextFunction) => {
  const error: any = new Error(`${req.originalUrl} not found.`);

  error.statusCode = HttpStatus.NOT_FOUND;
  next(error);
});
// eslint-disable-next-line no-unused-vars
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(error);
  return failed(res, error.statusCode, error.message, error.data);
});

export default app;
