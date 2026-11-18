import { NextResponse } from "next/server";
import { getProductsByIds } from "@/lib/catalog";

/** Public: fresh product data for compare / cart re-validation. GET /api/products?ids=a,b,c */
export async function GET(req: Request) {
  const ids = (new URL(req.url).searchParams.get("ids") ?? "").split(",").filter(Boolean).slice(0, 50);
  const items = await getProductsByIds(ids);
  return NextResponse.json({ items }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
