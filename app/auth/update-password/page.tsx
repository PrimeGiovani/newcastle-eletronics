"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { features } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export default function UpdatePasswordPage() {
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("password") !== f.get("confirm")) { setError("Passwords don't match"); return; }
    const { error } = await createClient().auth.updateUser({ password: String(f.get("password")) });
    if (error) setError(error.message); else window.location.assign(features.customerAccounts ? "/account" : "/admin");
  }
  return (
    <section className="container flex min-h-[60vh] items-center justify-center py-12">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-[28px] bg-white shadow-card dark:bg-card p-8">
        <h1 className="font-display text-2xl font-semibold">Choose a new password</h1>
        <Field label="New password"><Input name="password" type="password" minLength={8} required autoComplete="new-password" className="mt-1.5" /></Field>
        <Field label="Confirm password"><Input name="confirm" type="password" minLength={8} required autoComplete="new-password" className="mt-1.5" /></Field>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full">Update password</Button>
      </form>
    </section>
  );
}
