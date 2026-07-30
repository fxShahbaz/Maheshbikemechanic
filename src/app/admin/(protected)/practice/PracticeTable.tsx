"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminPunchOut } from "@/app/actions/practice";
import { formatDuration } from "@/lib/types";
import type { PracticeSessionWithStudent } from "@/lib/types";
import { ShowMoreButton, usePagination } from "@/components/pagination";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PracticeTable({
  sessions,
}: {
  sessions: PracticeSessionWithStudent[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [search, setSearch] = useState("");
  const [openOnly, setOpenOnly] = useState(false);
  const [now] = useState(() => Date.now());

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = sessions.filter((s) => {
      if (openOnly && s.punched_out_at != null) return false;
      if (!q) return true;
      return (
        s.engine.toLowerCase().includes(q) ||
        (s.student?.name ?? "").toLowerCase().includes(q) ||
        (s.student?.email ?? "").toLowerCase().includes(q)
      );
    });
    // Open sessions bubble to the top, newest first inside each group
    return [...filtered].sort((a, b) => {
      const aOpen = a.punched_out_at == null ? 0 : 1;
      const bOpen = b.punched_out_at == null ? 0 : 1;
      if (aOpen !== bOpen) return aOpen - bOpen;
      return b.punched_in_at.localeCompare(a.punched_in_at);
    });
  }, [sessions, search, openOnly]);

  const { paged, remaining, showMore } = usePagination(
    rows,
    20,
    `${search}|${openOnly}`
  );

  function handlePunchOut(id: string) {
    setError(undefined);
    startTransition(async () => {
      const result = await adminPunchOut(id);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <>
      <div className="mt-6 md:mt-8 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <button
          type="button"
          onClick={() => setOpenOnly((v) => !v)}
          className={[
            "self-start px-4 py-1.5 rounded-full text-sm border transition",
            openOnly
              ? "bg-ink text-white border-ink"
              : "bg-white border-line text-ink/80 hover:bg-cream",
          ].join(" ")}
        >
          Open only
        </button>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search student or engine…"
          className="w-full md:w-64 bg-white border border-line rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-forest"
        />
      </div>

      {error && (
        <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="mt-5 bg-white border border-line rounded-2xl md:rounded-3xl overflow-hidden">
        {rows.length === 0 ? (
          <p className="text-muted text-sm px-5 py-8 text-center">
            No practice sessions yet.
          </p>
        ) : (
          paged.map((s) => {
            const isOpen = s.punched_out_at == null;
            return (
              <div
                key={s.id}
                className={[
                  "px-5 py-4 border-b border-line last:border-0 flex flex-col md:flex-row md:items-center gap-3",
                  isOpen ? "bg-lime/15" : "",
                ].join(" ")}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {s.student?.name ?? "Deleted account"}
                    </span>
                    {isOpen && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider bg-lime text-ink rounded-full px-2 py-0.5">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ink opacity-60" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-ink" />
                        </span>
                        Open
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted mt-0.5 truncate">
                    {s.engine} · in {formatDateTime(s.punched_in_at)}
                    {s.punched_out_at
                      ? ` · out ${formatDateTime(s.punched_out_at)}`
                      : ""}
                    {s.notes ? ` · ${s.notes}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="num-mono text-sm">
                    {formatDuration(
                      (s.punched_out_at
                        ? new Date(s.punched_out_at).getTime()
                        : now) - new Date(s.punched_in_at).getTime()
                    )}
                  </span>
                  {isOpen && (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handlePunchOut(s.id)}
                      className="px-4 py-1.5 rounded-full text-sm border border-line hover:bg-cream transition disabled:opacity-60"
                    >
                      {pending ? "Closing…" : "Punch out"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <ShowMoreButton remaining={remaining} onShowMore={showMore} />
    </>
  );
}
