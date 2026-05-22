"use client";

import { useCallback, useEffect, useRef } from "react";

export function useDragSound(
  src: string = "/sounds/drag.mp3",
  volume: number = 0.45
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const a = new Audio(src);
    a.volume = volume;
    a.preload = "auto";
    audioRef.current = a;
    return () => {
      a.pause();
      audioRef.current = null;
    };
  }, [src, volume]);

  return useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    try {
      a.currentTime = 0;
      void a.play().catch(() => {});
    } catch {
      // Playback failures must never break drag UX.
    }
  }, []);
}
