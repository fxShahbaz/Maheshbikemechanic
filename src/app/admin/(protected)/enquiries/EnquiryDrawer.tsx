"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, useTransition } from "react";
import {
  deleteEnquiry,
  updateEnquiry,
} from "@/app/actions/enquiries";
import {
  ENQUIRY_SOURCES,
  ENQUIRY_STATUSES,
  formatStatus,
  type Enquiry,
  type EnquiryStatus,
} from "@/lib/types";

const STATUS_STYLES: Record<EnquiryStatus, string> = {
  new: "bg-lime/40 text-forest border-lime",
  contacted: "bg-amber-100 text-amber-900 border-amber-200",
  dormant: "bg-sky-100 text-sky-900 border-sky-200",
  enrolled: "bg-emerald-100 text-emerald-900 border-emerald-200",
  closed: "bg-zinc-100 text-zinc-700 border-zinc-200",
};

type Props = {
  enquiry: Enquiry | null;
  onClose: () => void;
};

export default function EnquiryDrawer({ enquiry, onClose }: Props) {
  const [draft, setDraft] = useState<Enquiry | null>(enquiry);
  const [saving, startSaving] = useTransition();
  const [deleting, startDeleting] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const [saved, setSaved] = useState(false);

  // Reset draft whenever a new enquiry is selected
  useEffect(() => {
    setDraft(enquiry);
    setError(undefined);
    setSaved(false);
  }, [enquiry]);

  // ESC to close
  useEffect(() => {
    if (!enquiry) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enquiry, onClose]);

  // Lock background scroll while open
  useEffect(() => {
    if (!enquiry) return;
    document.body.classList.add("no-scroll");
    document.documentElement.classList.add("no-scroll");
    window.__lenis?.stop();
    return () => {
      document.body.classList.remove("no-scroll");
      document.documentElement.classList.remove("no-scroll");
      window.__lenis?.start();
    };
  }, [enquiry]);

  function save() {
    if (!draft) return;
    setError(undefined);
    setSaved(false);
    startSaving(async () => {
      const result = await updateEnquiry(draft.id, {
        name: draft.name,
        phone: draft.phone,
        city: draft.city,
        interest: draft.interest,
        notes: draft.notes,
        status: draft.status,
        source: draft.source,
        reminder_date: draft.reminder_date,
      });
      if (result.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(result.error);
      }
    });
  }

  function doDelete() {
    if (!draft) return;
    if (!confirm("Delete this enquiry? This cannot be undone.")) return;
    startDeleting(async () => {
      try {
        await deleteEnquiry(draft.id);
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not delete.");
      }
    });
  }

  return (
    <AnimatePresence>
      {enquiry && draft && (
        <motion.div
          className="fixed inset-0 z-[80] flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-ink/45 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            className="relative ml-auto h-full w-full max-w-xl bg-white border-l border-line shadow-2xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-line">
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-wider text-muted">
                  Enquiry · {formatDate(enquiry.created_at)}
                </div>
                <h2 className="font-display text-2xl mt-1 truncate">
                  {draft.name || "Untitled"}
                </h2>
                <div className="text-sm text-muted mt-1 flex items-center gap-3">
                  <a
                    href={`tel:${draft.phone}`}
                    className="hover:text-ink"
                  >
                    {draft.phone}
                  </a>
                  <a
                    href={`https://wa.me/${draft.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:text-emerald-900 text-xs font-medium"
                  >
                    WhatsApp ↗
                  </a>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 w-9 h-9 rounded-full hover:bg-cream flex items-center justify-center text-ink/70 hover:text-ink transition"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div
              data-lenis-prevent
              className="flex-1 overflow-y-auto overscroll-contain px-6 py-6 space-y-5"
            >
              <Field label="Status">
                <select
                  value={draft.status}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      status: e.target.value as EnquiryStatus,
                    })
                  }
                  className={
                    "appearance-none cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium " +
                    STATUS_STYLES[draft.status]
                  }
                >
                  {ENQUIRY_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {formatStatus(s)}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full name">
                  <Input
                    value={draft.name}
                    onChange={(v) => setDraft({ ...draft, name: v })}
                  />
                </Field>
                <Field label="Phone">
                  <Input
                    value={draft.phone}
                    onChange={(v) => setDraft({ ...draft, phone: v })}
                  />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="City">
                  <Input
                    value={draft.city ?? ""}
                    onChange={(v) => setDraft({ ...draft, city: v || null })}
                    placeholder="—"
                  />
                </Field>
                <Field label="Interested in">
                  <Input
                    value={draft.interest ?? ""}
                    onChange={(v) =>
                      setDraft({ ...draft, interest: v || null })
                    }
                    placeholder="—"
                  />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Source">
                  <select
                    value={draft.source ?? ""}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        source: e.target.value || null,
                      })
                    }
                    className="w-full bg-white border border-line rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                  >
                    <option value="">—</option>
                    {ENQUIRY_SOURCES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Reminder date">
                  <input
                    type="date"
                    value={draft.reminder_date ?? ""}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        reminder_date: e.target.value || null,
                      })
                    }
                    className="w-full bg-white border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest"
                  />
                </Field>
              </div>

              <Field label="Notes">
                <textarea
                  value={draft.notes ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, notes: e.target.value || null })
                  }
                  rows={5}
                  placeholder="Call summary, follow-up date, etc."
                  className="w-full bg-white border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-forest"
                />
              </Field>

              <div className="text-xs text-muted space-y-1 pt-2 border-t border-line">
                <div>
                  <span className="uppercase tracking-wider">ID:</span>{" "}
                  <code className="text-[11px]">{enquiry.id}</code>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-line bg-cream/40 space-y-3">
              {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {error}
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={doDelete}
                  disabled={deleting || saving}
                  className="text-sm text-red-700 hover:text-red-900 disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
                <div className="flex items-center gap-3">
                  {saved && (
                    <span className="text-xs text-emerald-700">Saved ✓</span>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="ghost-btn !py-2 !px-4 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={save}
                    disabled={saving || deleting}
                    className="pill-btn text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-muted">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest"
    />
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
