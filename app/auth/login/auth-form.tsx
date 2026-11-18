"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { NG_PHONE_PATTERN, normalizeNgPhone } from "@/lib/nigeria";
import { cn } from "@/lib/utils";

export function AuthForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next")?.startsWith("/") ? sp.get("next")! : "/account"; // prevent open redirects
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(sp.get("error") ?? "");
  const [info, setInfo] = useState("");

  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setInfo(""); setLoading(true);
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")), password = String(f.get("password"));
    const sb = createClient();
    if (mode === "signin") {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message === "Invalid login credentials" ? "Incorrect email or password." : error.message); setLoading(false); return; }
      router.replace(next); router.refresh();
    } else {
      const { error } = await sb.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`, data: { full_name: f.get("fullName"), phone: normalizeNgPhone(String(f.get("phone"))) } },
      });
      setLoading(false);
      if (error) { setError(error.message); return; }
      setInfo("Check your email to confirm your account, then sign in.");
    }
  }

  async function google() {
    setError("");
    const { error } = await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` } });
    if (error) setError(error.message);
  }

  return (
    <div className="w-full max-w-md rounded-[28px] bg-white shadow-card dark:bg-card p-6 shadow-soft sm:p-10">
      <h1 className="font-display text-2xl font-semibold">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{mode === "signin" ? "Sign in to track orders, save addresses and checkout faster." : "Join for faster checkout, order history and exclusive deals."}</p>
      {!configured && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">Authentication requires Supabase. Add your keys to <code>.env.local</code>.</p>}

      <div className="mt-6 grid grid-cols-2 rounded-full bg-muted p-1 text-sm font-semibold" role="tablist">
        {(["signin", "signup"] as const).map((m) => <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={cn("rounded-full py-2", mode === m && "bg-background shadow")}>{m === "signin" ? "Sign in" : "Register"}</button>)}
      </div>

      <Button variant="outline" className="mt-6 w-full" onClick={google} disabled={!configured}>
        <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z"/></svg>
        Continue with Google
      </Button>
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or with email<span className="h-px flex-1 bg-border" /></div>

      <form onSubmit={submit} className="space-y-4">
        {mode === "signup" && <>
          <Field label="Full name"><Input name="fullName" required autoComplete="name" className="mt-1.5" /></Field>
          <Field label="Phone number"><Input name="phone" type="tel" required pattern={NG_PHONE_PATTERN} autoComplete="tel" className="mt-1.5" /></Field>
        </>}
        <Field label="Email"><Input name="email" type="email" required autoComplete="email" className="mt-1.5" /></Field>
        <Field label="Password" hint={mode === "signup" ? "At least 8 characters" : undefined}><Input name="password" type="password" required minLength={mode === "signup" ? 8 : 1} autoComplete={mode === "signin" ? "current-password" : "new-password"} className="mt-1.5" /></Field>
        {mode === "signin" && <Link href="/auth/reset" className="block text-right text-sm font-medium text-electric">Forgot password?</Link>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {info && <p role="status" className="text-sm text-emerald-600">{info}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={loading || !configured}>{loading && <Loader2 className="animate-spin" />}{mode === "signin" ? "Sign in" : "Create account"}</Button>
      </form>
    </div>
  );
}
