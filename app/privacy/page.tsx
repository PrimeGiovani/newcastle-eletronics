import { buildMetadata } from "@/lib/seo";
import { features, site } from "@/lib/config";

export const metadata = buildMetadata({ title: "Privacy Policy", description: "How Newcastle Electronics collects, uses and protects your personal data, in line with the Nigeria Data Protection Act 2023.", path: "/privacy" });

/** DRAFT – have this reviewed by a lawyer / your Data Protection Officer before relying on it. */
export default function PrivacyPage() {
  const h = "mt-10 text-xl font-semibold tracking-tight";
  const p = "mt-2 leading-relaxed text-ink-muted dark:text-white/70";
  return (
    <article className="container max-w-3xl py-16">
      <h1 className="text-4xl font-semibold tracking-tightest sm:text-5xl">Privacy Policy</h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated: November 2026</p>
      <p className={p}>Newcastle Electronics Ltd (“Newcastle”, “we”) respects your privacy. This policy explains what personal data we collect when you use this website, why, and your rights under the Nigeria Data Protection Act 2023 (NDPA).</p>

      <h2 className={h}>What we collect</h2>
      <ul className={`${p} list-disc space-y-1 pl-5`}>
        {features.customerAccounts
          ? <li><b>Account details:</b> name, email address, phone number and password (stored only in encrypted, hashed form – we can never see it). If you sign in with Google, we receive your name and email from Google.</li>
          : <li><b>Contact details:</b> the name, email address and phone number you give us at checkout or in a form. You don't need an account to shop with us.</li>}
        <li><b>Order details:</b> delivery address, items bought, order history and payment status.</li>
        <li><b>Payments:</b> handled by Paystack. We never receive or store your full card number; Paystack may give us a card brand, last 4 digits and expiry for saved cards.</li>
        <li><b>Messages and enquiries:</b> what you send through our forms, WhatsApp or email.</li>
        <li><b>Reviews</b> you choose to publish, and basic technical data (such as device type) needed to run the website securely.</li>
      </ul>

      <h2 className={h}>Why we use it</h2>
      <p className={p}>To process and deliver your orders, arrange shipping and installation, provide customer support and swaps, prevent fraud, meet legal and tax obligations, and – only if you subscribe – send you news and offers. You can unsubscribe at any time.</p>

      <h2 className={h}>Where your data is stored and how it is protected</h2>
      <p className={p}>Your data is stored in a secured database hosted by Supabase, with encryption in transit (HTTPS) and at rest, strict access controls that let each customer see only their own records, and access for staff limited to what they need. Payments are processed by Paystack (PCI-DSS Level 1). Some of our service providers may process data outside Nigeria; where they do, we rely on safeguards permitted by the NDPA.</p>

      <h2 className={h}>Who we share it with</h2>
      <p className={p}>Only with service providers that help us run the business – payment processing (Paystack), hosting (Vercel, Supabase), email delivery, delivery partners and our trusted installers (only the details needed for your job) – or where the law requires. We never sell your personal data.</p>

      <h2 className={h}>How long we keep it</h2>
      <p className={p}>{features.customerAccounts ? "Account data is kept while your account is active. " : ""}Order and payment records are kept for as long as required by Nigerian tax and accounting law. Enquiries are deleted when no longer needed.</p>

      <h2 className={h}>Your rights</h2>
      <p className={p}>You can ask to access, correct, download or delete your personal data, withdraw consent for marketing, or object to certain processing. Contact us at <a className="text-electric hover:underline" href={`mailto:${site.email}`}>{site.email}</a> or WhatsApp {site.whatsappLocal}. If you are not satisfied with our response, you may complain to the Nigeria Data Protection Commission (NDPC).</p>

      <h2 className={h}>Contact</h2>
      <p className={p}>Newcastle Electronics Ltd, {site.addressLine}. Email {site.email}. Call {site.phoneLocal}.</p>
    </article>
  );
}
