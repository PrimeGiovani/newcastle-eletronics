import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/utils";
import { PageTitle, Table, Td } from "../ui";

/** Customer analytics derived from paid orders (includes guests), joined with registered profiles. */
export default async function Customers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const sb = await createClient();
  const [{ data: orders }, { count: registered }] = await Promise.all([
    sb.from("orders").select("email, customer_name, phone, total, created_at, user_id, reference").in("status", ["paid", "processing", "shipped", "delivered"]).order("created_at", { ascending: false }).limit(5000),
    sb.from("profiles").select("id", { count: "exact", head: true }),
  ]);
  type Cust = { name: string; phone: string; orders: number; spent: number; last: string; registered: boolean; refs: string[] };
  const map = new Map<string, Cust>();
  orders?.forEach((o) => {
    const k = o.email.toLowerCase(); const c: Cust = map.get(k) ?? { name: o.customer_name, phone: o.phone, orders: 0, spent: 0, last: o.created_at, registered: !!o.user_id, refs: [] };
    c.orders++; c.spent += Number(o.total); c.registered ||= !!o.user_id; if (c.refs.length < 3) c.refs.push(o.reference); map.set(k, c);
  });
  let rows = [...map.entries()].sort((a, b) => b[1].spent - a[1].spent);
  if (q) rows = rows.filter(([e, c]) => `${e} ${c.name} ${c.phone}`.toLowerCase().includes(q.toLowerCase()));
  const repeat = [...map.values()].filter((c) => c.orders > 1).length;
  return (
    <>
      <PageTitle>Customers</PageTitle>
      <p className="mb-4 text-sm text-muted-foreground">{registered} registered accounts · {map.size} paying customers · {map.size ? Math.round((repeat / map.size) * 100) : 0}% repeat purchase rate</p>
      <form className="mb-4"><input name="q" defaultValue={q} placeholder="Search name, email, phone" className="h-10 w-full max-w-sm rounded-xl border bg-background px-3 text-sm" /></form>
      <Table head={["Customer", "Contact", "Orders", "Lifetime spend", "Last order", "Recent orders"]}>
        {rows.slice(0, 300).map(([email, c]) => (
          <tr key={email}><Td>{c.name}<span className="block text-xs text-muted-foreground">{c.registered ? "Registered" : "Guest"}</span></Td><Td>{email}<span className="block text-xs">{c.phone}</span></Td>
            <Td>{c.orders}</Td><Td className="font-semibold">{formatNaira(c.spent)}</Td><Td>{new Date(c.last).toLocaleDateString("en-NG")}</Td>
            <Td><span className="text-xs">{c.refs.map((r) => <a key={r} href={`/admin/orders?q=${r}`} className="mr-2 text-electric">{r}</a>)}</span></Td></tr>
        ))}
      </Table>
    </>
  );
}
