"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { features } from "@/lib/config";

export default function UpdatePasswordPage() {
  const [ready, setReady] = useState<"checking" | "ok" | "nosession">("checking");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // The reset link signs the user in first; without a session we can't change the password
  useEffect(() => {
    (async () => {
      const sb = createClient();
      // Older-style links arrive with ?code=… (works only in the browser that requested the reset)
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) { await sb.auth.exchangeCodeForSession(code).catch(() => null); window.history.replaceState(null, "", "/auth/update-password"); }
      const { data } = await sb.auth.getUser();
      setReady(data.user ? "ok" : "nosession");
    })();
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError("");
    const f = new FormData(e.currentTarget);
    const pw = String(f.get("password"));
    if (pw !== f.get("confirm")) { setError("Passwords don't match"); return; }
    if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) { setError("Use at least 8 characters with letters and numbers"); return; }
    setSaving(true);
    const { error } = await createClient().auth.updateUser({ password: pw });
    if (error) { setSaving(false); setError(/session/i.test(error.message) ? "Your reset link has expired. Please request a new one." : error.message); return; }
    window.location.assign(features.customerAccounts ? "/account" : "/admin");
  }

  return (
    <section className="container flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-card dark:bg-card">
        <h1 className="text-2xl font-semibold tracking-tight">Choose a new password</h1>
        {ready === "checking" && <p className="mt-6 flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Checking your link…</p>}
        {ready === "nosession" && (
          <div className="mt-6">
            <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">Your reset link has expired or was opened in a different way. Please request a new one – it only takes a minute.</p>
            <Link href="/auth/reset" className="mt-4 inline-block text-sm font-semibold text-electric">Send a new reset link →</Link>
          </div>
        )}
        {ready === "ok" && (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="New password" hint="At least 8 characters, with letters and numbers"><Input name="password" type="password" minLength={8} required autoComplete="new-password" className="mt-1.5" /></Field>
            <Field label="Confirm password"><Input name="confirm" type="password" minLength={8} required autoComplete="new-password" className="mt-1.5" /></Field>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={saving}>{saving && <Loader2 className="animate-spin" />}Update password</Button>
          </form>
        )}
      </div>
    </section>
  );
}
