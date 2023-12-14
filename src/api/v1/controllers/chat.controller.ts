import { validationResult } from 'express-validator';
import { NextFunction, Request, Response, Router } from 'express';
import { tokenGuard } from '../middlewares';
import { chatRules } from '../middlewares/chat.middleware';
import { failed, logger, prisma, succeeded } from '../../../common/helper';
import { HttpStatus } from '../../../common/constants';
import redisClient from '../../../common/helper/redis';

const ChatController: Router = Router();

ChatController.post(
  '/',
  tokenGuard(),
  chatRules.forCreateChat,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { text, sendTo } = req.body;
      const chat = await prisma.chat.create({
        include: {
          Receiver: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          Sender: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        data: {
          text: text?.trim(),
          Sender: {
            connect: {
              id: req.authUser.id,
            },
          },
          Receiver: {
            connect: {
              id: sendTo,
            },
          },
        },
      });
      return succeeded(res, HttpStatus.OK, 'Message sent.', { chat });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }
);

ChatController.get(
  '/',
  tokenGuard(),
  chatRules.forChatGet,
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
        JSON.stringify({ ...req.query, model: 'chat' })
      );
      if (checkCache) {
        logger.info('getting from the cache');
        const count = await prisma.chat.count({
          where: {
            OR: [
              {
                ...(search && {
                  text: {
                    contains: String(search),
                    mode: 'insensitive',
                  },
                }),
              },
              {
                senderId: req.authUser.id,
              },
              {
                receiverId: req.authUser.id,
              },
            ],
          },
        });
        return succeeded(res, HttpStatus.OK, 'Successful.', {
          posts: JSON.parse(checkCache),
          count,
        });
      }

      const count = await prisma.chat.count({
        where: {
          OR: [
            {
              ...(search && {
                text: {
                  contains: String(search),
                  mode: 'insensitive',
                },
              }),
            },
            {
              senderId: req.authUser.id,
            },
            {
              receiverId: req.authUser.id,
            },
          ],
        },
      });

      const chats = await prisma.chat.findMany({
        where: {
          OR: [
            {
              ...(search && {
                text: {
                  contains: String(search),
                  mode: 'insensitive',
                },
              }),
            },
            {
              senderId: req.authUser.id,
            },
            {
              receiverId: req.authUser.id,
            },
          ],
        },
        skip: Number(skip),
        take: Number(take),
      });

      if (!chats.length) {
        return failed(res, HttpStatus.FORBIDDEN, 'No chats are available');
      }

      await redisClient.setEx(
        JSON.stringify({ ...req.query, model: 'chat' }),
        3600,
        JSON.stringify(chats)
      );

      return succeeded(res, HttpStatus.OK, 'Successful.', { chats, count });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }
);

export default ChatController;
