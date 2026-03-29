"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Search, 
  PenTool, 
  Users, 
  Wrench, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Research", href: "/research", icon: Search },
  { name: "Create", href: "/create", icon: PenTool },
  { name: "AI Team", href: "/agents", icon: Users },
  { name: "Tools", href: "/tools", icon: Wrench },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Mock usage data
  const usagePercentage = 85;
  const isHighUsage = usagePercentage >= 90;

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ type: "spring", bounce: 0, duration: 0.3 }}
      className="h-screen bg-black border-r border-[#1E1E1E] flex flex-col pt-6 relative shrink-0 z-50 overflow-hidden"
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute right-0 top-8 translate-x-1/2 w-6 h-6 bg-[#141414] border border-[#222222] rounded-full flex items-center justify-center text-[#666] hover:text-white transition-colors z-50"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Header / Logo */}
      <div className={cn("px-4 mb-8 flex items-center", collapsed ? "justify-center" : "")}>
        {!collapsed ? (
          <h1 className="text-white font-bold text-2xl tracking-[-0.04em] whitespace-nowrap overflow-hidden">
            SALAAR
          </h1>
        ) : (
          <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-bold font-mono">
            S
          </div>
        )}
      </div>

      {/* Workspace Selector Mock */}
      <div className={cn("px-4 mb-8", collapsed && "hidden")}>
        <div className="w-full bg-[#0A0A0A] border border-[#222222] rounded-md px-3 py-2 flex items-center justify-between cursor-pointer hover:border-[#444444] transition-colors">
          <span className="text-sm font-medium">Alpha Project</span>
          <ChevronRight size={14} className="text-[#666]" />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-1">
        {!collapsed && (
          <div className="px-2 mb-2">
            <h2 className="text-[#444444] text-[10px] uppercase tracking-widest font-semibold font-sans">
              Core Modules
            </h2>
          </div>
        )}
        
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2 rounded-md transition-colors w-full group overflow-hidden",
                  isActive 
                    ? "text-white bg-[#141414]" 
                    : "text-[#666666] hover:text-white hover:bg-[#111111]"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute left-0 top-0 bottom-0 w-[2px] bg-white"
                  />
                )}
                <item.icon size={18} className="shrink-0" />
                
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}

        {/* Mock Chat History if not collapsed */}
        <AnimatePresence>
          {!collapsed && pathname.startsWith("/chat") && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 px-2"
            >
              <h2 className="text-[#444444] text-[10px] uppercase tracking-widest font-semibold font-sans mb-2 pl-2">
                Recent Chats
              </h2>
              <div className="space-y-[2px]">
                {["Marketing Copy", "API Architecture", "Debug Postgres"].map((chat, i) => (
                  <div key={i} className="px-3 py-1.5 text-xs text-[#555555] hover:text-white cursor-pointer transition-colors truncate w-full rounded-md hover:bg-[#111111]">
                    {chat}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Footer / Settings */}
      <div className="p-4 border-t border-[#1E1E1E] mt-auto">
        <Link href="/settings">
          <motion.div
            whileHover={{ x: 2 }}
            className={cn(
               "flex items-center gap-3 px-3 py-2 rounded-md transition-colors w-full group mb-4",
               pathname.startsWith("/settings") ? "text-white bg-[#141414]" : "text-[#666] hover:text-white hover:bg-[#111]"
            )}
          >
            <Settings size={18} className="shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Settings</span>}
          </motion.div>
        </Link>

        {/* Usage & Profile */}
        {!collapsed && (
          <div className="px-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-[#555] font-sans uppercase tracking-widest">Workspace Usage</span>
              <span className="text-xs text-[#A0A0A0]">{usagePercentage}%</span>
            </div>
            <div className="h-1 w-full bg-[#1A1A1A] rounded-full overflow-hidden mb-4">
              <div 
                className={cn("h-full rounded-full transition-all duration-500", isHighUsage ? "bg-[#FF4444]" : "bg-white")} 
                style={{ width: `${usagePercentage}%` }} 
              />
            </div>
            
            <div className="flex items-center gap-3 pt-2">
              <div className="w-8 h-8 rounded bg-[#1A1A1A] flex items-center justify-center font-bold text-xs">
                JD
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm text-white truncate">John Doe</p>
                <div className="flex items-center gap-1 text-[#666] text-xs">
                  <Zap size={10} className="text-white" />
                  <span>Pro Plan</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
