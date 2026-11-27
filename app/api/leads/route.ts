import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/validation";
import { normalizePhone } from "@/lib/nigeria";
import { assertSameOrigin, clientIp, escapeHtml, rateLimit } from "@/lib/security";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

/** Quotes, contact, installation bookings, solar consultations, support tickets and newsletter sign-ups. */
export async function POST(req: Request) {
  if (!(await assertSameOrigin(req))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!rateLimit(`lead:${clientIp(req)}`, 6)) return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });

  const parsed = leadSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid form" }, { status: 400 });
  const v = parsed.data;
  if (v.website) return NextResponse.json({ ok: true }); // honeypot – silently drop bots
  const phone = normalizePhone(v.phone) ?? v.phone;

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) { console.info("[lead – no database configured]", v.type, v.name, phone); return NextResponse.json({ ok: true }); }
  const sb = createAdminClient();
  let error;
  switch (v.type) {
    case "newsletter":
      ({ error } = await sb.from("newsletter_subscribers").upsert({ email: v.email, unsubscribed_at: null }, { onConflict: "email" }));
      break;
    case "solar_consultation":
      ({ error } = await sb.from("solar_consultations").insert({ name: v.name, email: v.email || null, phone, state: v.state, property_type: v.product, message: v.message, calculator: v.meta ?? null }));
      break;
    case "support": {
      const { data: t, error: e } = await sb.from("support_tickets").insert({ name: v.name, email: v.email || null, phone, subject: v.product ? `Order ${v.product}` : "Support request" }).select("id").single();
      error = e;
      if (t) await sb.from("ticket_messages").insert({ ticket_id: t.id, body: v.message || "(no message)" });
      break;
    }
    default:
      ({ error } = await sb.from("leads").insert({ type: v.type, name: v.name, email: v.email || null, phone, state: v.state, product: v.product, preferred_date: v.preferredDate || null, message: v.message, meta: v.meta ?? null }));
  }
  if (error) { console.error(error); return NextResponse.json({ error: "Could not submit. Please try WhatsApp instead." }, { status: 500 }); }

  if (v.type !== "newsletter" && process.env.ADMIN_NOTIFY_EMAIL)
    await sendEmail(process.env.ADMIN_NOTIFY_EMAIL, `New ${v.type.replace("_", " ")} – ${v.name}`,
      `<p><b>${escapeHtml(v.name)}</b> · ${escapeHtml(phone)} · ${escapeHtml(v.email ?? "")}</p><p>State: ${escapeHtml(v.state)}<br>Product: ${escapeHtml(v.product)}<br>Date: ${escapeHtml(v.preferredDate)}</p><p>${escapeHtml(v.message)}</p>`);
  return NextResponse.json({ ok: true });
}
