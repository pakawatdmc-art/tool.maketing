"use client";

import { useState, useRef } from "react";
import { Search, Play, Square, Copy, Check, Trash2, Link as LinkIcon, Loader2, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function GetUidPage() {
  const t = useTranslations("GetUID");
  const [input, setInput] = useState("");
  const [successItems, setSuccessItems] = useState<{url: string, uid: string}[]>([]);
  const [failItems, setFailItems] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [copiedFail, setCopiedFail] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const startCheck = async () => {
    const lines = input.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) {
      alert("Please enter URLs or usernames to get UIDs.");
      return;
    }

    const uniqueLines = [...new Set(lines)];
    
    setTotal(uniqueLines.length);
    setProgress(0);
    setSuccessItems([]);
    setFailItems([]);
    setIsChecking(true);
    
    abortControllerRef.current = new AbortController();
    
    const CHUNK_SIZE = 10; // Check 10 at a time
    let localSuccess: {url: string, uid: string}[] = [];
    let localFail: string[] = [];
    let processed = 0;

    for (let i = 0; i < uniqueLines.length; i += CHUNK_SIZE) {
      if (abortControllerRef.current.signal.aborted) {
        break;
      }

      const chunk = uniqueLines.slice(i, i + CHUNK_SIZE);
      
      try {
        const res = await fetch('/api/get-uid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urls: chunk }),
          signal: abortControllerRef.current.signal
        });
        
        if (!res.ok) throw new Error('API Error');
        
        const data = await res.json();
        
        const newSuccess = data.results.filter((r: any) => r.status === 'success').map((r: any) => ({ url: r.url, uid: r.uid }));
        const newFail = data.results.filter((r: any) => r.status === 'fail').map((r: any) => r.url);
        
        localSuccess = [...localSuccess, ...newSuccess];
        localFail = [...localFail, ...newFail];
        
        setSuccessItems(localSuccess);
        setFailItems(localFail);
        
        processed += chunk.length;
        setProgress(processed);
        
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Aborted');
        } else {
          console.error("Chunk failed", err);
          localFail = [...localFail, ...chunk];
          setFailItems(localFail);
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
    setSuccessItems([]);
    setFailItems([]);
    setProgress(0);
    setTotal(0);
  };

  const handleCopy = async (text: string, type: 'success' | 'fail') => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    
    if (type === 'success') {
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2000);
    } else {
      setCopiedFail(true);
      setTimeout(() => setCopiedFail(false), 2000);
    }
  };

  const progressPercentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center mb-2">
          <Search className="w-8 h-8 mr-3 text-primary" />
          {t("title")}
        </h1>
        <p className="text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col h-[550px]">
            <div className="bg-muted px-4 py-3 border-b border-border flex justify-between items-center rounded-t-xl">
              <h2 className="font-semibold text-foreground flex items-center">
                <LinkIcon className="w-4 h-4 mr-2" />
                {t("inputUrls")}
              </h2>
              <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded border border-border">
                {t("format")}
              </span>
            </div>
            <textarea
              className="w-full flex-grow p-4 bg-transparent border-none resize-none focus:ring-0 focus:outline-none text-sm font-mono text-foreground"
              placeholder="https://www.facebook.com/zuck&#10;zuck&#10;https://m.facebook.com/profile.php?id=4&#10;..."
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
                    <Play className="w-4 h-4 mr-2" /> {t("startExtract")}
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
                  disabled={isChecking || (!input && successItems.length === 0 && failItems.length === 0)}
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
        <div className="lg:col-span-7 flex flex-col sm:flex-row gap-6 h-[550px]">
          {/* Success Output */}
          <div className="flex-1 bg-card border border-blue-500/30 rounded-xl shadow-sm flex flex-col overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
            <div className="bg-blue-500/5 px-4 py-3 border-b border-blue-500/20 flex justify-between items-center">
              <h2 className="font-semibold text-blue-600 dark:text-blue-400 flex items-center">
                <Check className="w-4 h-4 mr-2" />
                Found UIDs
                <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {successItems.length}
                </span>
              </h2>
              <button
                onClick={() => handleCopy(successItems.map(s => s.uid).join("\n"), 'success')}
                disabled={successItems.length === 0}
                className="text-xs flex items-center space-x-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded disabled:opacity-50 transition-colors border border-blue-500/20"
              >
                {copiedSuccess ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSuccess ? "Copied" : "Copy UIDs"}</span>
              </button>
            </div>
            <div className="flex-grow p-4 bg-transparent overflow-y-auto font-mono text-sm">
              {successItems.length === 0 && !isChecking && (
                <span className="text-muted-foreground">Successfully extracted UIDs will appear here...</span>
              )}
              {successItems.map((item, idx) => (
                <div key={idx} className="flex flex-col mb-3 pb-3 border-b border-border/50 last:border-0 last:mb-0 last:pb-0">
                  <span className="text-xs text-muted-foreground truncate" title={item.url}>{item.url}</span>
                  <span className="text-blue-700 dark:text-blue-300 font-bold select-all">{item.uid}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fail Output */}
          <div className="flex-1 bg-card border border-red-500/30 rounded-xl shadow-sm flex flex-col overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500"></div>
            <div className="bg-red-500/5 px-4 py-3 border-b border-red-500/20 flex justify-between items-center">
              <h2 className="font-semibold text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                Failed
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {failItems.length}
                </span>
              </h2>
              <button
                onClick={() => handleCopy(failItems.join("\n"), 'fail')}
                disabled={failItems.length === 0}
                className="text-xs flex items-center space-x-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-1 rounded disabled:opacity-50 transition-colors border border-red-500/20"
              >
                {copiedFail ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedFail ? "Copied" : "Copy Failed"}</span>
              </button>
            </div>
            <textarea
              className="w-full flex-grow p-4 bg-transparent border-none resize-none focus:ring-0 focus:outline-none text-sm font-mono text-red-700 dark:text-red-300"
              placeholder="URLs that failed to resolve will appear here..."
              value={failItems.join("\n")}
              readOnly
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
}
