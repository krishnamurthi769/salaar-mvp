import { Router, Response } from 'express';
import { requireFirebaseAuth, resolvePgUserId, AuthenticatedRequest } from '../middleware/auth';
import { dbPool, redisConnection } from '../config/db';
import { agentTaskQueue } from '../queue/agentQueue';

const router = Router();
router.use(requireFirebaseAuth);
router.use(resolvePgUserId);

// 1. Create a new Agent
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const { workspaceId, name, role, instructions, expertise_areas, communication_style } = req.body;
  if (!workspaceId || !name || !role || !instructions) return void res.status(400).json({ error: 'Missing required fields' });

  try {
    const wsCheck = await dbPool.query('SELECT id FROM workspaces WHERE id = $1 AND owner_id = $2', [workspaceId, res.locals.pgUserId]);
    if (wsCheck.rowCount === 0) return void res.status(403).json({ error: 'Forbidden' });

    const metadata = { expertise_areas, communication_style };
    const result = await dbPool.query(
      "INSERT INTO agents (workspace_id, name, role, system_prompt, metadata) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [workspaceId, name, role, instructions, JSON.stringify(metadata)]
    );

    res.status(201).json({ agent: result.rows[0] });
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. List all agents in a workspace
router.get('/:workspaceId', async (req: AuthenticatedRequest, res: Response) => {
  const { workspaceId } = req.params;
  try {
    const wsCheck = await dbPool.query('SELECT id FROM workspaces WHERE id = $1 AND owner_id = $2', [workspaceId, res.locals.pgUserId]);
    if (wsCheck.rowCount === 0) return void res.status(403).json({ error: 'Forbidden' });

    const result = await dbPool.query("SELECT * FROM agents WHERE workspace_id = $1 ORDER BY created_at ASC", [workspaceId]);
    
    res.status(200).json({ agents: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Execute Async Task for an Agent
router.post('/:id/tasks', async (req: AuthenticatedRequest, res: Response) => {
  const agentId = req.params.id;
  const { payload } = req.body;
  
  if (!payload) return void res.status(400).json({ error: 'Task payload required' });

  try {
    const agentCheck = await dbPool.query(
      "SELECT a.workspace_id FROM agents a JOIN workspaces w ON a.workspace_id = w.id WHERE a.id = $1 AND w.owner_id = $2",
      [agentId, res.locals.pgUserId]
    );
    if (agentCheck.rowCount === 0) return void res.status(403).json({ error: 'Forbidden' });
    const workspaceId = agentCheck.rows[0].workspace_id;

    // Insert task tracker into PostgreSQL
    const taskResult = await dbPool.query(
      "INSERT INTO tasks (workspace_id, agent_id, status, input_payload) VALUES ($1, $2, 'queued', $3) RETURNING id",
      [workspaceId, agentId, JSON.stringify(payload)]
    );
    const taskId = taskResult.rows[0].id;

    // Dispatch job to BullMQ
    await agentTaskQueue.add('execute-agent-task', { workspaceId, agentId, payload }, { jobId: taskId });
    
    // Log user request temporarily in redis context
    const memoryKey = `agent:memory:${agentId}`;
    await redisConnection.lpush(memoryKey, JSON.stringify({ role: 'user', content: payload.task || 'Assigned task', timestamp: new Date().toISOString() }));
    await redisConnection.ltrim(memoryKey, 0, 9); 

    res.status(202).json({ task_id: taskId, status: 'queued' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Synchronous chat with Agent (Not streaming for now, returns full response)
router.post('/:id/chat', async (req: AuthenticatedRequest, res: Response) => {
  const agentId = req.params.id;
  const { message } = req.body;

  try {
    const agentCheck = await dbPool.query(
      "SELECT a.workspace_id, a.name, a.role FROM agents a JOIN workspaces w ON a.workspace_id = w.id WHERE a.id = $1 AND w.owner_id = $2",
      [agentId, res.locals.pgUserId]
    );
    if (agentCheck.rowCount === 0) return void res.status(403).json({ error: 'Forbidden' });
    
    const memoryKey = `agent:memory:${agentId}`;
    await redisConnection.lpush(memoryKey, JSON.stringify({ role: 'user', content: message, timestamp: new Date().toISOString() }));
    await redisConnection.ltrim(memoryKey, 0, 9);
    
    // Simulate orchestration delay synchronously
    setTimeout(async () => {
      const gennedResp = `Yes, as your ${agentCheck.rows[0].role}, I received your message: "${message}".`;
      await redisConnection.lpush(memoryKey, JSON.stringify({ role: 'assistant', content: gennedResp, timestamp: new Date().toISOString() }));
      await redisConnection.ltrim(memoryKey, 0, 9);
      
      res.status(200).json({ response: gennedResp });
    }, 1500);
    
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as agentsRouter };
