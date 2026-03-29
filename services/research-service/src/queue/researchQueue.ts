import { Queue } from 'bullmq';
import { redisConnection } from '../config/db';

export const RESEARCH_QUEUE_NAME = 'research-jobs';

export const researchQueue = new Queue(RESEARCH_QUEUE_NAME, {
  connection: redisConnection
});
