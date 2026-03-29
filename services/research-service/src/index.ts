import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabases } from './config/db';
import { researchRouter } from './routes/research';

import './workers/researchWorker'; // Boot the worker

dotenv.config({ path: '../../.env' }); // Adjust for root monorepo

const app = express();
const PORT = process.env.RESEARCH_SERVICE_PORT || 4003;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', service: 'research-service' });
});

app.use('/api/v1/research', researchRouter);

const startServer = async () => {
  try {
    await connectDatabases();
    
    app.listen(PORT, () => {
      console.log(`Research Service running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
