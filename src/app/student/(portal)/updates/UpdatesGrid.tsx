"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { FeedPost } from "@/lib/student-portal";
import { SITE_NAME } from "@/lib/site";
import { usePagination } from "@/components/pagination";
import { formatPostTime } from "../_components/ui";

const svg = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** Feed of announcement cards of announcements, pinned posts first. */
export default function UpdatesGrid({
  announcements,
}: {
  announcements: FeedPost[];
}) {
  const { paged, remaining, showMore } = usePagination(announcements, 15);

  return (
    <>
      <div className="mt-5 space-y-4">
        {paged.map((a, i) => (
          <Post key={a.id} a={a} index={i} />
        ))}
      </div>

      {remaining > 0 && (
        <button
          type="button"
          onClick={showMore}
          className="mt-4 w-full h-12 rounded-2xl bg-white border border-line text-[15px] font-medium text-forest active:bg-cream transition"
        >
          Show more ({remaining} left)
        </button>
      )}
    </>
  );
}

function Avatar({ dark }: { dark: boolean }) {
  return (
    <span
      className={[
        "relative shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-full ring-4",
        dark ? "bg-lime text-ink ring-white/10" : "bg-ink text-lime ring-lime/25",
      ].join(" ")}
    >
      <svg width="22" height="22" {...svg}>
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    </span>
  );
}

function Verified({ dark }: { dark: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" className={`shrink-0 ${dark ? "text-lime" : "text-forest"}`} aria-label="Official">
      <path fill="currentColor" d="M12 2l2.4 1.8 3-.2.9 2.9 2.5 1.7-1 2.8 1 2.8-2.5 1.7-.9 2.9-3-.2L12 22l-2.4-1.8-3 .2-.9-2.9-2.5-1.7 1-2.8-1-2.8 2.5-1.7.9-2.9 3 .2z" />
      <path d="m8.5 12 2.5 2.5 4.5-5" fill="none" stroke={dark ? "#0f1410" : "#d4f548"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** One announcement as a post card from the institute. Long bodies expand. */
function Post({ a, index }: { a: FeedPost; index: number }) {
  const reduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const long = (a.body?.length ?? 0) > 280;

  async function share() {
    const text = a.body ? `${a.title}\n\n${a.body}` : a.title;
    try {
      if (navigator.share) {
        await navigator.share({ title: a.title, text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Share sheet dismissed or clipboard blocked — nothing to do
    }
  }

  const [date, time] = formatPostTime(a.created_at).split(" · ");
  const dark = a.pinned;
  const when = a.ago
    ? a.ago === "Just now"
      ? a.ago
      : `${a.ago} ago`
    : date;

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: Math.min(index, 6) * 0.05 }}
      className={[
        "relative rounded-[28px] p-5 overflow-hidden",
        dark
          ? "bg-ink text-white shadow-[0_24px_48px_-24px_rgba(15,20,16,0.7)]"
          : "bg-white ring-1 ring-ink/[0.05] shadow-[0_1px_2px_rgba(15,20,16,0.04),0_16px_36px_-20px_rgba(15,20,16,0.22)]",
      ].join(" ")}
    >
      {/* Soft glow accent */}
      <span
        aria-hidden
        className={[
          "pointer-events-none absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl",
          dark ? "bg-lime/20" : "bg-lime/25",
        ].join(" ")}
      />

      {/* Author */}
      <header className="relative flex items-center gap-3">
        <Avatar dark={dark} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 min-w-0">
            <span className="font-semibold text-[15px] truncate">{SITE_NAME}</span>
            <Verified dark={dark} />
          </div>
          <div className={`text-[13px] ${dark ? "text-white/55" : "text-muted"}`}>
            Official ·{" "}
            <time dateTime={a.created_at} title={`${date} · ${time}`}>
              {when}
            </time>
          </div>
        </div>
        {a.pinned ? (
          <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider rounded-full pl-2 pr-2.5 h-7 bg-lime text-ink">
            <svg width="12" height="12" {...svg}>
              <path d="M12 17v5" />
              <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
            </svg>
            Pinned
          </span>
        ) : (
          a.isNew && (
            <span className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-2.5 h-7 bg-lime text-ink">
              <span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" />
              New
            </span>
          )
        )}
      </header>

      {/* Message bubble */}
      <div
        className={[
          "relative mt-4 ml-1 rounded-[22px] rounded-tl-md px-4 pt-3.5 pb-2.5 break-words",
          dark ? "bg-white/[0.07] ring-1 ring-white/10" : "bg-cream/80 ring-1 ring-ink/[0.04]",
        ].join(" ")}
      >
        <h2 className="font-semibold text-[17px] leading-snug tracking-[-0.01em]">
          {a.title}
        </h2>
        {a.body && (
          <p
            className={[
              "mt-1.5 text-[15px] leading-relaxed whitespace-pre-line",
              dark ? "text-white/75" : "text-ink/75",
              long && !expanded ? "line-clamp-5" : "",
            ].join(" ")}
          >
            {a.body}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between gap-3">
          {long ? (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className={`text-sm font-semibold active:opacity-60 ${dark ? "text-lime" : "text-forest"}`}
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          ) : (
            <span />
          )}
          <span className={`inline-flex items-center gap-1 text-[11px] num-mono ${dark ? "text-white/45" : "text-muted"}`}>
            {time}
            <svg width="15" height="15" {...svg} className={dark ? "text-lime" : "text-forest"}>
              <path d="M2 12.5 6 16.5 14 8.5" />
              <path d="M10 16.5 18 8.5" />
            </svg>
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="relative mt-4 flex items-center justify-between gap-2">
        <span
          className={[
            "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[13px] font-medium",
            dark
              ? "bg-white/[0.08] text-white/80"
              : a.audience
                ? "bg-forest/10 text-forest"
                : "bg-cream text-ink/70",
          ].join(" ")}
        >
          <svg width="15" height="15" {...svg}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          {a.audience ?? "All students"}
        </span>
        <button
          type="button"
          onClick={share}
          className={[
            "inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[13px] font-semibold active:scale-95 transition",
            dark ? "bg-lime text-ink" : "bg-ink text-white",
          ].join(" ")}
        >
          {copied ? (
            <svg width="15" height="15" {...svg}>
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg width="15" height="15" {...svg}>
              <path d="M12 3v12" />
              <path d="m7 8 5-5 5 5" />
              <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
            </svg>
          )}
          {copied ? "Copied" : "Share"}
        </button>
      </div>
    </motion.article>
  );
}
