import { NextResponse } from "next/server";
import { z } from "zod";

const Quote = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^[+0-9 ()-]{7,20}$/, "Please enter a valid phone number"),
  email: z.union([z.literal(""), z.string().trim().email("Please enter a valid email")]).optional(),
  product: z.string().trim().min(1, "Please select a product").max(120),
  message: z.string().trim().max(2000).optional(),
  company_website: z.string().max(0).optional(), // honeypot must be empty
});

// Simple in-memory rate limit (per instance). Use Upstash/Redis in production for multi-region.
const hits = new Map<string, { n: number; t: number }>();
function limited(ip: string) {
  const now = Date.now(), h = hits.get(ip);
  if (!h || now - h.t > 60_000) { hits.set(ip, { n: 1, t: now }); return false; }
  return ++h.n > 5;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (limited(ip)) return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });

  const parsed = Quote.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  if (parsed.data.company_website) return NextResponse.json({ ok: true }); // silently drop bots

  const { company_website, ...lead } = parsed.data;
  // Optional DB: see README "Enable the database" -> await prisma.lead.create({ data: { ...lead } })
  if (process.env.QUOTE_WEBHOOK_URL) {
    await fetch(process.env.QUOTE_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...lead, at: new Date().toISOString() }) }).catch(() => null);
  } else {
    console.log("[quote]", lead);
  }
  return NextResponse.json({ ok: true });
}
