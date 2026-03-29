import { Router, Response } from 'express';
import { requireFirebaseAuth, AuthenticatedRequest } from '../middleware/auth';
import { dbPool } from '../config/db';

const router = Router();

// Get current user profile or create if not exists
router.get('/me', requireFirebaseAuth, async (req: AuthenticatedRequest, res: Response) => {
  const firebaseUid = req.user?.uid;
  const email = req.user?.email;

  if (!firebaseUid || !email) {
    res.status(400).json({ error: 'Invalid user context' });
    return;
  }

  try {
    // 1. Check if user exists
    let result = await dbPool.query('SELECT * FROM users WHERE firebase_uid = $1', [firebaseUid]);
    let user = result.rows[0];

    // 2. If not, create them
    if (!user) {
      const insertResult = await dbPool.query(
        'INSERT INTO users (firebase_uid, email) VALUES ($1, $2) RETURNING *',
        [firebaseUid, email]
      );
      user = insertResult.rows[0];
      
      // Auto-create default workspace for new user
      await dbPool.query(
        'INSERT INTO workspaces (name, owner_id) VALUES ($1, $2)',
        [`${email.split('@')[0]}'s Workspace`, user.id]
      );
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching/creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/me', requireFirebaseAuth, async (req: AuthenticatedRequest, res: Response) => {
  const firebaseUid = req.user?.uid;
  const { full_name } = req.body;

  try {
    const result = await dbPool.query(
      'UPDATE users SET full_name = $1, updated_at = NOW() WHERE firebase_uid = $2 RETURNING *',
      [full_name, firebaseUid]
    );
    
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as usersRouter };
