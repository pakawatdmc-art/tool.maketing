"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Save, Trash2, Clock, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { createNote, updateNote, listNotes, deleteNote, type Note } from "@/lib/noteStorage";

export default function NotepadPage() {
  const t = useTranslations("Notepad");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");

  // Load existing notes from localStorage on mount
  useEffect(() => {
    const existing = listNotes();
    setNotes(existing);
    
    // Auto-load the most recent note if any
    if (existing.length > 0) {
      setContent(existing[0].content);
      setActiveNoteId(existing[0].id);
    }
  }, []);

  // Auto-save to localStorage with debounce
  const autoSave = useCallback(() => {
    if (!content.trim() && !activeNoteId) return;

    if (activeNoteId) {
      updateNote(activeNoteId, content);
    } else {
      const note = createNote(content);
      setActiveNoteId(note.id);
    }
    
    setNotes(listNotes());
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }, [content, activeNoteId]);

  useEffect(() => {
    if (content === "" && !activeNoteId) return;
    
    const timeout = setTimeout(() => {
      autoSave();
    }, 1500);

    return () => clearTimeout(timeout);
  }, [content, autoSave, activeNoteId]);

  const handleNewNote = () => {
    setContent("");
    setActiveNoteId(null);
    setSaveStatus("idle");
  };

  const handleSaveNow = () => {
    autoSave();
  };

  const handleSelectNote = (note: Note) => {
    setContent(note.content);
    setActiveNoteId(note.id);
    setSaveStatus("idle");
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNote(id);
    const remaining = listNotes();
    setNotes(remaining);
    
    if (activeNoteId === id) {
      if (remaining.length > 0) {
        setContent(remaining[0].content);
        setActiveNoteId(remaining[0].id);
      } else {
        setContent("");
        setActiveNoteId(null);
      }
    }
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      // Clipboard API fallback
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center mb-2">
            <FileText className="w-8 h-8 mr-3 text-primary" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground">
            {t("descLocal")}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleNewNote}
            className="flex items-center bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg font-medium transition-colors border border-border"
          >
            {t("newNote")}
          </button>
          <button
            onClick={handleSaveNow}
            className="flex items-center bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            {t("saveNow")}
          </button>
        </div>
      </div>

      <div className="flex-grow flex gap-4 min-h-0">
        {/* Notes list sidebar */}
        {notes.length > 0 && (
          <div className="w-64 shrink-0 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col hidden md:flex">
            <div className="px-4 py-3 border-b border-border bg-muted/50">
              <h3 className="text-sm font-semibold text-muted-foreground">
                {t("savedNotes")} ({notes.length})
              </h3>
            </div>
            <div className="flex-grow overflow-y-auto">
              {notes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={`w-full text-left px-4 py-3 border-b border-border/50 hover:bg-muted/50 transition-colors group ${
                    activeNoteId === note.id ? "bg-primary/10 border-l-2 border-l-primary" : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium truncate flex-1 mr-2">
                      {note.content.slice(0, 40) || t("emptyNote")}
                    </p>
                    <button
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTime(note.updated_at)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Editor */}
        <div className="flex-grow bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <textarea
            className="w-full flex-grow p-6 bg-transparent border-none resize-none focus:ring-0 focus:outline-none text-foreground leading-relaxed"
            placeholder={t("placeholder")}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
          ></textarea>
          
          <div className="bg-muted px-4 py-2 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {saveStatus === "saved" && (
                <span className="flex items-center text-green-500">
                  <Check className="w-3 h-3 mr-1" /> {t("autoSaved")}
                </span>
              )}
              {saveStatus === "idle" && activeNoteId && (
                <span>{t("autoSaveEnabled")}</span>
              )}
              {saveStatus === "idle" && !activeNoteId && (
                <span>{t("unsaved")}</span>
              )}
              <button 
                onClick={handleCopyContent}
                className="hover:text-foreground transition-colors"
              >
                {t("copyContent")}
              </button>
            </div>
            <span>{t("chars", { count: content.length })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
