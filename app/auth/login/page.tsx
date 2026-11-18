import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "./auth-form";
export const metadata: Metadata = { title: "Sign in or create an account", robots: { index: false } };
export default function LoginPage() {
  return (
    <section className="container flex min-h-[70vh] items-center justify-center py-12">
      <Suspense><AuthForm /></Suspense>
    </section>
  );
}
