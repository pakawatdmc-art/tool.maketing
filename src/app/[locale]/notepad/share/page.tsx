"use client";

import { useState, useEffect } from "react";
import { FileText, AlertCircle, Clock, Copy, Check, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { decodeNote } from "@/lib/noteShare";
import Link from "next/link";

export default function SharedNotePage() {
  const t = useTranslations("NotepadShare");
  const [content, setContent] = useState("");
  const [expired, setExpired] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number>(0);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hash = window.location.hash.slice(1); // Remove the #
    if (!hash) {
      setError(true);
      setIsLoading(false);
      return;
    }

    const result = decodeNote(hash);
    if (!result) {
      setError(true);
      setIsLoading(false);
      return;
    }

    setContent(result.content);
    setExpired(result.expired);
    setExpiresAt(result.expiresAt);
    setIsLoading(false);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const formatExpiry = (timestamp: number) => {
    const now = Date.now();
    const diff = timestamp - now;

    if (diff <= 0) return t("alreadyExpired");

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);

    if (days > 0) return t("expiresIn", { days, hours });
    return t("expiresInHours", { hours });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-muted-foreground animate-pulse text-lg">{t("loading")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold">{t("invalidLink")}</h2>
          <p className="text-muted-foreground">{t("invalidDesc")}</p>
          <Link
            href="/notepad"
            className="inline-flex items-center text-primary hover:underline font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t("backToNotepad")}
          </Link>
        </div>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold">{t("expiredTitle")}</h2>
          <p className="text-muted-foreground">{t("expiredDesc")}</p>
          <Link
            href="/notepad"
            className="inline-flex items-center text-primary hover:underline font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t("backToNotepad")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center mb-2">
            <FileText className="w-8 h-8 mr-3 text-primary" />
            {t("title")}
          </h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1" />
              {formatExpiry(expiresAt)}
            </span>
            <span>•</span>
            <span>{t("readOnly")}</span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleCopy}
            className="flex items-center bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg font-medium transition-colors border border-border"
          >
            {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? t("copied") : t("copyAll")}
          </button>
          <Link
            href="/notepad"
            className="flex items-center bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("backToNotepad")}
          </Link>
        </div>
      </div>

      <div className="flex-grow bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="w-full flex-grow p-6 overflow-y-auto text-foreground leading-relaxed whitespace-pre-wrap break-words">
          {content}
        </div>

        <div className="bg-muted px-4 py-2 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {t("autoExpire")}
          </span>
          <span>{t("chars", { count: content.length })}</span>
        </div>
      </div>
    </div>
  );
}
