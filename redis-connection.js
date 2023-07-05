import 'dotenv/config';
import { Redis } from 'ioredis';

const CacheClient = () => {
  const client = new Redis({
    host: process.env.REDIS_HOST
  });

  return client;
};

export default CacheClient();
