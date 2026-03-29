import { ArrowRight } from "lucide-react";

export default function DashboardHome() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-[-0.02em] text-white">
          Alpha Project
        </h1>
        <p className="text-[#A0A0A0] text-sm">
          Overview of your AI team's current operations and memory context.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quick actions mock */}
        <div className="card-styled flex flex-col justify-between hover:border-[#444444] transition-colors cursor-pointer group">
          <div className="space-y-2">
            <h3 className="font-bold text-white tracking-tight">New Research Task</h3>
            <p className="text-sm text-[#A0A0A0] leading-relaxed">
              Deploy the Research Agent to scrape competitors or compile Perplexity-style reports.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-end">
            <div className="w-8 h-8 rounded-full bg-[#111111] group-hover:bg-white text-[#555] group-hover:text-black flex items-center justify-center transition-colors">
              <ArrowRight size={14} />
            </div>
          </div>
        </div>

        <div className="card-styled flex flex-col justify-between hover:border-[#444444] transition-colors cursor-pointer group">
          <div className="space-y-2">
            <h3 className="font-bold text-white tracking-tight">Founder Tools</h3>
            <p className="text-sm text-[#A0A0A0] leading-relaxed">
              Generate pitch decks, business plans, or specialized marketing emails instantly.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-end">
            <div className="w-8 h-8 rounded-full bg-[#111111] group-hover:bg-white text-[#555] group-hover:text-black flex items-center justify-center transition-colors">
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 space-y-4">
        <h2 className="text-sm uppercase tracking-widest text-[#444444] font-semibold">Active Agents</h2>
        <div className="space-y-2">
          {["CTO Agent (Reviewing API)", "Marketing Agent (Drafting Campaign)"].map((agent, i) => (
             <div key={i} className="flex items-center justify-between p-4 border border-[#1E1E1E] bg-[#0A0A0A]">
               <span className="text-sm text-white font-medium">{agent}</span>
               <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                 <span className="text-xs text-[#666]">Processing</span>
               </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
