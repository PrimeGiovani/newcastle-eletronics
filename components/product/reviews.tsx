"use client";
import Image from "next/image";
import { useState } from "react";
import { BadgeCheck, Camera, Loader2 } from "lucide-react";
import type { Review } from "@/lib/types";
import { Rating } from "./rating";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Reviews({ productId, reviews, rating, count }: { productId: string; reviews: Review[]; rating: number; count: number }) {
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, n: reviews.filter((r) => r.rating === s).length }));
  return (
    <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
      <div>
        <p className="font-display text-5xl font-semibold">{rating.toFixed(1)}</p>
        <Rating value={rating} size="md" className="mt-2" />
        <p className="mt-1 text-sm text-muted-foreground">Based on {count} reviews</p>
        <ul className="mt-5 space-y-1.5">
          {dist.map(({ s, n }) => (
            <li key={s} className="flex items-center gap-2 text-sm">
              <span className="w-3">{s}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-amber-400" style={{ width: `${reviews.length ? (n / reviews.length) * 100 : 0}%` }} /></span>
              <span className="w-6 text-right text-muted-foreground">{n}</span>
            </li>
          ))}
        </ul>
        <ReviewForm productId={productId} />
      </div>
      <ul className="divide-y">
        {reviews.length === 0 && <li className="py-6 text-muted-foreground">No reviews yet — be the first to share your experience.</li>}
        {reviews.map((r) => (
          <li key={r.id} className="py-6 first:pt-0">
            <div className="flex flex-wrap items-center gap-2">
              <Rating value={r.rating} />
              {r.title && <p className="font-semibold">{r.title}</p>}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground/90">{r.body}</p>
            {r.photos.length > 0 && (
              <div className="mt-3 flex gap-2">{r.photos.map((src) => <Image key={src} src={src} alt="Customer photo" width={80} height={80} className="h-20 w-20 rounded-xl object-cover" />)}</div>
            )}
            <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              {r.author} · {new Date(r.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}
              {r.verified && <span className="inline-flex items-center gap-1 font-semibold text-emerald-600"><BadgeCheck className="h-3.5 w-3.5" />Verified purchase</span>}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReviewForm({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setStatus("loading");
    const fd = new FormData(e.currentTarget);
    fd.set("productId", productId); fd.set("rating", String(rating));
    fd.delete("photos"); files.forEach((f) => fd.append("photos", f));
    const res = await fetch("/api/reviews", { method: "POST", body: fd });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) { setError(json.error ?? "Could not submit review"); setStatus("idle"); return; }
    setStatus("done");
  }

  if (status === "done") return <p role="status" className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">Thanks! Your review has been published.</p>;
  if (!open) return <Button variant="outline" className="mt-6 w-full" onClick={() => setOpen(true)}>Write a review</Button>;
  return (
    <form onSubmit={submit} className="mt-6 space-y-3">
      <fieldset>
        <legend className="mb-1 text-sm font-medium">Your rating</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button type="button" key={s} onClick={() => setRating(s)} aria-label={`${s} star${s > 1 ? "s" : ""}`} aria-pressed={rating === s}
              className={cn("text-2xl leading-none transition", s <= rating ? "text-amber-400" : "text-muted")}>★</button>
          ))}
        </div>
      </fieldset>
      <Field label="Title"><Input name="title" maxLength={120} className="mt-1.5" /></Field>
      <Field label="Review *"><Textarea name="body" required minLength={10} maxLength={2000} className="mt-1.5" /></Field>
      <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed p-3 text-sm text-muted-foreground hover:bg-muted">
        <Camera className="h-4 w-4" />{files.length ? `${files.length} photo(s) selected` : "Add photos (up to 3, max 3MB each)"}
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 3))} />
      </label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={status === "loading"}>{status === "loading" && <Loader2 className="animate-spin" />}Submit review</Button>
      <p className="text-xs text-muted-foreground">You must be signed in. Reviews from customers who bought this item get a “Verified purchase” badge.</p>
    </form>
  );
}
