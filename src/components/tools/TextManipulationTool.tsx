"use client";

import { useState } from "react";
import { Copy, Trash2, ArrowUpDown, ArrowDownAZ, ArrowDownZA, Type, Hash, Shuffle, FileEdit, Check, ArrowRightLeft, Search } from "lucide-react";
import { useTranslations } from "next-intl";

export default function TextManipulationTool() {
  const t = useTranslations("Tool");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [copied, setCopied] = useState(false);

  // Tools
  const sortAZ = () => {
    setOutput(input.split("\n").sort().join("\n"));
  };

  const sortZA = () => {
    setOutput(input.split("\n").sort().reverse().join("\n"));
  };

  const removeDuplicates = () => {
    setOutput([...new Set(input.split("\n"))].join("\n"));
  };

  const removeEmptyLines = () => {
    setOutput(input.split("\n").filter((line) => line.trim() !== "").join("\n"));
  };

  const trimWhitespace = () => {
    setOutput(input.split("\n").map((line) => line.trim()).join("\n"));
  };

  const addPrefixSuffix = () => {
    setOutput(input.split("\n").map((line) => `${prefix}${line}${suffix}`).join("\n"));
  };

  const handleFindReplace = () => {
    if (!findText) return;
    setOutput(input.split(findText).join(replaceText));
  };

  const toUppercase = () => {
    setOutput(input.toUpperCase());
  };

  const toLowercase = () => {
    setOutput(input.toLowerCase());
  };

  const toTitleCase = () => {
    setOutput(
      input.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
      )
    );
  };

  const reverseLines = () => {
    setOutput(input.split("\n").reverse().join("\n"));
  };

  const shuffleLines = () => {
    const lines = input.split("\n");
    for (let i = lines.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lines[i], lines[j]] = [lines[j], lines[i]];
    }
    setOutput(lines.join("\n"));
  };

  const numberLines = () => {
    setOutput(input.split("\n").map((line, i) => `${i + 1}. ${line}`).join("\n"));
  };

  const handleCopy = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
  };

  const linesCount = input ? input.split("\n").length : 0;
  const wordsCount = input.trim() ? input.trim().split(/\s+/).length : 0;
  const charCount = input.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center mb-2">
          <FileEdit className="w-8 h-8 mr-3 text-primary" />
          {t("title")}
        </h1>
        <p className="text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Input Area */}
        <div className="flex flex-col h-full bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="bg-muted px-4 py-3 border-b border-border flex justify-between items-center">
            <h2 className="font-semibold text-foreground">{t("inputText")}</h2>
            <div className="text-xs text-muted-foreground flex space-x-3">
              <span>{t("lines")}: <strong className="text-foreground">{linesCount}</strong></span>
              <span>{t("words")}: <strong className="text-foreground">{wordsCount}</strong></span>
              <span>{t("chars")}: <strong className="text-foreground">{charCount}</strong></span>
            </div>
          </div>
          <textarea
            className="w-full h-80 p-4 bg-transparent border-none resize-none focus:ring-0 focus:outline-none"
            placeholder={t("placeholder")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          ></textarea>
        </div>

        {/* Output Area */}
        <div className="flex flex-col h-full bg-card border border-border rounded-xl shadow-sm overflow-hidden relative">
          <div className="bg-muted px-4 py-3 border-b border-border flex justify-between items-center">
            <h2 className="font-semibold text-foreground">{t("outputResult")}</h2>
            <button
               onClick={handleCopy}
              disabled={!output}
              className="text-xs flex items-center space-x-1 bg-primary text-primary-foreground px-2 py-1 rounded disabled:opacity-50 transition-colors"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? t("copied") : t("copy")}</span>
            </button>
          </div>
          <textarea
            className="w-full h-80 p-4 bg-primary/5 border-none resize-none focus:ring-0 focus:outline-none text-foreground"
            placeholder={t("resultPlaceholder")}
            value={output}
            readOnly
          ></textarea>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 border-b border-border pb-2">{t("tools")}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {/* Sorting */}
          <div className="bg-background border border-border p-4 rounded-xl space-y-3 shadow-sm">
            <p className="text-sm font-semibold text-foreground flex items-center border-b border-border/60 pb-2">
              <ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" /> {t("sorting")}
            </p>
            <div className="flex flex-col gap-1.5">
              <button onClick={sortAZ} className="tool-btn"><ArrowDownAZ className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> <span>{t("sortAz")}</span></button>
              <button onClick={sortZA} className="tool-btn"><ArrowDownZA className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> <span>{t("sortZa")}</span></button>
              <button onClick={reverseLines} className="tool-btn"><ArrowUpDown className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> <span>{t("reverse")}</span></button>
              <button onClick={shuffleLines} className="tool-btn"><Shuffle className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> <span>{t("shuffle")}</span></button>
            </div>
          </div>

          {/* Cleaning */}
          <div className="bg-background border border-border p-4 rounded-xl space-y-3 shadow-sm">
            <p className="text-sm font-semibold text-foreground flex items-center border-b border-border/60 pb-2">
              <Trash2 className="w-4 h-4 mr-2 text-muted-foreground" /> {t("cleaning")}
            </p>
            <div className="flex flex-col gap-1.5">
              <button onClick={removeDuplicates} className="tool-btn"><Copy className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> <span>{t("removeDuplicates")}</span></button>
              <button onClick={removeEmptyLines} className="tool-btn"><FileEdit className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> <span>{t("removeEmptyLines")}</span></button>
              <button onClick={trimWhitespace} className="tool-btn"><Type className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> <span>{t("trimWhitespace")}</span></button>
            </div>
          </div>

          {/* Formatting */}
          <div className="bg-background border border-border p-4 rounded-xl space-y-3 shadow-sm">
            <p className="text-sm font-semibold text-foreground flex items-center border-b border-border/60 pb-2">
              <Type className="w-4 h-4 mr-2 text-muted-foreground" /> {t("formatting")}
            </p>
            <div className="flex flex-col gap-1.5">
              <button onClick={toUppercase} className="tool-btn"><Type className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> <span>{t("upper")}</span></button>
              <button onClick={toLowercase} className="tool-btn"><Type className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> <span>{t("lower")}</span></button>
              <button onClick={toTitleCase} className="tool-btn"><Type className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> <span>{t("titleCase")}</span></button>
              <button onClick={numberLines} className="tool-btn"><Hash className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> <span>{t("numberLines")}</span></button>
            </div>
          </div>

          {/* Other Actions */}
          <div className="bg-background border border-border p-4 rounded-xl space-y-3 shadow-sm">
            <p className="text-sm font-semibold text-foreground flex items-center border-b border-border/60 pb-2">
              <FileEdit className="w-4 h-4 mr-2 text-muted-foreground" /> {t("otherActions")}
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <button onClick={() => setInput(output)} className="flex items-center justify-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-md text-[13px] font-medium transition-colors w-full">
                <ArrowRightLeft className="w-3.5 h-3.5 mr-2" /> <span>{t("moveOutput")}</span>
              </button>
              <button onClick={clearAll} className="flex items-center justify-center px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md text-[13px] font-medium transition-colors w-full">
                <Trash2 className="w-3.5 h-3.5 mr-2" /> <span>{t("clearAll")}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-border">
          {/* Prefix / Suffix */}
          <div className="flex flex-col space-y-3 bg-muted/30 p-4 rounded-xl border border-border/50">
            <p className="text-sm font-semibold text-foreground flex items-center"><Hash className="w-4 h-4 mr-2 text-muted-foreground" /> {t("prefixSuffix")}</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder={t("prefix")}
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="text"
                placeholder={t("suffix")}
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button onClick={addPrefixSuffix} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap">
                {t("apply")}
              </button>
            </div>
          </div>

          {/* Find & Replace */}
          <div className="flex flex-col space-y-3 bg-muted/30 p-4 rounded-xl border border-border/50">
            <p className="text-sm font-semibold text-foreground flex items-center"><Search className="w-4 h-4 mr-2 text-muted-foreground" /> {t("findReplace")}</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder={t("find")}
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="text"
                placeholder={t("replaceWith")}
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button onClick={handleFindReplace} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap">
                {t("replaceBtn")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .tool-btn {
          @apply flex items-center justify-start px-3 py-2 bg-muted/30 border border-transparent rounded-md text-[13px] hover:bg-muted hover:border-border transition-all text-foreground focus:outline-none w-full;
        }
      `}</style>
    </div>
  );
}
