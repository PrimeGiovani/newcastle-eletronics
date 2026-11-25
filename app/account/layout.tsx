import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";
import { features } from "@/lib/config";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

const links = [["Orders", "/account"], ["Wishlist", "/wishlist"], ["Addresses", "/account/addresses"], ["Payment methods", "/account/payment-methods"], ["Change password", "/auth/update-password"]];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  if (!features.customerAccounts) redirect("/track");
  const me = await getProfile();
  if (!me) redirect("/auth/login?next=/account");
  return (
    <section className="container grid gap-8 py-10 lg:grid-cols-[240px_1fr]">
      <aside>
        <p className="text-sm text-muted-foreground">Signed in as</p>
        <p className="font-semibold">{me.profile?.full_name ?? me.user.email}</p>
        <nav aria-label="Account" className="mt-6 flex gap-1 overflow-x-auto lg:flex-col">
          {links.map(([l, h]) => <Link key={h} href={h} className="shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-muted">{l}</Link>)}
          {(me.profile?.role === "admin" || me.profile?.role === "staff") && <Link href="/admin" className="shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold text-electric hover:bg-muted">Admin dashboard →</Link>}
        </nav>
        <form action="/auth/signout" method="post" className="mt-4"><Button variant="ghost" size="sm" type="submit">Sign out</Button></form>
      </aside>
      <div>{children}</div>
    </section>
  );
}
