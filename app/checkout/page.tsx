"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Lock, MapPin } from "lucide-react";
import { useStore } from "@/components/cart/store";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { DELIVERY_METHODS, LGAS, NG_PHONE_PATTERN, STATES, estimateDateRange, normalizeNgPhone, shippingQuote, type DeliveryMethod } from "@/lib/nigeria";
import { INSTALLATION_FEE } from "@/lib/pricing";
import { cn, formatNaira } from "@/lib/utils";

const STEPS = ["Customer", "Shipping", "Delivery", "Payment", "Confirmation"] as const;
type Addr = { id?: string; fullName: string; phone: string; line1: string; line2: string; landmark: string; city: string; lga: string; state: string };
const emptyAddr: Addr = { fullName: "", phone: "", line1: "", line2: "", landmark: "", city: "", lga: "", state: "Lagos" };

export default function CheckoutPage() {
  const { cart, subtotal, ready } = useStore();
  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState({ email: "", fullName: "", phone: "" });
  const [addr, setAddr] = useState<Addr>(emptyAddr);
  const [saved, setSaved] = useState<Addr[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [method, setMethod] = useState<DeliveryMethod>("standard");
  const [installation, setInstallation] = useState(false);
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  // Account checkout: prefill from profile + saved addresses
  useEffect(() => {
    fetch("/api/account/addresses").then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (!d) return;
      setSignedIn(true); setSaved(d.addresses ?? []);
      setCustomer((c) => ({ email: c.email || d.email || "", fullName: c.fullName || d.fullName || "", phone: c.phone || d.phone || "" }));
      if (d.addresses?.[0]) setAddr(d.addresses[0]);
    }).catch(() => {});
    const code = sessionStorage.getItem("nce:coupon");
    if (code) setCoupon({ code, discount: 0 });
  }, []);

  // Re-validate coupon whenever subtotal changes
  useEffect(() => {
    if (!coupon?.code || !subtotal) return;
    fetch("/api/coupons/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: coupon.code, subtotal }) })
      .then(async (r) => { const j = await r.json(); setCoupon(r.ok ? { code: j.code, discount: j.discount } : null); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal, coupon?.code]);

  const installUnits = cart.filter((l) => l.installable).reduce((s, l) => s + l.quantity, 0);
  const ship = shippingQuote(addr.state, subtotal - (coupon?.discount ?? 0), method);
  const installFee = installation ? installUnits * INSTALLATION_FEE : 0;
  const total = subtotal - (coupon?.discount ?? 0) + ship.fee + installFee;
  const lgas = LGAS[addr.state];

  // Abandoned-cart capture once we have an email
  const cartKey = useMemo(() => cart.map((l) => `${l.id}:${l.quantity}`).join(","), [cart]);
  useEffect(() => {
    if (!customer.email.includes("@") || !cart.length) return;
    const t = setTimeout(() => fetch("/api/cart/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: customer.email, items: cart.map((l) => ({ id: l.id, name: l.name, quantity: l.quantity, price: l.price })), subtotal }) }).catch(() => {}), 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer.email, cartKey]);

  const next = (e: React.FormEvent) => { e.preventDefault(); setError(""); setStep((s) => s + 1); window.scrollTo({ top: 0, behavior: "smooth" }); };

  async function pay() {
    setError(""); setPaying(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer, shipping: addr, deliveryMethod: method, installation, couponCode: coupon?.code, saveAddress: signedIn && saveAddress && !addr.id, notes,
          items: cart.map((l) => ({ productId: l.id, quantity: l.quantity })),
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Could not start payment");
      sessionStorage.removeItem("nce:coupon");
      window.location.href = j.authorizationUrl; // Paystack hosted checkout (card, transfer, USSD, QR, mobile money)
    } catch (e) { setError((e as Error).message); setPaying(false); }
  }

  if (!ready) return <div className="container py-20" aria-busy="true" />;
  if (!cart.length) return (
    <section className="container py-20 text-center"><h1 className="text-2xl font-semibold">Your cart is empty</h1><Link href="/shop" className={buttonVariants({ className: "mt-6" })}>Continue shopping</Link></section>
  );

  return (
    <section className="container py-8">
      <h1 className="sr-only">Checkout</h1>
      <ol className="mb-8 flex items-center gap-2 overflow-x-auto text-sm" aria-label="Checkout progress">
        {STEPS.map((s, i) => (
          <li key={s} className="flex shrink-0 items-center gap-2">
            <button disabled={i >= step || i === 4} onClick={() => setStep(i)} aria-current={i === step ? "step" : undefined}
              className={cn("flex items-center gap-2 rounded-full px-3 py-1.5 font-medium", i === step ? "bg-primary text-primary-foreground" : i < step ? "text-electric" : "text-muted-foreground")}>
              <span className={cn("grid h-6 w-6 place-items-center rounded-full border text-xs", i < step && "border-electric bg-electric text-white")}>{i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}</span>{s}
            </button>
            {i < STEPS.length - 1 && <span className="h-px w-6 bg-border" aria-hidden />}
          </li>
        ))}
      </ol>

      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="rounded-[28px] bg-white shadow-card dark:bg-card p-5 sm:p-8">
          {step === 0 && (
            <form onSubmit={next} className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-wrap items-center justify-between gap-2 sm:col-span-2">
                <h2 className="text-xl font-semibold">Customer information</h2>
                {!signedIn && <p className="text-sm text-muted-foreground">Have an account? <Link href="/auth/login?next=/checkout" className="font-semibold text-electric">Sign in</Link> · or continue as guest</p>}
              </div>
              <div className="sm:col-span-2"><Field label="Email address *"><Input type="email" required autoComplete="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} className="mt-1.5" /></Field></div>
              <Field label="Full name *"><Input required minLength={2} autoComplete="name" value={customer.fullName} onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })} className="mt-1.5" /></Field>
              <Field label="Phone number *" hint="For delivery updates, e.g. 0803 123 4567"><Input type="tel" required pattern={NG_PHONE_PATTERN} inputMode="tel" autoComplete="tel" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} className="mt-1.5" /></Field>
              <Button type="submit" size="lg" className="sm:col-span-2" onClick={() => !addr.fullName && setAddr((a) => ({ ...a, fullName: customer.fullName, phone: customer.phone }))}>Continue to shipping</Button>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={next} className="grid gap-4 sm:grid-cols-2">
              <h2 className="text-xl font-semibold sm:col-span-2">Shipping address</h2>
              {saved.length > 0 && (
                <div className="grid gap-2 sm:col-span-2">
                  {saved.map((a) => (
                    <button type="button" key={a.id} onClick={() => setAddr(a)} className={cn("flex items-start gap-3 rounded-2xl border p-4 text-left text-sm", addr.id === a.id && "border-electric ring-2 ring-electric/20")}>
                      <MapPin className="mt-0.5 h-4 w-4 text-electric" /><span><b>{a.fullName}</b> · {a.phone}<br />{a.line1}, {a.city}, {a.lga}, {a.state}</span>
                    </button>
                  ))}
                  <button type="button" onClick={() => setAddr({ ...emptyAddr, fullName: customer.fullName, phone: customer.phone })} className="text-left text-sm font-semibold text-electric">+ Use a new address</button>
                </div>
              )}
              <Field label="Recipient name *"><Input required value={addr.fullName} onChange={(e) => setAddr({ ...addr, id: undefined, fullName: e.target.value })} autoComplete="shipping name" className="mt-1.5" /></Field>
              <Field label="Recipient phone *"><Input type="tel" required pattern={NG_PHONE_PATTERN} value={addr.phone} onChange={(e) => setAddr({ ...addr, id: undefined, phone: e.target.value })} autoComplete="shipping tel" className="mt-1.5" /></Field>
              <div className="sm:col-span-2"><Field label="Street address *"><Input required minLength={4} placeholder="House number and street" value={addr.line1} onChange={(e) => setAddr({ ...addr, id: undefined, line1: e.target.value })} autoComplete="shipping address-line1" className="mt-1.5" /></Field></div>
              <Field label="Apartment, estate, floor"><Input value={addr.line2} onChange={(e) => setAddr({ ...addr, id: undefined, line2: e.target.value })} autoComplete="shipping address-line2" className="mt-1.5" /></Field>
              <Field label="Nearest landmark"><Input placeholder="e.g. Opposite GTBank" value={addr.landmark} onChange={(e) => setAddr({ ...addr, id: undefined, landmark: e.target.value })} className="mt-1.5" /></Field>
              <Field label="State *">
                <Select required value={addr.state} onChange={(e) => setAddr({ ...addr, id: undefined, state: e.target.value, lga: "" })} autoComplete="shipping address-level1" className="mt-1.5">{STATES.map((s) => <option key={s.name}>{s.name}</option>)}</Select>
              </Field>
              <Field label="LGA *">
                {lgas ? (
                  <Select required value={addr.lga} onChange={(e) => setAddr({ ...addr, id: undefined, lga: e.target.value })} className="mt-1.5"><option value="">Select LGA</option>{lgas.map((l) => <option key={l}>{l}</option>)}</Select>
                ) : <Input required value={addr.lga} onChange={(e) => setAddr({ ...addr, id: undefined, lga: e.target.value })} placeholder="Local Government Area" className="mt-1.5" />}
              </Field>
              <div className="sm:col-span-2"><Field label="City / Town *"><Input required value={addr.city} onChange={(e) => setAddr({ ...addr, id: undefined, city: e.target.value })} autoComplete="shipping address-level2" className="mt-1.5" /></Field></div>
              {signedIn && !addr.id && <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="h-4 w-4 accent-electric" />Save this address to my account</label>}
              <Button type="submit" size="lg" className="sm:col-span-2">Continue to delivery</Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={next} className="space-y-4">
              <h2 className="text-xl font-semibold">Delivery method</h2>
              <fieldset className="space-y-3">
                <legend className="sr-only">Choose a delivery method</legend>
                {(Object.keys(DELIVERY_METHODS) as DeliveryMethod[]).map((m) => {
                  const q = shippingQuote(addr.state, subtotal - (coupon?.discount ?? 0), m);
                  return (
                    <label key={m} className={cn("flex cursor-pointer items-center gap-4 rounded-2xl border p-4", method === m && "border-electric ring-2 ring-electric/20")}>
                      <input type="radio" name="method" checked={method === m} onChange={() => setMethod(m)} className="h-4 w-4 accent-electric" />
                      <span className="flex-1"><b className="block">{DELIVERY_METHODS[m].label}</b><span className="text-sm text-muted-foreground">{DELIVERY_METHODS[m].note} · {m === "pickup" ? "Ready tomorrow" : `Arrives ${estimateDateRange(q.days)}`}</span></span>
                      <b>{q.fee ? formatNaira(q.fee) : "FREE"}</b>
                    </label>
                  );
                })}
              </fieldset>
              {installUnits > 0 && (
                <label className={cn("flex cursor-pointer items-center gap-4 rounded-2xl border p-4", installation && "border-electric ring-2 ring-electric/20")}>
                  <input type="checkbox" checked={installation} onChange={(e) => setInstallation(e.target.checked)} className="h-4 w-4 accent-electric" />
                  <span className="flex-1"><b className="block">Add professional installation</b><span className="text-sm text-muted-foreground">{installUnits} installable item(s) · certified technicians · 90-day workmanship warranty</span></span>
                  <b>{formatNaira(installUnits * INSTALLATION_FEE)}</b>
                </label>
              )}
              <Field label="Delivery notes (optional)"><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} placeholder="Gate code, best time to call…" className="mt-1.5" /></Field>
              <Button type="submit" size="lg" className="w-full">Continue to payment</Button>
            </form>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold">Review & pay</h2>
              <dl className="grid gap-4 rounded-2xl bg-muted/50 p-5 text-sm sm:grid-cols-2">
                <div><dt className="text-muted-foreground">Contact</dt><dd className="font-medium">{customer.fullName}<br />{customer.email}<br />{normalizeNgPhone(customer.phone) ?? customer.phone}</dd></div>
                <div><dt className="text-muted-foreground">Ship to</dt><dd className="font-medium">{addr.fullName}, {addr.line1}{addr.line2 && `, ${addr.line2}`}<br />{addr.city}, {addr.lga}, {addr.state}</dd></div>
                <div><dt className="text-muted-foreground">Delivery</dt><dd className="font-medium">{DELIVERY_METHODS[method].label}{installation && " + installation"}</dd></div>
              </dl>
              <div className="rounded-2xl border p-5">
                <p className="flex items-center gap-2 font-semibold"><Lock className="h-4 w-4 text-emerald-600" />Pay securely with Paystack</p>
                <p className="mt-1 text-sm text-muted-foreground">You'll be redirected to Paystack to pay with any of:</p>
                <ul className="mt-3 flex flex-wrap gap-2 text-xs font-medium">{["Debit/Credit card", "Bank transfer", "USSD", "Mobile money", "QR", "Bank account"].map((c) => <li key={c} className="rounded-full bg-muted px-3 py-1">{c}</li>)}</ul>
              </div>
              {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-destructive dark:bg-red-950/30">{error}</p>}
              <Button size="lg" variant="accent" className="w-full" onClick={pay} disabled={paying}>{paying ? <Loader2 className="animate-spin" /> : <Lock />}Pay {formatNaira(total)}</Button>
              <p className="text-center text-xs text-muted-foreground">By placing your order you agree to our terms and returns policy.</p>
            </div>
          )}
        </div>

        <aside className="h-fit rounded-[28px] bg-white shadow-card dark:bg-card p-6 lg:sticky lg:top-36" aria-label="Order summary">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto">
            {cart.map((l) => (
              <li key={l.id} className="flex gap-3 text-sm">
                <span className="relative"><Image src={l.image} alt="" width={56} height={56} className="h-14 w-14 rounded-xl object-cover" /><span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-charcoal text-[10px] font-semibold text-white">{l.quantity}</span></span>
                <span className="flex-1 line-clamp-2">{l.name}</span><b>{formatNaira(l.price * l.quantity)}</b>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatNaira(subtotal)}</dd></div>
            {coupon && coupon.discount > 0 && <div className="flex justify-between text-emerald-600"><dt>Coupon {coupon.code}</dt><dd>-{formatNaira(coupon.discount)}</dd></div>}
            <div className="flex justify-between"><dt>Delivery</dt><dd>{ship.fee ? formatNaira(ship.fee) : "FREE"}</dd></div>
            {installFee > 0 && <div className="flex justify-between"><dt>Installation</dt><dd>{formatNaira(installFee)}</dd></div>}
            <div className="flex justify-between border-t pt-3 text-base font-semibold"><dt>Total</dt><dd>{formatNaira(total)}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">Final prices and stock are verified on our server before payment.</p>
        </aside>
      </div>
    </section>
  );
}
