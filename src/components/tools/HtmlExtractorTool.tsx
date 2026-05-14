"use client";

import { useState } from "react";
import { Copy, Trash2, Code2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function HtmlExtractorTool() {
  const t = useTranslations("HtmlExtractorTool");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"image" | "link">("image");

  const processHtml = () => {
    const results: string[] = [];
    
    if (mode === "image") {
      const regex = /<img[^>]+src=(["'])(.*?)\1/g;
      let match;
      while ((match = regex.exec(input)) !== null) {
        results.push(match[2]);
      }
    } else {
      const regex = /<a[^>]+href=(["'])(.*?)\1/g;
      let match;
      while ((match = regex.exec(input)) !== null) {
        results.push(match[2]);
      }
    }

    setOutput(results.join('\n'));
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
          <label className="text-sm font-medium">{t("target")}</label>
          <select 
            value={mode}
            onChange={(e) => setMode(e.target.value as any)}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="image">{t("extractImages")}</option>
            <option value="link">{t("extractLinks")}</option>
          </select>
        </div>
        
        <button onClick={processHtml} className="flex items-center btn-primary bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors h-[38px]">
          <Code2 className="w-4 h-4 mr-2" /> {t("extractBtn")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t("inputHtml")}</label>
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
            <label className="text-sm font-medium">{t("extractedUrls")} ({output.split('\n').filter(Boolean).length})</label>
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
