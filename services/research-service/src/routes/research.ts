import { Router, Response } from 'express';
import { requireFirebaseAuth, resolvePgUserId, AuthenticatedRequest } from '../middleware/auth';
import { dbPool } from '../config/db';
import { researchQueue } from '../queue/researchQueue';

const router = Router();
router.use(requireFirebaseAuth);
router.use(resolvePgUserId);

// 1. Start a Research Job
router.post('/query', async (req: AuthenticatedRequest, res: Response) => {
  const { workspaceId, query } = req.body;
  if (!workspaceId || !query) return res.status(400).json({ error: 'Workspace ID and query required' });

  try {
    const wsCheck = await dbPool.query('SELECT id FROM workspaces WHERE id = $1 AND owner_id = $2', [workspaceId, res.locals.pgUserId]);
    if (wsCheck.rowCount === 0) return res.status(403).json({ error: 'Forbidden' });

    // Insert task into PostgreSQL
    const taskResult = await dbPool.query(
      "INSERT INTO tasks (workspace_id, status, input_payload) VALUES ($1, 'queued', $2) RETURNING id",
      [workspaceId, JSON.stringify({ query })]
    );
    const taskId = taskResult.rows[0].id;

    // Add exactly matching taskId to BullMQ
    await researchQueue.add('execute-research', { workspaceId, query }, { jobId: taskId });

    res.status(202).json({ job_id: taskId, status: 'queued' });
  } catch (error) {
    console.error('Error starting research:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Poll for Research Status/Progress
router.get('/status/:jobId', async (req: AuthenticatedRequest, res: Response) => {
  const { jobId } = req.params;
  try {
    const taskResult = await dbPool.query(
      "SELECT t.status, t.result_payload FROM tasks t JOIN workspaces w ON t.workspace_id = w.id WHERE t.id = $1 AND w.owner_id = $2",
      [jobId, res.locals.pgUserId]
    );

    if (taskResult.rowCount === 0) return res.status(404).json({ error: 'Job not found' });
    
    const task = taskResult.rows[0];
    const bullJob = await researchQueue.getJob(jobId);
    const progress = bullJob ? bullJob.progress : 0;

    res.status(200).json({ 
      job_id: jobId, 
      status: task.status, 
      progress,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Get completed Research Result directly
router.get('/result/:jobId', async (req: AuthenticatedRequest, res: Response) => {
  const { jobId } = req.params;
  try {
    const taskResult = await dbPool.query(
      "SELECT t.status, t.result_payload, t.created_at FROM tasks t JOIN workspaces w ON t.workspace_id = w.id WHERE t.id = $1 AND w.owner_id = $2",
      [jobId, res.locals.pgUserId]
    );

    if (taskResult.rowCount === 0) return res.status(404).json({ error: 'Job not found' });
    const task = taskResult.rows[0];
    
    if (task.status !== 'completed') return res.status(400).json({ error: `Job is currently: ${task.status}` });

    res.status(200).json({ job_id: jobId, result: task.result_payload, created_at: task.created_at });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Get Research History for Workspace
router.get('/history/:workspaceId', async (req: AuthenticatedRequest, res: Response) => {
   const { workspaceId } = req.params;
   try {
     const wsCheck = await dbPool.query('SELECT id FROM workspaces WHERE id = $1 AND owner_id = $2', [workspaceId, res.locals.pgUserId]);
     if (wsCheck.rowCount === 0) return res.status(403).json({ error: 'Forbidden' });
     
     // Note: we can filter by type of task by ensuring input_payload has a specific structure or adding a `type` column to Tasks.
     const history = await dbPool.query(
       "SELECT id, status, input_payload, created_at FROM tasks WHERE workspace_id = $1 AND status != 'failed' ORDER BY created_at DESC LIMIT 50", 
       [workspaceId]
     );
     
     res.status(200).json({ history: history.rows });
   } catch (error) {
     res.status(500).json({ error: 'Internal server error' });
   }
});

export { router as researchRouter };
