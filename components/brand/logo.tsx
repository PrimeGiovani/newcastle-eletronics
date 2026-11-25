import Image from "next/image";
import { cn } from "@/lib/utils";

/** Newcastle wordmark + "ELECTRONICS" so the full company name always shows. Swaps to the white logo in dark mode. */
export function Logo({ size = "md", priority, className }: { size?: "md" | "lg"; priority?: boolean; className?: string }) {
  const h = size === "lg" ? "h-7" : "h-7 sm:h-8";
  return (
    <span className={cn("inline-flex flex-col items-start leading-none", className)}>
      <Image src="/logo.png" alt="" width={877} height={160} priority={priority} className={cn(h, "w-auto dark:hidden")} />
      <Image src="/logo-white.png" alt="" width={877} height={160} priority={priority} className={cn(h, "hidden w-auto dark:block")} />
      <span className="mt-1 w-full text-right text-[9px] font-semibold uppercase tracking-[.42em] text-ink-soft sm:text-[10px] dark:text-white/70" aria-hidden>Electronics</span>
      <span className="sr-only">Newcastle Electronics</span>
    </span>
  );
}
