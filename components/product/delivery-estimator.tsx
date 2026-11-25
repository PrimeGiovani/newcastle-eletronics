import { MapPin, Truck } from "lucide-react";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/nigeria";
import { site } from "@/lib/config";
import { formatNaira } from "@/lib/utils";

/** Delivery & pickup terms (replaces the old state-based delivery estimator). */
export function DeliveryInfo() {
  return (
    <div className="space-y-3 rounded-[20px] bg-cloud p-5 text-sm dark:bg-muted">
      <p className="flex gap-3"><Truck className="h-5 w-5 shrink-0 text-electric" /><span><b>Free delivery</b> on orders of {formatNaira(FREE_SHIPPING_THRESHOLD)} and above. For smaller orders, Newcastle will contact you after purchase to arrange shipping.</span></p>
      <p className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-electric" /><span><b>Free pickup</b> at our showroom: {site.addressLine}.</span></p>
    </div>
  );
}
