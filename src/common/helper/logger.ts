import path from 'path';
import fs from 'fs';

import { format, createLogger, transports } from 'winston';
import 'winston-daily-rotate-file';

const env = process.env.NODE_ENV;
const logDirectory = path.join(process.cwd(), 'logs');

// Check that `logs` folder is exists or not, and if not than make one
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const enumerateErrorFormat = format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

export const logger = createLogger({
  level: env === 'development' ? 'debug' : 'info',
  format: format.combine(
    enumerateErrorFormat(),
    env === 'development' ? format.colorize() : format.uncolorize(),
    format.splat(),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(
      ({ level, message, timestamp }) => `[${timestamp}] ${level}: ${message}`
    )
  ),
  transports: [
    new transports.Console({
      stderrLevels: ['error'],
    }),
  ],
  exitOnError: false,
});

// In production then log to the `files`
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new transports.DailyRotateFile({
      filename: path.join(logDirectory, 'error-%DATE%.log'),
      frequency: '24h',
      datePattern: 'YYYY-MM-DD-HH',
      maxSize: '50m',
      level: 'error', // Store only error logs in log-files
    })
  );
}
