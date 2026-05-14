"use client";

import { useState, useEffect, useCallback } from "react";
import * as OTPAuth from "otpauth";
import { ShieldCheck, Copy, Check, KeyRound, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Authenticator() {
  const t = useTranslations("Auth2FA");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTOTP = useCallback((secretKey: string) => {
    try {
      // Remove spaces and make uppercase
      const cleanSecret = secretKey.replace(/\s+/g, "").toUpperCase();
      
      if (!cleanSecret) {
        setCode(null);
        setError(null);
        return;
      }

      const totp = new OTPAuth.TOTP({
        issuer: "2FA Tool",
        label: "Authenticator",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(cleanSecret),
      });

      setCode(totp.generate());
      setError(null);
    } catch (err) {
      console.error(err);
      setCode(null);
      setError(t("invalidKey"));
    }
  }, [t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    generateTOTP(secret);

    const updateTimer = () => {
      const epoch = Math.floor(Date.now() / 1000);
      const remaining = 30 - (epoch % 30);
      setTimeLeft(remaining);

      if (remaining === 30) {
        generateTOTP(secret); // Refresh code when timer resets
      }
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [secret, generateTOTP]);

  const handleCopy = async () => {
    if (code) {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const progressPercentage = (timeLeft / 30) * 100;

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] relative overflow-hidden">
      {/* Background gradient decorative elements */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-card border border-border shadow-2xl rounded-3xl p-8 relative overflow-hidden">
          {/* Subtle top border highlight */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4 ring-8 ring-primary/5">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("title")}</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {t("description")}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="secret" className="text-sm font-semibold text-foreground flex items-center">
                <KeyRound className="w-4 h-4 mr-2 text-primary" />
                {t("secretKey")}
              </label>
              <div className="relative">
                <input
                  id="secret"
                  type="text"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder={t("placeholder")}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300 text-foreground font-mono text-center tracking-widest placeholder:tracking-normal"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </div>
              {error && (
                <p className="text-destructive text-sm flex items-center mt-2 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4 mr-1.5" />
                  {error}
                </p>
              )}
            </div>

            {code && !error && (
              <div className="bg-muted rounded-2xl p-6 text-center border border-border/50 relative overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="text-5xl font-mono font-bold tracking-[0.2em] text-primary drop-shadow-sm flex items-center justify-center ml-2">
                    {code.slice(0, 3)}
                    <span className="text-muted-foreground/30 mx-1">-</span>
                    {code.slice(3, 6)}
                  </div>
                  
                  <div className="flex items-center justify-between w-full mt-4 bg-background/50 backdrop-blur-sm rounded-xl p-2 border border-border/50">
                    <div className="flex items-center space-x-3 px-3 py-1.5">
                      <div className="relative w-6 h-6 flex items-center justify-center">
                        <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-border"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className={`${timeLeft <= 5 ? "text-destructive" : "text-primary"} transition-all duration-1000 ease-linear`}
                            strokeDasharray={`${progressPercentage}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className={`absolute text-[10px] font-bold ${timeLeft <= 5 ? "text-destructive animate-pulse" : "text-foreground"}`}>
                          {timeLeft}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleCopy}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background ${
                        copied 
                        ? "bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 focus:ring-green-500/50" 
                        : "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/50"
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{t("copied")}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>{t("copyCode")}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-6 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
            <p className="text-xs text-muted-foreground flex items-center justify-center bg-background/50 py-2 rounded-lg inline-flex w-full">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-primary/70" />
              {t("privacyNotice")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
