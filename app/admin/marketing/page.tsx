import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/misc";
import { saveCoupon, toggleCoupon, updateLeadStatus } from "../actions";
import { PageTitle, Stat, Table, Td } from "../ui";

export default async function Marketing() {
  const sb = await createClient();
  const hourAgo = new Date(Date.now() - 36e5).toISOString();
  const [{ data: coupons }, { data: carts }, { count: subs }, { data: leads }, { data: solar }] = await Promise.all([
    sb.from("coupons").select("*").order("created_at", { ascending: false }),
    sb.from("carts").select("*").eq("status", "open").lt("updated_at", hourAgo).order("updated_at", { ascending: false }).limit(50),
    sb.from("newsletter_subscribers").select("email", { count: "exact", head: true }).is("unsubscribed_at", null),
    sb.from("leads").select("*").order("created_at", { ascending: false }).limit(50),
    sb.from("solar_consultations").select("*").order("created_at", { ascending: false }).limit(30),
  ]);
  const abandonedValue = (carts ?? []).reduce((s, c) => s + Number(c.subtotal), 0);
  const leadStatuses = ["new", "contacted", "quoted", "won", "lost"];
  return (
    <>
      <PageTitle>Marketing</PageTitle>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Newsletter subscribers" value={String(subs ?? 0)} sub="Export via Supabase → newsletter_subscribers" />
        <Stat label="Abandoned carts (>1h)" value={String(carts?.length ?? 0)} sub={`${formatNaira(abandonedValue)} recoverable`} />
        <Stat label="Active coupons" value={String(coupons?.filter((c) => c.active).length ?? 0)} />
      </div>

      <section className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div>
          <h2 className="mb-3 font-semibold">Discount codes & coupons</h2>
          <Table head={["Code", "Discount", "Min order", "Used", "Expires", ""]}>
            {coupons?.map((c) => (
              <tr key={c.id}><Td className="font-mono font-semibold">{c.code}</Td><Td>{c.type === "percent" ? `${c.value}%` : formatNaira(+c.value)}{c.max_discount && ` (max ${formatNaira(+c.max_discount)})`}</Td>
                <Td>{formatNaira(+c.min_subtotal)}</Td><Td>{c.used_count}{c.usage_limit && ` / ${c.usage_limit}`}</Td><Td>{c.expires_at ? new Date(c.expires_at).toLocaleDateString("en-NG") : "—"}</Td>
                <Td><form action={toggleCoupon}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="active" value={String(!c.active)} /><button className="text-xs">{c.active ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Disabled</Badge>}</button></form></Td></tr>
            ))}
          </Table>
          <p className="mt-2 text-xs text-muted-foreground">Flash sales: set a compare-at price and a “Flash deal ends at” date on any product. Promotions banners: <code>promotions</code> table.</p>
        </div>
        <form action={saveCoupon} className="h-fit space-y-3 rounded-3xl border p-6">
          <p className="font-semibold">New coupon</p>
          <div><Label htmlFor="code">Code</Label><Input id="code" name="code" required className="uppercase" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label htmlFor="type">Type</Label><Select id="type" name="type"><option value="percent">Percent</option><option value="fixed">Fixed ₦</option></Select></div>
            <div><Label htmlFor="value">Value</Label><Input id="value" name="value" type="number" required min={1} /></div>
            <div><Label htmlFor="min">Min order ₦</Label><Input id="min" name="min_subtotal" type="number" defaultValue={0} /></div>
            <div><Label htmlFor="max">Max discount ₦</Label><Input id="max" name="max_discount" type="number" /></div>
            <div><Label htmlFor="limit">Usage limit</Label><Input id="limit" name="usage_limit" type="number" /></div>
            <div><Label htmlFor="exp">Expires</Label><Input id="exp" name="expires_at" type="date" /></div>
          </div>
          <Button className="w-full">Create coupon</Button>
        </form>
      </section>

      <h2 className="mb-3 mt-10 font-semibold">Abandoned carts – recover via email / WhatsApp</h2>
      <Table head={["Email", "Items", "Value", "Last active", "Recover"]}>
        {carts?.map((c) => (
          <tr key={c.id}><Td>{c.email}</Td><Td>{(c.items as { name: string; quantity: number }[]).map((i) => `${i.quantity}× ${i.name}`).join(", ")}</Td><Td>{formatNaira(+c.subtotal)}</Td><Td>{new Date(c.updated_at).toLocaleString("en-NG")}</Td>
            <Td><a className="text-electric" href={`mailto:${c.email}?subject=${encodeURIComponent("You left something in your cart 🛒")}&body=${encodeURIComponent("Complete your order with 5% off using code WELCOME5: https://www.newcastleelectronics.com/cart")}`}>Email</a></Td></tr>
        ))}
      </Table>

      <h2 className="mb-3 mt-10 font-semibold">Quote requests, installations & contact leads</h2>
      <Table head={["Date", "Type", "Name", "Phone", "State", "Product / message", "Status"]}>
        {leads?.map((l) => (
          <tr key={l.id}><Td>{new Date(l.created_at).toLocaleDateString("en-NG")}</Td><Td><Badge variant="secondary">{l.type}</Badge></Td><Td>{l.name}</Td><Td><a href={`https://wa.me/${l.phone.replace(/\D/g, "")}`} className="text-electric">{l.phone}</a></Td><Td>{l.state}</Td>
            <Td className="max-w-xs"><b>{l.product}</b> {l.preferred_date && `· ${l.preferred_date}`}<span className="line-clamp-2 block text-xs text-muted-foreground">{l.message}</span></Td>
            <Td><form action={updateLeadStatus} className="flex gap-1"><input type="hidden" name="id" value={l.id} /><select name="status" defaultValue={l.status} className="rounded border bg-background text-xs">{leadStatuses.map((s) => <option key={s}>{s}</option>)}</select><button className="text-xs text-electric">✓</button></form></Td></tr>
        ))}
      </Table>

      <h2 className="mb-3 mt-10 font-semibold">Solar consultations</h2>
      <Table head={["Date", "Name", "Phone", "State", "Sizing", "Status"]}>
        {solar?.map((s) => {
          const c = s.calculator as { dailyKwh?: number; inverterKva?: number; batteryKwh?: number; panels?: number } | null;
          return (
            <tr key={s.id}><Td>{new Date(s.created_at).toLocaleDateString("en-NG")}</Td><Td>{s.name}</Td><Td>{s.phone}</Td><Td>{s.state}</Td>
              <Td className="text-xs">{c ? `${c.dailyKwh}kWh/day · ${c.inverterKva}kVA · ${c.batteryKwh}kWh · ${c.panels} panels` : s.message}</Td>
              <Td><form action={updateLeadStatus} className="flex gap-1"><input type="hidden" name="table" value="solar_consultations" /><input type="hidden" name="id" value={s.id} /><select name="status" defaultValue={s.status} className="rounded border bg-background text-xs">{["new", "site_visit", "proposal_sent", "won", "lost"].map((x) => <option key={x}>{x}</option>)}</select><button className="text-xs text-electric">✓</button></form></Td></tr>
          );
        })}
      </Table>
    </>
  );
}
