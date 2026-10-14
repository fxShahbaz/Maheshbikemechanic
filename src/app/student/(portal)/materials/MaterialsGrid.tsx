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

const OTHER = "Other";

/** Categories A–Z with uncategorised files last; newest first within each. */
function byCategory(materials: StudyMaterial[]): StudyMaterial[] {
  const key = (m: StudyMaterial) => m.category?.trim() || "";
  return [...materials].sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    if (ka === kb) return 0; // stable sort keeps the newest-first order
    if (!ka) return 1;
    if (!kb) return -1;
    return ka.localeCompare(kb, undefined, { numeric: true });
  });
}

function groupRows(rows: StudyMaterial[]): [string, StudyMaterial[]][] {
  const groups = new Map<string, StudyMaterial[]>();
  for (const m of rows) {
    const label = m.category?.trim() || OTHER;
    groups.set(label, [...(groups.get(label) ?? []), m]);
  }
  return [...groups];
}

export default function MaterialsGrid({
  materials,
}: {
  materials: StudyMaterial[];
}) {
  const sorted = byCategory(materials);
  const { paged, remaining, showMore } = usePagination(sorted, 20);
  const categorised = materials.some((m) => m.category?.trim());
  const groups = categorised
    ? groupRows(paged)
    : [["Documents", paged] as [string, StudyMaterial[]]];
  const countIn = (label: string) =>
    categorised
      ? materials.filter((m) => (m.category?.trim() || OTHER) === label).length
      : materials.length;

  return (
    <>
      {groups.map(([label, rows]) => {
        const count = countIn(label);
        return (
          <div key={label}>
            <SectionLabel aside={`${count} ${count === 1 ? "file" : "files"}`}>
              {label}
            </SectionLabel>
            <Group>
              {rows.map((m) => {
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
          </div>
        );
      })}

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
