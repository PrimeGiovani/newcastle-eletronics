import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, Boxes, FolderTree, Megaphone, Package, ShoppingCart, Star, Users, LifeBuoy, Store } from "lucide-react";
import { requireRole } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false, follow: false } };

const nav = [
  ["Dashboard", "/admin", BarChart3], ["Orders", "/admin/orders", ShoppingCart], ["Products", "/admin/products", Package],
  ["Categories", "/admin/categories", FolderTree], ["Inventory", "/admin/inventory", Boxes], ["Customers", "/admin/customers", Users], ["Reviews", "/admin/reviews", Star],
  ["Support", "/admin/tickets", LifeBuoy], ["Marketing", "/admin/marketing", Megaphone],
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) return <div className="container py-20 text-center"><h1 className="text-2xl font-semibold">Admin requires Supabase</h1><p className="mt-2 text-muted-foreground">Configure environment variables and run the migrations (see docs/DEPLOYMENT.md).</p></div>;
  const me = await requireRole(["admin", "staff"]);
  if (!me) redirect("/auth/login?next=/admin&error=Admin+access+required");
  return (
    <div className="container grid gap-8 py-8 lg:grid-cols-[220px_1fr]">
      <aside>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Admin · {me.profile!.role}</p>
        <nav aria-label="Admin" className="no-scrollbar mt-4 flex gap-1 overflow-x-auto lg:flex-col">
          {nav.map(([l, h, Icon]) => <Link key={h} href={h} className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted"><Icon className="h-4 w-4" />{l}</Link>)}
          <Link href="/" className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted"><Store className="h-4 w-4" />View store</Link>
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
