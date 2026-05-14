"use client";

import { useState } from "react";
import { Copy, Trash2, Scissors } from "lucide-react";

import { useTranslations } from "next-intl";

export default function StringSplitTool() {
  const t = useTranslations("StringSplitTool");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"column" | "chunk">("column");
  
  // For 'column' mode
  const [delimiter, setDelimiter] = useState("|");
  const [columnIndex, setColumnIndex] = useState(1);
  
  // For 'chunk' mode
  const [linesPerChunk, setLinesPerChunk] = useState(10);
  const [chunkSeparator, setChunkSeparator] = useState("====================");

  const processSplit = () => {
    const lines = input.split('\n').filter(line => line.trim() !== '');
    
    if (mode === "column") {
      const result = lines.map(line => {
        const parts = line.split(delimiter);
        // 1-indexed to 0-indexed
        const index = Math.max(0, columnIndex - 1);
        return parts[index] || "";
      });
      setOutput(result.join('\n'));
    } else if (mode === "chunk") {
      const chunks = [];
      for (let i = 0; i < lines.length; i += linesPerChunk) {
        chunks.push(lines.slice(i, i + linesPerChunk).join('\n'));
      }
      setOutput(chunks.join(`\n${chunkSeparator}\n`));
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-2">{t("title")}</h2>
        <p className="text-muted-foreground">{t("desc")}</p>
      </div>

      <div className="flex flex-wrap gap-4 items-end bg-muted/30 p-4 rounded-lg border border-border">
        <div className="space-y-1">
          <label className="text-sm font-medium">{t("operationMode")}</label>
          <select 
            value={mode}
            onChange={(e) => setMode(e.target.value as any)}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="column">{t("extractColumn")}</option>
            <option value="chunk">{t("splitIntoChunks")}</option>
          </select>
        </div>

        {mode === "column" ? (
          <>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t("delimiter")}</label>
              <input
                type="text"
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                className="w-24 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. |"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t("columnIndex")}</label>
              <input
                type="number"
                min="1"
                value={columnIndex}
                onChange={(e) => setColumnIndex(parseInt(e.target.value) || 1)}
                className="w-24 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t("linesPerChunk")}</label>
              <input
                type="number"
                min="1"
                value={linesPerChunk}
                onChange={(e) => setLinesPerChunk(parseInt(e.target.value) || 10)}
                className="w-32 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t("separator")}</label>
              <input
                type="text"
                value={chunkSeparator}
                onChange={(e) => setChunkSeparator(e.target.value)}
                className="w-48 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </>
        )}
        
        <button onClick={processSplit} className="flex items-center btn-primary bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors h-[38px]">
          <Scissors className="w-4 h-4 mr-2" /> {t("splitBtn")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t("input")}</label>
            <button
              onClick={() => setInput("")}
              className="text-xs flex items-center text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3 h-3 mr-1" /> {t("clear")}
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-[400px] p-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono whitespace-pre"
            placeholder={t("placeholder")}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t("output")}</label>
            <div className="flex space-x-2">
              <button
                onClick={copyToClipboard}
                className="text-xs flex items-center text-primary hover:text-primary/80 transition-colors"
              >
                <Copy className="w-3 h-3 mr-1" /> {t("copy")}
              </button>
              <button
                onClick={() => setOutput("")}
                className="text-xs flex items-center text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3 h-3 mr-1" /> {t("clear")}
              </button>
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            className="w-full h-[400px] p-3 rounded-md border border-input bg-muted/30 focus:outline-none text-sm font-mono whitespace-pre"
            placeholder={t("outputPlaceholder")}
          />
        </div>
      </div>
    </div>
  );
}
