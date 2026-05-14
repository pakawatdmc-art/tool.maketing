"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Save } from "lucide-react";
import { useTranslations } from "next-intl";

export default function NotepadPage() {
  const t = useTranslations("Notepad");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleCreateNote = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/notepad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      
      if (!res.ok) throw new Error('Failed to create');
      
      const data = await res.json();
      router.push(`/notepad/${data.id}`);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold flex items-center mb-2">
            <FileText className="w-8 h-8 mr-3 text-primary" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleCreateNote}
            disabled={isSaving}
            className="flex items-center bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {t("save")}
          </button>
        </div>
      </div>

      <div className="flex-grow bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <textarea
          className="w-full flex-grow p-6 bg-transparent border-none resize-none focus:ring-0 focus:outline-none text-foreground leading-relaxed"
          placeholder={t("placeholder")}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          autoFocus
        ></textarea>
        
        <div className="bg-muted px-4 py-2 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
          <span>{t("unsaved")}</span>
          <span>{t("chars", { count: content.length })}</span>
        </div>
      </div>
    </div>
  );
}
