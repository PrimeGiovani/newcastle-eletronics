import type { Metadata } from "next";
import { Suspense } from "react";
import { ConfirmCard } from "./confirm-card";

export const metadata: Metadata = { title: "Confirm", robots: { index: false, follow: false } };

/**
 * Target of Supabase auth emails (reset password, confirm sign-up, change email).
 * Uses the token-hash flow, so links work in ANY browser/device (email apps, phones) –
 * unlike the PKCE "code" flow which only works in the browser that requested the email.
 * Verification happens on a button click, so email link-scanners can't use up the one-time link.
 */
export default function ConfirmPage() {
  return (
    <section className="container flex min-h-[60vh] items-center justify-center py-12">
      <Suspense><ConfirmCard /></Suspense>
    </section>
  );
}
