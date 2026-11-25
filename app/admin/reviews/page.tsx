import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/misc";
import { Rating } from "@/components/product/rating";
import { addReview, deleteReview, setReviewStatus } from "../actions";
import { PageTitle, Table, Td } from "../ui";

const SOURCE: Record<string, string> = { website: "Website", staff: "Added by staff", imported: "Imported (reviews.csv)" };

export default async function AdminReviews({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const sb = await createClient();
  let q = sb.from("reviews").select("id, author_name, rating, title, body, status, source, verified_purchase, created_at, products(name, slug)").order("created_at", { ascending: false }).limit(300);
  if (status) q = q.eq("status", status);
  const [{ data: reviews }, { data: products }] = await Promise.all([q, sb.from("products").select("id, name").eq("status", "active").order("sort_order")]);

  return (
    <>
      <PageTitle>Reviews</PageTitle>
      <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <div>
          <p className="mb-3 flex gap-3 text-sm">{[["", "All"], ["approved", "Published"], ["pending", "Pending"], ["rejected", "Hidden"]].map(([v, l]) => <Link key={v} href={v ? `?status=${v}` : "?"} className={(status ?? "") === v ? "font-semibold" : "text-electric"}>{l}</Link>)}</p>
          <Table head={["Review", "Product", "Source", "Status", ""]}>
            {!reviews?.length && <tr><Td className="text-muted-foreground">No reviews yet.</Td></tr>}
            {reviews?.map((r) => {
              const prod = r.products as unknown as { name: string; slug: string } | null;
              return (
                <tr key={r.id} className="align-top">
                  <Td className="max-w-md"><Rating value={r.rating} /><b className="mt-1 block">{r.title}</b><span className="line-clamp-3 text-muted-foreground">{r.body}</span><span className="mt-1 block text-xs">{r.author_name} · {new Date(r.created_at).toLocaleDateString("en-NG")}{r.verified_purchase && " · ✓ Verified purchase"}</span></Td>
                  <Td>{prod && <Link href={`/product/${prod.slug}#reviews`} className="text-electric hover:underline">{prod.name.replace(/^Newcastle /, "")}</Link>}</Td>
                  <Td>{SOURCE[r.source] ?? r.source}</Td>
                  <Td><Badge variant={r.status === "approved" ? "success" : r.status === "pending" ? "warning" : "secondary"}>{r.status === "approved" ? "Published" : r.status === "rejected" ? "Hidden" : "Pending"}</Badge></Td>
                  <Td>
                    <div className="flex flex-col gap-1">
                      {r.status !== "approved" && <form action={setReviewStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="approved" /><button className="text-xs text-electric">Publish</button></form>}
                      {r.status !== "rejected" && <form action={setReviewStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="rejected" /><button className="text-xs">Hide</button></form>}
                      <form action={deleteReview}><input type="hidden" name="id" value={r.id} /><button className="text-xs text-destructive">Delete</button></form>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </Table>
        </div>
        <form action={addReview} className="h-fit space-y-3 rounded-3xl border p-6">
          <p className="font-semibold">Add a customer review</p>
          <p className="text-xs text-muted-foreground">For genuine reviews customers sent you by WhatsApp, phone, email or in the showroom. Use the customer's name as they'd like it shown (e.g. “Adaeze N.”).</p>
          <div><Label htmlFor="productId">Product</Label><Select id="productId" name="productId" required>{products?.map((p) => <option key={p.id} value={p.id}>{p.name.replace(/^Newcastle /, "")}</option>)}</Select></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label htmlFor="author">Customer name</Label><Input id="author" name="author" required /></div>
            <div><Label htmlFor="rating">Stars</Label><Select id="rating" name="rating" defaultValue="5">{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)}</option>)}</Select></div>
          </div>
          <div><Label htmlFor="title">Title (optional)</Label><Input id="title" name="title" maxLength={120} /></div>
          <div><Label htmlFor="body">Review</Label><Textarea id="body" name="body" required minLength={5} maxLength={2000} /></div>
          <div><Label htmlFor="date">Date received</Label><Input id="date" name="date" type="date" /></div>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="verified" className="mt-1 accent-electric" />Verified purchase – I've confirmed this customer bought the product from Newcastle</label>
          <Button className="w-full">Publish review</Button>
        </form>
      </div>
    </>
  );
}
