"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Download, Copy, Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type StylePreset = "Realistic" | "Artistic" | "Minimalist" | "Illustration" | "3D" | "Flat";
type AspectRatio = "1:1" | "16:9" | "9:16" | "3:2";
type ImageCount = 1 | 2 | 4;

type GeneratedImage = {
  id: string;
  url: string; // We'll use colored placeholders or abstract gradients
  prompt: string;
};

const MOCK_HISTORY = [
  { id: "h1", url: "bg-gradient-to-br from-neutral-800 to-neutral-900" },
  { id: "h2", url: "bg-gradient-to-tr from-neutral-700 to-black" },
  { id: "h3", url: "bg-gradient-to-bl from-neutral-900 to-neutral-800" },
  { id: "h4", url: "bg-gradient-to-tl from-[#111] to-[#333]" },
  { id: "h5", url: "bg-gradient-to-r from-neutral-800 to-neutral-950" },
  { id: "h6", url: "bg-gradient-to-r from-[#222] to-black" },
];

export default function ImageGenerationPage() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [showNegative, setShowNegative] = useState(false);
  const [stylePreset, setStylePreset] = useState<StylePreset>("Realistic");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [count, setCount] = useState<ImageCount>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [fullscreenImage, setFullscreenImage] = useState<GeneratedImage | null>(null);

  // Esc to close fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreenImage(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleGenerate = () => {
    if (!prompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setGeneratedImages([]); // clear current for shimmer
    
    // Simulate generation delay
    setTimeout(() => {
      const newImages: GeneratedImage[] = Array.from({ length: count }).map((_, i) => ({
        id: `img-${Date.now()}-${i}`,
        url: ["bg-gradient-to-br from-[#111] to-[#222]", "bg-gradient-to-tl from-[#1A1A1A] to-black", "bg-gradient-to-tr from-[#0F0F0F] to-[#2A2A2A]", "bg-gradient-to-b from-[#222] to-black"][i % 4],
        prompt,
      }));
      setGeneratedImages(newImages);
      setIsGenerating(false);
    }, 3000);
  };

  const getAspectRatioPadding = () => {
    switch (aspectRatio) {
      case "16:9": return "pb-[56.25%]";
      case "9:16": return "pb-[177.77%]";
      case "3:2": return "pb-[66.66%]";
      case "1:1": 
      default: return "pb-[100%]";
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-black overflow-hidden relative">
      
      {/* Left Panel: Controls (340px) */}
      <div className="w-full md:w-[340px] h-full border-b md:border-b-0 md:border-r border-[#1E1E1E] bg-[#000000] p-6 flex flex-col overflow-y-auto shrink-0 z-10">
        
        <div className="flex-1 space-y-6">
          {/* Prompt */}
          <div>
            <label className="block text-[#555555] text-xs uppercase tracking-widest mb-2 font-semibold font-sans">
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              className="w-full bg-[#0A0A0A] border border-[#222222] focus:border-[#444444] rounded-xl p-3 text-white text-sm placeholder-[#333333] resize-none focus:outline-none focus:ring-0 min-h-[96px] transition-colors"
            />
          </div>

          {/* Negative Prompt Toggle */}
          <div>
            <button 
              onClick={() => setShowNegative(!showNegative)}
              className="flex items-center gap-1.5 text-[#444444] hover:text-[#666666] text-xs transition-colors cursor-pointer outline-none"
            >
              {showNegative ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              NEGATIVE PROMPT
            </button>
            <AnimatePresence>
              {showNegative && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: "auto", opacity: 1, marginTop: 8 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <textarea
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="Things to exclude from the image..."
                    className="w-full bg-[#0A0A0A] border border-[#222222] focus:border-[#444444] rounded-xl p-3 text-white text-sm placeholder-[#333333] resize-none focus:outline-none focus:ring-0 min-h-[96px] transition-colors"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Style Presets */}
          <div>
            <label className="block text-[#555555] text-xs uppercase tracking-widest mb-2 font-semibold font-sans">
              Style Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["Realistic", "Artistic", "Minimalist", "Illustration", "3D", "Flat"] as StylePreset[]).map((style) => (
                <button
                  key={style}
                  onClick={() => setStylePreset(style)}
                  className={cn(
                    "bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg p-2.5 text-center cursor-pointer transition-colors outline-none",
                    stylePreset === style 
                      ? "border-white text-white bg-[#111111]" 
                      : "text-[#666666] hover:border-[#333333]"
                  )}
                >
                  <span className="text-xs font-medium">{style}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-[#555555] text-xs uppercase tracking-widest mb-2 font-semibold font-sans">
              Aspect Ratio
            </label>
            <div className="flex items-center bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg overflow-hidden p-1">
              {(["1:1", "16:9", "9:16", "3:2"] as AspectRatio[]).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={cn(
                    "flex-1 text-xs py-1.5 rounded-md font-medium transition-colors cursor-pointer outline-none",
                    aspectRatio === ratio
                      ? "bg-white text-black"
                      : "text-[#555555] hover:text-[#999999]"
                  )}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Image Count */}
          <div>
            <label className="block text-[#555555] text-xs uppercase tracking-widest mb-2 font-semibold font-sans">
              Image Count
            </label>
            <div className="flex items-center bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg overflow-hidden p-1">
              {([1, 2, 4] as ImageCount[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCount(c)}
                  className={cn(
                    "flex-1 text-xs py-1.5 rounded-md font-medium transition-colors cursor-pointer outline-none",
                    count === c
                      ? "bg-white text-black"
                      : "text-[#555555] hover:text-[#999999]"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button Wrapper to keep it at bottom naturally */}
        <div className="pt-6 mt-auto">
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className={cn(
              "w-full font-medium rounded-xl py-3 transition-colors outline-none cursor-pointer flex items-center justify-center",
              isGenerating || !prompt.trim()
                ? "bg-[#111111] text-[#444444] cursor-not-allowed"
                : "bg-white text-black hover:bg-[#E0E0E0] active:bg-[#C0C0C0]"
            )}
          >
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>

      {/* Right Panel: Output & History */}
      <div className="flex-1 flex flex-col h-full bg-black">
        
        {/* Output Grid Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {(!isGenerating && generatedImages.length === 0) ? (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-[#333333] text-sm">Fill out the prompt and hit generate to see results.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px] auto-rows-max w-full">
              {isGenerating 
                ? Array.from({ length: count }).map((_, i) => (
                   <div key={i} className={cn("bg-[#0A0A0A] rounded-xl animate-pulse relative w-full", getAspectRatioPadding())} />
                  ))
                : generatedImages.map((img) => (
                   <div key={img.id} className={cn("rounded-xl overflow-hidden relative group w-full", img.url, getAspectRatioPadding())}>
                     {/* Overlay */}
                     <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button className="w-10 h-10 rounded-full bg-black/50 border border-[#333] flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors cursor-pointer outline-none">
                          <Download size={18} />
                        </button>
                        <button 
                          onClick={() => setFullscreenImage(img)}
                          className="w-10 h-10 rounded-full bg-black/50 border border-[#333] flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors cursor-pointer outline-none"
                        >
                          <Maximize2 size={18} />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-black/50 border border-[#333] flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors cursor-pointer outline-none">
                          <Copy size={18} />
                        </button>
                     </div>
                   </div>
                  ))
              }
            </div>
          )}
        </div>

        {/* History Bottom Ribbon */}
        <div className="p-6 pt-0 shrink-0">
          <h3 className="text-[#444444] text-xs uppercase tracking-widest mb-3 font-semibold font-sans">
            Recent Generations
          </h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full">
            {MOCK_HISTORY.map((hist) => (
              <div 
                key={hist.id} 
                className={cn(
                  "w-16 h-16 rounded-lg shrink-0 cursor-pointer border border-[#1E1E1E] hover:border-[#444444] transition-colors",
                  hist.url
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen Overlay */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-8 backdrop-blur-sm"
          >
            <button 
              onClick={() => setFullscreenImage(null)}
              className="absolute top-6 right-6 text-[#555555] hover:text-white transition-colors cursor-pointer outline-none"
            >
              <X size={32} />
            </button>
            <div className={cn("w-full max-w-4xl max-h-[80vh] rounded-xl overflow-hidden shadow-2xl relative", fullscreenImage.url, getAspectRatioPadding())} />
            <div className="absolute bottom-12 max-w-2xl text-center">
              <p className="text-white text-lg font-medium tracking-tight bg-black/50 px-6 py-3 rounded-full border border-[#222]">
                "{fullscreenImage.prompt}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
