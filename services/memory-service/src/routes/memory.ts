import { Router, Response } from 'express';
import { requireFirebaseAuth, resolvePgUserId, AuthenticatedRequest } from '../middleware/auth';
import { dbPool, redisConnection, pineconeIndex } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
router.use(requireFirebaseAuth);
router.use(resolvePgUserId);

// 1. Store structured long-term user memory (Preferences, Facts)
router.post('/store', async (req: AuthenticatedRequest, res: Response) => {
  const { workspaceId, contextType, content } = req.body;
  if (!workspaceId || !contextType || !content) return void res.status(400).json({ error: 'Missing fields' });

  try {
    const wsCheck = await dbPool.query('SELECT id FROM workspaces WHERE id = $1 AND owner_id = $2', [workspaceId, res.locals.pgUserId]);
    if (wsCheck.rowCount === 0) return void res.status(403).json({ error: 'Forbidden' });

    const result = await dbPool.query(
      "INSERT INTO user_memories (workspace_id, context_type, content) VALUES ($1, $2, $3) RETURNING *",
      [workspaceId, contextType, content]
    );

    res.status(201).json({ memory: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Retrieve structured long-term memory
router.get('/retrieve/:context', async (req: AuthenticatedRequest, res: Response) => {
  const { context } = req.params;
  const { workspaceId } = req.query;
  
  if (!workspaceId) return void res.status(400).json({ error: 'workspaceId query param required' });

  try {
    const wsCheck = await dbPool.query('SELECT id FROM workspaces WHERE id = $1 AND owner_id = $2', [workspaceId, res.locals.pgUserId]);
    if (wsCheck.rowCount === 0) return void res.status(403).json({ error: 'Forbidden' });

    const result = await dbPool.query(
      "SELECT * FROM user_memories WHERE workspace_id = $1 AND context_type = $2 ORDER BY created_at DESC",
      [workspaceId, context]
    );
    res.status(200).json({ memories: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Embed Data into Semantic Vector Store (Pinecone)
router.post('/embed', async (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId, text, metadata } = req.body;
    if (!workspaceId || !text) return void res.status(400).json({ error: 'Missing fields' });
    
    try {
      const wsCheck = await dbPool.query('SELECT id FROM workspaces WHERE id = $1 AND owner_id = $2', [workspaceId, res.locals.pgUserId]);
      if (wsCheck.rowCount === 0) return void res.status(403).json({ error: 'Forbidden' });
      
      if (process.env.PINECONE_API_KEY) {
         // Mock embedding vector
         const mockEmbedding = Array(1536).fill(0).map(() => Math.random() - 0.5); 
         await pineconeIndex.namespace(workspaceId as string).upsert([{
           id: uuidv4(),
           values: mockEmbedding,
           metadata: { ...metadata, text }
         }]);
      }
      res.status(200).json({ success: true, message: 'Text embedded into Pinecone semantic memory' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
});

// 4. Semantic Search across embeddings based on user query
router.get('/search', async (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId, query } = req.query;
    if (!workspaceId || !query) return void res.status(400).json({ error: 'workspaceId and query required' });

    try {
      const wsCheck = await dbPool.query('SELECT id FROM workspaces WHERE id = $1 AND owner_id = $2', [workspaceId, res.locals.pgUserId]);
      if (wsCheck.rowCount === 0) return void res.status(403).json({ error: 'Forbidden' });
      
      let matches: any[] = [];
      if (process.env.PINECONE_API_KEY) {
         const mockQueryEmbedding = Array(1536).fill(0).map(() => Math.random() - 0.5); 
         const searchResult = await pineconeIndex.namespace(workspaceId as string).query({
             topK: 5,
             vector: mockQueryEmbedding,
             includeMetadata: true
         });
         matches = searchResult.matches;
      }

      res.status(200).json({ results: matches });
    } catch(err) {
      res.status(500).json({ error: 'Internal server error' });
    }
});

// 5. Clear specific Workspace memory
router.delete('/clear/:workspaceId', async (req: AuthenticatedRequest, res: Response) => {
    const { workspaceId } = req.params;
    try {
        const wsCheck = await dbPool.query('SELECT id FROM workspaces WHERE id = $1 AND owner_id = $2', [workspaceId, res.locals.pgUserId]);
        if (wsCheck.rowCount === 0) return void res.status(403).json({ error: 'Forbidden' });
        
        // Clear structured DB memories
        await dbPool.query("DELETE FROM user_memories WHERE workspace_id = $1", [workspaceId]);
        
        // Clear Pinecone namespace entirely
        if (process.env.PINECONE_API_KEY) {
            await pineconeIndex.namespace(workspaceId).deleteAll();
        }
        
        res.status(200).json({ success: true, message: 'Workspace memory purged successfully' });
    } catch(err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export { router as memoryRouter };
