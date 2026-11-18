import Link from "next/link";
import { cn } from "@/lib/utils";
import type { SP } from "@/lib/search-params";
export function Pagination({ page, pages, basePath, sp }: { page: number; pages: number; basePath: string; sp: SP }) {
  if (pages <= 1) return null;
  const href = (n: number) => { const p = new URLSearchParams(Object.entries(sp).flatMap(([k, v]) => (typeof v === "string" ? [[k, v]] : []))); p.set("page", String(n)); return `${basePath}?${p}`; };
  return (
    <nav aria-label="Pagination" className="mt-12 flex justify-center gap-2">
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <Link key={n} href={href(n)} aria-current={n === page ? "page" : undefined}
          className={cn("grid h-10 w-10 place-items-center rounded-full border text-sm font-medium", n === page ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted")}>{n}</Link>
      ))}
    </nav>
  );
}
