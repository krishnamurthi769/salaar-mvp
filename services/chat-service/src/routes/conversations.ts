import { Router, Response } from 'express';
import { requireFirebaseAuth, resolvePgUserId, AuthenticatedRequest } from '../middleware/auth';
import { dbPool } from '../config/db';

const router = Router();
router.use(requireFirebaseAuth);
router.use(resolvePgUserId);

// Create a new conversation
router.post('/conversations', async (req: AuthenticatedRequest, res: Response) => {
  const { workspaceId, title } = req.body;
  if (!workspaceId || !title) return res.status(400).json({ error: 'Workspace ID and title required' });

  try {
    // Basic verification that user owns workspace
    const wsCheck = await dbPool.query('SELECT id FROM workspaces WHERE id = $1 AND owner_id = $2', [workspaceId, res.locals.pgUserId]);
    if (wsCheck.rowCount === 0) return res.status(403).json({ error: 'Forbidden workspace access' });

    const result = await dbPool.query(
      'INSERT INTO conversations (workspace_id, title) VALUES ($1, $2) RETURNING *',
      [workspaceId, title]
    );
    res.status(201).json({ conversation: result.rows[0] });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get conversations for a workspace
router.get('/conversations/:workspaceId', async (req: AuthenticatedRequest, res: Response) => {
  const { workspaceId } = req.params;

  try {
    const wsCheck = await dbPool.query('SELECT id FROM workspaces WHERE id = $1 AND owner_id = $2', [workspaceId, res.locals.pgUserId]);
    if (wsCheck.rowCount === 0) return res.status(403).json({ error: 'Forbidden workspace access' });

    const result = await dbPool.query('SELECT * FROM conversations WHERE workspace_id = $1 ORDER BY updated_at DESC', [workspaceId]);
    res.status(200).json({ conversations: result.rows });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a conversation
router.delete('/conversations/:id', async (req: AuthenticatedRequest, res: Response) => {
  const conversationId = req.params.id;

  try {
    // Check ownership through workspace
    const ownershipQuery = `
      SELECT c.id FROM conversations c 
      JOIN workspaces w ON c.workspace_id = w.id 
      WHERE c.id = $1 AND w.owner_id = $2`;
    
    const checkResult = await dbPool.query(ownershipQuery, [conversationId, res.locals.pgUserId]);
    if (checkResult.rowCount === 0) return res.status(403).json({ error: 'Forbidden conversation access' });

    await dbPool.query('DELETE FROM conversations WHERE id = $1', [conversationId]);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as conversationsRouter };
