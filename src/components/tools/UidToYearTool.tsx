"use client";

import { useState, useCallback } from "react";
import { Copy, Trash2, Check, Calendar, AlertCircle, Info } from "lucide-react";
import { useTranslations } from "next-intl";

// Facebook UID ranges based on known data
// These ranges are approximate and based on community research
const UID_RANGES: Array<{ prefix: string; yearRange: string; note?: string }> = [
  // Very old accounts (short UIDs)
  { prefix: "4", yearRange: "2004", note: "Mark Zuckerberg's account" },
  
  // Old-format UIDs (8-10 digits, no prefix pattern)
  // New-format UIDs start with 1000xxxxx
  { prefix: "1000000", yearRange: "2009-2011" },
  { prefix: "1000010", yearRange: "2011-2012" },
  { prefix: "1000020", yearRange: "2012-2013" },
  { prefix: "1000030", yearRange: "2013-2014" },
  { prefix: "1000040", yearRange: "2014-2015" },
  { prefix: "1000050", yearRange: "2015-2016" },
  { prefix: "1000060", yearRange: "2016-2017" },
  { prefix: "1000070", yearRange: "2017-2018" },
  { prefix: "1000080", yearRange: "2018-2019" },
  { prefix: "1000090", yearRange: "2019-2020" },
  { prefix: "100010", yearRange: "2020-2021" },
  { prefix: "100011", yearRange: "2021" },
  { prefix: "100012", yearRange: "2021-2022" },
  { prefix: "100013", yearRange: "2022" },
  { prefix: "100014", yearRange: "2022-2023" },
  { prefix: "100015", yearRange: "2023" },
  { prefix: "100016", yearRange: "2023-2024" },
  { prefix: "100017", yearRange: "2024" },
  { prefix: "100018", yearRange: "2024-2025" },
  { prefix: "100019", yearRange: "2025" },
  
  // Page IDs / Business accounts
  { prefix: "61550", yearRange: "2023 (Page)", note: "Facebook Page" },
  { prefix: "61551", yearRange: "2023 (Page)", note: "Facebook Page" },
  { prefix: "61552", yearRange: "2023-2024 (Page)", note: "Facebook Page" },
  { prefix: "61553", yearRange: "2024 (Page)", note: "Facebook Page" },
  { prefix: "61554", yearRange: "2024 (Page)", note: "Facebook Page" },
  { prefix: "61555", yearRange: "2024-2025 (Page)", note: "Facebook Page" },
  { prefix: "61556", yearRange: "2025 (Page)", note: "Facebook Page" },
  { prefix: "61557", yearRange: "2025 (Page)", note: "Facebook Page" },
];

export default function UidToYearTool() {
  const t = useTranslations("UidToYearTool");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<Record<string, number>>({});

  const estimateYearFromUid = useCallback((uid: string): { year: string; note: string } => {
    if (!uid || !/^\d+$/.test(uid)) {
      return { year: "Invalid UID", note: "ต้องเป็นตัวเลขเท่านั้น" };
    }

    const numericUid = BigInt(uid);

    // Very old accounts (UID < 100000000)
    if (uid.length < 9) {
      return { year: "2004-2009", note: "บัญชีเก่ามาก (Old Format)" };
    }

    // Old accounts (UID is 9-10 digits, not starting with 100)
    if (uid.length <= 10 && !uid.startsWith("100")) {
      return { year: "2006-2011", note: "บัญชีเก่า (Short UID)" };
    }

    // Match against known ranges (check longer prefixes first for specificity)
    const sortedRanges = [...UID_RANGES].sort((a, b) => b.prefix.length - a.prefix.length);
    
    for (const range of sortedRanges) {
      if (uid.startsWith(range.prefix)) {
        return { 
          year: range.yearRange, 
          note: range.note || "" 
        };
      }
    }

    // Fallback based on UID length
    if (uid.length >= 15 && uid.startsWith("100")) {
      return { year: "Recent (2020+)", note: "UID format ใหม่" };
    }

    return { year: "Unknown", note: "ไม่สามารถระบุปีได้" };
  }, []);

  const processUids = () => {
    const lines = input.split('\n').filter(line => line.trim() !== '');
    const yearCounts: Record<string, number> = {};
    
    const result = lines.map(line => {
      let uid = line.trim();
      
      // Extract UID from various formats
      const cUserMatch = line.match(/c_user[=:]\s*(\d+)/);
      const numMatch = line.match(/\b(\d{5,20})\b/);
      
      if (cUserMatch) {
        uid = cUserMatch[1];
      } else if (numMatch) {
        uid = numMatch[1];
      }

      const { year, note } = estimateYearFromUid(uid);
      
      // Count years for stats
      yearCounts[year] = (yearCounts[year] || 0) + 1;
      
      return `${uid} | ${year}${note ? ` (${note})` : ""}`;
    });

    setOutput(result.join('\n'));
    setStats(yearCounts);
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-primary" />
          {t("title")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t("desc")}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={processUids} className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
          🔍 {t("analyzeBtn")}
        </button>
      </div>

      {/* Stats Summary */}
      {Object.keys(stats).length > 0 && (
        <div className="bg-muted/30 border border-border rounded-lg p-4">
          <p className="text-sm font-medium mb-2">📊 {t("statsSummary")}</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats).sort().map(([year, count]) => (
              <span key={year} className="bg-background border border-border px-3 py-1 rounded-full text-xs font-medium">
                {year}: <strong className="text-primary">{count}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t("input")}</label>
            <button
              onClick={() => { setInput(""); setStats({}); }}
              className="text-xs flex items-center text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3 h-3 mr-1" /> {t("clear")}
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-96 p-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono resize-none"
            placeholder={t("placeholder")}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t("output")}</label>
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
            className="w-full h-96 p-3 rounded-lg border border-input bg-muted/30 focus:outline-none text-sm font-mono resize-none"
            placeholder={t("output")}
          />
        </div>
      </div>

      {/* Info box */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-sm text-amber-700 dark:text-amber-300">
        <div className="flex items-start space-x-2">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">{t("note")}</p>
            <p className="text-xs opacity-80">
              {t("noteDesc")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
