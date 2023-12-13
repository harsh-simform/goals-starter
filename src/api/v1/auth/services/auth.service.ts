import { sign, verify } from 'jsonwebtoken';
import { Request } from 'express';

import { PrismaClient, User } from '@prisma/client';

const jwtSecret = process.env?.JWT_SECRET as string;

const prisma = new PrismaClient();

/**
 * Create Access Token
 * @param param0 Data to sign
 */
export const signAccessToken = async ({
  id,
  email,
}: {
  id: number;
  email: string;
}): Promise<string> => {
  return sign({ id, email }, jwtSecret, {
    expiresIn: '1h',
  });
};

/**
 * Create Refresh Token
 * @param param0 Data to sign
 */
export const signRefreshToken = async ({
  id,
  email,
}: {
  id: number;
  email: string;
}): Promise<string> => {
  return sign({ id, email }, jwtSecret, {
    expiresIn: '30d',
  });
};

/**
 * User Login
 * @param param0 User's Email Id
 */
export const login = async ({
  email,
}: User): Promise<{
  user: User | null;
  accessToken: string;
  refreshToken: string;
}> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  const accessToken = await signAccessToken({
    id: user!.id,
    email: user!.email,
  });
  const refreshToken = await signRefreshToken({
    id: user!.id,
    email: user!.email,
  });

  return { user, accessToken, refreshToken };
};

/**
 * Verify JWT Token
 * @param req
 * @param token JWT token
 */
export const verifyToken = async (
  req: any,
  token: string
): Promise<boolean> => {
  return new Promise((resolve) => {
    verify(
      token,
      jwtSecret,
      async (err, decoded: { id?: number; email?: string } | undefined) => {
        if (err) {
          return resolve(false);
        }
        if (typeof decoded!.id === 'number') {
          req.authUser = decoded;
        }

        return resolve(true);
      }
    );
  }) as Promise<boolean>;
};

/**
 * Reissue The Tokens When The Access Token Expires
 * @param req
 */
export const reIssueTokens = async (
  req: Request
): Promise<{ accessToken: string; refreshToken: string }> => {
  const user = req.authUser;
  const accessToken = await signAccessToken({
    id: user!.id,
    email: user!.email,
  });
  const newRefreshToken = await signRefreshToken({
    id: user!.id,
    email: user!.email,
  });

  return { accessToken, refreshToken: newRefreshToken };
};
