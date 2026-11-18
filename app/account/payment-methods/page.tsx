import { CreditCard } from "lucide-react";
import { createClient, getUser } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { deletePaymentMethod } from "../actions";

export default async function PaymentMethodsPage() {
  const user = await getUser();
  const { data } = await (await createClient()).from("payment_methods").select("id, brand, last4, exp_month, exp_year, bank, channel").eq("user_id", user!.id);
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Saved payment methods</h1>
      <p className="mt-2 text-sm text-muted-foreground">Cards are tokenised and stored securely by Paystack — we never see or store your full card number.</p>
      {!data?.length ? <p className="mt-6 rounded-[28px] bg-cloud dark:bg-muted p-10 text-center text-muted-foreground">Cards you pay with are saved automatically for faster checkout.</p> : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {data.map((m) => (
            <li key={m.id} className="flex items-center gap-4 rounded-[28px] bg-white shadow-card dark:bg-card p-5">
              <CreditCard className="h-8 w-8 text-electric" />
              <span className="flex-1 text-sm"><b className="block capitalize">{m.brand?.trim()} •••• {m.last4}</b>Expires {m.exp_month}/{m.exp_year} · {m.bank}</span>
              <form action={deletePaymentMethod}><input type="hidden" name="id" value={m.id} /><Button size="sm" variant="ghost">Remove</Button></form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
