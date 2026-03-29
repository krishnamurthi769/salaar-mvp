import { Pool } from 'pg';
import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

// PostgreSQL Connection Pool
const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

dbPool.on('error', (err) => {
  console.error('Unexpected error on idle pg client', err);
});

// Redis Client Connection
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

export const connectDatabases = async (): Promise<void> => {
  try {
    await dbPool.query('SELECT NOW()');
    console.log('PostgreSQL connected');
    await redisClient.connect();
    console.log('Redis connected');
  } catch (error) {
    console.error('Database Connection Error:', error);
  }
};

export { dbPool, redisClient };
