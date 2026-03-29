import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabases } from './config/db';
import { agentsRouter } from './routes/agents';

// Boot up BullMQ agent worker
import './workers/agentWorker';

dotenv.config({ path: '../../.env' });

const app = express();
const PORT = process.env.AGENT_SERVICE_PORT || 4004;

app.use(cors());
app.use(express.json());

// Main Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', service: 'agent-service' });
});

// Register routers
app.use('/api/v1/agents', agentsRouter);

const startServer = async () => {
  try {
    await connectDatabases();
    
    app.listen(PORT, () => {
      console.log(`Agent Service running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
