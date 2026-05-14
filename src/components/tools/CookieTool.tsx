"use client";

import { useState, useCallback } from "react";
import { Copy, Trash2, ArrowDownAZ, ArrowDownZA, Check, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CookieTool() {
  const t = useTranslations("CookieTool");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lineCount, setLineCount] = useState({ input: 0, output: 0 });

  const getLines = useCallback((text: string) => {
    return text.split('\n').filter(line => line.trim() !== '');
  }, []);

  const updateOutput = useCallback((lines: string[]) => {
    let result = lines;
    if (removeDuplicates) {
      result = Array.from(new Set(result));
    }
    const text = result.join('\n');
    setOutput(text);
    setLineCount(prev => ({ ...prev, output: result.length }));
  }, [removeDuplicates]);

  const updateInput = (text: string) => {
    setInput(text);
    setLineCount(prev => ({ ...prev, input: getLines(text).length }));
  };

  // Extract c_user UID from cookie string
  const extractUid = () => {
    const lines = getLines(input);
    const result: string[] = [];
    
    for (const line of lines) {
      // Try c_user first (most reliable)
      const cUserMatch = line.match(/c_user[=:]\s*(\d+)/);
      if (cUserMatch) {
        result.push(cUserMatch[1]);
        continue;
      }
      
      // Try profile_id
      const profileMatch = line.match(/profile_id[=:]\s*(\d+)/);
      if (profileMatch) {
        result.push(profileMatch[1]);
        continue;
      }
      
      // If line itself is just a UID number
      if (/^\d{8,20}$/.test(line.trim())) {
        result.push(line.trim());
        continue;
      }
      
      // Try to find any large number sequence (likely UID)
      const numMatch = line.match(/\b(\d{10,20})\b/);
      if (numMatch) {
        result.push(numMatch[1]);
      }
    }
    
    updateOutput(result);
  };

  // Sort cookies by the c_user UID found in each line
  const sortCookieByUid = () => {
    const lines = getLines(input);
    const result = [...lines].sort((a, b) => {
      const matchA = a.match(/c_user[=:]\s*(\d+)/);
      const matchB = b.match(/c_user[=:]\s*(\d+)/);
      const uidA = matchA ? matchA[1] : "";
      const uidB = matchB ? matchB[1] : "";
      return uidA.localeCompare(uidB, undefined, { numeric: true });
    });
    updateOutput(result);
  };

  // Sort UID (pure numbers, one per line)
  const sortUid = () => {
    const lines = getLines(input);
    const result = [...lines].sort((a, b) => {
      const numA = parseInt(a.trim()) || 0;
      const numB = parseInt(b.trim()) || 0;
      return numA - numB;
    });
    updateOutput(result);
  };

  // Extract Facebook access tokens (EAAA...)
  const extractToken = () => {
    const lines = getLines(input);
    const result: string[] = [];
    
    for (const line of lines) {
      // Standard FB token
      const tokenMatch = line.match(/(EAA[A-Za-z0-9]+)/);
      if (tokenMatch) {
        result.push(tokenMatch[1]);
        continue;
      }
      
      // Try extracting from JSON-like format
      const jsonMatch = line.match(/["']access_token["']\s*[:=]\s*["']([^"']+)["']/);
      if (jsonMatch) {
        result.push(jsonMatch[1]);
      }
    }
    
    updateOutput(result);
  };

  // Remove cookies that don't have c_user (invalid/dead cookies)
  const removeInvalidCookies = () => {
    const lines = getLines(input);
    const result = lines.filter(line => /c_user[=:]\s*\d+/.test(line));
    updateOutput(result);
  };

  // Format: UID|Cookie (useful for tools that need this format)
  const formatUidCookie = () => {
    const lines = getLines(input);
    const result = lines.map(line => {
      const match = line.match(/c_user[=:]\s*(\d+)/);
      if (match) {
        return `${match[1]}|${line.trim()}`;
      }
      return line.trim();
    });
    updateOutput(result);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const sortLines = (direction: 'asc' | 'desc') => {
    const lines = getLines(output || input);
    const sorted = [...lines].sort();
    if (direction === 'desc') sorted.reverse();
    updateOutput(sorted);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-2">{t("title")}</h2>
        <p className="text-muted-foreground text-sm">
          {t("desc")}
        </p>
      </div>

      {/* Toggle */}
      <div className="flex items-center space-x-3 bg-muted/30 px-4 py-3 rounded-lg border border-border">
        <label className="text-sm font-medium">{t("removeDupes")}</label>
        <button
          onClick={() => setRemoveDuplicates(!removeDuplicates)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            removeDuplicates ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
              removeDuplicates ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Action Buttons - Main */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">{t("mainFunc")}</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={extractUid} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            {t("extractUid")}
          </button>
          <button onClick={extractToken} className="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            {t("extractToken")}
          </button>
          <button onClick={sortCookieByUid} className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-border">
            {t("sortCookie")}
          </button>
          <button onClick={sortUid} className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-border">
            {t("sortUid")}
          </button>
          <button onClick={removeInvalidCookies} className="bg-red-500/10 text-red-600 hover:bg-red-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-red-500/20">
            {t("removeInvalid")}
          </button>
          <button onClick={formatUidCookie} className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-border">
            {t("formatUid")}
          </button>
        </div>
      </div>

      {/* Sort Buttons */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => sortLines('asc')} className="flex items-center bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1.5 rounded-lg text-sm transition-colors border border-border">
          <ArrowDownAZ className="w-4 h-4 mr-1.5" /> A - Z
        </button>
        <button onClick={() => sortLines('desc')} className="flex items-center bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1.5 rounded-lg text-sm transition-colors border border-border">
          <ArrowDownZA className="w-4 h-4 mr-1.5" /> Z - A
        </button>
      </div>

      {/* Input / Output */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t("input")} ({lineCount.input})</label>
            <button
              onClick={() => { updateInput(""); }}
              className="text-xs flex items-center text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3 h-3 mr-1" /> {t("clear")}
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => updateInput(e.target.value)}
            className="w-full h-80 p-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono resize-none"
            placeholder={t("placeholder")}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t("output")} ({lineCount.output})</label>
            <div className="flex space-x-2">
              <button
                onClick={copyToClipboard}
                disabled={!output}
                className="text-xs flex items-center text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
              >
                {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                {copied ? t("copied") : t("copy")}
              </button>
              <button
                onClick={() => { setOutput(""); setLineCount(prev => ({ ...prev, output: 0 })); }}
                className="text-xs flex items-center text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3 h-3 mr-1" /> {t("clear")}
              </button>
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            className="w-full h-80 p-3 rounded-lg border border-input bg-muted/30 focus:outline-none text-sm font-mono resize-none"
            placeholder={t("output")}
          />
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-300">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">{t("tips")}</p>
            <ul className="list-disc list-inside space-y-1 text-xs opacity-80">
              <li>{t("tip1")}</li>
              <li>{t("tip2")}</li>
              <li>{t("tip3")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
