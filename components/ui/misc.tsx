import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground", secondary: "bg-muted text-foreground", sale: "bg-flame-50 text-flame-600 dark:bg-flame/15 dark:text-orange-300",
      new: "bg-electric-50 text-electric dark:bg-electric/15 dark:text-sky-300", success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
      warning: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300", outline: "border border-border",
      destructive: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    },
  },
  defaultVariants: { variant: "default" },
});
export function Badge({ className, variant, ...p }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...p} />;
}

export function Card({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[24px] bg-card text-card-foreground shadow-card", className)} {...p} />;
}

export function Skeleton({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-xl bg-muted", className)} {...p} />;
}

export function Separator({ className }: { className?: string }) {
  return <hr className={cn("border-border", className)} />;
}

export function SectionHeader({ eyebrow, title, subtitle, action, center }: { eyebrow?: string; title: string; subtitle?: string; action?: React.ReactNode; center?: boolean }) {
  return (
    <div className={cn("reveal mb-10 flex flex-wrap items-end justify-between gap-4 sm:mb-14", center && "flex-col items-center text-center")}>
      <div className={cn("max-w-3xl", center && "mx-auto")}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tightest sm:text-5xl">{title}</h2>
        {subtitle && <p className="mt-4 text-lg text-muted-foreground sm:text-xl">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
