import { Pool } from 'pg';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

// PostgreSQL Connection Pool
const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

dbPool.on('error', (err) => {
  console.error('Unexpected error on idle pg client', err);
});

// Redis client for BullMQ (ioredis)
const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

redisConnection.on('error', (err) => {
  console.error('Redis Connection Error', err);
});

export const connectDatabases = async (): Promise<void> => {
  try {
    await dbPool.query('SELECT NOW()');
    console.log('PostgreSQL connected');
    await redisConnection.ping();
    console.log('Redis (ioredis) connected');
  } catch (error) {
    console.error('Database Connection Error:', error);
  }
};

export { dbPool, redisConnection };
