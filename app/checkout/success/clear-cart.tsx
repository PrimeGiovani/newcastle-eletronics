"use client";
import { useEffect, useRef } from "react";
import { useStore } from "@/components/cart/store";
export function ClearCart() {
  const { clear, ready } = useStore();
  const done = useRef(false);
  useEffect(() => { if (ready && !done.current) { done.current = true; clear(); } }, [ready, clear]);
  return null;
}
