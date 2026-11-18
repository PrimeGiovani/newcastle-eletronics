import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/utils";
import { Stat, PageTitle, Table, Td } from "./ui";
import { StatusBadge } from "../account/status-badge";

export default async function AdminDashboard() {
  const sb = await createClient();
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const [{ data: orders }, { data: low }, { count: customers }, { data: recent }, { data: top }, { count: openTickets }] = await Promise.all([
    sb.from("orders").select("total, created_at, status, email").gte("created_at", since).in("status", ["paid", "processing", "shipped", "delivered"]),
    sb.from("low_stock").select("*").limit(8),
    sb.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    sb.from("orders").select("id, reference, customer_name, total, status, created_at").order("created_at", { ascending: false }).limit(8),
    sb.from("products").select("id, name, sold_count, price").order("sold_count", { ascending: false }).limit(5),
    sb.from("support_tickets").select("id", { count: "exact", head: true }).in("status", ["open", "pending"]),
  ]);
  const revenue = (orders ?? []).reduce((s, o) => s + Number(o.total), 0);
  const count = orders?.length ?? 0;
  const uniqueBuyers = new Set(orders?.map((o) => o.email)).size;
  const byDay = new Map<string, number>();
  for (let i = 29; i >= 0; i--) byDay.set(new Date(Date.now() - i * 864e5).toISOString().slice(0, 10), 0);
  orders?.forEach((o) => { const d = o.created_at.slice(0, 10); byDay.set(d, (byDay.get(d) ?? 0) + Number(o.total)); });
  const max = Math.max(1, ...byDay.values());

  return (
    <>
      <PageTitle>Dashboard</PageTitle>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Revenue (30 days)" value={formatNaira(revenue)} />
        <Stat label="Paid orders (30 days)" value={String(count)} sub={`AOV ${formatNaira(count ? revenue / count : 0)}`} />
        <Stat label="Customers" value={String(customers ?? 0)} sub={`${uniqueBuyers} bought in last 30 days`} />
        <Stat label="Open support tickets" value={String(openTickets ?? 0)} />
      </div>
      <section className="mt-8 rounded-3xl border p-6" aria-label="Revenue chart">
        <p className="font-semibold">Revenue – last 30 days</p>
        <div className="mt-6 flex h-48 items-end gap-1">
          {[...byDay.entries()].map(([d, v]) => <div key={d} title={`${d}: ${formatNaira(v)}`} className="flex-1 rounded-t bg-electric/80 transition hover:bg-flame" style={{ height: `${Math.max(2, (v / max) * 100)}%` }} />)}
        </div>
      </section>
      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <section>
          <div className="mb-3 flex justify-between"><h2 className="font-semibold">Recent orders</h2><Link href="/admin/orders" className="text-sm text-electric">All →</Link></div>
          <Table head={["Order", "Customer", "Status", "Total"]}>
            {recent?.map((o) => <tr key={o.id}><Td><Link href={`/admin/orders/${o.id}`} className="font-medium text-electric">{o.reference}</Link></Td><Td>{o.customer_name}</Td><Td><StatusBadge status={o.status} /></Td><Td>{formatNaira(+o.total)}</Td></tr>)}
          </Table>
        </section>
        <section>
          <div className="mb-3 flex justify-between"><h2 className="font-semibold">Low stock alerts</h2><Link href="/admin/inventory" className="text-sm text-electric">Inventory →</Link></div>
          <Table head={["Product", "SKU", "Available", "Threshold"]}>
            {low?.length ? low.map((p) => <tr key={p.id}><Td>{p.name}</Td><Td>{p.sku}</Td><Td className="font-semibold text-flame">{p.quantity - p.reserved}</Td><Td>{p.low_stock_threshold}</Td></tr>) : <tr><Td className="text-muted-foreground">All products are well stocked 🎉</Td></tr>}
          </Table>
          <h2 className="mb-3 mt-8 font-semibold">Top products (all time)</h2>
          <Table head={["Product", "Units sold", "Price"]}>
            {top?.map((p) => <tr key={p.id}><Td>{p.name}</Td><Td>{p.sold_count}</Td><Td>{formatNaira(+p.price)}</Td></tr>)}
          </Table>
        </section>
      </div>
    </>
  );
}
