"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Presentation, Briefcase, BarChart3, Mail, Linkedin, FileText, Megaphone, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Writing", "Research", "Legal", "Finance"];

const TOOLS = [
  { id: "pitch-deck", name: "Pitch Deck Generator", description: "Create a compelling 10-slide pitch deck structure for investors.", category: "Finance", icon: Presentation },
  { id: "business-plan", name: "Business Plan Builder", description: "Generate a comprehensive business plan including go-to-market strategy.", category: "Finance", icon: Briefcase },
  { id: "market-research", name: "Market Research", description: "Analyze competitor landscapes and total addressable market (TAM).", category: "Research", icon: BarChart3 },
  { id: "cold-email", name: "Cold Email Writer", description: "Draft high-converting cold emails tailored to specific buyer personas.", category: "Writing", icon: Mail },
  { id: "linkedin-post", name: "LinkedIn Post Writer", description: "Create engaging thought leadership posts for your network.", category: "Writing", icon: Linkedin },
  { id: "job-description", name: "Job Description Writer", description: "Write attractive job requirements for key startup roles.", category: "Writing", icon: FileText },
  { id: "pr-template", name: "PR Template Generator", description: "Draft press releases for product launches or funding announcements.", category: "Writing", icon: Megaphone },
  { id: "tos-generator", name: "Terms of Service Generator", description: "Create standardized SaaS Terms of Service and Privacy Policies.", category: "Legal", icon: Scale },
];

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredTools = TOOLS.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory === "All" || t.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="w-full min-h-full bg-black">
      <h1 className="text-white font-bold text-3xl tracking-tight mb-8">Tools</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444444]" size={18} />
          <input 
            type="text" 
            placeholder="Search tools..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#222222] focus:border-[#444444] rounded-xl pl-12 pr-4 py-2.5 text-white placeholder-[#333333] focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map(cat => (
             <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm transition-colors whitespace-nowrap outline-none cursor-pointer",
                  activeCategory === cat 
                    ? "bg-white text-black border border-white font-medium"
                    : "bg-transparent border border-[#1E1E1E] text-[#555555] hover:text-[#999999]"
                )}
             >
               {cat}
             </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[12px]">
        {filteredTools.map(tool => (
          <Link href={`/tools/${tool.id}`} key={tool.id}>
            <div className="bg-[#0A0A0A] border border-[#1E1E1E] hover:border-[#333333] rounded-2xl p-5 flex flex-col h-full cursor-pointer transition-all group">
              <div className="w-10 h-10 bg-[#111111] border border-[#1E1E1E] rounded-xl flex items-center justify-center mb-4 shrink-0 transition-colors group-hover:border-[#333333]">
                <tool.icon size={20} strokeWidth={1.5} className="text-white" />
              </div>
              <h3 className="text-white font-semibold text-base tracking-tight">{tool.name}</h3>
              <p className="text-[#555555] text-sm mt-1 line-clamp-2 leading-[1.6] flex-1">
                {tool.description}
              </p>
              <div className="mt-4 text-[#444444] text-xs font-medium group-hover:text-white transition-colors">
                Open →
              </div>
            </div>
          </Link>
        ))}
        {filteredTools.length === 0 && (
          <div className="col-span-full py-12 text-center text-[#555555]">
            No tools found matching your search.
          </div>
        )}
      </div>
      
    </div>
  );
}
