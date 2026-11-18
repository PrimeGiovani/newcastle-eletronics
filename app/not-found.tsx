import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
export default function NotFound() {
  return (
    <section className="container py-24 text-center">
      <p className="font-display text-7xl font-semibold text-electric">404</p>
      <h1 className="mt-4 text-2xl font-semibold">We couldn't find that page</h1>
      <p className="mt-2 text-muted-foreground">It may have moved, or the product is no longer available.</p>
      <div className="mt-8 flex justify-center gap-3"><Link href="/shop" className={buttonVariants()}>Browse products</Link><Link href="/" className={buttonVariants({ variant: "outline" })}>Go home</Link></div>
    </section>
  );
}
