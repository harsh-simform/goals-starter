import { User } from '@prisma/client';
import { Socket } from 'socket.io';
import server from './app';

const port = process.env.PORT;

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
      io: Socket;
    }
    export interface Response {
      authUser: User;
    }
  }
}
