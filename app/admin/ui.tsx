import { cn } from "@/lib/utils";
export const Stat = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
  <div className="rounded-3xl border p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p>{sub && <p className="text-xs text-muted-foreground">{sub}</p>}</div>
);
export const PageTitle = ({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><h1 className="font-display text-2xl font-semibold">{children}</h1>{action}</div>
);
export function Table({ head, children, className }: { head: string[]; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto rounded-3xl border", className)}>
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-muted/50 text-left text-muted-foreground"><tr>{head.map((h) => <th key={h} scope="col" className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
        <tbody className="divide-y">{children}</tbody>
      </table>
    </div>
  );
}
export const Td = ({ children, className }: { children: React.ReactNode; className?: string }) => <td className={cn("px-4 py-3", className)}>{children}</td>;
