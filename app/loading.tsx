export default function Loading() {
  return <div className="container py-24" aria-busy="true" aria-live="polite"><div className="h-8 w-1/3 animate-pulse rounded bg-slate-100" /><div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{[0,1,2].map(i => <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-100" />)}</div></div>;
}
