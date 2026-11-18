import "server-only";
import crypto from "node:crypto";

const BASE = "https://api.paystack.co";
const key = () => {
  const k = process.env.PAYSTACK_SECRET_KEY;
  if (!k) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return k;
};

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, { ...init, headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json", ...init?.headers }, cache: "no-store" });
  const json = await res.json();
  if (!res.ok || json.status === false) throw new Error(json.message ?? `Paystack error ${res.status}`);
  return json.data as T;
}

export const PAYSTACK_CHANNELS = ["card", "bank", "bank_transfer", "ussd", "mobile_money", "qr"] as const;

/** amount in Naira – converted to kobo here, the only place kobo appears. */
export function initializeTransaction(input: { email: string; amount: number; reference: string; callbackUrl: string; metadata: Record<string, unknown> }) {
  return call<{ authorization_url: string; access_code: string; reference: string }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({ email: input.email, amount: Math.round(input.amount * 100), currency: "NGN", reference: input.reference, callback_url: input.callbackUrl, channels: PAYSTACK_CHANNELS, metadata: input.metadata }),
  });
}

export type PaystackTransaction = {
  id: number; status: "success" | "failed" | "abandoned" | string; reference: string; amount: number; currency: string; channel: string;
  paid_at: string; customer: { email: string; customer_code: string };
  authorization?: { authorization_code: string; card_type: string; last4: string; exp_month: string; exp_year: string; bank: string; reusable: boolean; signature: string; channel: string };
  metadata?: Record<string, unknown>;
};
export const verifyTransaction = (reference: string) => call<PaystackTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`);

/** Constant-time check of x-paystack-signature (HMAC-SHA512 of the raw body with the secret key). */
export function isValidWebhookSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const hash = crypto.createHmac("sha512", key()).update(rawBody).digest("hex");
  const a = Buffer.from(hash), b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
