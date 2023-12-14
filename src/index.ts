import { createServer } from 'http';
import { Server } from 'socket.io';
import { User } from '@prisma/client';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import app from './app';
import { logger } from './common/helper';

const port = process.env.PORT;

const server = createServer(app);
const io = new Server(server);

io.on('connnection', (socket) => {
  logger.info('a user connected!', socket);
  socket.on('disconnect', () => {
    logger.info('user disconnected');
  });
});

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
  io.listen(3000);
});

// Start server
server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`**** Server is listening on port ${port} ****`);
});

declare global {
  // eslint-disable-next-line no-unused-vars
  namespace Express {
    export interface Request {
      authUser: User;
    }
    export interface Response {
      authUser: User;
    }
  }
}
