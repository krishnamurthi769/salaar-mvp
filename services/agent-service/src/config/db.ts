import { Pool } from 'pg';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

dbPool.on('error', (err) => {
  console.error('Unexpected error on idle pg client', err);
});

// ioredis client for BullMQ and short-term agent memory
const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

redisConnection.on('error', (err) => {
  console.error('Redis Connection Error', err);
});

export const connectDatabases = async (): Promise<void> => {
  try {
    // Basic migration to ensure metadata column for agent stats just in case
    await dbPool.query(`ALTER TABLE agents ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'`);
    await dbPool.query('SELECT NOW()');
    console.log('PostgreSQL connected (agent-service)');
    await redisConnection.ping();
    console.log('Redis connected (agent-service)');
  } catch (error) {
    console.error('Database Connection Error:', error);
  }
};

export { dbPool, redisConnection };
