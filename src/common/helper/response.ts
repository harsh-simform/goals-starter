import { Response } from 'express';

import { HttpStatus } from '../constants';

/**
 * Response Object When API Success
 * @param res Response
 * @param statusCode HTTP status code
 * @param message Response message
 * @param data Response data
 */
export const succeeded = (
  res: Response,
  statusCode: number = HttpStatus.OK,
  message: string = 'Successfully completed.',
  data: object = {}
) => {
  return res.status(statusCode).json({
    status: true,
    message,
    data,
    error: null,
  });
};

/**
 * Response Object When API Fail/Broke
 * @param res Response
 * @param statusCode HTTP status code
 * @param message Response message
 * @param data Response data
 */
export const failed = (
  res: Response,
  statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
  message: string = 'Please, Try again!',
  data: object = {}
) => {
  return res.status(statusCode).json({
    status: false,
    message,
    data: null,
    error: data,
  });
};
