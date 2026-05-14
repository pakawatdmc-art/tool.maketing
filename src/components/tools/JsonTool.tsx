"use client";

import { useState } from "react";
import { Copy, Trash2, FileJson, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function JsonTool() {
  const t = useTranslations("JsonTool");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const formatJson = () => {
    try {
      setError(null);
      if (!input.trim()) {
        setOutput("");
        return;
      }
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid JSON format");
    }
  };

  const minifyJson = () => {
    try {
      setError(null);
      if (!input.trim()) {
        setOutput("");
        return;
      }
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid JSON format");
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

      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={formatJson} className="flex items-center btn-primary bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
          <FileJson className="w-4 h-4 mr-2" /> {t("formatBtn")}
        </button>
        <button onClick={minifyJson} className="flex items-center btn-secondary bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors border border-border">
          {t("minifyBtn")}
        </button>
      </div>

      {error && (
        <div className="flex items-center p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t("input")}</label>
            <button
              onClick={() => { setInput(""); setError(null); }}
              className="text-xs flex items-center text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3 h-3 mr-1" /> {t("clear")}
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-[500px] p-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono whitespace-pre"
            placeholder="{}"
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
            className="w-full h-[500px] p-3 rounded-md border border-input bg-muted/30 focus:outline-none text-sm font-mono whitespace-pre"
            placeholder="Result..."
          />
        </div>
      </div>
    </div>
  );
}
