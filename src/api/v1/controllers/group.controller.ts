import { NextFunction, Request, Response, Router } from 'express';
import { validationResult } from 'express-validator';
import { failed, logger, prisma, succeeded } from '../../../common/helper';
import { tokenGuard } from '../middlewares';
import { HttpStatus } from '../../../common/constants';
import redisClient from '../../../common/helper/redis';

const GroupController: Router = Router();

GroupController.post(
  '/',
  tokenGuard(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, userIds } = req.body;
      const group = await prisma.groups.create({
        data: {
          name: name?.trim(),
          CreatedBy: {
            connect: {
              id: req.authUser.id,
            },
          },
          Members: {
            connect: userIds?.map((userId: number) => ({ id: userId })),
          },
        },
      });
      return succeeded(res, HttpStatus.OK, 'Successful.', { group });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }
);

GroupController.get(
  '/',
  tokenGuard(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { skip, take, search } = req.query;
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return failed(
          res,
          HttpStatus.UNPROCESSABLE_ENTITY,
          errors.array()[0].msg
        );
      }
      const checkCache = await redisClient.get(
        JSON.stringify({ ...req.query, model: 'group' })
      );
      if (checkCache) {
        logger.info('getting from the cache');
        const count = await prisma.groups.count({
          where: {
            ...(search && {
              name: {
                contains: String(search),
                mode: 'insensitive',
              },
            }),
          },
        });
        return succeeded(res, HttpStatus.OK, 'Successful.', {
          posts: JSON.parse(checkCache),
          count,
        });
      }

      const count = await prisma.groups.count({
        where: {
          ...(search && {
            name: {
              contains: String(search),
              mode: 'insensitive',
            },
          }),
        },
      });

      const groups = await prisma.groups.findMany({
        where: {
          ...(search && {
            name: {
              contains: String(search),
              mode: 'insensitive',
            },
          }),
        },
        skip: Number(skip),
        take: Number(take),
      });

      if (!groups.length) {
        return failed(res, HttpStatus.FORBIDDEN, 'No groups are available');
      }

      await redisClient.setEx(
        JSON.stringify({ ...req.query, model: 'group' }),
        3600,
        JSON.stringify(groups)
      );

      return succeeded(res, HttpStatus.OK, 'Successful.', { groups, count });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }
);

export default GroupController;
