"use client";

import { useState } from "react";
import { Plus, UserPlus, MoreHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type AgentStatus = "Active" | "Idle" | "Working";

type Agent = {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  lastActivity: string;
};

type TaskActivity = {
  id: string;
  agentName: string;
  agentInitial: string;
  task: string;
  status: string;
  time: string;
};

const MOCK_AGENTS: Agent[] = [
  { id: "1", name: "Market Researcher", role: "Research", status: "Working", lastActivity: "Scraping Q3 SaaS reports..." },
  { id: "2", name: "Alpha CTO", role: "CTO", status: "Active", lastActivity: "Ready for code review" },
  { id: "3", name: "Content Writer", role: "Marketing", status: "Idle", lastActivity: "Paused. Last active 2h ago" },
  { id: "4", name: "Financial M.", role: "Founder", status: "Active", lastActivity: "Analyzing burn rate metrics" },
];

const MOCK_ACTIVITIES: TaskActivity[] = [
  { id: "t1", agentName: "Market Researcher", agentInitial: "M", task: "Compiled competitor pricing table", status: "Done", time: "2m ago" },
  { id: "t2", agentName: "Alpha CTO", agentInitial: "A", task: "Reviewed PR #142 (Stripe webhook)", status: "Done", time: "15m ago" },
  { id: "t3", agentName: "Content Writer", agentInitial: "C", task: "Drafted email campaign: Beta launch", status: "Failed", time: "1h ago" },
  { id: "t4", agentName: "Financial M.", agentInitial: "F", task: "Generated Q2 burn rate chart", status: "Done", time: "3h ago" },
];

export default function AgentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAgentRole, setNewAgentRole] = useState("Research");

  return (
    <div className="flex flex-col h-full w-full bg-black overflow-hidden relative">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 mb-6 pt-6 px-6 border-b border-[#1E1E1E] shrink-0">
        <h1 className="text-3xl font-bold tracking-[--0.02em] text-white">AI Team</h1>
        
        <div className="flex items-center gap-3">
          <button className="border border-[#222222] hover:border-[#444444] text-white rounded-xl px-4 py-2 text-sm transition-colors flex items-center gap-2 cursor-pointer outline-none">
            <UserPlus size={16} />
            <span className="hidden sm:inline">Invite Human</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-white hover:bg-[#E0E0E0] text-black font-medium rounded-xl px-4 py-2 text-sm transition-colors flex items-center gap-2 cursor-pointer outline-none"
          >
            <Plus size={16} />
            <span>Add Agent</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden px-6 pb-6 gap-8">
        
        {/* Left: Agents Grid (65%) */}
        <div className="w-full md:w-[65%] h-full overflow-y-auto pr-2 scrollbar-none">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
            {MOCK_AGENTS.map((agent) => (
              <div 
                key={agent.id} 
                className="bg-[#0A0A0A] border border-[#1E1E1E] hover:border-[#333333] transition-colors rounded-2xl p-5 flex flex-col relative group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#141414] border border-[#333333] flex items-center justify-center shrink-0">
                      <span className="text-white font-bold font-sans text-lg">{agent.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-base leading-tight">{agent.name}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="bg-[#111111] border border-[#1E1E1E] text-[#888888] text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-medium">
                          {agent.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="text-[#444444] hover:text-white transition-colors p-1 cursor-pointer outline-none">
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-1">
                   {agent.status === "Working" && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                   {agent.status === "Active" && <span className="w-2 h-2 rounded-full bg-white" />}
                   {agent.status === "Idle" && <span className="w-2 h-2 rounded-full bg-[#333333]" />}
                   <span className={cn(
                     "text-sm", 
                     agent.status === "Working" ? "text-white" : 
                     agent.status === "Active" ? "text-[#888888]" : "text-[#555555]"
                   )}>
                     {agent.status === "Working" ? "Working..." : agent.status}
                   </span>
                </div>
                
                <p className="text-[#555555] text-xs line-clamp-1 h-4">
                  {agent.lastActivity}
                </p>

                <div className="border-t border-[#111111] my-3" />

                <button className="w-full bg-[#111111] border border-[#1E1E1E] hover:border-[#333333] hover:bg-[#141414] transition-colors text-white text-sm font-medium rounded-xl py-2 cursor-pointer outline-none mt-auto">
                  Assign Task
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Task Feed (35%) */}
        <div className="w-full md:w-[35%] h-full overflow-y-auto pl-4 border-l border-[#1E1E1E] hidden md:block">
          <h2 className="text-[#444444] text-xs uppercase tracking-widest font-semibold font-sans mb-4 sticky top-0 bg-black pt-1 pb-2 z-10">
            Activity Feed
          </h2>
          
          <div className="space-y-1">
            {MOCK_ACTIVITIES.map((activity) => (
              <div key={activity.id} className="flex gap-3 py-3 border-b border-[#0F0F0F] hover:bg-[#0A0A0A] transition-colors rounded-lg px-2 -mx-2">
                <div className="w-6 h-6 rounded-full bg-[#141414] border border-[#333333] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white font-bold font-sans text-[10px]">{activity.agentInitial}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm leading-snug mb-1 pr-2">{activity.task}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[#555555] text-xs truncate">{activity.agentName}</span>
                    <span className={cn(
                      "text-[10px] px-2 rounded-full border border-[#1E1E1E] bg-[#111111] font-medium",
                      activity.status === "Failed" ? "text-[#FF4444] border-[#FF4444]/20" : "text-[#666666]"
                    )}>
                      {activity.status}
                    </span>
                  </div>
                </div>
                <div className="text-[#333333] text-xs shrink-0 whitespace-nowrap mt-0.5">
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Agent Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-[480px] bg-[#0A0A0A] border border-[#222222] rounded-2xl p-6 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold tracking-[-0.02em] text-xl">Create New Agent</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#555555] hover:text-white transition-colors cursor-pointer outline-none"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[#555555] text-xs uppercase tracking-widest mb-2 font-semibold">Agent Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Lead Generation Specialist"
                    className="w-full bg-black border border-[#222222] focus:border-[#444444] rounded-xl px-3 py-2 text-white text-sm placeholder-[#333333] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[#555555] text-xs uppercase tracking-widest mb-2 font-semibold">Specialty Role</label>
                  <div className="flex flex-wrap items-center bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg overflow-hidden p-1">
                    {["Research", "Marketing", "CTO", "Founder"].map((role) => (
                      <button
                        key={role}
                        onClick={() => setNewAgentRole(role)}
                        className={cn(
                          "flex-1 text-xs py-1.5 rounded-md font-medium transition-colors cursor-pointer outline-none",
                          newAgentRole === role
                            ? "bg-white text-black"
                            : "text-[#555555] hover:text-[#999999]"
                        )}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[#555555] text-xs uppercase tracking-widest mb-2 font-semibold">System Instructions (Prompt)</label>
                  <textarea 
                    placeholder="Define the behavior, tone, and goals for this agent..."
                    className="w-full bg-black border border-[#222222] focus:border-[#444444] rounded-xl p-3 text-white text-sm placeholder-[#333333] focus:outline-none transition-colors resize-none min-h-[96px]"
                  />
                </div>

                <div>
                  <label className="block text-[#555555] text-xs uppercase tracking-widest mb-2 font-semibold">Assigned Tools</label>
                  <div className="flex flex-wrap gap-2 p-3 bg-black border border-[#222222] rounded-xl cursor-text min-h-[44px]">
                     <span className="flex items-center gap-1 bg-[#111111] border border-[#1E1E1E] text-white text-[11px] font-medium rounded-full px-2.5 py-0.5">
                       Web Browser <X size={10} className="cursor-pointer hover:text-[#FF4444]" />
                     </span>
                     <span className="flex items-center gap-1 bg-[#111111] border border-[#1E1E1E] text-white text-[11px] font-medium rounded-full px-2.5 py-0.5">
                       Postgres DB <X size={10} className="cursor-pointer hover:text-[#FF4444]" />
                     </span>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="text-[#555555] hover:text-white px-4 py-2 text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button className="bg-white hover:bg-[#E0E0E0] active:bg-[#C0C0C0] text-black rounded-xl px-6 py-2 text-sm font-medium transition-colors outline-none">
                    Initialize Agent
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
