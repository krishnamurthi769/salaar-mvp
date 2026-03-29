"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ArrowRight, BookOpen, ExternalLink, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type DepthLevel = "Quick" | "Deep" | "Comprehensive";

type SearchState = "idle" | "searching" | "reading" | "generating" | "complete";

type Source = {
  id: number;
  domain: string;
  excerpt: string;
  relevance: number; // 0-100
};

const MOCK_SOURCES: Source[] = [
  { id: 1, domain: "techcrunch.com", excerpt: "Generative AI startups raised $27B in 2023, representing a significant shift in venture deployment...", relevance: 98 },
  { id: 2, domain: "cbinsights.com", excerpt: "The State of AI 2024 report indicates that autonomous agents and orchestration frameworks...", relevance: 92 },
  { id: 3, domain: "a16z.com", excerpt: "Emerging architectures for LLM applications focus on RAG, routing, and specialized multi-agent...", relevance: 85 },
];

export default function ResearchPage() {
  const [query, setQuery] = useState("");
  const [depth, setDepth] = useState<DepthLevel>("Quick");
  const [state, setState] = useState<SearchState>("idle");
  const [resultsVisible, setResultsVisible] = useState(false);
  
  const handleSearch = () => {
    if (!query.trim()) return;
    
    setState("searching");
    setResultsVisible(false);
    
    // Simulate orchestration and research flow
    setTimeout(() => setState("reading"), 1500);
    setTimeout(() => setState("generating"), 3000);
    setTimeout(() => {
      setState("complete");
      setResultsVisible(true);
    }, 4500);
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-black overflow-hidden relative">
      {/* Left Panel: Query & Results (60%) */}
      <div className={cn("w-full md:w-[60%] flex flex-col h-full overflow-y-auto px-6 py-8 transition-all duration-300", !resultsVisible && "md:w-full max-w-4xl mx-auto")}>
        
        {/* Header / Query Area */}
        <div className="space-y-6 shrink-0">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-[-0.02em] text-white flex items-center gap-3">
              <BookOpen size={28} />
              Research Engine
            </h1>
            <p className="text-[#A0A0A0] text-sm">Deploy agents to scrape, synthesize, and cite the web.</p>
          </div>

          <div className="bg-[#0A0A0A] border border-[#222222] focus-within:border-[#444444] rounded-xl p-4 transition-colors">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you want to research?"
              className="w-full bg-transparent text-white text-lg placeholder-[#333333] resize-none focus:outline-none"
              rows={Math.max(2, Math.min(6, query.split("\n").length))}
            />
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                {(["Quick", "Deep", "Comprehensive"] as DepthLevel[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDepth(d)}
                    className={cn(
                      "px-3 py-1 text-xs rounded-full font-medium transition-colors cursor-pointer",
                      depth === d 
                        ? "bg-white text-black border border-white" 
                        : "bg-transparent border border-[#222222] text-[#555555] hover:text-white"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={handleSearch}
                disabled={!query.trim() || state !== "idle" && state !== "complete"}
                className="bg-white text-black disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 cursor-pointer"
              >
                {state !== "idle" && state !== "complete" ? "Synthesizing..." : "Initialize"}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        <AnimatePresence>
          {state !== "idle" && state !== "complete" && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-12 space-y-8"
            >
              <div className="flex items-center gap-4 border border-[#1E1E1E] bg-[#0A0A0A] p-4 rounded-xl">
                <Activity size={18} className="text-white animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", state === "searching" ? "bg-white" : "bg-[#333333]")} />
                    <span className={cn("text-sm transition-colors", state === "searching" ? "text-white" : "text-[#444444]")}>Searching web...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", state === "reading" ? "bg-white" : "bg-[#333333]")} />
                    <span className={cn("text-sm transition-colors", state === "reading" ? "text-white" : "text-[#444444]")}>Reading sources...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", state === "generating" ? "bg-white" : "bg-[#333333]")} />
                    <span className={cn("text-sm transition-colors", state === "generating" ? "text-white" : "text-[#444444]")}>Generating summary...</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="h-4 bg-[#111111] animate-pulse rounded w-3/4" />
                <div className="h-4 bg-[#111111] animate-pulse rounded w-full" />
                <div className="h-4 bg-[#111111] animate-pulse rounded w-5/6" />
                <div className="h-4 bg-[#111111] animate-pulse rounded w-1/2" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Area */}
        <AnimatePresence>
          {resultsVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-12 space-y-6 pb-12"
            >
              <div>
                <h3 className="text-[#444444] text-xs uppercase tracking-widest mb-2 font-semibold">Executive Summary</h3>
                <p className="text-white leading-relaxed text-[15px]">
                  The landscape of Generative AI startups in 2024 has heavily shifted towards autonomous agent architectures and specific vertically-integrated applications. While base model funding continues, the application layer—specifically tools enabling reliable RAG (Retrieval-Augmented Generation) and workflow automation—is seeing accelerated growth.
                </p>
              </div>

              <div className="border-t border-[#111111] my-6" />

              <div>
                <h3 className="text-[#444444] text-xs uppercase tracking-widest mb-3 font-semibold">Key Findings</h3>
                <ul className="space-y-2">
                  {["Agent orchestration platforms are expanding.", "Context windows continue to increase, reducing chunking reliance.", "Open-source models are achieving parity on specific benchmark subsets."].map((finding, i) => (
                    <li key={i} className="flex gap-3 text-[15px] leading-relaxed">
                      <span className="text-[#555555] select-none">—</span>
                      <span className="text-white">{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-[#111111] my-6" />

              <div>
                <h3 className="text-[#444444] text-xs uppercase tracking-widest mb-3 font-semibold">Market Analysis</h3>
                <div className="border border-[#1E1E1E] rounded-lg overflow-hidden font-sans text-sm">
                  <div className="grid grid-cols-3 bg-[#0A0A0A] text-[#666666] font-medium p-3 border-b border-[#1E1E1E]">
                    <div>Segment</div>
                    <div>Growth YoY</div>
                    <div>Primary Challenge</div>
                  </div>
                  <div className="grid grid-cols-3 bg-black text-white p-3 border-b border-[#111111]">
                    <div>Model Training</div>
                    <div>+120%</div>
                    <div>Compute Costs</div>
                  </div>
                  <div className="grid grid-cols-3 bg-black text-white p-3 border-b border-[#111111]">
                    <div>Vector Databases</div>
                    <div>+350%</div>
                    <div>Latency</div>
                  </div>
                  <div className="grid grid-cols-3 bg-black text-white p-3">
                    <div>Agent Frameworks</div>
                    <div>+500%</div>
                    <div>Reliability</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Panel: Sources (40%) */}
      <AnimatePresence>
        {resultsVisible && (
          <motion.div 
            initial={{ opacity: 0, x: 20, width: 0 }}
            animate={{ opacity: 1, x: 0, width: "auto" }}
            className="w-full md:w-[40%] h-full border-t md:border-t-0 md:border-l border-[#1E1E1E] bg-black p-6 overflow-y-auto"
          >
            <h2 className="text-[#555555] text-xs uppercase tracking-widest mb-4 font-semibold">Sources</h2>
            
            <div className="space-y-3">
              {MOCK_SOURCES.map((source, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  key={source.id} 
                  className="bg-[#0A0A0A] border border-[#1E1E1E] hover:border-[#333333] transition-colors rounded-lg p-4 cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[#333333] text-xs font-mono">[{source.id}]</span>
                      <span className="text-white text-sm font-medium">{source.domain}</span>
                    </div>
                    <ExternalLink size={14} className="text-[#444444] group-hover:text-white transition-colors" />
                  </div>
                  
                  <p className="text-[#666666] text-xs line-clamp-2 leading-relaxed mb-3">
                    {source.excerpt}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-0.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: `${source.relevance}%` }} />
                    </div>
                    <span className="text-[10px] text-[#555555] font-mono">{source.relevance}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-[#111111] border border-[#222222] rounded-lg">
               <p className="text-xs text-[#666666] leading-relaxed">
                 Citations are generated using Pinecone vector search and embedded directly into the LLM context window by the Orchestrator.
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
