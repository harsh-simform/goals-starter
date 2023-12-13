import { Application, Router } from 'express';

import AuthController from '../../api/v1/auth/controllers/auth.controller';
import PostController from '../../api/v1/post/controllers/post.controller';
import HealthController from '../../api/health/health.controller';

const routesV1Api: [string, Router][] = [
  ['/api/health', HealthController],
  ['/api/v1/auth', AuthController],
  ['/api/v1/posts', PostController],
];

export default (app: Application) => {
  routesV1Api.forEach((route) => {
    const [url, controller] = route;

    app.use(url, controller);
  });
};
