import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

type Post = {
  id: number;
  title: string;
  author: string;
  content: string;
  date: string;
  files: string[];
};

const POSTS_KEY = "factshield_posts";

function safeParse(raw: string | null): Post[] {
  if (!raw) return [];
  try {
    const x = JSON.parse(raw);
    return Array.isArray(x) ? x : [];
  } catch {
    return [];
  }
}

function mergeAll(seed: Post[], local: Post[]) {
  const map = new Map<number, Post>();

  // Seed first
  for (const p of seed) {
    if (p && typeof p.id === "number") map.set(p.id, p);
  }
  // Local overrides seed
  for (const p of local) {
    if (p && typeof p.id === "number") map.set(p.id, p);
  }

  // Sort by date desc (newest first)
  return Array.from(map.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
}

async function bootstrap() {
  // 1) Load seed from posts.json (if you have it)
  let seed: Post[] = [];
  try {
    const res = await fetch("/factshield/posts.json?x=" + Date.now(), { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      seed = Array.isArray(data) ? data : [];
    }
  } catch {
    // ok: no seed available
  }

  // 2) Load local
  const local = safeParse(localStorage.getItem(POSTS_KEY));

  // 3) Merge (NO deletion)
  const merged = mergeAll(seed, local);

  // 4) Persist merged so App reads a single source
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(merged));
  } catch {
    // quota exceeded: still render
  }

  // 5) Render app
  createRoot(document.getElementById("root")!).render(<App />);
}

bootstrap();
