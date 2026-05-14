"use client";

import { useState, useRef } from "react";
import { CheckCircle, XCircle, Play, Square, Copy, Check, Trash2, ListChecks, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CheckUidPage() {
  const t = useTranslations("CheckUID");
  const [input, setInput] = useState("");
  const [liveUids, setLiveUids] = useState<string[]>([]);
  const [dieUids, setDieUids] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  
  const [copiedLive, setCopiedLive] = useState(false);
  const [copiedDie, setCopiedDie] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const startCheck = async () => {
    // Extract numbers that look like UIDs (10 to 20 digits)
    const matches = input.match(/\b\d{10,20}\b/g);
    if (!matches || matches.length === 0) {
      alert("No valid Facebook UIDs found in the input.");
      return;
    }

    const uniqueUids = [...new Set(matches)];
    
    setTotal(uniqueUids.length);
    setProgress(0);
    setLiveUids([]);
    setDieUids([]);
    setIsChecking(true);
    
    abortControllerRef.current = new AbortController();
    
    const CHUNK_SIZE = 20; // Check 20 at a time
    let localLive: string[] = [];
    let localDie: string[] = [];
    let processed = 0;

    for (let i = 0; i < uniqueUids.length; i += CHUNK_SIZE) {
      if (abortControllerRef.current.signal.aborted) {
        break;
      }

      const chunk = uniqueUids.slice(i, i + CHUNK_SIZE);
      
      try {
        const res = await fetch('/api/check-uid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uids: chunk }),
          signal: abortControllerRef.current.signal
        });
        
        if (!res.ok) throw new Error('API Error');
        
        const data = await res.json();
        
        const newLive = data.results.filter((r: any) => r.status === 'live').map((r: any) => r.uid);
        const newDie = data.results.filter((r: any) => r.status === 'die').map((r: any) => r.uid);
        
        localLive = [...localLive, ...newLive];
        localDie = [...localDie, ...newDie];
        
        setLiveUids(localLive);
        setDieUids(localDie);
        
        processed += chunk.length;
        setProgress(processed);
        
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Aborted');
        } else {
          console.error("Chunk failed", err);
          // Assume failed chunk means we couldn't check, but we shouldn't crash the whole process
          processed += chunk.length;
          setProgress(processed);
        }
      }
    }
    
    setIsChecking(false);
    abortControllerRef.current = null;
  };

  const stopCheck = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsChecking(false);
  };

  const clearAll = () => {
    setInput("");
    setLiveUids([]);
    setDieUids([]);
    setProgress(0);
    setTotal(0);
  };

  const handleCopy = async (text: string, type: 'live' | 'die') => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    
    if (type === 'live') {
      setCopiedLive(true);
      setTimeout(() => setCopiedLive(false), 2000);
    } else {
      setCopiedDie(true);
      setTimeout(() => setCopiedDie(false), 2000);
    }
  };

  const progressPercentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center mb-2">
          <CheckCircle className="w-8 h-8 mr-3 text-primary" />
          {t("title")}
        </h1>
        <p className="text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col h-[500px]">
            <div className="bg-muted px-4 py-3 border-b border-border flex justify-between items-center rounded-t-xl">
              <h2 className="font-semibold text-foreground flex items-center">
                <ListChecks className="w-4 h-4 mr-2" />
                {t("inputUids")}
              </h2>
              <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded border border-border">
                {t("format")}
              </span>
            </div>
            <textarea
              className="w-full flex-grow p-4 bg-transparent border-none resize-none focus:ring-0 focus:outline-none text-sm font-mono text-foreground"
              placeholder="100001234567890&#10;100009876543210&#10;..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isChecking}
            ></textarea>
            
            <div className="p-4 border-t border-border bg-background/50 rounded-b-xl flex flex-col space-y-3">
              {total > 0 && (
                <div className="w-full space-y-1">
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-primary">{progress} / {total} ({progressPercentage}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden border border-border">
                    <div 
                      className="bg-primary h-2.5 rounded-full transition-all duration-300 relative overflow-hidden" 
                      style={{ width: `${progressPercentage}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_1s_infinite]"></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2">
                {!isChecking ? (
                  <button
                    onClick={startCheck}
                    disabled={!input.trim()}
                    className="flex-1 flex justify-center items-center bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <Play className="w-4 h-4 mr-2" /> {t("startCheck")}
                  </button>
                ) : (
                  <button
                    onClick={stopCheck}
                    className="flex-1 flex justify-center items-center bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2.5 rounded-lg font-medium transition-colors"
                  >
                    <Square className="w-4 h-4 mr-2" /> {t("stop")}
                  </button>
                )}
                <button
                  onClick={clearAll}
                  disabled={isChecking || (!input && liveUids.length === 0 && dieUids.length === 0)}
                  className="flex justify-center items-center bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 border border-border"
                  title="Clear All"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-7 flex flex-col sm:flex-row gap-6 h-[500px]">
          {/* Live Output */}
          <div className="flex-1 bg-card border border-green-500/30 rounded-xl shadow-sm flex flex-col overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-green-500"></div>
            <div className="bg-green-500/5 px-4 py-3 border-b border-green-500/20 flex justify-between items-center">
              <h2 className="font-semibold text-green-600 dark:text-green-400 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                LIVE
                <span className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {liveUids.length}
                </span>
              </h2>
              <button
                onClick={() => handleCopy(liveUids.join("\n"), 'live')}
                disabled={liveUids.length === 0}
                className="text-xs flex items-center space-x-1 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-1 rounded disabled:opacity-50 transition-colors border border-green-500/20"
              >
                {copiedLive ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLive ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <textarea
              className="w-full flex-grow p-4 bg-transparent border-none resize-none focus:ring-0 focus:outline-none text-sm font-mono text-green-700 dark:text-green-300"
              placeholder="Live UIDs will appear here..."
              value={liveUids.join("\n")}
              readOnly
            ></textarea>
          </div>

          {/* Die Output */}
          <div className="flex-1 bg-card border border-red-500/30 rounded-xl shadow-sm flex flex-col overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500"></div>
            <div className="bg-red-500/5 px-4 py-3 border-b border-red-500/20 flex justify-between items-center">
              <h2 className="font-semibold text-red-600 dark:text-red-400 flex items-center">
                <XCircle className="w-4 h-4 mr-2" />
                DIE
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {dieUids.length}
                </span>
              </h2>
              <button
                onClick={() => handleCopy(dieUids.join("\n"), 'die')}
                disabled={dieUids.length === 0}
                className="text-xs flex items-center space-x-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-1 rounded disabled:opacity-50 transition-colors border border-red-500/20"
              >
                {copiedDie ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedDie ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <textarea
              className="w-full flex-grow p-4 bg-transparent border-none resize-none focus:ring-0 focus:outline-none text-sm font-mono text-red-700 dark:text-red-300"
              placeholder="Die UIDs will appear here..."
              value={dieUids.join("\n")}
              readOnly
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
}
