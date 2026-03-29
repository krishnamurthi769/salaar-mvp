import { Queue } from 'bullmq';
import { redisConnection } from '../config/db';

export const AGENT_TASK_QUEUE_NAME = 'agent-tasks';

export const agentTaskQueue = new Queue(AGENT_TASK_QUEUE_NAME, {
  connection: redisConnection
});
