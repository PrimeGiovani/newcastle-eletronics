"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <section className="container py-24 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">Please try again. If the problem continues, contact us on WhatsApp.</p>
      <Button className="mt-8" onClick={reset}>Try again</Button>
    </section>
  );
}
