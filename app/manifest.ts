import type { MetadataRoute } from "next";
import { site } from "@/lib/config";
export default function manifest(): MetadataRoute.Manifest {
  return { name: site.name, short_name: "Newcastle", description: site.description, start_url: "/", display: "standalone", background_color: "#ffffff", theme_color: "#FFFFFF", icons: [{ src: "/emblem.png", sizes: "256x256", type: "image/png" }] };
}
