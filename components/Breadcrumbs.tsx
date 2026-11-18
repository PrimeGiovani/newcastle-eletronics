import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "./json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  const all = [{ name: "Home", path: "/" }, ...items];
  return (
    <nav aria-label="Breadcrumb" className="container py-4 text-sm text-muted-foreground">
      <JsonLd data={breadcrumbJsonLd(all)} />
      <ol className="flex flex-wrap items-center gap-1">
        {all.map((it, i) => (
          <li key={it.path} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5" aria-hidden />}
            {i === all.length - 1 ? <span aria-current="page" className="line-clamp-1 text-foreground">{it.name}</span> : <Link href={it.path} className="hover:text-foreground">{it.name}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
