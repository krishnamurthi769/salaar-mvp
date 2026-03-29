"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Paperclip, ArrowUp, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type TabMenu = "Chat" | "Research" | "Code";
const TABS: TabMenu[] = ["Chat", "Research", "Code"];

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  agent?: string;
  tokens?: number;
  latency?: number;
  isStreaming?: boolean;
};

const SUGGESTIONS = [
  "Analyze the latest startup funding trends in AI.",
  "Write a cold email to a tier-1 VC partner.",
  "Generate a Next.js 14 API route for Stripe webhooks.",
  "Summarize the recent changes in React 19.",
];

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState<TabMenu>("Chat");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    
    // Simulate AI response stream delay
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: activeTab === "Code" 
          ? "Here is the layout component you requested:\n\n```tsx:layout.tsx\nexport default function Layout({ children }) {\n  return <div className=\"app\">{children}</div>;\n}\n```"
          : "Based on internal memory, I've compiled this data. The AI Orchestration Layer dynamically selected the best model for this operation without any manual routing.",
        agent: activeTab === "Research" ? "Research Agent" : "Orchestrator",
        isStreaming: true,
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Turn off streaming after 1.5s
      setTimeout(() => {
        setMessages((prev) => prev.map(m => m.id === aiMsg.id ? { ...m, isStreaming: false, tokens: 342, latency: 1.2 } : m));
      }, 1500);

    }, 500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderContent = (content: string, msgId: string) => {
    if (!content.includes("```")) {
      return <p className="whitespace-pre-wrap">{content}</p>;
    }

    const parts = content.split(/(```[\w]+:?[\w.]*\n[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (!part.startsWith("```")) {
        return <p key={index} className="whitespace-pre-wrap inline">{part}</p>;
      }

      const match = part.match(/```([\w]+)?:?([\w.]+)?\n([\s\S]+?)```/);
      if (!match) return <pre key={index}>{part}</pre>;

      const [_, lang, filename, code] = match;
      const cleanCode = code.trim();
      const codeId = `${msgId}-${index}`;

      return (
        <div key={index} className="my-4 bg-[#0A0A0A] border border-[#222222] rounded-lg overflow-hidden font-mono text-[13px] w-full max-w-full">
          <div className="flex items-center justify-between px-4 py-2 bg-[#0A0A0A] border-b border-[#222222]">
            <span className="text-[#555555]">{filename || lang || "code"}</span>
            <button 
              onClick={() => copyToClipboard(cleanCode, codeId)}
              className="text-[#555555] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedId === codeId ? <Check size={14} /> : <Copy size={14} />}
              <span className="text-xs uppercase tracking-wider">{copiedId === codeId ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <div className="p-4 overflow-x-auto">
            <pre>
              <code className="text-[#CCCCCC]">
                {cleanCode.split('\n').map((line, i) => {
                  let highlighted = line
                    .replace(/\b(export|async|function|const|let|var|await|return|new|import|from|default|type|interface)\b/g, '<span class="text-white font-bold">$1</span>')
                    .replace(/(['"`].*?['"`])/g, '<span class="text-[#CCCCCC]">$1</span>')
                    .replace(/(\/\/.*)/g, '<span class="text-[#888888]">$1</span>');
                  
                  return <div key={i} dangerouslySetInnerHTML={{ __html: highlighted || '&nbsp;' }} />;
                })}
              </code>
            </pre>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-black w-full relative">
      <div className="flex items-center gap-6 px-6 border-b border-[#1E1E1E] bg-black shrink-0 relative pt-4 md:pt-0">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
               "py-4 text-sm font-medium transition-colors relative cursor-pointer outline-none",
               activeTab === tab ? "text-white" : "text-[#555555] hover:text-[#999999]"
            )}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="activeChatTab"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-white -mb-px z-10"
              />
            )}
          </button>
        ))}
        <div className="ml-auto hidden sm:block">
          <div className="bg-[#111111] border border-[#222222] text-[#666666] text-xs px-3 py-1 rounded-full flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#555555]" />
            {activeTab} Mode
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] animate-in fade-in duration-500">
              <div className="w-12 h-12 bg-[#0A0A0A] border border-[#222] rounded-2xl flex items-center justify-center mb-6">
                <div className="text-white font-bold font-sans text-xl">S</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {SUGGESTIONS.map((text, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(text)}
                    className="bg-[#0A0A0A] border border-[#1E1E1E] hover:border-[#333333] transition-colors p-4 rounded-xl text-left flex flex-col gap-2 group cursor-pointer outline-none"
                  >
                    <span className="text-white text-sm leading-[1.7] font-sans">{text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
             messages.map((msg) => (
              <div key={msg.id} className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
                <div className={cn("flex flex-col", msg.role === "user" ? "max-w-[70%]" : "max-w-[85%] md:max-w-[70%]")}>
                  <div className="flex gap-2 w-full">
                    {msg.role === "ai" && (
                      <div className="w-7 h-7 mt-3 rounded-full bg-[#141414] border border-[#333333] flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold font-sans">
                          {msg.agent ? msg.agent.charAt(0) : "S"}
                        </span>
                      </div>
                    )}
                    
                    <div
                      className={cn(
                        "px-4 py-3 leading-[1.7] text-[15px] font-sans w-full",
                        msg.role === "user"
                          ? "bg-white text-black rounded-2xl rounded-tr-sm ml-auto"
                          : "bg-[#0A0A0A] text-white border border-[#1E1E1E] rounded-2xl rounded-tl-sm"
                      )}
                    >
                      {renderContent(msg.content, msg.id)}
                      {msg.isStreaming && <span className="inline-block w-2 h-4 bg-white ml-2 animate-pulse align-middle" />}
                    </div>
                  </div>
                </div>
                
                {msg.role === "ai" && !msg.isStreaming && msg.tokens && (
                  <div className="flex items-center gap-3 mt-1.5 ml-11 text-[#444444] text-[11px] font-mono uppercase tracking-wider">
                    <span>{msg.agent || "Orchestrator"}</span>
                    <span>•</span>
                    <span>{msg.tokens} tokens</span>
                    <span>•</span>
                    <span>{msg.latency}s</span>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} className="snap-align-end" />
        </div>
      </div>

      <div className="p-4 pt-0 shrink-0">
        <div className="max-w-3xl mx-auto relative group">
          <div className="bg-[#0A0A0A] border border-[#222222] focus-within:border-[#444444] focus-within:ring-0 rounded-2xl p-3 flex flex-col transition-colors mx-4 sm:mx-0 mb-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              placeholder="Message Orchestrator..."
              className="bg-transparent text-white placeholder-[#444444] resize-none focus:outline-none focus:ring-0 w-full min-h-[44px] max-h-[200px] text-[15px] leading-[1.7] font-sans"
              rows={1}
            />
            
            <div className="flex items-center justify-between mt-2">
              <button className="p-1.5 text-[#444444] hover:text-white rounded-md transition-colors cursor-pointer outline-none">
                <Paperclip size={18} />
              </button>
              
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim()}
                className="bg-white text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors rounded-xl px-4 py-1.5 flex items-center justify-center font-medium cursor-pointer outline-none"
              >
                <ArrowUp size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
