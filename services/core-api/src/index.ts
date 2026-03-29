import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabases } from './config/db';
import { requireFirebaseAuth } from './middleware/auth';
import { usersRouter } from './routes/users';
import { workspacesRouter } from './routes/workspaces';

dotenv.config({ path: '../../.env' }); // Assuming we run from service directory

const app = express();
const PORT = process.env.CORE_API_PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// Main Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', service: 'core-api' });
});

// Example Auth Protected Route
app.get('/api/v1/auth/me', requireFirebaseAuth, (req: Request, res: Response) => {
  res.status(200).json({ 
    message: 'Authentication successful',
    // @ts-ignore - The middleware populates this
    user: req.user
  });
});

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/workspaces', workspacesRouter);

// Initialize Server and DBs
const startServer = async () => {
  try {
    await connectDatabases();
    
    app.listen(PORT, () => {
      console.log(`Core API Service running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
