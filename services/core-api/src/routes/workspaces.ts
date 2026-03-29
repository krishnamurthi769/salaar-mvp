import { Router, Response } from 'express';
import { requireFirebaseAuth, AuthenticatedRequest } from '../middleware/auth';
import { dbPool } from '../config/db';

const router = Router();

// Middleware to resolve pg UUID from firebase UID for workspace operations
const resolvePgUserId = async (req: AuthenticatedRequest, res: Response, next: Function) => {
  const firebaseUid = req.user?.uid;
  if (!firebaseUid) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const result = await dbPool.query('SELECT id FROM users WHERE firebase_uid = $1', [firebaseUid]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'User record not found in DB' });
    req.user = { ...req.user, uid: firebaseUid }; // Keep the structural req.user
    res.locals.pgUserId = result.rows[0].id;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database error resolving user' });
  }
};

router.use(requireFirebaseAuth);
router.use(resolvePgUserId);

// List workspaces for user
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const pgUserId = res.locals.pgUserId;
  try {
    const result = await dbPool.query('SELECT * FROM workspaces WHERE owner_id = $1 ORDER BY created_at DESC', [pgUserId]);
    res.status(200).json({ workspaces: result.rows });
  } catch (error) {
    console.error('Error listing workspaces:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create workspace
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const pgUserId = res.locals.pgUserId;
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: 'Workspace name is required' });

  try {
    const result = await dbPool.query(
      'INSERT INTO workspaces (name, owner_id) VALUES ($1, $2) RETURNING *',
      [name, pgUserId]
    );
    res.status(201).json({ workspace: result.rows[0] });
  } catch (error) {
    console.error('Error creating workspace:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete workspace
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const pgUserId = res.locals.pgUserId;
  const workspaceId = req.params.id;

  try {
    const result = await dbPool.query(
      'DELETE FROM workspaces WHERE id = $1 AND owner_id = $2 RETURNING id',
      [workspaceId, pgUserId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Workspace not found or unauthorized' });
    }
    res.status(200).json({ success: true, deleted: result.rows[0].id });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as workspacesRouter };
