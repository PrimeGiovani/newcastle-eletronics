"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export default function ResetPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError("");
    const email = String(new FormData(e.currentTarget).get("email"));
    const { error } = await createClient().auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/auth/callback?next=/auth/update-password` });
    if (error) setError(error.message); else setSent(true);
  }
  return (
    <section className="container flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-[28px] bg-white shadow-card dark:bg-card p-8">
        <h1 className="font-display text-2xl font-semibold">Reset your password</h1>
        {sent ? <p role="status" className="mt-4 text-emerald-600">If an account exists for that email, a reset link is on its way.</p> : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="Email"><Input name="email" type="email" required autoComplete="email" className="mt-1.5" /></Field>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">Send reset link</Button>
          </form>
        )}
      </div>
    </section>
  );
}
