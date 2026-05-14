"use client";

import { useState } from "react";
import { Copy, Trash2, Combine } from "lucide-react";
import { useTranslations } from "next-intl";

export default function MergeTool() {
  const t = useTranslations("MergeTool");
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [output, setOutput] = useState("");
  const [separator, setSeparator] = useState("|");

  const processMerge = () => {
    const lines1 = input1.split('\n');
    const lines2 = input2.split('\n');
    const maxLength = Math.max(lines1.length, lines2.length);
    const result = [];

    for (let i = 0; i < maxLength; i++) {
      const part1 = lines1[i] || "";
      const part2 = lines2[i] || "";
      if (part1 && part2) {
        result.push(`${part1}${separator}${part2}`);
      } else if (part1) {
        result.push(part1);
      } else if (part2) {
        result.push(part2);
      }
    }

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
          <label className="text-sm font-medium">{t("separator")}</label>
          <input
            type="text"
            value={separator}
            onChange={(e) => setSeparator(e.target.value)}
            className="w-24 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="e.g. |"
          />
        </div>
        
        <button onClick={processMerge} className="flex items-center btn-primary bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors h-[38px]">
          <Combine className="w-4 h-4 mr-2" /> {t("mergeBtn")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t("list1")}</label>
          </div>
          <textarea
            value={input1}
            onChange={(e) => setInput1(e.target.value)}
            className="w-full h-[400px] p-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono whitespace-pre"
            placeholder={t("placeholder1")}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t("list2")}</label>
            <button
              onClick={() => { setInput1(""); setInput2(""); setOutput(""); }}
              className="text-xs flex items-center text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3 h-3 mr-1" /> {t("clearAll")}
            </button>
          </div>
          <textarea
            value={input2}
            onChange={(e) => setInput2(e.target.value)}
            className="w-full h-[400px] p-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono whitespace-pre"
            placeholder={t("placeholder2")}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t("mergedOutput")}</label>
            <div className="flex space-x-2">
              <button
                onClick={copyToClipboard}
                className="text-xs flex items-center text-primary hover:text-primary/80 transition-colors"
              >
                <Copy className="w-3 h-3 mr-1" /> {t("copy")}
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
