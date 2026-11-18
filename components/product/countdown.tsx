"use client";
import { useEffect, useState } from "react";
export function Countdown({ to, className }: { to: string; className?: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  if (now === null) return <span className={className}>&nbsp;</span>;
  const ms = Math.max(0, new Date(to).getTime() - now);
  const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
  const cell = (v: number, l: string) => (
    <span className="flex min-w-[52px] flex-col items-center rounded-2xl bg-white px-3 py-2 shadow-card dark:bg-card">
      <b className="text-xl font-semibold tabular-nums leading-none tracking-tight">{String(v).padStart(2, "0")}</b>
      <span className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{l}</span>
    </span>
  );
  return <span className={className} role="timer" aria-label={`Ends in ${d} days ${h} hours ${m} minutes`}><span className="flex gap-2">{cell(d, "days")}{cell(h, "hrs")}{cell(m, "min")}{cell(s, "sec")}</span></span>;
}
