"use client";

/** "All students" or a multi-select of batches. Empty selection = all. */
export function AudiencePicker({
  batches,
  value,
  onChange,
  disabled,
}: {
  batches: string[];
  value: string[] | null; // null = all students
  onChange: (next: string[] | null) => void;
  disabled?: boolean;
}) {
  const all = value === null;
  const selected = value ?? [];

  function toggle(b: string) {
    onChange(
      selected.includes(b)
        ? selected.filter((x) => x !== b)
        : [...selected, b]
    );
  }

  const chip = (active: boolean) =>
    [
      "px-3.5 py-1.5 rounded-full text-sm border transition disabled:opacity-60",
      active
        ? "bg-ink text-white border-ink"
        : "bg-white border-line hover:bg-cream",
    ].join(" ");

  return (
    <div>
      <div className="inline-flex p-1 rounded-full bg-cream border border-line">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(null)}
          className={[
            "px-4 py-1.5 rounded-full text-sm transition",
            all ? "bg-white shadow-sm font-medium" : "text-muted hover:text-ink",
          ].join(" ")}
        >
          All students
        </button>
        <button
          type="button"
          disabled={disabled || batches.length === 0}
          onClick={() => onChange(all ? [] : selected)}
          className={[
            "px-4 py-1.5 rounded-full text-sm transition disabled:opacity-50 disabled:cursor-not-allowed",
            !all ? "bg-white shadow-sm font-medium" : "text-muted hover:text-ink",
          ].join(" ")}
        >
          Specific batches
        </button>
      </div>

      {batches.length === 0 && (
        <p className="text-xs text-muted mt-2">
          No batches yet. Set a batch number on admissions to target them.
        </p>
      )}

      {!all && (
        <div className="mt-3">
          <div className="flex flex-wrap gap-2">
            {batches.map((b) => (
              <button
                key={b}
                type="button"
                disabled={disabled}
                onClick={() => toggle(b)}
                className={chip(selected.includes(b))}
              >
                Batch {b}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted mt-2">
            {selected.length === 0
              ? "Pick at least one batch."
              : `Visible only to ${selected.length} batch${
                  selected.length === 1 ? "" : "es"
                }.`}
          </p>
        </div>
      )}
    </div>
  );
}

export function AudienceBadge({ batches }: { batches: string[] }) {
  const all = batches.length === 0;
  const label = all
    ? "All students"
    : batches.length <= 2
      ? batches.map((b) => `Batch ${b}`).join(", ")
      : `${batches.length} batches`;
  return (
    <span
      title={all ? undefined : batches.map((b) => `Batch ${b}`).join(", ")}
      className={[
        "inline-flex items-center gap-1.5 text-[11px] rounded-full px-2.5 py-1 border",
        all
          ? "bg-cream/70 border-line text-ink/70"
          : "bg-forest/5 border-forest/20 text-forest",
      ].join(" ")}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
      {label}
    </span>
  );
}
