import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { deleteProduct, deleteProductImage, saveProduct } from "../../actions";
import { PageTitle } from "../../ui";

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params; const { saved } = await searchParams;
  const sb = await createClient();
  const isNew = id === "new";
  const [{ data: p }, { data: cats }, { data: brands }, { data: images }] = await Promise.all([
    isNew ? Promise.resolve({ data: null }) : sb.from("products").select("*").eq("id", id).single(),
    sb.from("category_tree").select("id, name, parent_slug").order("sort_order"),
    sb.from("brands").select("id, name").order("name"),
    isNew ? Promise.resolve({ data: [] as { id: string; url: string }[] }) : sb.from("product_images").select("id, url").eq("product_id", id).order("sort_order"),
  ]);
  if (!isNew && !p) notFound();
  const specs = p ? Object.entries(p.specs as Record<string, string>).map(([k, v]) => `${k}: ${v}`).join("\n") : "";
  const flash = p?.flash_deal_ends_at ? new Date(p.flash_deal_ends_at).toISOString().slice(0, 16) : "";

  return (
    <>
      <PageTitle>{isNew ? "Add product" : `Edit: ${p!.name}`}</PageTitle>
      {saved && <p role="status" className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/40">Product saved.</p>}
      <form action={saveProduct} className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {!isNew && <input type="hidden" name="id" value={p!.id} />}
        <div className="space-y-5 rounded-3xl border p-6">
          <div><Label htmlFor="name">Product name *</Label><Input id="name" name="name" required defaultValue={p?.name} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="slug">URL slug</Label><Input id="slug" name="slug" defaultValue={p?.slug} placeholder="auto-generated from name" /></div>
            <div><Label htmlFor="sku">SKU *</Label><Input id="sku" name="sku" required defaultValue={p?.sku} /></div>
            <div><Label htmlFor="category_id">Category *</Label><Select id="category_id" name="category_id" required defaultValue={p?.category_id}>{cats?.map((c) => <option key={c.id} value={c.id}>{c.parent_slug ? "— " : ""}{c.name}</option>)}</Select></div>
            <div><Label htmlFor="brand_id">Brand</Label><Select id="brand_id" name="brand_id" defaultValue={p?.brand_id ?? ""}><option value="">—</option>{brands?.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</Select></div>
            <div><Label htmlFor="price">Price (₦) *</Label><Input id="price" name="price" type="number" min={0} required defaultValue={p?.price} /></div>
            <div><Label htmlFor="compare_at_price">Compare-at price (₦) – shows as discount</Label><Input id="compare_at_price" name="compare_at_price" type="number" min={0} defaultValue={p?.compare_at_price ?? ""} /></div>
            <div><Label htmlFor="cost_price">Cost price (₦) – internal</Label><Input id="cost_price" name="cost_price" type="number" min={0} defaultValue={p?.cost_price ?? ""} /></div>
            {isNew && <div><Label htmlFor="initial_stock">Initial stock</Label><Input id="initial_stock" name="initial_stock" type="number" min={0} defaultValue={0} /></div>}
          </div>
          <div><Label htmlFor="short_description">Short description</Label><Input id="short_description" name="short_description" maxLength={300} defaultValue={p?.short_description ?? ""} /></div>
          <div><Label htmlFor="description">Full description</Label><Textarea id="description" name="description" rows={6} defaultValue={p?.description ?? ""} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="highlights">Highlights (one per line)</Label><Textarea id="highlights" name="highlights" rows={5} defaultValue={p?.highlights?.join("\n")} /></div>
            <div><Label htmlFor="specs">Specifications (Key: Value per line)</Label><Textarea id="specs" name="specs" rows={5} defaultValue={specs} placeholder={"Cooling capacity: 12,000 BTU\nRefrigerant: R32"} /></div>
          </div>
          <div><Label htmlFor="warranty">Warranty</Label><Input id="warranty" name="warranty" defaultValue={p?.warranty ?? ""} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="meta_title">SEO title (≤70)</Label><Input id="meta_title" name="meta_title" maxLength={70} defaultValue={p?.meta_title ?? ""} /></div>
            <div><Label htmlFor="meta_description">SEO description (≤160)</Label><Input id="meta_description" name="meta_description" maxLength={160} defaultValue={p?.meta_description ?? ""} /></div>
          </div>
        </div>
        <div className="space-y-5">
          <div className="space-y-4 rounded-3xl border p-6">
            <div><Label htmlFor="status">Status</Label><Select id="status" name="status" defaultValue={p?.status ?? "draft"}><option value="draft">Draft</option><option value="active">Active (visible)</option><option value="archived">Archived</option></Select></div>
            {[["is_featured", "Featured on homepage"], ["is_best_seller", "Best seller"], ["is_new", "New arrival"], ["coming_soon", "Coming soon (Contact us instead of Add to cart)"], ["price_on_request", "Price on request (hide price)"], ["installable", "Show “installation available” note"]].map(([n, l]) => (
              <label key={n} className="flex items-center gap-2 text-sm"><input type="checkbox" name={n} defaultChecked={p?.[n]} className="h-4 w-4 accent-electric" />{l}</label>
            ))}
            <div><Label htmlFor="flash">Flash deal ends at</Label><Input id="flash" name="flash_deal_ends_at" type="datetime-local" defaultValue={flash} /></div>
          </div>
          <div className="rounded-3xl border p-6">
            <Label htmlFor="images">Upload images (JPG/PNG/WebP, ≤5MB)</Label>
            <Input id="images" name="images" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="pt-2.5" />
            <p className="mt-2 text-xs text-muted-foreground">Use square images ≥1200px on a clean background for a premium look.</p>
          </div>
          <Button type="submit" size="lg" className="w-full">{isNew ? "Create product" : "Save changes"}</Button>
        </div>
      </form>
      {!isNew && (
        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="rounded-3xl border p-6">
            <p className="font-semibold">Images</p>
            <ul className="mt-4 flex flex-wrap gap-3">
              {images?.map((im) => (
                <li key={im.id} className="relative">
                  <Image src={im.url} alt="" width={112} height={112} className="h-28 w-28 rounded-2xl object-cover" />
                  <form action={deleteProductImage} className="absolute right-1 top-1"><input type="hidden" name="imageId" value={im.id} /><input type="hidden" name="productId" value={id} /><button className="rounded-full bg-background/90 px-2 text-xs font-semibold text-destructive" aria-label="Delete image">✕</button></form>
                </li>
              ))}
            </ul>
          </div>
          <form action={deleteProduct} className="h-fit rounded-3xl border border-destructive/40 p-6">
            <input type="hidden" name="id" value={id} />
            <p className="font-semibold text-destructive">Danger zone</p>
            <p className="mt-1 text-xs text-muted-foreground">Products with orders are archived instead of deleted. Admin only.</p>
            <Button variant="destructive" size="sm" className="mt-3">Delete product</Button>
          </form>
        </div>
      )}
    </>
  );
}
