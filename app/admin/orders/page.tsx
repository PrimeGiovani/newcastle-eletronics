import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUSES } from "@/lib/types";
import { formatNaira, cn } from "@/lib/utils";
import { StatusBadge } from "../../account/status-badge";
import { PageTitle, Table, Td } from "../ui";

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status, q } = await searchParams;
  const sb = await createClient();
  let query = sb.from("orders").select("id, reference, customer_name, email, phone, total, status, delivery_method, shipping_address, created_at").order("created_at", { ascending: false }).limit(200);
  if (status) query = query.eq("status", status);
  if (q) { const s = q.replace(/[%,()]/g, ""); query = query.or(`reference.ilike.%${s}%,email.ilike.%${s}%,customer_name.ilike.%${s}%,phone.ilike.%${s}%`); }
  const { data } = await query;
  return (
    <>
      <PageTitle>Orders</PageTitle>
      <form className="mb-3"><input name="q" defaultValue={q} placeholder="Search ref, name, email, phone" className="h-10 w-full max-w-sm rounded-xl border bg-background px-3 text-sm" /></form>
      <nav className="no-scrollbar mb-4 flex gap-2 overflow-x-auto text-sm" aria-label="Filter by status">
        {["", ...ORDER_STATUSES].map((s) => <Link key={s} href={s ? `/admin/orders?status=${s}` : "/admin/orders"} className={cn("shrink-0 rounded-full border px-3 py-1.5", (status ?? "") === s && "bg-primary text-primary-foreground")}>{s || "All"}</Link>)}
      </nav>
      <Table head={["Order", "Date", "Customer", "Ship to", "Method", "Status", "Total"]}>
        {data?.map((o) => (
          <tr key={o.id} className="hover:bg-muted/40">
            <Td><Link href={`/admin/orders/${o.id}`} className="font-semibold text-electric">{o.reference}</Link></Td>
            <Td>{new Date(o.created_at).toLocaleDateString("en-NG")}</Td>
            <Td>{o.customer_name}<span className="block text-xs text-muted-foreground">{o.phone}</span></Td>
            <Td>{(o.shipping_address as { state: string }).state}</Td><Td>{o.delivery_method}</Td>
            <Td><StatusBadge status={o.status} /></Td><Td className="font-semibold">{formatNaira(+o.total)}</Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
