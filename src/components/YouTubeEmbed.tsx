"use client";

import { useState } from "react";

type Props = {
  videoId: string;
  title: string;
};

export default function YouTubeEmbed({ videoId, title }: Props) {
  const [active, setActive] = useState(false);

  if (active) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full block"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      aria-label={`Play video: ${title}`}
      className="group relative w-full h-full block cursor-pointer"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
        alt={title}
        loading="lazy"
        onError={(e) => {
          const img = e.currentTarget;
          if (!img.src.endsWith("hqdefault.jpg")) {
            img.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
          }
        }}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-ink/10 group-hover:from-ink/55 transition-colors" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-lime shadow-2xl group-hover:scale-110 transition-transform duration-300">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="#0f1410"
            className="ml-1"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
