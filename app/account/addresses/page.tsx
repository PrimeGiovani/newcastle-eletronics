import { createClient, getUser } from "@/lib/supabase/server";
import { STATES } from "@/lib/nigeria";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/misc";
import { deleteAddress, saveAddress, setDefaultAddress } from "../actions";

export default async function AddressesPage() {
  const user = await getUser();
  const { data } = await (await createClient()).from("addresses").select("*").eq("user_id", user!.id).order("is_default", { ascending: false });
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Address book</h1>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {data?.map((a) => (
          <li key={a.id} className="rounded-[28px] bg-white shadow-card dark:bg-card p-5 text-sm">
            <p className="flex items-center gap-2 font-semibold">{a.label}{a.is_default && <Badge variant="new">Default</Badge>}</p>
            <p className="mt-2">{a.full_name} · {a.phone}<br />{a.line1} {a.line2}<br />{a.city}, {a.lga}, {a.state}</p>
            <div className="mt-3 flex gap-2">
              {!a.is_default && <form action={setDefaultAddress}><input type="hidden" name="id" value={a.id} /><Button size="sm" variant="outline">Make default</Button></form>}
              <form action={deleteAddress}><input type="hidden" name="id" value={a.id} /><Button size="sm" variant="ghost">Delete</Button></form>
            </div>
          </li>
        ))}
      </ul>
      <form action={saveAddress} className="mt-8 grid gap-4 rounded-[28px] bg-white shadow-card dark:bg-card p-6 sm:grid-cols-2">
        <p className="font-semibold sm:col-span-2">Add a new address</p>
        {[["label", "Label (Home, Office)"], ["fullName", "Full name"], ["phone", "Phone"], ["line1", "Street address"], ["line2", "Apartment / estate"], ["landmark", "Landmark"], ["city", "City"], ["lga", "LGA"]].map(([n, l]) => (
          <div key={n}><Label htmlFor={n}>{l}</Label><Input id={n} name={n} required={["fullName", "phone", "line1", "city", "lga"].includes(n)} /></div>
        ))}
        <div><Label htmlFor="state">State</Label><Select id="state" name="state" defaultValue="Lagos">{STATES.map((s) => <option key={s.name}>{s.name}</option>)}</Select></div>
        <Button type="submit" className="sm:col-span-2">Save address</Button>
      </form>
    </div>
  );
}
