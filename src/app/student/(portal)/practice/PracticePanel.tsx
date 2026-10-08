"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { punchIn, punchOut } from "@/app/actions/practice";
import { formatDuration } from "@/lib/types";
import type { PracticeSession } from "@/lib/types";
import {
  formatDayHeading,
  formatTime,
  Group,
  SectionLabel,
} from "../_components/ui";

/** Live h:mm:ss clock for the open session. */
function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function sessionMs(s: PracticeSession): number {
  return (
    new Date(s.punched_out_at!).getTime() - new Date(s.punched_in_at).getTime()
  );
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

/** Group completed sessions by calendar day (IST), newest first. */
function groupByDay(
  sessions: PracticeSession[]
): { day: string; totalMs: number; items: PracticeSession[] }[] {
  const groups: { day: string; totalMs: number; items: PracticeSession[] }[] =
    [];
  for (const s of sessions) {
    const day = formatDayHeading(s.punched_in_at);
    const last = groups[groups.length - 1];
    if (last && last.day === day) {
      last.items.push(s);
      last.totalMs += sessionMs(s);
    } else {
      groups.push({ day, totalMs: sessionMs(s), items: [s] });
    }
  }
  return groups;
}

const WrenchIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(15);

  const openSession = sessions.find((s) => s.punched_out_at == null) ?? null;
  const completed = sessions.filter((s) => s.punched_out_at != null);

  const totalMs = useMemo(
    () => completed.reduce((sum, s) => sum + sessionMs(s), 0),
    [completed]
  );
  const avgMs = completed.length ? totalMs / completed.length : 0;
  const days = useMemo(
    () => groupByDay(completed.slice(0, visibleCount)),
    [completed, visibleCount]
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
        setSheetOpen(false);
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
      {/* Hero: current state + primary action */}
      {openSession ? (
        <section className="mt-4 bg-ink text-white rounded-3xl p-5">
          <div className="flex items-center gap-2 text-lime text-[13px] font-medium">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-lime" />
            </span>
            Practice in progress
          </div>

          <div className="text-center py-6">
            <div className="font-display num-mono text-[56px] leading-none tracking-tight">
              {now === null
                ? "–:––:––"
                : formatClock(
                    now - new Date(openSession.punched_in_at).getTime()
                  )}
            </div>
            <div className="mt-3 font-semibold text-lg">{openSession.engine}</div>
            <div className="text-white/60 text-sm mt-0.5">
              Started at {formatTime(openSession.punched_in_at)}
            </div>
            {openSession.notes && (
              <p className="text-white/70 text-sm mt-2">{openSession.notes}</p>
            )}
          </div>

          <button
            type="button"
            disabled={pending}
            onClick={() => handlePunchOut(openSession.id)}
            className="w-full h-14 rounded-2xl bg-lime text-ink font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            {pending ? "Punching out…" : "Punch out"}
          </button>
        </section>
      ) : (
        <section className="mt-4 bg-white border border-line rounded-3xl p-5">
          <div className="flex items-center gap-3">
            <span className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-lime text-ink">
              <WrenchIcon size={22} />
            </span>
            <div className="min-w-0">
              <h2 className="font-semibold text-[17px]">Ready to practice?</h2>
              <p className="text-muted text-sm">
                Punch in when you start on an engine.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setError(undefined);
              setSheetOpen(true);
            }}
            className="mt-5 w-full h-14 rounded-2xl bg-ink text-white font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z" />
            </svg>
            Punch in
          </button>
        </section>
      )}

      {error && !sheetOpen && <ErrorBanner message={error} />}

      {/* Stats */}
      <div className="mt-4 bg-white border border-line rounded-2xl grid grid-cols-3 divide-x divide-line">
        <Stat label="Sessions" value={String(completed.length)} />
        <Stat label="Total time" value={formatDuration(totalMs)} />
        <Stat label="Avg session" value={formatDuration(avgMs)} />
      </div>

      {/* History */}
      {completed.length === 0 ? (
        <>
          <SectionLabel>History</SectionLabel>
          <div className="bg-white border border-line rounded-2xl px-6 py-10 text-center">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cream text-forest">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
            <p className="font-semibold mt-3">No sessions yet</p>
            <p className="text-muted text-sm mt-1">
              Your completed practice sessions will show up here.
            </p>
          </div>
        </>
      ) : (
        <>
          {days.map((d) => (
            <div key={d.day}>
              <SectionLabel aside={formatDuration(d.totalMs)}>{d.day}</SectionLabel>
              <Group>
                {d.items.map((s) => (
                  <div key={s.id} className="px-4 py-3 flex items-center gap-3">
                    <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-xl bg-cream text-forest">
                      <WrenchIcon size={16} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[15px] truncate">
                        {s.engine}
                      </div>
                      <div className="text-[13px] text-muted truncate">
                        {formatTime(s.punched_in_at)} – {formatTime(s.punched_out_at!)}
                        {s.notes ? ` · ${s.notes}` : ""}
                      </div>
                    </div>
                    <span className="num-mono text-[15px] font-semibold shrink-0">
                      {formatDuration(sessionMs(s))}
                    </span>
                  </div>
                ))}
              </Group>
            </div>
          ))}
          {completed.length > visibleCount && (
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + 15)}
              className="mt-4 w-full h-12 rounded-2xl bg-white border border-line text-[15px] font-medium text-forest active:bg-cream transition"
            >
              Show more ({completed.length - visibleCount} left)
            </button>
          )}
        </>
      )}

      <PunchInSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        engines={engines}
        pending={pending}
        error={error}
        onSubmit={handlePunchIn}
      />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-3.5 text-center">
      <div className="font-display num-mono text-xl leading-tight">{value}</div>
      <div className="text-xs text-muted mt-0.5">{label}</div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
      {message}
    </div>
  );
}

/** Bottom sheet for starting a session: tap an engine, add notes, punch in. */
function PunchInSheet({
  open,
  onClose,
  engines,
  pending,
  error,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  engines: EngineOption[];
  pending: boolean;
  error?: string;
  onSubmit: (formData: FormData) => void;
}) {
  const [engine, setEngine] = useState("");

  // Lock background scroll while the sheet is up.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.classList.add("no-scroll");
    document.body.classList.add("no-scroll");
    window.__lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      root.classList.remove("no-scroll");
      document.body.classList.remove("no-scroll");
      window.__lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const hasList = engines.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Start practice">
          <motion.div
            className="absolute inset-0 bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.form
            action={onSubmit}
            className="absolute inset-x-0 bottom-0 max-w-lg mx-auto bg-cream rounded-t-[28px] flex flex-col max-h-[88dvh] shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.4)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 360 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
          >
            {/* Grab handle + title */}
            <div className="pt-2.5 pb-3 px-5 cursor-grab active:cursor-grabbing">
              <div className="mx-auto w-10 h-1.5 rounded-full bg-ink/15" />
              <div className="mt-3 flex items-center justify-between">
                <h2 className="font-semibold text-lg">Start practice</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center text-ink/60 active:bg-ink/10"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div
              className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4"
              data-lenis-prevent
              onPointerDownCapture={(e) => e.stopPropagation()}
            >
              {hasList ? (
                <>
                  <input type="hidden" name="engine" value={engine} />
                  {groupByBrand(engines).map(([brand, names]) => (
                    <div key={brand}>
                      <SectionLabel>{brand}</SectionLabel>
                      <Group>
                        {names.map((name) => {
                          const selected = engine === name;
                          return (
                            <button
                              key={name}
                              type="button"
                              onClick={() => setEngine(name)}
                              aria-pressed={selected}
                              className="w-full px-4 py-3.5 flex items-center gap-3 text-left text-[15px] active:bg-cream transition-colors"
                            >
                              <span className="flex-1 min-w-0 truncate">{name}</span>
                              <span
                                className={[
                                  "w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition",
                                  selected ? "bg-forest text-lime" : "border-2 border-line",
                                ].join(" ")}
                              >
                                {selected && (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                    <path d="M20 6 9 17l-5-5" />
                                  </svg>
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </Group>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <SectionLabel>Engine</SectionLabel>
                  <input
                    name="engine"
                    type="text"
                    required
                    value={engine}
                    onChange={(e) => setEngine(e.target.value)}
                    className="w-full bg-white border border-line rounded-2xl px-4 h-12 text-base focus:outline-none focus:border-forest"
                    placeholder="e.g. Splendor engine #4"
                  />
                </>
              )}

              <SectionLabel>Notes (optional)</SectionLabel>
              <input
                name="notes"
                type="text"
                className="w-full bg-white border border-line rounded-2xl px-4 h-12 text-base focus:outline-none focus:border-forest"
                placeholder="What are you working on?"
              />

              {error && <ErrorBanner message={error} />}
            </div>

            <div className="px-5 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-line bg-cream">
              <button
                type="submit"
                disabled={pending || !engine.trim()}
                className="w-full h-14 rounded-2xl bg-ink text-white font-semibold text-base active:scale-[0.98] transition disabled:opacity-40"
              >
                {pending
                  ? "Punching in…"
                  : engine
                    ? `Punch in · ${engine}`
                    : "Select an engine"}
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
}
