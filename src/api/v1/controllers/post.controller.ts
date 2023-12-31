import { Request, Response, NextFunction, Router } from 'express';
import { validationResult, matchedData } from 'express-validator';

import { Post } from '@prisma/client';
import { HttpStatus } from '../../../common/constants';
import { logger, succeeded, failed } from '../../../common/helper';
import { tokenGuard } from '../middlewares/auth.middleware';
import { createNewPost } from '../services/post.service';
import redisClient from '../../../common/helper/redis';
import { prisma } from '../../../common/helper/utils';

const PostController: Router = Router();

PostController.get(
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
        JSON.stringify({ ...req.query, model: 'post' })
      );
      if (checkCache) {
        logger.info('getting from the cache');
        const count = await prisma.post.count({
          where: {
            ...(search && {
              content: {
                contains: String(search),
                mode: 'insensitive',
              },
            }),
            ...(search && {
              title: {
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

      const count = await prisma.post.count({
        where: {
          ...(search && {
            content: {
              contains: String(search),
              mode: 'insensitive',
            },
          }),
          ...(search && {
            title: {
              contains: String(search),
              mode: 'insensitive',
            },
          }),
        },
      });

      const posts = await prisma.post.findMany({
        where: {
          ...(search && {
            content: {
              contains: String(search),
              mode: 'insensitive',
            },
          }),
          ...(search && {
            title: {
              contains: String(search),
              mode: 'insensitive',
            },
          }),
        },
        skip: Number(skip),
        take: Number(take),
      });

      if (!posts.length) {
        return failed(res, HttpStatus.FORBIDDEN, 'No posts are available');
      }

      await redisClient.setEx(
        JSON.stringify({ ...req.query, model: 'post' }),
        3600,
        JSON.stringify(posts)
      );

      return succeeded(res, HttpStatus.OK, 'Successful.', { posts, count });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }
);

/**
 * Create New Post
 */
PostController.post(
  '/',
  tokenGuard(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return failed(
          res,
          HttpStatus.UNPROCESSABLE_ENTITY,
          errors.array()[0].msg
        );
      }

      const payload = matchedData(req, {
        includeOptionals: false,
      }) as Post;
      const post = (await createNewPost({
        ...payload,
        authorId: req.authUser.id,
      })) as Post;

      return succeeded(
        res,
        HttpStatus.CREATED,
        'Post Created Successfully.',
        post
      );
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }
);

export default PostController;
