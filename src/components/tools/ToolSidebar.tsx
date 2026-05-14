"use client";

import { useTranslations } from "next-intl";
import { 
  Shield, Cookie, Timer, Edit3, Calendar, Scissors,
  Copy, RefreshCcw, Filter, 
  Code2, FileJson, Layers
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TOOLS_LIST = [
  { id: "authenticator", icon: Shield },
  { id: "cookie", icon: Cookie },
  { id: "pomodoro", icon: Timer },
  { id: "edit_text", icon: Edit3 },
  { id: "uid_year", icon: Calendar },
  { id: "split_string", icon: Scissors },
  { id: "merge_lines", icon: Layers },
  { id: "duplicate", icon: Copy },
  { id: "reverse_word", icon: RefreshCcw },
  { id: "filter_string", icon: Filter },
  { id: "html_extractor", icon: Code2 },
  { id: "json", icon: FileJson },
];

export default function ToolSidebar({ activeTab, onTabChange }: SidebarProps) {
  const t = useTranslations("Sidebar");
  
  return (
    <div className="w-full md:w-64 flex-shrink-0 border-r border-border/40 bg-card">
      <div className="flex flex-col h-[calc(100vh-4rem)] overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-muted">
        {TOOLS_LIST.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTab === tool.id;
          
          return (
            <button
              key={tool.id}
              onClick={() => onTabChange(tool.id)}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "" : "text-primary/70"}`} />
              <span className="truncate">{t(tool.id)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
