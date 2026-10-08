import type { ReactNode } from "react";

/** Shared, native-app style building blocks for the student portal. */

/** Large-title page header, like iOS navigation large titles. */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <header className="pt-2 pb-1">
      {eyebrow && <p className="text-sm text-muted">{eyebrow}</p>}
      <h1 className="font-display text-[34px] leading-tight tracking-tight">
        {title}
      </h1>
      {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
    </header>
  );
}

/** Small uppercase label above a grouped list. */
export function SectionLabel({
  children,
  aside,
}: {
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="mt-7 mb-2 px-1 flex items-baseline justify-between gap-3">
      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted">
        {children}
      </h2>
      {aside && <span className="text-[13px] text-muted num-mono">{aside}</span>}
    </div>
  );
}

/** Inset grouped list container (rows separated by hairlines). */
export function Group({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-line overflow-hidden divide-y divide-line ${className}`}
    >
      {children}
    </div>
  );
}

/** Label / value row inside a Group. */
export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="px-4 py-3.5 flex items-start justify-between gap-4 text-[15px]">
      <span className="text-muted shrink-0">{label}</span>
      <span className="text-right min-w-0 break-words">{value}</span>
    </div>
  );
}

export function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className="text-ink/30 shrink-0" aria-hidden>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function EmptyState({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="mt-6 bg-white border border-line rounded-2xl px-6 py-12 text-center">
      <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-cream text-forest">
        {icon}
      </span>
      <p className="font-semibold mt-4">{title}</p>
      <p className="text-muted text-sm mt-1 max-w-xs mx-auto">{text}</p>
    </div>
  );
}

/** IST formatters — fixed timezone keeps server and client renders identical. */
const TZ = "Asia/Kolkata";

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    timeZone: TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDayHeading(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatPostTime(iso: string): string {
  return `${formatShortDate(iso)} · ${formatTime(iso)}`;
}
