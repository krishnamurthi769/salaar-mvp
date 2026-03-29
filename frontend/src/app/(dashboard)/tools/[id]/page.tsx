"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Copy, Download, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const WIZARD_STEPS = [
  { id: "01", label: "Company Overview" },
  { id: "02", label: "Problem & Solution" },
  { id: "03", label: "Market & Traction" },
];

export default function ToolWizardPage() {
  const router = useRouter();
  const params = useParams();
  
  // Clean title from ID e.g. "pitch-deck" -> "Pitch Deck"
  const rawId = typeof params.id === "string" ? params.id : "tool";
  const title = rawId.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  
  const [activeStepId, setActiveStepId] = useState("01");
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState("");
  const [streamingText, setStreamingText] = useState("");

  const handleGenerate = () => {
    setIsGenerating(true);
    setOutput("");
    setStreamingText("");

    const mockResponse = `Slide 1: Title & Purpose\nCompany: Alpha\nMission: The AI Operating System for Startups.\n\nSlide 2: The Problem\nStartups waste 40% of their early capital on disjointed SaaS tools and manual operations. There is no unified context layer.\n\nSlide 3: The Solution\nA unified OS featuring specialized AI agents, Perplexity-style research, and founder tools, all operating on a shared dynamic memory context (Pinecone + PostgreSQL).\n\nSlide 4: Market Size\nTotal Addressable Market: $25B in SMB AI tools by 2027.`;

    let i = 0;
    const words = mockResponse.split(" ");
    
    const interval = setInterval(() => {
      if (i < words.length) {
        setStreamingText((prev) => prev + (prev ? " " : "") + words[i]);
        i++;
      } else {
        clearInterval(interval);
        setIsGenerating(false);
        setOutput(mockResponse);
      }
    }, 50);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] -m-8 bg-black overflow-hidden relative">
      {/* Left Panel: Steps (240px) */}
      <div className="w-[240px] border-r border-[#1E1E1E] flex flex-col pt-8 pb-6 px-6 shrink-0 overflow-y-auto z-10 bg-black">
        <button 
          onClick={() => router.push("/tools")}
          className="flex items-center gap-2 text-[#555555] hover:text-white transition-colors text-sm mb-8 font-medium cursor-pointer outline-none"
        >
          <ArrowLeft size={16} />
          Back to Tools
        </button>

        <h2 className="text-white font-bold text-xl tracking-tight mb-8 leading-tight">{title}</h2>

        <div className="space-y-6">
          {WIZARD_STEPS.map((step) => {
            const isActive = activeStepId === step.id;
            return (
              <div 
                key={step.id} 
                onClick={() => setActiveStepId(step.id)}
                className="flex items-start gap-3 cursor-pointer group"
              >
                <div className="relative pt-1">
                  {isActive && (
                    <motion.div 
                      layoutId="active-step-dot"
                      className="absolute -left-3 top-[10px] w-1.5 h-1.5 bg-white rounded-full"
                    />
                  )}
                  <span className={cn(
                    "font-mono text-sm leading-none transition-colors",
                    isActive ? "text-white" : "text-[#333333] group-hover:text-[#555555]"
                  )}>
                    {step.id}
                  </span>
                </div>
                <span className={cn(
                  "text-sm font-medium transition-colors pt-[2px]",
                  isActive ? "text-white" : "text-[#555555] group-hover:text-[#888888]"
                )}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Panel: Content */}
      <div className="flex-1 flex flex-col bg-black px-8 py-8 overflow-y-auto h-full scrollbar-none pb-24">
        <div className="max-w-3xl w-full mx-auto space-y-8">
          
          {/* Step Inputs */}
          <div className="space-y-6">
            <h3 className="text-white font-semibold text-lg">{WIZARD_STEPS.find(s => s.id === activeStepId)?.label}</h3>
            
            <div className="space-y-4">
              {activeStepId === "01" && (
                <>
                  <div>
                    <label className="block text-[#555555] text-xs uppercase tracking-widest mb-2 font-semibold font-sans">Company Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. SALAAR"
                      className="w-full bg-[#0A0A0A] border border-[#222222] focus:border-[#444444] rounded-xl px-4 py-3 text-white text-sm placeholder-[#333333] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#555555] text-xs uppercase tracking-widest mb-2 font-semibold font-sans">One-line Pitch</label>
                    <textarea 
                      placeholder="The AI OS for Startups..."
                      className="w-full bg-[#0A0A0A] border border-[#222222] focus:border-[#444444] rounded-xl px-4 py-3 text-white text-sm placeholder-[#333333] focus:outline-none transition-colors resize-none min-h-[96px]"
                    />
                  </div>
                </>
              )}
              {activeStepId !== "01" && (
                <div className="animate-in fade-in duration-300">
                   <label className="block text-[#555555] text-xs uppercase tracking-widest mb-2 font-semibold font-sans">Additional Context</label>
                    <textarea 
                      placeholder="Provide data, metrics, or insights for this section..."
                      className="w-full bg-[#0A0A0A] border border-[#222222] focus:border-[#444444] rounded-xl px-4 py-3 text-white text-sm placeholder-[#333333] focus:outline-none transition-colors resize-none min-h-[120px]"
                    />
                </div>
              )}
            </div>

            <div className="pt-2">
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-white text-black font-medium rounded-xl px-6 py-3 hover:bg-[#E0E0E0] disabled:bg-[#111111] disabled:text-[#444444] disabled:cursor-not-allowed transition-colors w-full sm:w-auto flex justify-center items-center outline-none"
              >
                {isGenerating ? (
                  <span className="flex items-center relative">
                    Generating
                    <span className="flex absolute -right-4 bottom-[2px] leading-none tracking-widest">
                       <span className="animate-bounce inline-block">.</span>
                       <span className="animate-bounce inline-block" style={{animationDelay: "0.15s"}}>.</span>
                       <span className="animate-bounce inline-block" style={{animationDelay: "0.3s"}}>.</span>
                    </span>
                  </span>
                ) : "Generate Section"}
              </button>
            </div>
          </div>

          {/* Output Area */}
          {(streamingText || output) && (
            <div className="mt-8">
              <div className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-2xl p-6 shadow-sm overflow-hidden">
                <div className="text-white whitespace-pre-wrap leading-[1.7] text-[15px] font-sans">
                  {streamingText || output}
                  {isGenerating && <span className="inline-block w-2 h-4 bg-white ml-2 animate-pulse align-middle" />}
                </div>

                {!isGenerating && output && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 pt-6 border-t border-[#111111] flex flex-wrap items-center justify-end gap-3"
                  >
                    <button className="border border-[#222222] text-[#666666] hover:text-white hover:border-[#444444] rounded-xl px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 outline-none cursor-pointer">
                      <Copy size={16} /> Copy
                    </button>
                    <button className="border border-[#222222] text-[#666666] hover:text-white hover:border-[#444444] rounded-xl px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 outline-none cursor-pointer">
                      <Download size={16} /> Download
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
