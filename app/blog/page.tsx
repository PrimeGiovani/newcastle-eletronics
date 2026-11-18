import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import { posts } from "@/lib/blog";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Blog – Solar, AC & Energy-Saving Guides", description: "Expert guides on solar sizing, inverter ACs, lithium batteries and saving energy at home and work.", path: "/blog" });
export default function Blog() {
  return (
    <section className="section container">
      <SectionHeading as="h1" eyebrow="Insights" title="Energy & technology guides" />
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <article key={p.slug} className="group relative overflow-hidden rounded-3xl shadow-card ring-1 ring-slate-100">
            <div className="relative aspect-[16/10]"><Image src={p.image} alt="" fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition group-hover:scale-105" /></div>
            <div className="p-6">
              <p className="text-xs font-semibold uppercase text-eco-600">{p.category} · <time dateTime={p.date}>{new Date(p.date).toLocaleDateString("en-GB", { dateStyle: "medium" })}</time></p>
              <h2 className="mt-2 text-lg font-bold"><Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0">{p.title}</Link></h2>
              <p className="mt-2 text-sm text-ink-soft">{p.excerpt}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
