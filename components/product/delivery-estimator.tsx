"use client";
import { useState } from "react";
import { Truck } from "lucide-react";
import { STATES, ZONE_RATES, estimateDateRange, shippingQuote, FREE_SHIPPING_THRESHOLD } from "@/lib/nigeria";
import { Select } from "@/components/ui/input";
import { formatNaira } from "@/lib/utils";

export function DeliveryEstimator({ price }: { price: number }) {
  const [state, setState] = useState("Lagos");
  const q = shippingQuote(state, price);
  return (
    <div className="rounded-[20px] bg-cloud p-5 dark:bg-muted">
      <p className="flex items-center gap-2 text-sm font-semibold"><Truck className="h-4 w-4 text-electric" />Delivery estimate</p>
      <label className="sr-only" htmlFor="deliver-to">Deliver to state</label>
      <Select id="deliver-to" value={state} onChange={(e) => setState(e.target.value)} className="mt-3 h-10">
        {STATES.map((s) => <option key={s.name}>{s.name}</option>)}
      </Select>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div><dt className="text-muted-foreground">Arrives</dt><dd className="font-medium">{estimateDateRange(q.days)}</dd></div>
        <div><dt className="text-muted-foreground">Delivery fee</dt><dd className="font-medium">{q.fee === 0 ? "FREE" : formatNaira(q.fee)}</dd></div>
      </dl>
      <p className="mt-2 text-xs text-muted-foreground">Zone: {ZONE_RATES[q.zone].label}. Free standard delivery on orders over {formatNaira(FREE_SHIPPING_THRESHOLD)}.</p>
    </div>
  );
}
