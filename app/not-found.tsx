import Link from "next/link";
export default function NotFound() {
  return (<section className="section container text-center"><h1 className="text-4xl font-bold">Page not found</h1><p className="mt-3 text-ink-soft">The page you're looking for doesn't exist.</p><Link href="/products" className="btn-primary mt-8">Browse products</Link></section>);
}
