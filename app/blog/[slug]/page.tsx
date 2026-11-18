import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { getPost, posts } from "@/lib/blog";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

type Props = { params: { slug: string } };
export const dynamicParams = false;
export const generateStaticParams = () => posts.map((p) => ({ slug: p.slug }));
export function generateMetadata({ params }: Props) {
  const p = getPost(params.slug);
  return p ? { ...pageMeta({ title: p.title, description: p.excerpt, path: `/blog/${p.slug}`, image: p.image }), openGraph: { type: "article", publishedTime: p.date, images: [p.image] } } : {};
}
export default function PostPage({ params }: Props) {
  const p = getPost(params.slug);
  if (!p) notFound();
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "BlogPosting", headline: p.title, description: p.excerpt, image: p.image, datePublished: p.date, author: { "@type": "Organization", name: p.author }, publisher: { "@type": "Organization", name: site.name }, mainEntityOfPage: `${site.url}/blog/${p.slug}` }} />
      <Breadcrumbs items={[{ name: "Blog", href: "/blog" }, { name: p.title, href: `/blog/${p.slug}` }]} />
      <article className="container max-w-3xl py-10">
        <p className="text-sm font-semibold text-eco-600">{p.category}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">{p.title}</h1>
        <p className="mt-4 text-sm text-ink-soft">By {p.author} · <time dateTime={p.date}>{new Date(p.date).toLocaleDateString("en-GB", { dateStyle: "long" })}</time></p>
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl"><Image src={p.image} alt={p.title} fill priority sizes="(min-width:768px) 768px, 100vw" className="object-cover" /></div>
        <div className="mt-10 space-y-5 text-lg leading-relaxed text-ink-soft">{p.body.map((b, i) => <p key={i}>{b}</p>)}</div>
        <div className="mt-12 rounded-2xl bg-brand-50 p-6"><p className="font-semibold">Need expert advice?</p><Link href="/contact#quote" className="btn-primary mt-4">Talk to an engineer</Link></div>
      </article>
    </>
  );
}
