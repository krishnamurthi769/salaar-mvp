import { Router, Response } from 'express';
import { requireFirebaseAuth, resolvePgUserId, AuthenticatedRequest } from '../middleware/auth';
import { dbPool } from '../config/db';

const router = Router();
router.use(requireFirebaseAuth);
router.use(resolvePgUserId);

// Fetch messages for a conversation
router.get('/messages/:conversationId', async (req: AuthenticatedRequest, res: Response) => {
  const { conversationId } = req.params;

  try {
    const ownershipQuery = `
      SELECT c.id FROM conversations c 
      JOIN workspaces w ON c.workspace_id = w.id 
      WHERE c.id = $1 AND w.owner_id = $2`;
    
    const checkResult = await dbPool.query(ownershipQuery, [conversationId, res.locals.pgUserId]);
    if (checkResult.rowCount === 0) return res.status(403).json({ error: 'Forbidden' });

    const result = await dbPool.query('SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC', [conversationId]);
    res.status(200).json({ messages: result.rows });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Post a new message and stream response (SSE)
router.post('/messages', async (req: AuthenticatedRequest, res: Response) => {
  const { conversationId, content } = req.body;
  if (!conversationId || !content) return res.status(400).json({ error: 'Missing conversationId or content' });

  try {
    // 1. Verify Ownership & Get Workspace ID
    const ownershipQuery = `
      SELECT c.id, c.workspace_id 
      FROM conversations c JOIN workspaces w ON c.workspace_id = w.id 
      WHERE c.id = $1 AND w.owner_id = $2`;
    const checkResult = await dbPool.query(ownershipQuery, [conversationId, res.locals.pgUserId]);
    
    if (checkResult.rowCount === 0) return res.status(403).json({ error: 'Forbidden' });
    const workspaceId = checkResult.rows[0].workspace_id;

    // 2. Save User Message
    await dbPool.query(
      'INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)',
      [conversationId, 'user', content]
    );

    // 3. Set up SSE Headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // 4. Mock Streaming from Orchestrator (since orchestrator is not built yet)
    // Production implementation would axios(stream) to the ai-orchestrator
    const mockResponse = `The AI Orchestration layer is analyzing your workspace context. I understand you requested: "${content}". I am generating this response via the SALAAR chat-service using Server-Sent Events.`;
    const words = mockResponse.split(' ');
    let i = 0;
    let fullAssistantContent = "";

    const streamInterval = setInterval(async () => {
      if (i < words.length) {
        const chunk = words[i] + ' ';
        fullAssistantContent += chunk;
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        i++;
      } else {
        clearInterval(streamInterval);
        
        // Finalize: Save AI Response & log usage
        try {
          // Add Assistant Message
          await dbPool.query(
            "INSERT INTO messages (conversation_id, role, content, metadata) VALUES ($1, $2, $3, $4)",
            [conversationId, 'assistant', fullAssistantContent.trim(), JSON.stringify({ model_used: 'orchestrator-auto', tokens_used: words.length, latency: words.length * 0.05 })]
          );

          // Update Conversation timestamp
          await dbPool.query("UPDATE conversations SET updated_at = NOW() WHERE id = $1", [conversationId]);
          
          // Log Usage Record
          await dbPool.query(
            "INSERT INTO usage_records (workspace_id, request_type, completion_tokens) VALUES ($1, $2, $3)",
            [workspaceId, 'chat_completion', words.length]
          );
        } catch (dbErr) {
          console.error("Failed saving final AI message", dbErr);
        }

        res.write(`data: [DONE]\n\n`);
        res.end();
      }
    }, 50);

  } catch (error) {
    console.error('Error handling message stream:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as messagesRouter };
