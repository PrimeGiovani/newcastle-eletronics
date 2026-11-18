import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/misc";
import { adjustStock } from "../actions";
import { PageTitle, Stat, Table, Td } from "../ui";
import { formatNaira } from "@/lib/utils";

export default async function Inventory({ searchParams }: { searchParams: Promise<{ low?: string }> }) {
  const { low } = await searchParams;
  const sb = await createClient();
  const [{ data: items }, { data: moves }] = await Promise.all([
    sb.from("product_listing").select("id, name, sku, stock, low_stock_threshold, price, cost_price, status").neq("status", "archived").order("stock"),
    sb.from("inventory_movements").select("id, delta, reason, note, reference, created_at, products(name)").order("created_at", { ascending: false }).limit(25),
  ]);
  const list = (items ?? []).filter((i) => (low ? i.stock <= i.low_stock_threshold : true));
  const units = (items ?? []).reduce((s, i) => s + i.stock, 0);
  const value = (items ?? []).reduce((s, i) => s + i.stock * Number(i.cost_price ?? i.price), 0);
  const lowCount = (items ?? []).filter((i) => i.stock <= i.low_stock_threshold).length;
  return (
    <>
      <PageTitle>Inventory</PageTitle>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Units in stock" value={units.toLocaleString()} /><Stat label="Stock value (cost)" value={formatNaira(value)} /><Stat label="Low / out of stock" value={String(lowCount)} />
      </div>
      <p className="mb-3 text-sm"><a href="/admin/inventory" className={!low ? "font-semibold" : "text-electric"}>All</a> · <a href="/admin/inventory?low=1" className={low ? "font-semibold" : "text-electric"}>Low stock only</a></p>
      <Table head={["Product", "SKU", "Available", "Adjust stock (+ restock / − remove)"]}>
        {list.map((i) => (
          <tr key={i.id}>
            <Td>{i.name}</Td><Td>{i.sku}</Td>
            <Td>{i.stock === 0 ? <Badge variant="destructive">Out</Badge> : i.stock <= i.low_stock_threshold ? <Badge variant="warning">{i.stock} low</Badge> : i.stock}</Td>
            <Td>
              <form action={adjustStock} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="productId" value={i.id} />
                <input name="delta" type="number" required placeholder="±qty" aria-label="Quantity change" className="h-9 w-20 rounded-lg border bg-background px-2" />
                <select name="reason" aria-label="Reason" className="h-9 rounded-lg border bg-background px-2"><option>restock</option><option>adjustment</option><option>return</option><option>damage</option></select>
                <input name="note" placeholder="Note" aria-label="Note" className="h-9 w-28 rounded-lg border bg-background px-2" />
                <input name="threshold" type="number" defaultValue={i.low_stock_threshold} aria-label="Low stock threshold" title="Low-stock alert threshold" className="h-9 w-16 rounded-lg border bg-background px-2" />
                <button className="h-9 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground">Save</button>
              </form>
            </Td>
          </tr>
        ))}
      </Table>
      <h2 className="mb-3 mt-10 font-semibold">Recent stock movements (inventory report)</h2>
      <Table head={["When", "Product", "Change", "Reason", "Ref / note"]}>
        {moves?.map((m) => <tr key={m.id}><Td>{new Date(m.created_at).toLocaleString("en-NG")}</Td><Td>{(m.products as unknown as { name: string } | null)?.name}</Td><Td className={m.delta > 0 ? "text-emerald-600" : "text-flame"}>{m.delta > 0 ? "+" : ""}{m.delta}</Td><Td>{m.reason}</Td><Td>{m.reference ?? m.note}</Td></tr>)}
      </Table>
    </>
  );
}
