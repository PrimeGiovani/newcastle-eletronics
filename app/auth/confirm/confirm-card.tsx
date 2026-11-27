"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { features } from "@/lib/config";

const COPY: Record<string, { title: string; text: string; cta: string; next: string }> = {
  recovery: { title: "Reset your password", text: "Click below to continue and choose a new password.", cta: "Reset my password", next: "/auth/update-password" },
  signup: { title: "Confirm your email", text: "Click below to activate your Newcastle Electronics account.", cta: "Confirm my email", next: "/account" },
  email: { title: "Confirm your email", text: "Click below to activate your Newcastle Electronics account.", cta: "Confirm my email", next: "/account" },
  email_change: { title: "Confirm your new email", text: "Click below to confirm your new email address.", cta: "Confirm new email", next: "/account" },
  invite: { title: "Accept your invitation", text: "Click below to accept the invitation, then choose a password.", cta: "Accept invitation", next: "/auth/update-password" },
  magiclink: { title: "Sign in", text: "Click below to sign in.", cta: "Sign in", next: "/account" },
};

export function ConfirmCard() {
  const sp = useSearchParams();
  const tokenHash = sp.get("token_hash") ?? "";
  const type = (sp.get("type") ?? "") as EmailOtpType;
  const c = COPY[type] ?? COPY.signup;
  const nextParam = sp.get("next");
  const fallbackNext = !features.customerAccounts && c.next === "/account" ? "/admin" : c.next;
  const next = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : fallbackNext;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(tokenHash && COPY[type] ? "" : "This link is incomplete. Please request a new one.");

  async function confirm() {
    setLoading(true); setError("");
    const { error } = await createClient().auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) {
      setLoading(false);
      setError(/expired|invalid/i.test(error.message) ? "This link has expired or has already been used. Please request a new one." : error.message);
      return;
    }
    window.location.assign(next); // full load so the server sees the new session
  }

  return (
    <div className="w-full max-w-md rounded-[28px] bg-white p-8 text-center shadow-card dark:bg-card">
      <h1 className="text-2xl font-semibold tracking-tight">{c.title}</h1>
      <p className="mt-2 text-muted-foreground">{c.text}</p>
      {error ? (
        <>
          <p role="alert" className="mt-6 rounded-xl bg-red-50 p-3 text-sm text-destructive dark:bg-red-950/30">{error}</p>
          <Link href={type === "recovery" ? "/auth/reset" : "/auth/login"} className="mt-4 inline-block text-sm font-semibold text-electric">{type === "recovery" ? "Send a new reset link" : "Go to sign in"} →</Link>
        </>
      ) : (
        <Button size="lg" className="mt-6 w-full" onClick={confirm} disabled={loading}>{loading && <Loader2 className="animate-spin" />}{c.cta}</Button>
      )}
    </div>
  );
}
