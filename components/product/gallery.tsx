"use client";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** Image gallery with hover-zoom (desktop) and tap-to-zoom (mobile). */
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };
  return (
    <div className="flex flex-col-reverse gap-3 self-start lg:sticky lg:top-36 lg:flex-row lg:items-start">
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto lg:flex-col" role="tablist" aria-label="Product images">
          {images.map((src, i) => (
            <button key={src + i} role="tab" aria-selected={i === active} aria-label={`Image ${i + 1}`} onClick={() => setActive(i)}
              className={cn("relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-cloud transition dark:bg-muted", i === active ? "border-electric" : "border-transparent opacity-70 hover:opacity-100")}>
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      <div
        className={cn("relative aspect-square flex-1 overflow-hidden rounded-[28px] bg-cloud dark:bg-muted", zoom ? "cursor-zoom-out" : "cursor-zoom-in")}
        onMouseEnter={() => setZoom(true)} onMouseLeave={() => setZoom(false)} onMouseMove={onMove} onClick={() => setZoom((z) => !z)}
        role="img" aria-label={`${name} – image ${active + 1} of ${images.length}. Click to zoom.`}>
        <Image src={images[active]} alt={name} fill priority sizes="(min-width:1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-200" style={{ transform: zoom ? "scale(2)" : "scale(1)", transformOrigin: origin }} />
      </div>
    </div>
  );
}
