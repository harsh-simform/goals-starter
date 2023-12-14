/* eslint-disable import/no-unresolved */
/* eslint-disable import/first */
import express, { Application, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { Server } from 'socket.io';
import { createServer } from 'http';
import { createAdapter } from '@socket.io/redis-adapter';
import { createOrReturnRoom } from './api/v1/services/chat.service';
import routes from './common/routes';
import { logger, failed } from './common/helper';
import redisClient from './common/helper/redis';
import { HttpStatus } from './common/constants';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: 'Too many requests from your IP, please try again after a minute',
});

// Boot express
const app: Application = express();

const server = createServer(app);

const io = new Server(server);

const redisAdapter = createAdapter(redisClient, redisClient.duplicate());

io.adapter(redisAdapter);

// Socket.IO event handling
io.on('connection', (socket) => {
  logger.info(`${socket.id} -- connected!`);

  socket.on('create-new-chat', async (data: { userIds: number[] }) => {
    const room = await createOrReturnRoom(data.userIds);
    socket.join(room.name);
    socket.emit('new-chat-response', room.name);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    logger.info(`${socket.id} -- disconnected!`);
  });
});

// Initialize Middleware //
app.set('io', io);
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

export default server;
