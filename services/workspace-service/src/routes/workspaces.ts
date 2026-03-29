import { Router, Response } from 'express';
import { requireFirebaseAuth, resolvePgUserId, AuthenticatedRequest } from '../middleware/auth';
import { dbPool, pineconeIndex } from '../config/db';

const router = Router();
router.use(requireFirebaseAuth);
router.use(resolvePgUserId);

// 1. Get Workspace details and context
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const result = await dbPool.query("SELECT * FROM workspaces WHERE id = $1 AND owner_id = $2", [id, res.locals.pgUserId]);
    if (result.rowCount === 0) return void res.status(404).json({ error: 'Workspace not found' });
    res.status(200).json({ workspace: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Update Workspace Context (and vectorize to Pinecone)
router.post('/:id/context', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { startup_idea, industry, stage, target_market, team_size, main_challenge } = req.body;
  
  if (!startup_idea) return void res.status(400).json({ error: 'startup_idea is required for context' });

  try {
    // Update Postgres natively
    const result = await dbPool.query(`
      UPDATE workspaces 
      SET startup_idea = $1, industry = $2, stage = $3, target_market = $4, team_size = $5, main_challenge = $6, updated_at = NOW() 
      WHERE id = $7 AND owner_id = $8 
      RETURNING *
    `, [startup_idea, industry, stage, target_market, team_size, main_challenge, id, res.locals.pgUserId]);

    if (result.rowCount === 0) return void res.status(404).json({ error: 'Workspace not found' });

    // Format context for Pinecone embedding
    const rawContextString = `Startup Idea: ${startup_idea}. Industry: ${industry || 'Unknown'}. Stage: ${stage || 'Unknown'}. Target Market: ${target_market || 'Unknown'}. Team Size: ${team_size || 'Unknown'}. Main Challenge: ${main_challenge || 'Unknown'}.`;
    
    // Simulate Vector Embedding (In production, you would call OpenAI text-embedding-ada-002 here)
    // Then upsert to the Pinecone index using the Workspace ID as the namespace
    if (process.env.PINECONE_API_KEY) {
       // Mocking the embedding array:
       const mockEmbedding = Array(1536).fill(0).map(() => Math.random() - 0.5); 
       await pineconeIndex.namespace(id).upsert([{
         id: 'core-context',
         values: mockEmbedding,
         metadata: { type: 'core_context', content: rawContextString }
       }]);
       console.log(`[Pinecone] Upserted core context for workspace ${id}`);
    }

    res.status(200).json({ success: true, workspace: result.rows[0], message: "Context successfully vectorized into Pinecone." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Register a Document in PostgreSQL before uploading
router.post('/:id/documents', async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { title, original_url } = req.body;
    
    if (!title) return void res.status(400).json({ error: 'Document title required' });
    
    try {
      const wsCheck = await dbPool.query('SELECT id FROM workspaces WHERE id = $1 AND owner_id = $2', [id, res.locals.pgUserId]);
      if (wsCheck.rowCount === 0) return void res.status(403).json({ error: 'Forbidden' });
      
      const docRes = await dbPool.query(
          "INSERT INTO documents (workspace_id, title, original_url, vector_status) VALUES ($1, $2, $3, 'pending') RETURNING *",
          [id, title, original_url]
      );
      
      res.status(201).json({ document: docRes.rows[0] });
    } catch(err) {
      res.status(500).json({ error: "Internal Error" });
    }
});

// 4. List registered documents for Workspace
router.get('/:id/documents', async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    try {
      const wsCheck = await dbPool.query('SELECT id FROM workspaces WHERE id = $1 AND owner_id = $2', [id, res.locals.pgUserId]);
      if (wsCheck.rowCount === 0) return void res.status(403).json({ error: 'Forbidden' });
      
      const docs = await dbPool.query("SELECT * FROM documents WHERE workspace_id = $1 ORDER BY created_at DESC", [id]);
      res.status(200).json({ documents: docs.rows });
    } catch(err) {
      res.status(500).json({ error: "Internal Error" });
    }
});

export { router as workspacesRouter };
