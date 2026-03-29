import { Worker, Job } from 'bullmq';
import { redisConnection, dbPool } from '../config/db';
import { AGENT_TASK_QUEUE_NAME } from '../queue/agentQueue';

interface AgentTaskData {
  workspaceId: string;
  agentId: string;
  payload: any;
}

export const agentWorker = new Worker(
  AGENT_TASK_QUEUE_NAME,
  async (job: Job<AgentTaskData>) => {
    const { workspaceId, agentId, payload } = job.data;
    const taskId = job.id!;
    
    // 1. Mark task processing and agent working
    await dbPool.query("UPDATE tasks SET status = 'processing' WHERE id = $1", [taskId]);
    await dbPool.query("UPDATE agents SET is_active = true WHERE id = $1", [agentId]); // Just indicative "working" if we had a status column
    await job.updateProgress(10);

    // 2. Fetch Agent Context (Memory & Profile)
    const agentRes = await dbPool.query("SELECT name, role, system_prompt, metadata FROM agents WHERE id = $1", [agentId]);
    const agent = agentRes.rows[0];
    
    // Short term memory extraction from Redis
    const memoryKey = `agent:memory:${agentId}`;
    const shortTermMemoryRaw = await redisConnection.lrange(memoryKey, 0, 9);
    const shortTermMemory = shortTermMemoryRaw.map(m => JSON.parse(m));

    console.log(`[Worker] Agent ${agent.name} (${agent.role}) executing task: `, payload);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await job.updateProgress(50);

    await new Promise((resolve) => setTimeout(resolve, 3000));
    await job.updateProgress(90);

    // Output synthesis (mocking Orchestration Layer response)
    const simulatedResult = {
      agent_identity: agent.name,
      response: `As the ${agent.role}, I have completed the task based on my expertise in ${agent.metadata?.expertise_areas || 'general startup operations'}. My communication reflects a ${agent.metadata?.communication_style || 'professional'} tone. Short-term contextual memory accessed: ${shortTermMemory.length} recent interactions.`,
      status: "SUCCESS"
    };

    // 3. Complete task and reset agent status
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await job.updateProgress(100);

    await dbPool.query(
      "UPDATE tasks SET status = 'completed', result_payload = $1, updated_at = NOW() WHERE id = $2",
      [JSON.stringify(simulatedResult), taskId]
    );

    // Persist to short term memory
    await redisConnection.lpush(memoryKey, JSON.stringify({
      role: 'assistant',
      content: simulatedResult.response,
      timestamp: new Date().toISOString()
    }));
    await redisConnection.ltrim(memoryKey, 0, 9); // Keep last 10

    // 4. Log usage metrics
    await dbPool.query(
      "INSERT INTO usage_records (workspace_id, request_type, completion_tokens) VALUES ($1, $2, $3)",
      [workspaceId, 'agent_task', 2500]
    );

    return simulatedResult;
  },
  { connection: redisConnection }
);

agentWorker.on('completed', (job) => {
  console.log(`Agent task ${job.id} completed!`);
});

agentWorker.on('failed', async (job, err) => {
  console.error(`Agent task ${job?.id} failed:`, err);
  if (job?.id) {
    await dbPool.query("UPDATE tasks SET status = 'failed' WHERE id = $1", [job.id]);
  }
});
