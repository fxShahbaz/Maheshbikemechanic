"use client";

import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

type HeroImage = {
  src: string;
  alt: string;
  objectPosition?: string;
  objectFit?: "cover" | "contain";
};

type Props = {
  images: HeroImage[];
  interval?: number;
};

export default function HeroSlideshow({ images, interval = 5500 }: Props) {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, interval);
    return () => window.clearInterval(id);
  }, [images.length, interval]);

  const current = images[index];

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <AnimatePresence initial={false} mode="sync">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          key={current.src}
          className="hero-img"
          src={current.src}
          alt={current.alt}
          style={{
            y,
            scale,
            objectFit: current.objectFit,
            objectPosition: current.objectPosition,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.94 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.3, ease: [0.4, 0, 0.2, 1] }}
        />
      </AnimatePresence>
    </div>
  );
}
