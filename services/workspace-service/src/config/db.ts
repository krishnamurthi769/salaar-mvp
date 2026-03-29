import { Pool } from 'pg';
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

// Pinecone Client
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || 'dummy_key',
});
const pineconeIndex = pc.index(process.env.PINECONE_INDEX || 'salaar-memory');

export const connectDatabases = async (): Promise<void> => {
  try {
    // Scaffold context columns if they don't exist
    await dbPool.query(`
      ALTER TABLE workspaces 
      ADD COLUMN IF NOT EXISTS startup_idea TEXT,
      ADD COLUMN IF NOT EXISTS industry VARCHAR(255),
      ADD COLUMN IF NOT EXISTS stage VARCHAR(100),
      ADD COLUMN IF NOT EXISTS target_market TEXT,
      ADD COLUMN IF NOT EXISTS team_size VARCHAR(50),
      ADD COLUMN IF NOT EXISTS main_challenge TEXT
    `);
    
    await dbPool.query('SELECT NOW()');
    console.log('PostgreSQL connected (workspace-service)');
    
    // Test pinecone init (mock if offline)
    try {
      if (process.env.PINECONE_API_KEY) {
         await pc.describeIndex(process.env.PINECONE_INDEX || 'salaar-memory');
         console.log('Pinecone connected (workspace-service)');
      } else {
         console.warn('Pinecone skipped: API Key Missing');
      }
    } catch(err) {
      console.warn("Pinecone init mock warning", err);
    }
  } catch (error) {
    console.error('Database Connection Error:', error);
  }
};

export { dbPool, pineconeIndex };
