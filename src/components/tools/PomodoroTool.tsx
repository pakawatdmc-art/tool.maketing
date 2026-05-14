"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Coffee, Briefcase, SkipForward, Volume2, VolumeX } from "lucide-react";
import { useTranslations } from "next-intl";

type PomodoroMode = "work" | "shortBreak" | "longBreak";

const MODES = {
  work: { key: "work", duration: 25 * 60, color: "text-red-500", bg: "bg-red-500", ring: "ring-red-500/20" },
  shortBreak: { key: "shortBreak", duration: 5 * 60, color: "text-emerald-500", bg: "bg-emerald-500", ring: "ring-emerald-500/20" },
  longBreak: { key: "longBreak", duration: 15 * 60, color: "text-blue-500", bg: "bg-blue-500", ring: "ring-blue-500/20" }
};

export default function PomodoroTool() {
  const t = useTranslations("PomodoroTool");
  const [mode, setMode] = useState<PomodoroMode>("work");
  const [timeLeft, setTimeLeft] = useState(MODES.work.duration);
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create beep sound using Web Audio API
  const playBeep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      
      // 3 short beeps
      setTimeout(() => { gainNode.gain.value = 0; }, 200);
      setTimeout(() => { gainNode.gain.value = 0.3; }, 400);
      setTimeout(() => { gainNode.gain.value = 0; }, 600);
      setTimeout(() => { gainNode.gain.value = 0.3; }, 800);
      setTimeout(() => {
        oscillator.stop();
        ctx.close();
      }, 1000);
    } catch {
      // Audio not available
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      playBeep();
      
      // Auto-advance logic
      if (mode === "work") {
        const newSessions = sessions + 1;
        setSessions(newSessions);
        
        // After 4 work sessions, take a long break
        if (newSessions % 4 === 0) {
          switchMode("longBreak");
        } else {
          switchMode("shortBreak");
        }
      } else {
        switchMode("work");
      }
      
      // Show browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(
          mode === "work" ? t("breakNotifTitle") : t("workNotifTitle"),
          { body: mode === "work" ? t("breakNotifBody") : t("workNotifBody") }
        );
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft, mode, sessions, playBeep]);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Update document title
  useEffect(() => {
    if (isActive) {
      const mins = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      document.title = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")} - ${t(MODES[mode].key)}`;
    } else {
      document.title = "2FA Tools";
    }
    
    return () => { document.title = "2FA Tools"; };
  }, [timeLeft, isActive, mode]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODES[mode].duration);
  };

  const switchMode = (newMode: PomodoroMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(MODES[newMode].duration);
  };

  const skipToNext = () => {
    if (mode === "work") {
      const newSessions = sessions + 1;
      setSessions(newSessions);
      switchMode(newSessions % 4 === 0 ? "longBreak" : "shortBreak");
    } else {
      switchMode("work");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const progress = ((MODES[mode].duration - timeLeft) / MODES[mode].duration) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (circumference * progress) / 100;

  return (
    <div className="flex flex-col items-center justify-center max-w-2xl mx-auto py-8">
      <div className="w-full bg-card rounded-2xl shadow-sm border border-border p-8 flex flex-col items-center">

        {/* Mode Tabs */}
        <div className="flex space-x-1 mb-8 bg-muted/50 p-1.5 rounded-xl">
          {(Object.keys(MODES) as PomodoroMode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === m
                  ? `bg-background shadow-sm text-foreground ${MODES[m].ring} ring-2`
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(MODES[m].key)}
            </button>
          ))}
        </div>

        {/* Timer Circle */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-8">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="45"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="3"
              className="text-muted/20"
            />
            <circle
              cx="50" cy="50" r="45"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-1000 ease-linear ${MODES[mode].color}`}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-6xl font-bold font-mono tracking-tighter">
              {formatTime(timeLeft)}
            </span>
            <span className="text-sm text-muted-foreground mt-2 uppercase tracking-widest">
              {t(MODES[mode].key)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={toggleTimer}
            className={`flex items-center justify-center w-16 h-16 rounded-full text-white shadow-lg transition-all hover:scale-105 active:scale-95 ${MODES[mode].bg}`}
          >
            {isActive ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
          </button>

          <button
            onClick={resetTimer}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors border border-border"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={skipToNext}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors border border-border"
            title="Skip to next"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors border border-border"
            title={soundEnabled ? "Mute" : "Unmute"}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

        {/* Session Counter */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1.5">
            <Briefcase className="w-4 h-4" />
            <span>{t("sessions")}: <strong className="text-foreground">{sessions}</strong></span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center space-x-1.5">
            <Coffee className="w-4 h-4" />
            <span>{t("nextLongBreak")}: <strong className="text-foreground">{4 - (sessions % 4)}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
