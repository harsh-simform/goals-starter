import { check } from 'express-validator';
import { compare } from 'bcrypt';

import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../services/auth.service';

const prisma = new PrismaClient();

export const authRules = {
  forSignup: [
    check('name')
      .isLength({ min: 2 })
      .withMessage('name must be at least 2 chars long'),
    check('email')
      .isEmail()
      .withMessage('Invalid email format!')
      .custom(async (email) => {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
          return Promise.reject(new Error('E-mail already in use!'));
        }
      }),
    check('password')
      .isLength({ min: 8 })
      .withMessage('password must be at least 8 chars long.')
      .matches(/\d/)
      .withMessage('password must contain a number!'),
  ],

  forLogin: [
    check('email')
      .isEmail()
      .withMessage('Invalid email format')
      .custom(async (email) => {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          return Promise.reject(new Error('E-mail already in use!'));
        }
      }),
    check('password').custom(async (password, { req }) => {
      const user = await prisma.user.findUnique({ where: { email: req.body.email } });
      const isMatched = await compare(password, user!.password);
      if (!isMatched) {
        return Promise.reject(new Error('Invalid email or password!'));
      }
    }),
  ],

  forRefreshToken: [
    check('refreshToken').custom(async (refreshToken, { req }) => {
      const hasAccess = await verifyToken(req, refreshToken);
      if (!hasAccess) {
        return Promise.reject(new Error('Invalid token provided!'));
      }
    }),
  ],
};
