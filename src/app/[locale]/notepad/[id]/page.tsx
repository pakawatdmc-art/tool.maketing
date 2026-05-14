"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { FileText, Plus, Loader2, Share2, Check, Clock, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function NoteViewPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations("Notepad");
  const router = useRouter();
  const resolvedParams = use(params);
  const noteId = resolvedParams.id;
  
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error" | "typing">("saved");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load note
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await fetch(`/api/notepad/${noteId}`);
        if (!res.ok) {
          if (res.status === 404) {
            router.push('/notepad'); // Redirect to new note if not found
            return;
          }
          throw new Error('Failed to load note');
        }
        const data = await res.json();
        setContent(data.note.content || "");
        setLastSavedAt(data.note.updated_at);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load note.");
        setIsLoading(false);
      }
    };
    
    if (noteId) {
      fetchNote();
    }
  }, [noteId, router]);

  // Auto-save logic
  const saveNote = useCallback(async (currentContent: string) => {
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/notepad/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: currentContent })
      });
      
      if (!res.ok) throw new Error('Failed to save');
      
      const data = await res.json();
      setLastSavedAt(data.updated_at);
      setSaveStatus("saved");
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
    }
  }, [noteId]);

  useEffect(() => {
    if (isLoading) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaveStatus("typing");
    
    const timeoutId = setTimeout(() => {
      saveNote(content);
    }, 2000); // Auto-save after 2 seconds of inactivity
    
    return () => clearTimeout(timeoutId);
  }, [content, saveNote, isLoading]);

  const handleShare = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNewNote = () => {
    router.push('/notepad');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">{t("errorLoad")}</h2>
          <button 
            onClick={handleNewNote}
            className="text-primary hover:underline"
          >
            {t("createNew")}
          </button>
        </div>
      </div>
    );
  }

  const formatLastSaved = (timestamp: number | null) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center mb-2">
            <FileText className="w-8 h-8 mr-3 text-primary" />
            {t("noteId", { id: noteId })}
          </h1>
          <div className="flex items-center text-sm text-muted-foreground">
            {saveStatus === "saving" && <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> {t("saving")}</>}
            {saveStatus === "saved" && <><Check className="w-3 h-3 mr-1 text-green-500" /> {t("savedAt", { time: formatLastSaved(lastSavedAt) })}</>}
            {saveStatus === "error" && <><AlertCircle className="w-3 h-3 mr-1 text-destructive" /> {t("failedSave")}</>}
            {saveStatus === "typing" && <><Clock className="w-3 h-3 mr-1" /> {t("unsavedChanges")}</>}
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleShare}
            className="flex flex-1 sm:flex-none justify-center items-center bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg font-medium transition-colors border border-border"
          >
            {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Share2 className="w-4 h-4 mr-2" />}
            {copied ? t("copied") : t("share")}
          </button>
          
          <button
            onClick={handleNewNote}
            className="flex flex-1 sm:flex-none justify-center items-center bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("newNote")}
          </button>
        </div>
      </div>

      <div className="flex-grow bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col relative">
        <textarea
          className="w-full flex-grow p-6 bg-transparent border-none resize-none focus:ring-0 focus:outline-none text-foreground leading-relaxed"
          placeholder={t("placeholder")}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          autoFocus
        ></textarea>
        
        <div className="bg-muted px-4 py-2 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
          <span>{t("access")}</span>
          <span>{t("chars", { count: content.length })}</span>
        </div>
      </div>
    </div>
  );
}
