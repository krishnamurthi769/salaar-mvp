import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabases } from './config/db';
import { conversationsRouter } from './routes/conversations';
import { messagesRouter } from './routes/messages';

dotenv.config({ path: '../../.env' }); // Adjusted for monorepo root

const app = express();
const PORT = process.env.CHAT_SERVICE_PORT || 4002;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', service: 'chat-service' });
});

// API Routes
app.use('/api/v1/chat', conversationsRouter);
app.use('/api/v1/chat', messagesRouter);

const startServer = async () => {
  try {
    await connectDatabases();
    app.listen(PORT, () => {
      console.log(`Chat Service running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
