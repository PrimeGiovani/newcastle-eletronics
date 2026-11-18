import { waLink } from "@/lib/site";
import { WhatsAppIcon } from "./Icons";
export default function WhatsAppButton() {
  return (
    <a href={waLink()} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg ring-4 ring-white transition hover:scale-105 focus-visible:outline-none focus-visible:ring-brand-500">
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
