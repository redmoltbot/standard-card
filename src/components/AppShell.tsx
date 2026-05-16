"use client";
import { useState, useEffect } from "react";
import PinLock from "@/components/PinLock";
import BottomNav from "@/components/BottomNav";
import { AppNameContext } from "@/components/AppNameContext";

interface AppShellProps {
  children: React.ReactNode;
  appName: string;
}

export default function AppShell({ children, appName }: AppShellProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("pin_unlocked");
    if (stored === "true") setUnlocked(true);
    setChecked(true);

    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const handleUnlock = () => {
    sessionStorage.setItem("pin_unlocked", "true");
    setUnlocked(true);
  };

  if (!checked) return null;

  if (!unlocked) return (
    <AppNameContext.Provider value={appName}>
      <PinLock onUnlock={handleUnlock} />
    </AppNameContext.Provider>
  );

  return (
    <AppNameContext.Provider value={appName}>
      <main className="pb-20 min-h-screen">{children}</main>
      <BottomNav />
    </AppNameContext.Provider>
  );
}
