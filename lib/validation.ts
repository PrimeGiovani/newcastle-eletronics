import { z } from "zod";
import { normalizeNgPhone, STATES } from "./nigeria";

export const ngPhone = z.string().trim().transform((v, ctx) => {
  const n = normalizeNgPhone(v);
  if (!n) { ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a valid Nigerian phone number, e.g. 0803 123 4567" }); return z.NEVER; }
  return n;
});
const stateName = z.string().refine((s) => STATES.some((x) => x.name === s), "Select a valid state");

export const addressSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: ngPhone,
  line1: z.string().trim().min(4, "Enter your street address").max(200),
  line2: z.string().trim().max(200).optional().default(""),
  landmark: z.string().trim().max(120).optional().default(""),
  city: z.string().trim().min(2).max(80),
  lga: z.string().trim().min(2, "Select your LGA").max(80),
  state: stateName,
});
export type AddressInput = z.infer<typeof addressSchema>;

export const checkoutSchema = z.object({
  customer: z.object({ email: z.string().trim().toLowerCase().email(), fullName: z.string().trim().min(2).max(100), phone: ngPhone }),
  shipping: addressSchema,
  deliveryMethod: z.enum(["standard", "express", "pickup"]),
  installation: z.boolean().default(false),
  couponCode: z.string().trim().toUpperCase().max(30).optional(),
  saveAddress: z.boolean().default(false),
  items: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(50) })).min(1).max(50),
  notes: z.string().max(500).optional(),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const LEAD_TYPES = ["quote", "contact", "installation", "solar_consultation", "newsletter", "support"] as const;
export const leadSchema = z.object({
  type: z.enum(LEAD_TYPES),
  name: z.string().trim().max(100).optional().default(""),
  email: z.string().trim().toLowerCase().email().optional().or(z.literal("")),
  phone: z.string().trim().optional().default(""),
  state: z.string().trim().max(40).optional().default(""),
  product: z.string().trim().max(160).optional().default(""),
  preferredDate: z.string().trim().max(20).optional().default(""),
  message: z.string().trim().max(3000).optional().default(""),
  meta: z.record(z.unknown()).optional(),
  website: z.string().max(0).optional(), // honeypot
}).superRefine((v, ctx) => {
  if (v.type === "newsletter") { if (!v.email) ctx.addIssue({ code: "custom", path: ["email"], message: "Email is required" }); return; }
  if (v.name.length < 2) ctx.addIssue({ code: "custom", path: ["name"], message: "Please enter your name" });
  if (!normalizeNgPhone(v.phone)) ctx.addIssue({ code: "custom", path: ["phone"], message: "Enter a valid Nigerian phone number" });
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional().default(""),
  body: z.string().trim().min(10, "Tell us a bit more (10+ characters)").max(2000),
});
