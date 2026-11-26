"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check, Info, Loader2, Lock, MapPin, Store, Truck } from "lucide-react";
import { useStore } from "@/components/cart/store";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { DELIVERY_METHODS, FREE_SHIPPING_THRESHOLD, LGAS, NG_PHONE_PATTERN, STATES, normalizeNgPhone, shippingLabel, shippingQuote, type DeliveryMethod } from "@/lib/nigeria";
import { features, site } from "@/lib/config";
import { cn, formatNaira } from "@/lib/utils";
import { IN_STORE_HOLD_DAYS } from "@/lib/types";

const STEPS = ["Customer", "Delivery method", "Shipping address", "Payment", "Confirmation"] as const;
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
  const [payment, setPayment] = useState<"paystack" | "in_store">("paystack");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  // Account checkout: prefill from profile + saved addresses
  useEffect(() => {
    if (features.customerAccounts) fetch("/api/account/addresses").then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (!d) return;
      setSignedIn(true); setSaved(d.addresses ?? []);
      setCustomer((c) => ({ email: c.email || d.email || "", fullName: c.fullName || d.fullName || "", phone: c.phone || d.phone || "" }));
      if (d.addresses?.[0]) setAddr(d.addresses[0]);
    }).catch(() => {});
    const code = sessionStorage.getItem("nce:coupon");
    if (code) setCoupon({ code, discount: 0 });
  }, []);

  useEffect(() => {
    if (!coupon?.code || !subtotal) return;
    fetch("/api/coupons/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: coupon.code, subtotal }) })
      .then(async (r) => { const j = await r.json(); setCoupon(r.ok ? { code: j.code, discount: j.discount } : null); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal, coupon?.code]);

  const ship = shippingQuote(subtotal, method);
  const total = subtotal - (coupon?.discount ?? 0) + ship.fee;
  const lgas = LGAS[addr.state];

  // Abandoned-cart capture once we have an email
  const cartKey = useMemo(() => cart.map((l) => `${l.id}:${l.quantity}`).join(","), [cart]);
  useEffect(() => {
    if (!customer.email.includes("@") || !cart.length) return;
    const t = setTimeout(() => fetch("/api/cart/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: customer.email, items: cart.map((l) => ({ id: l.id, name: l.name, quantity: l.quantity, price: l.price })), subtotal }) }).catch(() => {}), 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer.email, cartKey]);

  const go = (n: number) => { setError(""); setStep(n); window.scrollTo({ top: 0, behavior: "smooth" }); };
  // Pickup orders skip the address step
  const next = (e: React.FormEvent) => { e.preventDefault(); go(step === 1 && method === "pickup" ? 3 : step + 1); };

  async function pay() {
    setError(""); setPaying(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer, deliveryMethod: method, paymentMethod: method === "pickup" ? payment : "paystack", shipping: method === "standard" ? addr : undefined,
          couponCode: coupon?.code, saveAddress: signedIn && saveAddress && !addr.id && method === "standard", notes,
          items: cart.map((l) => ({ productId: l.id, quantity: l.quantity })),
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Could not start payment");
      sessionStorage.removeItem("nce:coupon");
      window.location.href = j.inStore ? j.redirect : j.authorizationUrl; // Paystack hosted checkout (card, transfer, USSD, QR, mobile money)
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
        {STEPS.map((s, i) => {
          const skipped = i === 2 && method === "pickup";
          return (
            <li key={s} className={cn("flex shrink-0 items-center gap-2", skipped && "opacity-40")}>
              <button disabled={i >= step || i === 4 || skipped} onClick={() => go(i)} aria-current={i === step ? "step" : undefined}
                className={cn("flex items-center gap-2 rounded-full px-3 py-1.5 font-medium", i === step ? "bg-primary text-primary-foreground" : i < step ? "text-electric" : "text-muted-foreground")}>
                <span className={cn("grid h-6 w-6 place-items-center rounded-full border text-xs", i < step && !skipped && "border-electric bg-electric text-white")}>{i < step && !skipped ? <Check className="h-3.5 w-3.5" /> : i + 1}</span>{skipped ? `${s} (not needed)` : s}
              </button>
              {i < STEPS.length - 1 && <span className="h-px w-6 bg-border" aria-hidden />}
            </li>
          );
        })}
      </ol>

      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="rounded-[28px] bg-white p-5 shadow-card dark:bg-card sm:p-8">
          {step === 0 && (
            <form onSubmit={next} className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-wrap items-center justify-between gap-2 sm:col-span-2">
                <h2 className="text-xl font-semibold">Customer information</h2>
                {!signedIn && features.customerAccounts && <p className="text-sm text-muted-foreground">Have an account? <Link href="/auth/login?next=/checkout" className="font-semibold text-electric">Sign in</Link> · or continue as guest</p>}
              </div>
              <div className="sm:col-span-2"><Field label="Email address *"><Input type="email" required autoComplete="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} className="mt-1.5" /></Field></div>
              <Field label="Full name *"><Input required minLength={2} autoComplete="name" value={customer.fullName} onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })} className="mt-1.5" /></Field>
              <Field label="Phone number *" hint="We'll call to confirm delivery or pickup, e.g. 0803 123 4567"><Input type="tel" required pattern={NG_PHONE_PATTERN} inputMode="tel" autoComplete="tel" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} className="mt-1.5" /></Field>
              <Button type="submit" size="lg" className="sm:col-span-2" onClick={() => !addr.fullName && setAddr((a) => ({ ...a, fullName: customer.fullName, phone: customer.phone }))}>Continue</Button>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={next} className="space-y-4">
              <h2 className="text-xl font-semibold">How would you like to get your order?</h2>
              <fieldset className="space-y-3">
                <legend className="sr-only">Delivery method</legend>
                {(Object.keys(DELIVERY_METHODS) as DeliveryMethod[]).map((m) => {
                  const q = shippingQuote(subtotal, m); const Icon = m === "pickup" ? Store : Truck;
                  return (
                    <label key={m} className={cn("flex cursor-pointer items-start gap-4 rounded-2xl border p-4", method === m && "border-electric ring-2 ring-electric/20")}>
                      <input type="radio" name="method" checked={method === m} onChange={() => setMethod(m)} className="mt-1 h-4 w-4 accent-electric" />
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-electric" />
                      <span className="flex-1"><b className="block">{DELIVERY_METHODS[m].label}</b><span className="text-sm text-muted-foreground">{DELIVERY_METHODS[m].note}</span></span>
                      <b className="shrink-0">{shippingLabel(q, m)}</b>
                    </label>
                  );
                })}
              </fieldset>
              {method === "standard" && ship.arrangeLater && (
                <p className="flex gap-3 rounded-2xl bg-electric-50 p-4 text-sm dark:bg-electric/10">
                  <Info className="h-5 w-5 shrink-0 text-electric" />
                  <span>Your order is under {formatNaira(FREE_SHIPPING_THRESHOLD)}, so shipping isn't included. After payment, Newcastle will contact you on {customer.phone || "your phone"} to arrange delivery and confirm any shipping cost. Spend {formatNaira(FREE_SHIPPING_THRESHOLD - subtotal)} more for free delivery, or choose free pickup.</span>
                </p>
              )}
              <Field label="Order notes (optional)"><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} placeholder="Preferred delivery/pickup time, gate code…" className="mt-1.5" /></Field>
              <Button type="submit" size="lg" className="w-full">{method === "pickup" ? "Continue to payment" : "Continue to shipping address"}</Button>
            </form>
          )}

          {step === 2 && (
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
              <Button type="submit" size="lg" className="sm:col-span-2">Continue to payment</Button>
            </form>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold">Review & pay</h2>
              <dl className="grid gap-4 rounded-2xl bg-cloud p-5 text-sm dark:bg-muted sm:grid-cols-2">
                <div><dt className="text-muted-foreground">Contact</dt><dd className="font-medium">{customer.fullName}<br />{customer.email}<br />{normalizeNgPhone(customer.phone) ?? customer.phone}</dd></div>
                {method === "pickup"
                  ? <div><dt className="text-muted-foreground">Pickup</dt><dd className="font-medium">Newcastle showroom<br />{site.addressLine}</dd></div>
                  : <div><dt className="text-muted-foreground">Ship to</dt><dd className="font-medium">{addr.fullName}, {addr.line1}{addr.line2 && `, ${addr.line2}`}<br />{addr.city}, {addr.lga}, {addr.state}</dd></div>}
                <div className="sm:col-span-2"><dt className="text-muted-foreground">Shipping</dt><dd className="font-medium">{method === "pickup" ? "Free showroom pickup – we'll call when it's ready" : ship.free ? "Free delivery" : "To be arranged – Newcastle will contact you after payment"}</dd></div>
              </dl>
              <fieldset className="space-y-3">
                <legend className="mb-2 font-semibold">How would you like to pay?</legend>
                <label className={cn("flex cursor-pointer items-start gap-4 rounded-2xl border p-4", (payment === "paystack" || method !== "pickup") && "border-electric ring-2 ring-electric/20")}>
                  <input type="radio" name="payment" checked={payment === "paystack" || method !== "pickup"} onChange={() => setPayment("paystack")} className="mt-1 h-4 w-4 accent-electric" />
                  <span className="flex-1">
                    <b className="flex items-center gap-2"><Lock className="h-4 w-4 text-emerald-600" />Pay now with Paystack</b>
                    <span className="mt-1 block text-sm text-muted-foreground">You'll be redirected to Paystack to pay securely with:</span>
                    <span className="mt-2 flex flex-wrap gap-2 text-xs font-medium">{["Debit/Credit card", "Bank transfer", "USSD", "Mobile money", "QR", "Bank account"].map((c) => <span key={c} className="rounded-full bg-muted px-3 py-1">{c}</span>)}</span>
                  </span>
                </label>
                <label className={cn("flex items-start gap-4 rounded-2xl border p-4", method === "pickup" ? "cursor-pointer" : "opacity-60", method === "pickup" && payment === "in_store" && "border-electric ring-2 ring-electric/20")}>
                  <input type="radio" name="payment" disabled={method !== "pickup"} checked={method === "pickup" && payment === "in_store"} onChange={() => setPayment("in_store")} className="mt-1 h-4 w-4 accent-electric" />
                  <span className="flex-1">
                    <b className="flex items-center gap-2"><Store className="h-4 w-4 text-electric" />Pay at our showroom</b>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {method === "pickup"
                        ? `We'll reserve your items for ${IN_STORE_HOLD_DAYS} days. Pay by cash, POS or transfer when you collect at ${site.addressLine}.`
                        : <>Only available with showroom pickup. <button type="button" onClick={() => { setMethod("pickup"); setPayment("in_store"); }} className="font-medium text-electric underline">Switch to pickup</button></>}
                    </span>
                  </span>
                </label>
              </fieldset>
              {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-destructive dark:bg-red-950/30">{error}</p>}
              <Button size="lg" variant="accent" className="w-full" onClick={pay} disabled={paying}>{paying ? <Loader2 className="animate-spin" /> : method === "pickup" && payment === "in_store" ? <Store /> : <Lock />}{method === "pickup" && payment === "in_store" ? `Reserve order – pay ${formatNaira(total)} at the showroom` : `Pay ${formatNaira(total)}`}</Button>
              <p className="text-center text-xs text-muted-foreground">By placing your order you agree to our terms and our <Link href="/about#policies" className="underline">7-day swap policy</Link>. Need installation? Contact us after purchase – our trusted installers charge separately.</p>
            </div>
          )}
        </div>

        <aside className="h-fit rounded-[28px] bg-white p-6 shadow-card dark:bg-card lg:sticky lg:top-36" aria-label="Order summary">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto">
            {cart.map((l) => (
              <li key={l.id} className="flex gap-3 text-sm">
                <span className="relative"><Image src={l.image} alt="" width={56} height={56} className="h-14 w-14 rounded-xl object-cover" /><span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-charcoal text-[10px] font-semibold text-white">{l.quantity}</span></span>
                <span className="line-clamp-2 flex-1">{l.name}</span><b>{formatNaira(l.price * l.quantity)}</b>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatNaira(subtotal)}</dd></div>
            {coupon && coupon.discount > 0 && <div className="flex justify-between text-emerald-600"><dt>Coupon {coupon.code}</dt><dd>-{formatNaira(coupon.discount)}</dd></div>}
            <div className="flex justify-between"><dt>Shipping</dt><dd>{shippingLabel(ship, method)}</dd></div>
            <div className="flex justify-between border-t pt-3 text-base font-semibold"><dt>{method === "pickup" && payment === "in_store" ? "Total to pay at showroom" : "Total to pay now"}</dt><dd>{formatNaira(total)}</dd></div>
          </dl>
          {method === "standard" && ship.arrangeLater && <p className="mt-3 text-xs text-muted-foreground">Shipping for orders under {formatNaira(FREE_SHIPPING_THRESHOLD)} is arranged with Newcastle after payment.</p>}
          <p className="mt-3 text-xs text-muted-foreground">Final prices and stock are verified on our server before payment.</p>
        </aside>
      </div>
    </section>
  );
}
