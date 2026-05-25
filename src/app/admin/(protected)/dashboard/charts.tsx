import type { ReactNode } from "react";

/* ----------------------------------------------------------------------------
 * Lightweight, dependency-free charts (server components — no client JS).
 * Sizing is done with inline styles; colours come from Tailwind theme classes.
 * Bars reveal with a CSS-only grow animation (see globals.css).
 * ------------------------------------------------------------------------- */

export function ChartCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="bg-white border border-line rounded-3xl p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg md:text-xl leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-muted mt-0.5">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="h-40 flex items-center justify-center text-sm text-muted">
      {label}
    </div>
  );
}

/* ---- Vertical column chart: trends over time --------------------------- */
const COLUMN_AREA_PX = 132; // tallest bar, leaving headroom for the value label

export function TrendColumns({
  data,
  format,
  highlightLast = true,
  emptyLabel = "No data yet.",
}: {
  data: { label: string; value: number }[];
  format?: (v: number) => string;
  highlightLast?: boolean;
  emptyLabel?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const allZero = data.every((d) => d.value === 0);
  if (data.length === 0 || allZero) return <EmptyState label={emptyLabel} />;

  return (
    <div>
      <div className="flex items-end gap-1.5 sm:gap-2" style={{ height: COLUMN_AREA_PX + 20 }}>
        {data.map((d, i) => {
          const isLast = highlightLast && i === data.length - 1;
          const h = d.value > 0 ? Math.max(Math.round((d.value / max) * COLUMN_AREA_PX), 3) : 0;
          return (
            <div
              key={i}
              className="group relative flex-1 h-full flex flex-col justify-end items-center"
            >
              <span className="mb-1 text-[10px] num-mono text-muted tabular-nums">
                {d.value > 0 ? (format ? format(d.value) : d.value) : ""}
              </span>
              <div
                className={`w-full rounded-t-md bar-grow-y ${
                  isLast ? "bg-lime" : "bg-forest"
                }`}
                style={{ height: h }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5 sm:gap-2">
        {data.map((d, i) => (
          <div
            key={i}
            className="flex-1 text-center text-[10px] text-muted truncate"
          >
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Funnel: stacked horizontal bars with conversion ------------------- */
export function Funnel({
  stages,
}: {
  stages: { label: string; value: number; colorClass: string }[];
}) {
  const top = stages[0]?.value ?? 0;
  if (top === 0) return <EmptyState label="No enquiries yet." />;

  return (
    <div className="space-y-4">
      {stages.map((s, i) => {
        const widthPct = top > 0 ? (s.value / top) * 100 : 0;
        const convPct = top > 0 ? Math.round((s.value / top) * 100) : 0;
        return (
          <div key={s.label}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-ink/80">{s.label}</span>
              <span className="num-mono tabular-nums">
                {s.value}
                {i > 0 && (
                  <span className="text-muted"> · {convPct}%</span>
                )}
              </span>
            </div>
            <div className="h-3 rounded-full bg-cream overflow-hidden">
              <div
                className={`h-full rounded-full bar-grow-x ${s.colorClass}`}
                style={{ width: `${Math.max(widthPct, s.value > 0 ? 4 : 0)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---- Ranked horizontal bars: by source / interest --------------------- */
export function BarList({
  data,
  emptyLabel = "No data yet.",
}: {
  data: { label: string; value: number }[];
  emptyLabel?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  if (data.length === 0) return <EmptyState label={emptyLabel} />;

  return (
    <div className="space-y-3.5">
      {data.map((d) => (
        <div key={d.label}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="truncate capitalize text-ink/80">{d.label}</span>
            <span className="num-mono tabular-nums text-muted">{d.value}</span>
          </div>
          <div className="h-2 rounded-full bg-cream overflow-hidden">
            <div
              className="h-full rounded-full bg-forest bar-grow-x"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
