import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUSES } from "@/lib/types";
import { formatNaira } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { StatusBadge } from "../../../account/status-badge";
import { updateOrderStatus, updateReturn } from "../../actions";
import { PageTitle, Table, Td } from "../../ui";

/** Fulfilment workflow: paid → processing (picked/packed) → shipped (tracking) → delivered. */
export default async function AdminOrder({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const { data: o } = await sb.from("orders").select("*, order_items(*), order_events(*), payments(*), returns(*)").eq("id", id).single();
  if (!o) notFound();
  const a = o.shipping_address as Record<string, string>;
  type Ev = { id: number; status: string; note: string; created_at: string };
  const NEXT: Record<string, string> = { paid: "processing", processing: "shipped", shipped: "delivered", return_requested: "returned" };
  return (
    <>
      <PageTitle action={<StatusBadge status={o.status} />}>Order {o.reference}</PageTitle>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Table head={["Item", "SKU", "Qty", "Unit", "Total"]}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {o.order_items.map((i: any) => <tr key={i.id}><Td>{i.name}</Td><Td>{i.sku}</Td><Td>{i.quantity}</Td><Td>{formatNaira(+i.unit_price)}</Td><Td>{formatNaira(i.quantity * i.unit_price)}</Td></tr>)}
          </Table>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border p-5 text-sm"><p className="font-semibold">Customer</p>{o.customer_name}<br />{o.email}<br />{o.phone}<br /><span className="text-muted-foreground">{o.user_id ? "Registered" : "Guest"} checkout</span></div>
            <div className="rounded-3xl border p-5 text-sm"><p className="font-semibold">Ship to ({o.delivery_method}{o.installation ? " + installation" : ""})</p>{a.fullName} · {a.phone}<br />{a.line1} {a.line2}<br />{a.landmark && <>Landmark: {a.landmark}<br /></>}{a.city}, {a.lga}, {a.state}</div>
          </div>
          {o.notes && <p className="rounded-2xl bg-muted p-4 text-sm"><b>Customer note:</b> {o.notes}</p>}
          <dl className="grid grid-cols-2 gap-2 rounded-3xl border p-5 text-sm sm:grid-cols-5">
            {[["Subtotal", o.subtotal], ["Discount", o.discount], ["Delivery", o.shipping_fee], ["Installation", o.installation_fee], ["Total", o.total]].map(([k, v]) => <div key={k as string}><dt className="text-muted-foreground">{k as string}</dt><dd className="font-semibold">{formatNaira(Number(v))}</dd></div>)}
          </dl>
          <div>
            <h2 className="mb-3 font-semibold">Payments</h2>
            <Table head={["Reference", "Status", "Channel", "Amount", "Paid at"]}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {o.payments.map((p: any) => <tr key={p.id}><Td>{p.reference}</Td><Td>{p.status}</Td><Td>{p.channel}</Td><Td>{formatNaira(+p.amount)}</Td><Td>{p.paid_at && new Date(p.paid_at).toLocaleString("en-NG")}</Td></tr>)}
            </Table>
          </div>
          {o.returns.length > 0 && (
            <div>
              <h2 className="mb-3 font-semibold">Returns</h2>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {o.returns.map((r: any) => (
                <form key={r.id} action={updateReturn} className="flex flex-wrap items-end gap-3 rounded-2xl border p-4 text-sm">
                  <input type="hidden" name="id" value={r.id} /><input type="hidden" name="orderId" value={o.id} />
                  <p className="w-full"><b>Reason:</b> {r.reason}</p>
                  <Select name="status" defaultValue={r.status} className="h-9 w-40">{["requested", "approved", "rejected", "received", "refunded"].map((s) => <option key={s}>{s}</option>)}</Select>
                  <Input name="refund_amount" type="number" placeholder="Refund ₦" defaultValue={r.refund_amount ?? ""} className="h-9 w-32" />
                  <Button size="sm">Update</Button>
                </form>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-6">
          <form action={updateOrderStatus} className="space-y-3 rounded-3xl border p-5">
            <input type="hidden" name="orderId" value={o.id} />
            <p className="font-semibold">Update status</p>
            <div><Label htmlFor="st">Status</Label><Select id="st" name="status" defaultValue={NEXT[o.status] ?? o.status}>{ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}</Select></div>
            <div><Label htmlFor="carrier">Carrier</Label><Input id="carrier" name="carrier" defaultValue={o.carrier ?? ""} placeholder="GIG Logistics, Kwik, In-house…" /></div>
            <div><Label htmlFor="tn">Tracking number</Label><Input id="tn" name="tracking_number" defaultValue={o.tracking_number ?? ""} /></div>
            <div><Label htmlFor="note">Note (visible to customer)</Label><Input id="note" name="note" /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="notify" defaultChecked className="accent-electric" />Email customer</label>
            <Button className="w-full">Save</Button>
            <p className="text-xs text-muted-foreground">Refunds are issued from the Paystack dashboard; the webhook marks the order refunded automatically.</p>
          </form>
          <div className="rounded-3xl border p-5">
            <p className="font-semibold">Timeline</p>
            <ol className="mt-3 space-y-3 border-l-2 pl-4 text-sm">
              {(o.order_events as Ev[]).sort((x, y) => x.created_at.localeCompare(y.created_at)).map((e) => <li key={e.id}><b>{e.status}</b><span className="block text-muted-foreground">{e.note} · {new Date(e.created_at).toLocaleString("en-NG")}</span></li>)}
            </ol>
          </div>
          <a href={`/api/orders/${o.reference}/invoice`} className="block text-center text-sm font-semibold text-electric">View invoice →</a>
        </div>
      </div>
    </>
  );
}
