import { Badge } from "@/components/ui/misc";
const MAP: Record<string, ["success" | "warning" | "destructive" | "secondary" | "new", string]> = {
  pending: ["warning", "Awaiting payment"], paid: ["new", "Paid"], processing: ["new", "Processing"], shipped: ["new", "Shipped"],
  delivered: ["success", "Delivered"], cancelled: ["destructive", "Cancelled"], refunded: ["secondary", "Refunded"],
  return_requested: ["warning", "Return requested"], returned: ["secondary", "Returned"],
};
export function StatusBadge({ status }: { status: string }) {
  const [v, l] = MAP[status] ?? ["secondary", status];
  return <Badge variant={v}>{l}</Badge>;
}
