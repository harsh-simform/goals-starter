import { createClient } from 'redis';
import { logger } from './logger';

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (error) => logger.error(error));

redisClient.connect();

export default redisClient;
