import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { site, waLink } from "@/lib/config";
import { cn } from "@/lib/utils";

/** Contact options shown instead of Add to cart for coming-soon / price-on-request products. */
export const enquiryText = (name: string, comingSoon?: boolean) =>
  comingSoon ? `I'd like to enquire about / book ahead: ${name}` : `Please send me the price of: ${name}`;

export function EnquireButtons({ name, comingSoon, compact, className }: { name: string; comingSoon?: boolean; compact?: boolean; className?: string }) {
  const text = enquiryText(name, comingSoon);
  if (compact) return (
    <a href={waLink("product", text)} target="_blank" rel="noopener noreferrer" aria-label={`Contact us about ${name}`}
      className={cn("flex h-10 items-center justify-center gap-2 rounded-full bg-ink text-sm font-medium text-white shadow-soft transition hover:bg-ink/85 dark:bg-white dark:text-ink", className)}>
      <MessageCircle className="h-4 w-4" />Contact us
    </a>
  );
  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid gap-3 sm:grid-cols-2">
        <a href={waLink("product", text)} target="_blank" rel="noopener noreferrer" className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-electric text-[17px] font-medium text-white transition hover:bg-electric-600">
          <MessageCircle className="h-5 w-5" />Contact us on WhatsApp
        </a>
        <Link href={`/contact?type=quote&product=${encodeURIComponent(name)}`} className="flex h-[52px] items-center justify-center gap-2 rounded-full border border-ink/15 text-[17px] font-medium transition hover:bg-ink/5 dark:border-white/20">
          {comingSoon ? "Book ahead / enquire" : "Request price"}
        </Link>
      </div>
      <a href={site.phoneHref} className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"><Phone className="h-4 w-4" />Or call {site.phoneLocal}</a>
    </div>
  );
}
