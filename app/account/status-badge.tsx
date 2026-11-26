import { Badge } from "@/components/ui/misc";
const MAP: Record<string, ["success" | "warning" | "destructive" | "secondary" | "new", string]> = {
  pending: ["warning", "Awaiting payment"], pending_store: ["warning", "Awaiting payment at store"], paid: ["new", "Paid"], processing: ["new", "Processing"], ready_for_pickup: ["success", "Ready for pickup"], collected: ["success", "Collected"], shipped: ["new", "Shipped"],
  delivered: ["success", "Delivered"], cancelled: ["destructive", "Cancelled"], refunded: ["secondary", "Refunded"],
  return_requested: ["warning", "Swap requested"], returned: ["secondary", "Swapped"],
};
export function StatusBadge({ status }: { status: string }) {
  const [v, l] = MAP[status] ?? ["secondary", status];
  return <Badge variant={v}>{l}</Badge>;
}
