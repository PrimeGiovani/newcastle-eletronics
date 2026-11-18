"use client";
import { useMemo, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { APPLIANCE_PRESETS, sizeSolarSystem, type Appliance } from "@/lib/solar";
import { Button } from "@/components/ui/button";
import { LeadForm } from "@/components/forms/lead-forms";

export function SolarCalculator() {
  const [items, setItems] = useState<Appliance[]>(APPLIANCE_PRESETS);
  const [sun, setSun] = useState(4.5);
  const r = useMemo(() => sizeSolarSystem(items, { sunHours: sun }), [items, sun]);
  const set = (i: number, patch: Partial<Appliance>) => setItems((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const cell = "h-9 w-full rounded-lg border bg-background px-2 text-sm";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="overflow-x-auto rounded-[28px] bg-white shadow-card dark:bg-card">
        <table className="w-full min-w-[620px] text-sm">
          <caption className="sr-only">Appliances and daily usage</caption>
          <thead className="bg-cloud dark:bg-muted text-left text-muted-foreground"><tr><th className="p-3 font-medium">Appliance</th><th className="p-3 font-medium">Watts</th><th className="p-3 font-medium">Qty</th><th className="p-3 font-medium">Hours/day</th><th className="p-3 font-medium">Of which at night</th><th className="p-3"><span className="sr-only">Remove</span></th></tr></thead>
          <tbody className="divide-y">
            {items.map((a, i) => (
              <tr key={i} className={a.qty === 0 ? "opacity-50" : ""}>
                <td className="p-2"><input aria-label="Appliance name" className={cell} value={a.name} onChange={(e) => set(i, { name: e.target.value })} /></td>
                <td className="p-2"><input aria-label={`${a.name} watts`} type="number" min={0} className={cell} value={a.watts} onChange={(e) => set(i, { watts: +e.target.value })} /></td>
                <td className="p-2"><div className="flex items-center gap-1"><button type="button" aria-label="Decrease" onClick={() => set(i, { qty: Math.max(0, a.qty - 1) })} className="grid h-8 w-8 place-items-center rounded-full border"><Minus className="h-3 w-3" /></button><span className="w-6 text-center">{a.qty}</span><button type="button" aria-label="Increase" onClick={() => set(i, { qty: a.qty + 1 })} className="grid h-8 w-8 place-items-center rounded-full border"><Plus className="h-3 w-3" /></button></div></td>
                <td className="p-2"><input aria-label={`${a.name} hours per day`} type="number" min={0} max={24} step={0.5} className={cell} value={a.hours} onChange={(e) => set(i, { hours: Math.min(24, +e.target.value) })} /></td>
                <td className="p-2"><input aria-label={`${a.name} night hours`} type="number" min={0} max={a.hours} step={0.5} className={cell} value={a.nightHours ?? 0} onChange={(e) => set(i, { nightHours: Math.min(a.hours, +e.target.value) })} /></td>
                <td className="p-2"><button type="button" aria-label={`Remove ${a.name}`} onClick={() => setItems((xs) => xs.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t p-3">
          <Button type="button" variant="outline" size="sm" onClick={() => setItems((xs) => [...xs, { name: "New appliance", watts: 100, qty: 1, hours: 4, nightHours: 2 }])}><Plus />Add appliance</Button>
          <label className="flex items-center gap-2 text-sm">Peak sun hours <select value={sun} onChange={(e) => setSun(+e.target.value)} className="h-9 rounded-lg border bg-background px-2"><option value={4}>4.0 (South)</option><option value={4.5}>4.5 (Lagos/SW)</option><option value={5.5}>5.5 (Abuja/Middle Belt)</option><option value={6}>6.0 (North)</option></select></label>
        </div>
      </div>

      <aside className="h-fit space-y-4 rounded-[28px] bg-cloud p-7 lg:sticky lg:top-36 dark:bg-muted" aria-live="polite">
        <p className="text-sm font-semibold text-flame">Your estimated system</p>
        <dl className="grid grid-cols-2 gap-3">
          {[["Daily power usage", `${r.dailyKwh} kWh`], ["Peak load", `${r.peakW.toLocaleString()} W`], ["Recommended inverter", `${r.inverterKva} kVA hybrid`], ["Battery storage", `${r.batteryKwh} kWh (${r.batteryModules}× 5kWh lithium)`], ["Solar panels", `${r.panels} × 550W`], ["Array size", `${r.arrayKw} kWp`]].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-white p-4 shadow-card dark:bg-card"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="mt-1 text-[17px] font-semibold tracking-tight">{v}</dd></div>
          ))}
        </dl>
        <p className="text-xs text-muted-foreground">Estimates include 25% inverter headroom, 90% battery depth-of-discharge and 20% system losses. A site survey confirms final sizing.</p>
        <a href="#consultation" className="block rounded-full bg-electric py-3.5 text-center font-medium text-white transition hover:bg-electric-600">Get a free quote for this system</a>
      </aside>

      <div id="consultation" className="scroll-mt-32 rounded-[28px] bg-cloud p-6 sm:p-10 lg:col-span-2 dark:bg-muted">
        <h2 className="font-display text-2xl font-semibold">Request a free solar consultation</h2>
        <p className="mb-6 mt-1 text-muted-foreground">Your calculator results are attached automatically so our engineer can prepare an accurate proposal.</p>
        <LeadForm type="solar_consultation" meta={{ ...r, sunHours: sun, appliances: items.filter((a) => a.qty > 0) }} />
      </div>
    </div>
  );
}
