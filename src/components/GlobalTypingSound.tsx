"use client";

import { useEffect, useRef } from "react";

const SRC = "/sounds/press.wav";
const VOLUME = 0.18;
const MIN_INTERVAL_MS = 35;
const DESKTOP_QUERY = "(hover: hover) and (pointer: fine)";

export default function GlobalTypingSound() {
  const seedRef = useRef<HTMLAudioElement | null>(null);
  const lastPlayRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Desktop-only: skip on phones / touch tablets.
    if (!window.matchMedia(DESKTOP_QUERY).matches) return;

    const seed = new Audio(SRC);
    seed.preload = "auto";
    seed.volume = VOLUME;
    seedRef.current = seed;

    function play() {
      const now = performance.now();
      if (now - lastPlayRef.current < MIN_INTERVAL_MS) return;
      lastPlayRef.current = now;
      const s = seedRef.current;
      if (!s) return;
      try {
        const clone = s.cloneNode() as HTMLAudioElement;
        clone.volume = VOLUME;
        // Subtle pitch variance so held-key repeats don't sound like a loop
        clone.playbackRate = 0.94 + Math.random() * 0.12;
        void clone.play().catch(() => {});
      } catch {
        // Audio errors must never break typing.
      }
    }

    function isEditableTarget(target: EventTarget | null): boolean {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      if (tag === "INPUT") {
        const type = (target as HTMLInputElement).type;
        const TEXT_TYPES = new Set([
          "text",
          "search",
          "email",
          "password",
          "tel",
          "url",
          "number",
          "date",
        ]);
        return TEXT_TYPES.has(type);
      }
      if (tag === "TEXTAREA") return true;
      if (target.isContentEditable) return true;
      return false;
    }

    function isTypingKey(e: KeyboardEvent): boolean {
      if (e.metaKey || e.ctrlKey || e.altKey) return false;
      if (e.isComposing) return false;
      const key = e.key;
      if (typeof key !== "string") return false;
      if (key.length === 1) return true;
      // Enter excluded: in inputs it submits, in textareas it newlines —
      // either way the surrounding action gives its own feedback.
      if (key === "Backspace" || key === "Delete") return true;
      return false;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (!isEditableTarget(e.target)) return;
      if (!isTypingKey(e)) return;
      play();
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      seed.pause();
      seedRef.current = null;
    };
  }, []);

  return null;
}
