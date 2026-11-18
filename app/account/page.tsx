import Link from "next/link";
import { createClient, getUser } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/utils";
import { StatusBadge } from "./status-badge";

export default async function OrdersPage() {
  const user = await getUser();
  const sb = await createClient();
  const { data: orders } = await sb.from("orders").select("reference, status, total, created_at, order_items(count)").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(50);
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">My orders</h1>
      {!orders?.length ? <p className="mt-6 rounded-[28px] bg-cloud dark:bg-muted p-10 text-center text-muted-foreground">No orders yet. <Link href="/shop" className="font-semibold text-electric">Start shopping →</Link></p> : (
        <ul className="mt-6 divide-y rounded-[28px] bg-white shadow-card dark:bg-card">
          {orders.map((o) => (
            <li key={o.reference}>
              <Link href={`/account/orders/${o.reference}`} className="flex flex-wrap items-center gap-4 p-5 hover:bg-muted/50">
                <span className="flex-1"><b className="block">{o.reference}</b><span className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-NG", { dateStyle: "medium" })} · {(o.order_items as unknown as { count: number }[])[0]?.count ?? 0} item(s)</span></span>
                <StatusBadge status={o.status} />
                <b>{formatNaira(Number(o.total))}</b>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
