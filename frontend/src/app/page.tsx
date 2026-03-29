import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-black min-h-screen">
      <div className="max-w-3xl space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold tracking-[-0.02em] text-white">
          SALAAR
        </h1>
        <p className="text-xl text-[#A0A0A0] max-w-2xl mx-auto leading-[1.7]">
          The first AI Operating System designed exclusively for startups. Deploy specialized AI agents, streamline research, and accelerate founder tasks.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link href="/dashboard" className="btn-primary w-full sm:w-auto text-lg">
            Enter Workspace
          </Link>
          <Link href="/agents" className="btn-secondary w-full sm:w-auto text-lg">
            Configure Agents
          </Link>
        </div>

        <div className="pt-24 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="card-styled space-y-3 hover:border-[#444444] transition-all duration-150 cursor-pointer">
            <h3 className="text-white text-lg font-bold tracking-[-0.02em]">Zero Call Routing</h3>
            <p className="text-[#A0A0A0] text-sm leading-[1.7]">The Orchestrator automatically selects the best AI model for every query. You never choose.</p>
          </div>
          <div className="card-styled space-y-3 hover:border-[#444444] transition-all duration-150 cursor-pointer">
            <h3 className="text-white text-lg font-bold tracking-[-0.02em]">Perplexity-style RAG</h3>
            <p className="text-[#A0A0A0] text-sm leading-[1.7]">The Memory service cites real sources and internal documents using Pinecone vector search.</p>
          </div>
          <div className="card-styled space-y-3 hover:border-[#444444] transition-all duration-150 cursor-pointer">
            <h3 className="text-white text-lg font-bold tracking-[-0.02em]">AI Team Assembly</h3>
            <p className="text-[#A0A0A0] text-sm leading-[1.7]">Deploy Marketing, CTO, and Researcher agents to run asynchronous background tests on Celery.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
