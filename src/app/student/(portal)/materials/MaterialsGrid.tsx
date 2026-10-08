"use client";

import Link from "next/link";
import type { StudyMaterial } from "@/lib/types";
import { usePagination } from "@/components/pagination";
import { Chevron, formatShortDate, Group, SectionLabel } from "../_components/ui";

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
  const { paged, remaining, showMore } = usePagination(materials, 20);

  return (
    <>
      <SectionLabel aside={`${materials.length} ${materials.length === 1 ? "file" : "files"}`}>
        Documents
      </SectionLabel>
      <Group>
        {paged.map((m) => {
          const size = formatSize(m.file_size);
          return (
            <Link
              key={m.id}
              href={`/student/materials/${m.id}`}
              className="px-4 py-3.5 flex items-center gap-3 active:bg-cream transition-colors [-webkit-tap-highlight-color:transparent]"
            >
              <span className="shrink-0 relative inline-flex items-center justify-center w-11 h-11 rounded-xl bg-forest text-lime">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[15px] leading-snug line-clamp-2 break-words">
                  {m.title}
                </div>
                {m.description && (
                  <div className="text-[13px] text-muted truncate">
                    {m.description}
                  </div>
                )}
                <div className="text-xs text-muted mt-0.5">
                  PDF{size ? ` · ${size}` : ""} · {formatShortDate(m.created_at)}
                </div>
              </div>
              <Chevron />
            </Link>
          );
        })}
      </Group>

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
