import { Application, Router } from 'express';

import HealthController from '../../api/health/health.controller';
import { AuthController, PostController, ChatController, GroupController } from '../../api/v1/controllers';

const routesV1Api: [string, Router][] = [
  ['/api/health', HealthController],
  ['/api/v1/auth', AuthController],
  ['/api/v1/posts', PostController],
  ['/api/v1/chats', ChatController],
  ['/api/v1/groups', GroupController],
];

export default (app: Application) => {
  routesV1Api.forEach((route) => {
    const [url, controller] = route;

    app.use(url, controller);
  });
};
