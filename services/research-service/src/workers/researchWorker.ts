import { Worker, Job } from 'bullmq';
import { redisConnection, dbPool } from '../config/db';
import { RESEARCH_QUEUE_NAME } from '../queue/researchQueue';

interface ResearchJobData {
  workspaceId: string;
  query: string;
}

export const researchWorker = new Worker(
  RESEARCH_QUEUE_NAME,
  async (job: Job<ResearchJobData>) => {
    const { workspaceId, query } = job.data;
    const taskId = job.id!;
    
    // 1. Mark task as processing
    await dbPool.query("UPDATE tasks SET status = 'processing' WHERE id = $1", [taskId]);
    await job.updateProgress(10); // "Searching web..."

    // 2. Simulate Web Scraper (Tavily/SerpAPI) + Orchestrator LLM calls
    // In production, this would make async calls to the AI Orchestration layer
    console.log(`[Worker] Executing research for query: "${query}" in workspace: ${workspaceId}`);
    
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await job.updateProgress(40); // "Reading sources..."

    await new Promise((resolve) => setTimeout(resolve, 3000));
    await job.updateProgress(70); // "Generating summary..."

    const simulatedLLMResult = {
      summary: `Research findings for: ${query}. \nThe landscape has heavily shifted towards autonomous agent architectures. While base model funding continues, the application layer—specifically tools enabling reliable RAG—is seeing accelerated growth.`,
      key_findings: [
        "Agent orchestration platforms are expanding.",
        "Context windows continue to increase.",
        "Automated RAG parsing is becoming table stakes."
      ],
      sources: [
        { title: "State of AI Ecosystem", url: "techcrunch.com", relevance_score: 98, excerpt: "Generative AI startups raised $27B in 2023..." },
        { title: "Emerging LLM Architectures", url: "cbinsights.com", relevance_score: 92, excerpt: "The 2024 report indicates that autonomous agents..." }
      ],
      suggested_follow_ups: [
        "What are the top vector DBs for RAG?",
        "Compare fine-tuning vs dynamic context injection."
      ]
    };

    // 3. Mark task as completed
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await job.updateProgress(100);

    await dbPool.query(
      "UPDATE tasks SET status = 'completed', result_payload = $1, updated_at = NOW() WHERE id = $2",
      [JSON.stringify(simulatedLLMResult), taskId]
    );

    // 4. Log usage natively
    const tokensEstimated = 1500;
    await dbPool.query(
      "INSERT INTO usage_records (workspace_id, request_type, completion_tokens) VALUES ($1, $2, $3)",
      [workspaceId, 'research_query', tokensEstimated]
    );

    return simulatedLLMResult;
  },
  { connection: redisConnection }
);

researchWorker.on('completed', (job) => {
  console.log(`Research job ${job.id} completed!`);
});

researchWorker.on('failed', async (job, err) => {
  console.error(`Research job ${job?.id} failed with error:`, err);
  if (job?.id) {
    await dbPool.query("UPDATE tasks SET status = 'failed' WHERE id = $1", [job.id]);
  }
});
