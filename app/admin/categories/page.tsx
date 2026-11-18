import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { deleteCategory, saveBrand, saveCategory } from "../actions";
import { PageTitle, Table, Td } from "../ui";

export default async function Categories() {
  const sb = await createClient();
  const [{ data: cats }, { data: brands }] = await Promise.all([sb.from("category_tree").select("*").order("sort_order"), sb.from("brands").select("*").order("name")]);
  const top = cats?.filter((c) => !c.parent_slug) ?? [];
  return (
    <>
      <PageTitle>Categories & brands</PageTitle>
      <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
        <Table head={["Category", "Slug", "Parent", "Order", ""]}>
          {top.flatMap((c) => [c, ...(cats?.filter((s) => s.parent_slug === c.slug) ?? [])]).map((c) => (
            <tr key={c.id}><Td className={c.parent_slug ? "pl-10" : "font-semibold"}>{c.name}</Td><Td>{c.slug}</Td><Td>{c.parent_slug ?? "—"}</Td><Td>{c.sort_order}</Td>
              <Td><form action={deleteCategory}><input type="hidden" name="id" value={c.id} /><button className="text-xs text-destructive">Deactivate</button></form></Td></tr>
          ))}
        </Table>
        <div className="space-y-6">
          <form action={saveCategory} className="space-y-3 rounded-3xl border p-6">
            <p className="font-semibold">Add category</p>
            <div><Label htmlFor="cn">Name</Label><Input id="cn" name="name" required /></div>
            <div><Label htmlFor="cp">Parent</Label><Select id="cp" name="parent_id"><option value="">— Top level —</option>{top.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></div>
            <div><Label htmlFor="cd">Description</Label><Input id="cd" name="description" /></div>
            <div><Label htmlFor="ci">Image URL</Label><Input id="ci" name="image_url" type="url" /></div>
            <div><Label htmlFor="co">Sort order</Label><Input id="co" name="sort_order" type="number" defaultValue={0} /></div>
            <Button className="w-full">Add category</Button>
          </form>
          <form action={saveBrand} className="space-y-3 rounded-3xl border p-6">
            <p className="font-semibold">Brands ({brands?.length})</p>
            <p className="text-sm text-muted-foreground">{brands?.map((b) => b.name).join(", ")}</p>
            <div><Label htmlFor="bn">New brand</Label><Input id="bn" name="name" required /></div>
            <Button variant="secondary" className="w-full">Add brand</Button>
          </form>
        </div>
      </div>
    </>
  );
}
