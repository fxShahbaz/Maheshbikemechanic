"use client";

import Link from "next/link";
import type { StudyMaterial } from "@/lib/types";
import { ShowMoreButton, usePagination } from "@/components/pagination";

function formatSize(bytes: number | null): string | null {
  if (bytes == null) return null;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MaterialsGrid({
  materials,
}: {
  materials: StudyMaterial[];
}) {
  const { paged, remaining, showMore } = usePagination(materials, 12);

  return (
    <>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {paged.map((m) => {
          const size = formatSize(m.file_size);
          return (
            <Link
              key={m.id}
              href={`/student/materials/${m.id}`}
              className="group bg-white border border-line rounded-3xl p-6 flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_32px_-20px_rgba(15,20,16,0.35)] hover:border-forest/30"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-forest text-lime shrink-0 group-hover:bg-ink transition">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </span>
                {size && (
                  <span className="text-[11px] rounded-full px-2.5 py-1 border border-line text-muted bg-cream/60">
                    {size}
                  </span>
                )}
              </div>

              <h2 className="font-display text-lg leading-snug mt-4">
                {m.title}
              </h2>
              {m.description && (
                <p className="text-sm text-ink/70 mt-1.5 line-clamp-2">
                  {m.description}
                </p>
              )}

              <div className="mt-auto pt-4 flex items-center gap-1.5 text-sm font-medium text-forest">
                <span>Open</span>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform duration-200 group-hover:translate-x-1"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>

      <ShowMoreButton remaining={remaining} onShowMore={showMore} />
    </>
  );
}
