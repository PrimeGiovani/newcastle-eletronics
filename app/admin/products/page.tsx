import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/misc";
import { PageTitle, Table, Td } from "../ui";

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q, status } = await searchParams;
  const sb = await createClient();
  let query = sb.from("product_listing").select("id, name, sku, price, status, stock, images, category_name, brand_name, low_stock_threshold").order("created_at", { ascending: false }).limit(200);
  if (q) query = query.or(`name.ilike.%${q.replace(/[%,()]/g, "")}%,sku.ilike.%${q.replace(/[%,()]/g, "")}%`);
  if (status) query = query.eq("status", status);
  const { data } = await query;
  return (
    <>
      <PageTitle action={<Link href="/admin/products/new" className={buttonVariants()}><Plus />Add product</Link>}>Products</PageTitle>
      <form className="mb-4 flex gap-2"><Input name="q" defaultValue={q} placeholder="Search name or SKU" className="max-w-xs" />
        <select name="status" defaultValue={status ?? ""} className="rounded-xl border bg-background px-3 text-sm"><option value="">All statuses</option><option>active</option><option>draft</option><option>archived</option></select>
        <button className={buttonVariants({ variant: "secondary" })}>Filter</button></form>
      <Table head={["", "Product", "Category", "Price", "Stock", "Status"]}>
        {data?.map((p) => (
          <tr key={p.id} className="hover:bg-muted/40">
            <Td>{p.images?.[0] && <Image src={p.images[0]} alt="" width={40} height={40} className="h-10 w-10 rounded-lg object-cover" />}</Td>
            <Td><Link href={`/admin/products/${p.id}`} className="font-medium hover:text-electric">{p.name}</Link><span className="block text-xs text-muted-foreground">{p.sku} · {p.brand_name}</span></Td>
            <Td>{p.category_name}</Td><Td>{formatNaira(+p.price)}</Td>
            <Td className={p.stock <= p.low_stock_threshold ? "font-semibold text-flame" : ""}>{p.stock}</Td>
            <Td><Badge variant={p.status === "active" ? "success" : "secondary"}>{p.status}</Badge></Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
