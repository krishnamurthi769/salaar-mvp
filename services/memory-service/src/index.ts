import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabases } from './config/db';
import { memoryRouter } from './routes/memory';

dotenv.config({ path: '../../.env' });

const app = express();
const PORT = process.env.MEMORY_SERVICE_PORT || 4006;

app.use(cors());
app.use(express.json());

// Main Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', service: 'memory-service' });
});

// API Routes
app.use('/api/v1/memory', memoryRouter);

const startServer = async () => {
  try {
    await connectDatabases();
    
    app.listen(PORT, () => {
      console.log(`Memory Service running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
