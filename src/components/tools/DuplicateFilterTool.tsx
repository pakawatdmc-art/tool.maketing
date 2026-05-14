"use client";

import { useState } from "react";
import { Copy, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function DuplicateFilterTool() {
  const t = useTranslations("DuplicateFilterTool");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [duplicateCount, setDuplicateCount] = useState(0);

  const processDuplicates = () => {
    const lines = input.split('\n');
    const uniqueLines = Array.from(new Set(lines));
    
    setDuplicateCount(lines.length - uniqueLines.length);
    setOutput(uniqueLines.join('\n'));
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

      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={processDuplicates} className="btn-primary bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
          {t("removeBtn")}
        </button>
        {duplicateCount > 0 && (
          <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1.5 rounded-md">
            {t("removedMsg", { count: duplicateCount })}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t("input")} ({input.split('\n').filter(Boolean).length})</label>
            <button
              onClick={() => { setInput(""); setDuplicateCount(0); }}
              className="text-xs flex items-center text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3 h-3 mr-1" /> {t("clear")}
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-96 p-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono whitespace-pre"
            placeholder="Paste your text here..."
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t("output")} ({output.split('\n').filter(Boolean).length})</label>
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
            className="w-full h-96 p-3 rounded-md border border-input bg-muted/30 focus:outline-none text-sm font-mono whitespace-pre"
            placeholder="Result will appear here..."
          />
        </div>
      </div>
    </div>
  );
}
