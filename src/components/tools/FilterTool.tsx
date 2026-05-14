"use client";

import { useState } from "react";
import { Copy, Trash2, Filter } from "lucide-react";
import { useTranslations } from "next-intl";

export default function FilterTool() {
  const t = useTranslations("FilterTool");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [filterKeyword, setFilterKeyword] = useState("");
  const [mode, setMode] = useState<"include" | "exclude">("include");
  const [caseSensitive, setCaseSensitive] = useState(false);

  const processFilter = () => {
    if (!filterKeyword) {
      setOutput(input);
      return;
    }

    const lines = input.split('\n');
    const keyword = caseSensitive ? filterKeyword : filterKeyword.toLowerCase();

    const result = lines.filter(line => {
      const targetLine = caseSensitive ? line : line.toLowerCase();
      const hasKeyword = targetLine.includes(keyword);
      return mode === "include" ? hasKeyword : !hasKeyword;
    });

    setOutput(result.join('\n'));
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
          <label className="text-sm font-medium">{t("keyword")}</label>
          <input
            type="text"
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
            className="w-48 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Text to filter..."
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">{t("mode")}</label>
          <select 
            value={mode}
            onChange={(e) => setMode(e.target.value as "include" | "exclude")}
            className="w-32 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="include">{t("include")}</option>
            <option value="exclude">{t("exclude")}</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 h-[38px] pb-2">
          <input
            type="checkbox"
            id="case-sensitive"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
            className="rounded border-input text-primary focus:ring-primary/50"
          />
          <label htmlFor="case-sensitive" className="text-sm font-medium">{t("caseSensitive")}</label>
        </div>
        
        <button onClick={processFilter} className="flex items-center btn-primary bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors h-[38px]">
          <Filter className="w-4 h-4 mr-2" /> {t("filterBtn")}
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
            placeholder="Paste your text here..."
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
            placeholder="Result will appear here..."
          />
        </div>
      </div>
    </div>
  );
}
