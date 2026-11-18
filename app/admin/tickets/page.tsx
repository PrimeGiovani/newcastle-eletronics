import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/misc";
import { replyTicket } from "../actions";
import { PageTitle } from "../ui";

export default async function Tickets({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "open" } = await searchParams;
  const sb = await createClient();
  const { data } = await sb.from("support_tickets").select("*, ticket_messages(*)").eq("status", status).order("created_at", { ascending: false }).limit(100);
  return (
    <>
      <PageTitle>Support tickets</PageTitle>
      <p className="mb-4 flex gap-3 text-sm">{["open", "pending", "resolved", "closed"].map((s) => <a key={s} href={`?status=${s}`} className={s === status ? "font-semibold" : "text-electric"}>{s}</a>)}</p>
      <ul className="space-y-4">
        {!data?.length && <li className="rounded-3xl border border-dashed p-10 text-center text-muted-foreground">No {status} tickets.</li>}
        {data?.map((t) => (
          <li key={t.id} className="rounded-3xl border p-5">
            <div className="flex flex-wrap items-center gap-2"><b>{t.subject}</b><Badge variant="secondary">{t.priority}</Badge><span className="text-sm text-muted-foreground">{t.name} · {t.phone} · {t.email}</span></div>
            <ul className="mt-3 space-y-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {t.ticket_messages.sort((a: any, b: any) => a.created_at.localeCompare(b.created_at)).map((m: any) => (
                <li key={m.id} className={`rounded-2xl p-3 text-sm ${m.is_staff ? "ml-8 bg-electric-50 dark:bg-electric/10" : "mr-8 bg-muted"}`}>{m.body}<span className="block text-xs text-muted-foreground">{m.is_staff ? "Staff" : "Customer"} · {new Date(m.created_at).toLocaleString("en-NG")}</span></li>
              ))}
            </ul>
            <form action={replyTicket} className="mt-3 flex flex-wrap gap-2">
              <input type="hidden" name="ticketId" value={t.id} />
              <input name="body" placeholder="Internal reply / log customer contact" className="h-10 flex-1 rounded-xl border bg-background px-3 text-sm" />
              <select name="status" defaultValue="pending" className="h-10 rounded-xl border bg-background px-2 text-sm"><option>open</option><option>pending</option><option>resolved</option><option>closed</option></select>
              <Button size="sm" className="h-10">Update</Button>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
