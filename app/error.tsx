"use client";
import Link from "next/link";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="section container text-center">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="mt-3 text-ink-soft">Please try again, or contact us directly.</p>
      <div className="mt-8 flex justify-center gap-3"><button onClick={reset} className="btn-primary">Try again</button><Link href="/contact" className="btn-outline">Contact us</Link></div>
    </section>
  );
}
