import { IncomingHttpHeaders } from 'http';

import { RequestHandler } from 'express';

import { verifyToken } from '../services/auth.service';
import { HttpStatus } from '../../../../common/constants';
import { failed } from '../../../../common/helper';

const getTokenFromHeaders = (headers: IncomingHttpHeaders) => {
  const header = headers.authorization as string;

  if (!header) return header;

  return header.split(' ')[1];
};

export const tokenGuard: () => RequestHandler = () => async (
  req,
  res,
  next
) => {
  const token =
    getTokenFromHeaders(req.headers) || req.query.token || req.body.token || '';
  const hasAccess = await verifyToken(req, token);

  if (!hasAccess) {
    return failed(res, HttpStatus.FORBIDDEN, 'Unauthorized access');
  }

  next();
};
