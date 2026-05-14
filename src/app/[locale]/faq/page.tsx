"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, Shield, Settings, MonitorSmartphone } from "lucide-react";
import { useTranslations } from "next-intl";

type FAQItem = {
  question: string;
  answer: string;
};

export default function FAQPage() {
  const t = useTranslations("FAQ");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const faqs = {
    [t("security")]: {
      icon: <Shield className="w-5 h-5" />,
      items: [
        { question: t("q1"), answer: t("a1") },
        { question: t("q2"), answer: t("a2") },
        { question: t("q3"), answer: t("a3") }
      ]
    },
    [t("howItWorks")]: {
      icon: <Settings className="w-5 h-5" />,
      items: [
        { question: t("q4"), answer: t("a4") },
        { question: t("q5"), answer: t("a5") },
        { question: t("q6"), answer: t("a6") }
      ]
    },
    [t("compatibility")]: {
      icon: <MonitorSmartphone className="w-5 h-5" />,
      items: [
        { question: t("q7"), answer: t("a7") },
        { question: t("q8"), answer: t("a8") },
        { question: t("q9"), answer: t("a9") }
      ]
    }
  };

  const toggleItem = (category: string, index: number) => {
    const key = `${category}-${index}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl min-h-[calc(100vh-4rem)]">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4 ring-8 ring-primary/5">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{t("title")}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          {t("description")}
        </p>
      </div>

      <div className="space-y-12">
        {Object.entries(faqs).map(([category, data]) => (
          <div key={category} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-muted px-6 py-4 border-b border-border flex items-center">
              <div className="bg-background p-2 rounded-lg border border-border mr-4 text-primary">
                {data.icon}
              </div>
              <h2 className="text-xl font-bold text-foreground">{category}</h2>
            </div>
            
            <div className="divide-y divide-border/50">
              {data.items.map((item, index) => {
                const isOpen = openItems[`${category}-${index}`];
                
                return (
                  <div key={index} className="transition-colors hover:bg-muted/30">
                    <button
                      onClick={() => toggleItem(category, index)}
                      className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    >
                      <span className="font-semibold text-foreground pr-8">{item.question}</span>
                      <span className="flex-shrink-0 text-muted-foreground bg-background border border-border rounded-full p-1">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </button>
                    
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="px-6 pb-6 pt-0 text-muted-foreground leading-relaxed">
                        {item.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-16 text-center border-t border-border pt-8">
        <p className="text-muted-foreground">
          {t("footer")}
        </p>
      </div>
    </div>
  );
}
