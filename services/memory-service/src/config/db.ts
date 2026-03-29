import { Pool } from 'pg';
import { Redis } from 'ioredis';
import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

// PostgreSQL Connection Pool
const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

dbPool.on('error', (err) => {
  console.error('Unexpected error on idle pg client', err);
});

// Redis client for short-term conversational context
const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

redisConnection.on('error', (err) => {
  console.error('Redis Connection Error', err);
});

// Pinecone Client for Semantic Search
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || 'dummy_key',
});
const pineconeIndex = pc.index(process.env.PINECONE_INDEX || 'salaar-memory');

export const connectDatabases = async (): Promise<void> => {
  try {
    // Scaffold User Memory and Semantic Memory tables explicitly just in case
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS user_memories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        context_type VARCHAR(50) NOT NULL, -- e.g. 'preference', 'fact', 'behavior'
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await dbPool.query('SELECT NOW()');
    console.log('PostgreSQL connected (memory-service)');
    
    await redisConnection.ping();
    console.log('Redis connected (memory-service)');

    if (process.env.PINECONE_API_KEY) {
       await pc.describeIndex(process.env.PINECONE_INDEX || 'salaar-memory');
       console.log('Pinecone connected (memory-service)');
    }
  } catch (error) {
    console.error('Database Connection Error:', error);
  }
};

export { dbPool, redisConnection, pineconeIndex };
