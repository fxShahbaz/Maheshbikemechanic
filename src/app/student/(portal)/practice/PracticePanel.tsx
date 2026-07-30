"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { punchIn, punchOut } from "@/app/actions/practice";
import { formatDuration } from "@/lib/types";
import type { PracticeSession } from "@/lib/types";

const inputClass =
  "mt-1 w-full bg-white border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-forest";

/** Live h:mm:ss clock for the open session. */
function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

type EngineOption = { name: string; brand: string | null };

/** Group engines by brand, preserving the admin-defined order. */
function groupByBrand(engines: EngineOption[]): [string, string[]][] {
  const groups: [string, string[]][] = [];
  for (const e of engines) {
    const brand = e.brand ?? "Other";
    const last = groups[groups.length - 1];
    if (last && last[0] === brand) last[1].push(e.name);
    else groups.push([brand, [e.name]]);
  }
  return groups;
}

export default function PracticePanel({
  sessions,
  engines,
}: {
  sessions: PracticeSession[];
  engines: EngineOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [showForm, setShowForm] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  const openSession = sessions.find((s) => s.punched_out_at == null) ?? null;
  const completed = sessions.filter((s) => s.punched_out_at != null);

  const totalMs = useMemo(
    () =>
      completed.reduce(
        (sum, s) =>
          sum +
          (new Date(s.punched_out_at!).getTime() -
            new Date(s.punched_in_at).getTime()),
        0
      ),
    [completed]
  );

  // Live elapsed timer for the open session. Starts as null so the
  // server-rendered HTML matches on hydration; first tick lands on mount.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!openSession) return;
    const firstTick = setTimeout(() => setNow(Date.now()), 0);
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(firstTick);
      clearInterval(id);
    };
  }, [openSession]);

  function handlePunchIn(formData: FormData) {
    setError(undefined);
    startTransition(async () => {
      const result = await punchIn(formData);
      if (!result.ok) setError(result.error);
      else {
        setShowForm(false);
        router.refresh();
      }
    });
  }

  function handlePunchOut(id: string) {
    setError(undefined);
    startTransition(async () => {
      const result = await punchOut(id);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <>
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat
          label="Sessions"
          value={String(completed.length)}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          }
        />
        <Stat
          label="Practice time"
          value={formatDuration(totalMs)}
          accent="lime"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <Stat
          label="Status"
          value={openSession ? "Open" : "Idle"}
          accent={openSession ? "dark" : undefined}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          }
        />
      </div>

      {openSession ? (
        <div className="mt-6 bg-ink text-white rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-2 text-lime text-xs uppercase tracking-wider">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-lime" />
            </span>
            Session open
          </div>
          <div className="font-display text-2xl md:text-3xl mt-3">
            {openSession.engine}
          </div>
          <div className="text-white/60 text-sm mt-1">
            Punched in {formatDateTime(openSession.punched_in_at)}
          </div>
          <div className="font-display num-mono text-4xl md:text-5xl mt-5">
            {now === null
              ? "–:––:––"
              : formatClock(now - new Date(openSession.punched_in_at).getTime())}
          </div>
          {openSession.notes && (
            <p className="text-white/70 text-sm mt-3">{openSession.notes}</p>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() => handlePunchOut(openSession.id)}
            className="mt-6 inline-flex items-center gap-2 bg-lime text-ink font-medium rounded-full px-6 py-3 text-sm hover:bg-lime-dk transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending ? "Punching out..." : "Punch out"}
          </button>
        </div>
      ) : showForm ? (
        <form
          action={handlePunchIn}
          className="mt-6 bg-white border border-line rounded-3xl p-6 md:p-8"
        >
          <h2 className="font-display text-xl">Start a practice session</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm">Engine</label>
              {engines.length > 0 ? (
                <select
                  name="engine"
                  required
                  autoFocus
                  defaultValue=""
                  className={inputClass}
                >
                  <option value="" disabled>
                    Select an engine…
                  </option>
                  {groupByBrand(engines).map(([brand, names]) => (
                    <optgroup key={brand} label={brand}>
                      {names.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              ) : (
                <input
                  name="engine"
                  type="text"
                  required
                  autoFocus
                  className={inputClass}
                  placeholder="e.g. Splendor engine #4"
                />
              )}
            </div>
            <div>
              <label className="text-sm">Notes (optional)</label>
              <input
                name="notes"
                type="text"
                className={inputClass}
                placeholder="What are you working on?"
              />
            </div>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="pill-btn disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pending ? "Punching in..." : "Punch in"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-full text-sm border border-line hover:bg-cream transition"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-6 bg-white border border-line rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 flex items-center gap-4">
            <span className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-full bg-lime">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f1410" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </span>
            <div>
              <h2 className="font-display text-xl">Engine practice</h2>
              <p className="text-muted text-sm mt-1">
                Working on an engine? Punch in to start logging your session.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setError(undefined);
              setShowForm(true);
            }}
            className="pill-btn self-start md:self-auto"
          >
            Start engine practice
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="mt-8">
        <h2 className="font-display text-xl">History</h2>
        {completed.length === 0 ? (
          <p className="text-muted text-sm mt-3">
            No completed sessions yet. Your practice log will appear here.
          </p>
        ) : (
          <>
            <div className="mt-3 bg-white border border-line rounded-2xl md:rounded-3xl overflow-hidden">
              {completed.slice(0, visibleCount).map((s) => (
                <div
                  key={s.id}
                  className="px-5 py-4 border-b border-line last:border-0 flex items-center gap-4 hover:bg-cream/50 transition"
                >
                  <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-xl bg-cream text-forest">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{s.engine}</div>
                    <div className="text-xs text-muted mt-0.5">
                      {formatDateTime(s.punched_in_at)} →{" "}
                      {formatDateTime(s.punched_out_at!)}
                      {s.notes ? ` · ${s.notes}` : ""}
                    </div>
                  </div>
                  <span className="num-mono text-xs shrink-0 rounded-full px-2.5 py-1 bg-cream border border-line">
                    {formatDuration(
                      new Date(s.punched_out_at!).getTime() -
                        new Date(s.punched_in_at).getTime()
                    )}
                  </span>
                </div>
              ))}
            </div>
            {completed.length > visibleCount && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((c) => c + 10)}
                  className="px-5 py-2.5 rounded-full text-sm border border-line bg-white hover:bg-cream transition"
                >
                  Show more ({completed.length - visibleCount} left)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string;
  accent?: "lime" | "dark";
  icon?: React.ReactNode;
}) {
  const accentClasses =
    accent === "dark"
      ? "bg-ink text-white border-ink"
      : accent === "lime"
        ? "bg-lime border-lime text-ink"
        : "bg-white border-line text-ink";
  const labelClass = accent === "dark" ? "text-white/60" : "text-muted";
  const iconClass =
    accent === "dark"
      ? "text-lime"
      : accent === "lime"
        ? "text-ink/60"
        : "text-forest";

  return (
    <div
      className={`rounded-2xl border px-4 py-3.5 transition-transform duration-200 hover:-translate-y-0.5 ${accentClasses}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className={`text-[10px] uppercase tracking-wider ${labelClass}`}>
          {label}
        </div>
        {icon && <span className={iconClass}>{icon}</span>}
      </div>
      <div className="font-display num-mono text-lg md:text-xl leading-tight mt-1">
        {value}
      </div>
    </div>
  );
}
