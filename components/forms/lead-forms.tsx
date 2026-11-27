"use client";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { STATES, PHONE_HINT, PHONE_PATTERN } from "@/lib/nigeria";
import { waLink } from "@/lib/config";
import { cn } from "@/lib/utils";

type LeadType = "quote" | "contact" | "installation" | "solar_consultation" | "support";

async function submitLead(payload: Record<string, unknown>) {
  const res = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "Something went wrong. Please try again.");
  return json;
}

const COPY: Record<LeadType, { cta: string; success: string; messageLabel: string; productLabel?: string }> = {
  quote: { cta: "Request Quotation", success: "Your quotation request has been received.", messageLabel: "Quantities, location & any details", productLabel: "Product(s) of interest" },
  contact: { cta: "Send Message", success: "Thanks! Your message has been received.", messageLabel: "How can we help?" },
  installation: { cta: "Book Installation", success: "Installation request received. We'll confirm your slot.", messageLabel: "Address & access notes", productLabel: "Appliance to install (e.g. 1.5HP split AC)" },
  solar_consultation: { cta: "Request Free Consultation", success: "Consultation booked. A solar engineer will call you.", messageLabel: "Tell us about your power needs", productLabel: "Property type (home, office, shop…)" },
  support: { cta: "Open Support Ticket", success: "Ticket opened. Our support team will respond shortly.", messageLabel: "Describe the issue", productLabel: "Order number (if any)" },
};

export function LeadForm({ type, defaultProduct = "", meta, showDate, className }: { type: LeadType; defaultProduct?: string; meta?: Record<string, unknown>; showDate?: boolean; className?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");
  const c = COPY[type];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setState("loading");
    const fd = Object.fromEntries(new FormData(e.currentTarget));
    try { await submitLead({ ...fd, type, meta }); setState("done"); }
    catch (err) { setError((err as Error).message); setState("idle"); }
  }

  if (state === "done") return (
    <div role="status" className="rounded-2xl bg-emerald-50 p-8 text-center dark:bg-emerald-950/40">
      <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
      <p className="mt-3 text-lg font-semibold">{c.success}</p>
      <p className="mt-1 text-sm text-muted-foreground">We respond within 2 business hours.</p>
      <Button variant="whatsapp" className="mt-5" onClick={() => window.open(waLink(type === "support" ? "support" : "quote"), "_blank", "noopener")}>Need it faster? WhatsApp us</Button>
    </div>
  );

  return (
    <form onSubmit={onSubmit} className={cn("grid gap-4 sm:grid-cols-2", className)}>
      <Field label="Full name *"><Input name="name" required minLength={2} autoComplete="name" className="mt-1.5" /></Field>
      <Field label="Phone number *" hint={PHONE_HINT}><Input name="phone" type="tel" required pattern={PHONE_PATTERN} inputMode="tel" autoComplete="tel" className="mt-1.5" title="Phone number with country code if outside Nigeria, e.g. +44 7700 900123" /></Field>
      <Field label="Email"><Input name="email" type="email" autoComplete="email" className="mt-1.5" /></Field>
      <Field label="State">
        <Select name="state" defaultValue="Lagos" className="mt-1.5">{STATES.map((s) => <option key={s.name}>{s.name}</option>)}</Select>
      </Field>
      {c.productLabel && <div className="sm:col-span-2"><Field label={c.productLabel}><Input name="product" defaultValue={defaultProduct} className="mt-1.5" /></Field></div>}
      {showDate && <Field label="Preferred date"><Input name="preferredDate" type="date" min={new Date().toISOString().slice(0, 10)} className="mt-1.5" /></Field>}
      <div className="sm:col-span-2"><Field label={c.messageLabel}><Textarea name="message" maxLength={3000} className="mt-1.5" /></Field></div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {error && <p role="alert" className="text-sm text-destructive sm:col-span-2">{error}</p>}
      <Button type="submit" variant="accent" size="lg" disabled={state === "loading"} className="sm:col-span-2">
        {state === "loading" && <Loader2 className="animate-spin" />}{c.cta}
      </Button>
    </form>
  );
}

export function NewsletterForm({ dark }: { dark?: boolean }) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setState("loading"); setError("");
    try { await submitLead({ type: "newsletter", email: new FormData(e.currentTarget).get("email") }); setState("done"); }
    catch (err) { setError((err as Error).message); setState("idle"); }
  }
  if (state === "done") return <p role="status" className={cn("text-sm font-medium", dark ? "text-emerald-300" : "text-emerald-700")}>You're subscribed. Welcome aboard!</p>;
  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <label className="sr-only" htmlFor={dark ? "nl-footer" : "nl"}>Email address</label>
      <input id={dark ? "nl-footer" : "nl"} name="email" type="email" required placeholder="you@example.com" autoComplete="email"
        className={cn("h-11 min-w-0 flex-1 rounded-full px-4 text-base lg:text-sm outline-none focus:ring-2 focus:ring-electric", dark ? "bg-white/10 text-white placeholder:text-white/50" : "border border-input bg-white dark:bg-muted")} />
      <Button type="submit" variant="accent" disabled={state === "loading"}>{state === "loading" ? <Loader2 className="animate-spin" /> : "Subscribe"}</Button>
      {error && <p role="alert" className="sr-only">{error}</p>}
    </form>
  );
}
