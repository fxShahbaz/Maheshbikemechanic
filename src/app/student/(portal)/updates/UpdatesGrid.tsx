"use client";

import type { Announcement } from "@/lib/types";
import { ShowMoreButton, usePagination } from "@/components/pagination";

export type AnnouncementWithNew = Announcement & { isNew: boolean };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function UpdatesGrid({
  announcements,
}: {
  announcements: AnnouncementWithNew[];
}) {
  const { paged, remaining, showMore } = usePagination(announcements, 12);

  return (
    <>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {paged.map((a) => {
          const pinned = a.pinned;
          return (
            <article
              key={a.id}
              className={[
                "rounded-3xl p-6 flex flex-col transition-transform duration-200 hover:-translate-y-1",
                pinned
                  ? "bg-ink text-white shadow-[0_20px_40px_-20px_rgba(15,20,16,0.5)]"
                  : "bg-white border border-line hover:shadow-[0_16px_32px_-20px_rgba(15,20,16,0.35)]",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={[
                    "inline-flex items-center justify-center w-10 h-10 rounded-full shrink-0",
                    pinned ? "bg-lime text-ink" : "bg-cream text-forest",
                  ].join(" ")}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 11l18-5v12L3 14v-3z" />
                    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                  </svg>
                </span>
                <div className="flex items-center gap-1.5">
                  {a.isNew && (
                    <span
                      className={[
                        "text-[10px] uppercase tracking-wider font-semibold rounded-full px-2 py-0.5",
                        pinned ? "bg-white/15 text-lime" : "bg-lime text-ink",
                      ].join(" ")}
                    >
                      New
                    </span>
                  )}
                  <time
                    className={[
                      "text-[11px] rounded-full px-2.5 py-1 border",
                      pinned
                        ? "border-white/20 text-white/70"
                        : "border-line text-muted bg-cream/60",
                    ].join(" ")}
                  >
                    {formatDate(a.created_at)}
                  </time>
                </div>
              </div>

              <h2 className="font-display text-xl leading-snug mt-4">
                {a.title}
              </h2>
              {a.body && (
                <p
                  className={[
                    "text-sm mt-2 whitespace-pre-line leading-relaxed",
                    pinned ? "text-white/75" : "text-ink/70",
                  ].join(" ")}
                >
                  {a.body}
                </p>
              )}

              {pinned && (
                <div className="mt-auto pt-4">
                  <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-lime">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
                      <path d="M12 2 9.5 8.5 3 9.3l4.8 4.4L6.5 20 12 16.6 17.5 20l-1.3-6.3L21 9.3l-6.5-.8z" />
                    </svg>
                    Important
                  </span>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <ShowMoreButton remaining={remaining} onShowMore={showMore} />
    </>
  );
}
