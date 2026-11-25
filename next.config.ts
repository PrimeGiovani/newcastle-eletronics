import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host : "*.supabase.co";

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://js.paystack.co",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https://${supabaseHost} wss://${supabaseHost} https://api.paystack.co`,
  "frame-src https://checkout.paystack.com https://www.google.com https://maps.google.com",
  "form-action 'self' https://checkout.paystack.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
];

const config: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true, // only our own /public/products renders; served sandboxed below
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  experimental: { optimizePackageImports: ["lucide-react"] },
  // Old URLs from the previous catalogue → keep link equity
  async redirects() {
    return [
      { source: "/category/audio-entertainment", destination: "/category/sound-system", permanent: true },
      { source: "/category/electronics", destination: "/shop", permanent: true },
      { source: "/category/accessories", destination: "/shop", permanent: true },
      { source: "/category/gas-cookers", destination: "/category/gas-hobs", permanent: true },
      { source: "/category/3hp-standing-unit", destination: "/category/standing-units", permanent: true },
      { source: "/category/home-appliances", destination: "/category/kitchen-appliances", permanent: true },
      { source: "/category/home-audio", destination: "/category/home-theatre", permanent: true },
      { source: "/category/speakers", destination: "/category/boom-box", permanent: true },
      { source: "/category/hybrid-inverters", destination: "/category/inverters", permanent: true },
      { source: "/category/ess-systems", destination: "/category/all-in-one-ess", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};
export default config;
