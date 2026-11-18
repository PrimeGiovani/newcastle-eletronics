"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/** Minimal product snapshot kept client-side. Prices are re-validated on the server at checkout. */
export type CartProduct = { id: string; slug: string; name: string; price: number; image: string; brand: string; stock: number; installable: boolean };
export type CartLine = CartProduct & { quantity: number };

type Store = {
  ready: boolean;
  cart: CartLine[]; saved: CartLine[]; wishlist: CartProduct[]; compare: CartProduct[];
  count: number; subtotal: number;
  add: (p: CartProduct, qty?: number) => void; setQty: (id: string, qty: number) => void; remove: (id: string) => void; clear: () => void;
  saveForLater: (id: string) => void; moveToCart: (id: string) => void; removeSaved: (id: string) => void;
  toggleWishlist: (p: CartProduct) => void; inWishlist: (id: string) => boolean;
  toggleCompare: (p: CartProduct) => void; inCompare: (id: string) => boolean; clearCompare: () => void;
  toast: string | null; notify: (m: string) => void;
};
const Ctx = createContext<Store | null>(null);
const KEY = "nce:store:v1";
export const MAX_COMPARE = 4;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [saved, setSaved] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<CartProduct[]>([]);
  const [compare, setCompare] = useState<CartProduct[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) ?? "{}");
      setCart(s.cart ?? []); setSaved(s.saved ?? []); setWishlist(s.wishlist ?? []); setCompare(s.compare ?? []);
    } catch { /* ignore corrupt storage */ }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(KEY, JSON.stringify({ cart, saved, wishlist, compare })); }, [ready, cart, saved, wishlist, compare]);

  const notify = useCallback((m: string) => { setToast(m); setTimeout(() => setToast(null), 2600); }, []);
  const clamp = (q: number, stock: number) => Math.max(1, Math.min(q, Math.max(stock, 1), 50));

  const add = useCallback((p: CartProduct, qty = 1) => {
    setCart((c) => {
      const ex = c.find((l) => l.id === p.id);
      return ex ? c.map((l) => (l.id === p.id ? { ...l, ...p, quantity: clamp(l.quantity + qty, p.stock) } : l)) : [...c, { ...p, quantity: clamp(qty, p.stock) }];
    });
    notify(`Added to cart: ${p.name}`);
  }, [notify]);
  const setQty = (id: string, qty: number) => setCart((c) => c.map((l) => (l.id === id ? { ...l, quantity: clamp(qty, l.stock) } : l)));
  const remove = (id: string) => setCart((c) => c.filter((l) => l.id !== id));
  const clear = () => setCart([]);
  const saveForLater = (id: string) => { const l = cart.find((x) => x.id === id); if (!l) return; remove(id); setSaved((s) => [...s.filter((x) => x.id !== id), l]); };
  const moveToCart = (id: string) => { const l = saved.find((x) => x.id === id); if (!l) return; setSaved((s) => s.filter((x) => x.id !== id)); add(l, l.quantity); };
  const removeSaved = (id: string) => setSaved((s) => s.filter((x) => x.id !== id));

  const toggleWishlist = (p: CartProduct) => {
    const has = wishlist.some((w) => w.id === p.id);
    setWishlist((w) => (has ? w.filter((x) => x.id !== p.id) : [...w, p]));
    notify(has ? "Removed from wishlist" : "Saved to wishlist");
    fetch("/api/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: p.id, on: !has }) }).catch(() => {});
  };
  const toggleCompare = (p: CartProduct) => {
    const has = compare.some((c) => c.id === p.id);
    if (!has && compare.length >= MAX_COMPARE) { notify(`You can compare up to ${MAX_COMPARE} products`); return; }
    setCompare((c) => (has ? c.filter((x) => x.id !== p.id) : [...c, p]));
    notify(has ? "Removed from compare" : "Added to compare");
  };

  const value = useMemo<Store>(() => ({
    ready, cart, saved, wishlist, compare,
    count: cart.reduce((s, l) => s + l.quantity, 0), subtotal: cart.reduce((s, l) => s + l.price * l.quantity, 0),
    add, setQty, remove, clear, saveForLater, moveToCart, removeSaved,
    toggleWishlist, inWishlist: (id) => wishlist.some((w) => w.id === id),
    toggleCompare, inCompare: (id) => compare.some((c) => c.id === id), clearCompare: () => setCompare([]),
    toast, notify,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [ready, cart, saved, wishlist, compare, toast]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside <StoreProvider>");
  return s;
}

export function Toast() {
  const { toast } = useStore();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4">
      {toast && <div className="animate-fade-up rounded-full bg-charcoal px-5 py-3 text-sm font-medium text-white shadow-lg dark:bg-white dark:text-charcoal">{toast}</div>}
    </div>
  );
}
