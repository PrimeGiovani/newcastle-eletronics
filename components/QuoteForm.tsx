"use client";
import { useState } from "react";
import { products } from "@/lib/products";
import { waLink } from "@/lib/site";

type Status = "idle" | "sending" | "ok" | "error";
export default function QuoteForm({ defaultProduct = "" }: { defaultProduct?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending"); setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setStatus("ok"); (e.target as HTMLFormElement).reset();
    } catch (err) { setStatus("error"); setError((err as Error).message); }
  }

  if (status === "ok") return (
    <div role="status" className="rounded-2xl bg-eco-50 p-8 text-center">
      <p className="text-xl font-semibold text-eco-700">Thank you! Your request was received.</p>
      <p className="mt-2 text-ink-soft">Our team will contact you within 2 business hours.</p>
      <a href={waLink("Hi, I just submitted a quote request.")} className="btn-wa mt-6" target="_blank" rel="noopener noreferrer">Need it faster? WhatsApp us</a>
    </div>
  );

  const field = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-ink outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100";
  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate={false}>
      <label className="text-sm font-medium text-ink">Full name *<input name="name" required minLength={2} autoComplete="name" className={field} /></label>
      <label className="text-sm font-medium text-ink">Phone *<input name="phone" type="tel" required autoComplete="tel" pattern="[+0-9 ()-]{7,20}" className={field} /></label>
      <label className="text-sm font-medium text-ink sm:col-span-2">Email<input name="email" type="email" autoComplete="email" className={field} /></label>
      <label className="text-sm font-medium text-ink sm:col-span-2">Product interested in *
        <select name="product" required defaultValue={defaultProduct} className={field}>
          <option value="" disabled>Select a product</option>
          {products.map((p) => <option key={p.slug} value={p.name}>{p.name}</option>)}
          <option value="Complete Solar Kit">Complete Solar Kit</option>
          <option value="Free Solar Consultation">Free Solar Consultation</option>
          <option value="Other / Bulk order">Other / Bulk order</option>
        </select>
      </label>
      <label className="text-sm font-medium text-ink sm:col-span-2">Message<textarea name="message" rows={4} maxLength={2000} className={field} placeholder="Quantity, location, project details…" /></label>
      {/* honeypot */}
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {status === "error" && <p role="alert" className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <button type="submit" disabled={status === "sending"} className="btn-primary sm:col-span-2 disabled:opacity-60">{status === "sending" ? "Sending…" : "Get My Free Quote"}</button>
    </form>
  );
}
