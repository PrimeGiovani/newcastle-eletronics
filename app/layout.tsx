import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/config";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { ThemeProvider } from "@/components/theme";
import { StoreProvider, Toast } from "@/components/cart/store";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppWidget } from "@/components/layout/whatsapp-widget";

// Inter with optical tweaks is the closest open alternative to SF Pro
const sans = Inter({ subsets: ["latin"], display: "swap", variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} | Inverter ACs, Appliances, Sound & Solar in Nigeria`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  keywords: ["Newcastle air conditioner", "inverter AC price Nigeria", "Newcastle gas cooker", "sound bar Nigeria", "home appliances Nigeria", "solar inverter Lagos", "lithium battery Nigeria"],
  openGraph: { type: "website", siteName: site.name, locale: "en_NG", url: "/", title: site.name, description: site.description },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, googleBot: { "max-image-preview": "large" } },
  formatDetection: { telephone: true },
};
export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#ffffff" }, { media: "(prefers-color-scheme: dark)", color: "#000000" }],
  width: "device-width", initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" suppressHydrationWarning className={sans.variable}>
      <body className="min-h-screen font-sans">
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <ThemeProvider>
          <StoreProvider>
            <Header />
            <main id="main">{children}</main>
            <Footer />
            <WhatsAppWidget />
            <Toast />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
