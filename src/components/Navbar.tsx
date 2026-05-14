"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X, Shield, FileText, MapPin, CheckCircle, Search, FileEdit, HelpCircle, Languages, Link2 } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";

export function Navbar() {
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const navItems = [
    { name: t("2fa"), href: "/", icon: Shield },
    { name: t("tool"), href: "/tool", icon: FileEdit },
    { name: t("checkIp"), href: "/check-ip", icon: MapPin },
    { name: t("checkUid"), href: "/check-uid", icon: CheckCircle },
    { name: t("getUid"), href: "/get-uid", icon: Search },
    { name: t("linkConverter"), href: "/link-converter", icon: Link2 },
    { name: t("notepad"), href: "/notepad", icon: FileText },
    { name: t("faq"), href: "/faq", icon: HelpCircle },
  ];

  // Helper to construct locale-aware links
  const getHref = (path: string) => {
    if (locale === "th") return path; // th is default, no prefix
    return `/${locale}${path === "/" ? "" : path}`;
  };

  // Helper to check if a path is active
  const isActivePath = (itemHref: string) => {
    const currentPath = pathname.replace(/^\/(en|th)/, "") || "/";
    return currentPath === itemHref;
  };

  const toggleLanguage = () => {
    const nextLocale = locale === "th" ? "en" : "th";
    const currentPath = pathname.replace(/^\/(en|th)/, "") || "/";
    
    let newPath = currentPath;
    if (nextLocale !== "th") {
      newPath = `/${nextLocale}${currentPath === "/" ? "" : currentPath}`;
    }
    
    router.push(newPath || "/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href={getHref("/")} className="flex items-center space-x-2 group">
              <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-300">
                <Image src="/logo.png" alt="2FA Tools Logo" fill className="object-cover" sizes="32px" priority />
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:inline-block">2FA Tools</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.href);
                return (
                  <Link
                    key={item.href}
                    href={getHref(item.href)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 p-2 rounded-md text-muted-foreground hover:bg-muted transition-colors font-medium text-sm"
              aria-label="Change language"
            >
              <Languages className="h-5 w-5" />
              <span className="hidden sm:inline-block">{locale === "th" ? "TH" : "EN"}</span>
            </button>

            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-md text-muted-foreground hover:bg-muted transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            )}

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md text-muted-foreground hover:bg-muted transition-colors"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="lg:hidden border-t border-border">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.href);
              return (
                <Link
                  key={item.href}
                  href={getHref(item.href)}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-3 rounded-md text-base font-medium ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
