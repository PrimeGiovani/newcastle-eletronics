"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, ShoppingBag, FileText, Headphones, Package } from "lucide-react";
import { site, waLink, type WaIntent } from "@/lib/config";

const options: { intent: WaIntent; label: string; desc: string; Icon: typeof MessageCircle }[] = [
  { intent: "sales", label: "Chat with Sales", desc: "Product advice & availability", Icon: ShoppingBag },
  { intent: "product", label: "Product Inquiry", desc: "Ask about this page's product", Icon: Package },
  { intent: "quote", label: "Request a Quotation", desc: "Bulk, hotel & project pricing", Icon: FileText },
  { intent: "support", label: "Customer Support", desc: "Orders, delivery & warranty", Icon: Headphones },
];

export function WhatsAppWidget() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  if (path.startsWith("/admin")) return null;
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div role="dialog" aria-label="WhatsApp chat options" className="w-[310px] animate-fade-up overflow-hidden rounded-[24px] bg-white/95 shadow-lift ring-1 ring-black/5 backdrop-blur-xl dark:bg-card">
          <div className="border-b p-5">
            <p className="font-semibold">Chat with Newcastle</p>
            <p className="text-xs text-muted-foreground">WhatsApp {site.phone} · replies within minutes</p>
          </div>
          <ul className="p-2">
            {options.map(({ intent, label, desc, Icon }) => (
              <li key={intent}>
                <a href={waLink(intent, intent === "product" || intent === "quote" ? pageUrl : "")} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-2xl p-3 hover:bg-muted">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#25D366]/15 text-[#128C7E]"><Icon className="h-5 w-5" /></span>
                  <span><span className="block text-sm font-semibold">{label}</span><span className="block text-xs text-muted-foreground">{desc}</span></span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? "Close WhatsApp options" : "Chat with us on WhatsApp"}
        className="grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lift transition duration-300 ease-apple hover:scale-105">
        {open ? <X className="h-6 w-6" /> : <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-1 1.2-.4.2-.7.1a8.2 8.2 0 0 1-4-3.5c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.8.4 3.5 3.5 0 0 0-1.1 2.6 6 6 0 0 0 1.3 3.2 13.9 13.9 0 0 0 5.3 4.7c2 .8 2.7.9 3.7.7a3.1 3.1 0 0 0 2-1.4 2.5 2.5 0 0 0 .2-1.4c-.1-.1-.3-.2-.6-.3zM12 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zm8.4-18.2A11.8 11.8 0 0 0 1.8 17.9L.1 24l6.3-1.6a11.8 11.8 0 0 0 5.6 1.4A11.8 11.8 0 0 0 20.4 3.6z" /></svg>}
      </button>
    </div>
  );
}
