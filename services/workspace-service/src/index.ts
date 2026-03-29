import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabases } from './config/db';
import { workspacesRouter } from './routes/workspaces';

dotenv.config({ path: '../../.env' });

const app = express();
const PORT = process.env.WORKSPACE_SERVICE_PORT || 4005;

app.use(cors());
app.use(express.json());

// Main Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', service: 'workspace-service' });
});

// API Routes
app.use('/api/v1/workspaces', workspacesRouter);

const startServer = async () => {
  try {
    await connectDatabases();
    
    app.listen(PORT, () => {
      console.log(`Workspace Service running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
