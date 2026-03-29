import { Pool } from 'pg';
import { createClient } from 'redis';

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
    // Test PG Connection
    const res = await dbPool.query('SELECT NOW()');
    console.log('PostgreSQL connected at:', res.rows[0].now);

    // Test Redis Connection
    await redisClient.connect();
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Database Connection Error:', error);
    process.exit(1);
  }
};

export { dbPool, redisClient };
