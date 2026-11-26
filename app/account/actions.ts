"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, getUser } from "@/lib/supabase/server";
import { addressSchema } from "@/lib/validation";

/**
 * 7-day swap policy: a delivered order can be swapped within 7 days if the product is unused and in
 * good condition (no scratches, no dents, fully functioning). Exchanges only – no cash refunds.
 */
const SWAP_WINDOW_DAYS = 7;
export async function requestReturn(fd: FormData) {
  const user = await getUser(); if (!user) return;
  const p = z.object({ orderId: z.string().uuid(), reason: z.string().min(10).max(1000), confirm: z.literal("on") }).safeParse(Object.fromEntries(fd));
  if (!p.success) return;
  const sb = await createClient();
  // Enforce the 7-day window from the "delivered" event
  const { data: ev } = await sb.from("order_events").select("created_at").eq("order_id", p.data.orderId).in("status", ["delivered", "collected"]).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!ev || Date.now() - new Date(ev.created_at).getTime() > SWAP_WINDOW_DAYS * 864e5) return;
  const { error } = await sb.from("returns").insert({ order_id: p.data.orderId, reason: `[SWAP] ${p.data.reason}` }); // RLS: own + delivered only
  if (!error) revalidatePath("/account");
}

export async function saveAddress(fd: FormData) {
  const user = await getUser(); if (!user) return;
  const p = addressSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) return;
  const a = p.data;
  const sb = await createClient();
  await sb.from("addresses").insert({ user_id: user.id, full_name: a.fullName, phone: a.phone, line1: a.line1, line2: a.line2, landmark: a.landmark, city: a.city, lga: a.lga, state: a.state, label: String(fd.get("label") ?? "Home").slice(0, 30) });
  revalidatePath("/account/addresses");
}

export async function deleteAddress(fd: FormData) {
  const sb = await createClient();
  await sb.from("addresses").delete().eq("id", String(fd.get("id"))); // RLS restricts to own rows
  revalidatePath("/account/addresses");
}

export async function setDefaultAddress(fd: FormData) {
  const user = await getUser(); if (!user) return;
  const sb = await createClient();
  await sb.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  await sb.from("addresses").update({ is_default: true }).eq("id", String(fd.get("id")));
  revalidatePath("/account/addresses");
}

export async function deletePaymentMethod(fd: FormData) {
  const sb = await createClient();
  await sb.from("payment_methods").delete().eq("id", String(fd.get("id")));
  revalidatePath("/account/payment-methods");
}
