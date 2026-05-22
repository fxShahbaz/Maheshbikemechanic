"use client";

import { useEffect, useRef } from "react";

const SRC = "/sounds/press.wav";
const VOLUME = 0.35;

const CLICKABLE_SELECTOR = [
  "button",
  "a[href]",
  '[role="button"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="checkbox"]',
  '[role="combobox"]',
  '[role="radio"]',
  '[role="option"]',
  '[role="tab"]',
  '[role="switch"]',
].join(", ");

export default function GlobalClickSound() {
  const seedRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const seed = new Audio(SRC);
    seed.preload = "auto";
    seed.volume = VOLUME;
    seedRef.current = seed;

    function play() {
      const s = seedRef.current;
      if (!s) return;
      try {
        const clone = s.cloneNode() as HTMLAudioElement;
        clone.volume = VOLUME;
        void clone.play().catch(() => {});
      } catch {
        // Never let an audio failure leak — clicks must still work.
      }
    }

    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const el = target.closest<HTMLElement>(CLICKABLE_SELECTOR);
      if (!el) return;
      if (
        el.hasAttribute("disabled") ||
        el.getAttribute("aria-disabled") === "true"
      ) {
        return;
      }
      play();
    }

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      seed.pause();
      seedRef.current = null;
    };
  }, []);

  return null;
}
