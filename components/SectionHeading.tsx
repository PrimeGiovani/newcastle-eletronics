export default function SectionHeading({ eyebrow, title, sub, center = false, as: H = "h2" }: { eyebrow?: string; title: string; sub?: string; center?: boolean; as?: "h1" | "h2" }) {
  return (
    <div className={`max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      {eyebrow && <p className="text-sm font-semibold uppercase tracking-wider text-eco-600">{eyebrow}</p>}
      <H className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</H>
      {sub && <p className="mt-4 text-lg text-ink-soft">{sub}</p>}
    </div>
  );
}
