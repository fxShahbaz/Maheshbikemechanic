"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createEnquiry } from "@/app/actions/enquiries";
import {
  ENQUIRY_SOURCES,
  ENQUIRY_STATUSES,
  type EnquiryStatus,
} from "@/lib/types";

type Draft = {
  name: string;
  phone: string;
  city: string;
  interest: string;
  source: string;
  status: EnquiryStatus;
  reminder_date: string;
  notes: string;
};

function todayIso(): string {
  // Local-timezone YYYY-MM-DD (avoids UTC drift from toISOString)
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function emptyDraft(): Draft {
  return {
    name: "",
    phone: "",
    city: "",
    interest: "4-month Complete Course",
    source: "admin",
    status: "new",
    reminder_date: todayIso(),
    notes: "",
  };
}

export default function NewEnquiryDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  // Reset draft when dialog opens (recomputes "today" each time)
  useEffect(() => {
    if (open) {
      setDraft(emptyDraft());
      setError(undefined);
    }
  }, [open]);

  // ESC + scroll lock
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.classList.add("no-scroll");
    document.documentElement.classList.add("no-scroll");
    window.__lenis?.stop();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("no-scroll");
      document.documentElement.classList.remove("no-scroll");
      window.__lenis?.start();
    };
  }, [open, onClose]);

  function submit() {
    setError(undefined);
    startTransition(async () => {
      const result = await createEnquiry({
        name: draft.name,
        phone: draft.phone,
        city: draft.city || undefined,
        interest: draft.interest || undefined,
        source: draft.source || undefined,
        status: draft.status,
        reminder_date: draft.reminder_date || null,
        notes: draft.notes || undefined,
      });
      if (result.ok) {
        router.refresh();
        onClose();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end md:items-center justify-center p-0 md:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          aria-modal="true"
          role="dialog"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-ink/55 backdrop-blur-sm" />
          <motion.div
            data-lenis-prevent
            className="relative bg-white border border-line rounded-t-3xl md:rounded-3xl w-full max-w-xl shadow-2xl max-h-[92vh] overflow-y-auto overscroll-contain"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-6 pb-3 sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-line">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted">
                  Admin
                </div>
                <h2 className="font-display text-2xl mt-1">New enquiry</h2>
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

            <div className="px-6 pt-5 pb-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full name *">
                  <Input
                    value={draft.name}
                    onChange={(v) => setDraft({ ...draft, name: v })}
                    placeholder="Customer name"
                  />
                </Field>
                <Field label="Phone *">
                  <div className="flex items-stretch bg-white border border-line rounded-xl overflow-hidden focus-within:border-forest">
                    <span className="inline-flex items-center pl-3 pr-2 text-sm text-muted bg-cream/60 border-r border-line select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={draft.phone}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                        })
                      }
                      placeholder="9876543210"
                      maxLength={10}
                      className="flex-1 bg-transparent py-2.5 px-3 text-sm focus:outline-none num-mono"
                    />
                  </div>
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="City">
                  <Input
                    value={draft.city}
                    onChange={(v) => setDraft({ ...draft, city: v })}
                    placeholder="e.g. Patna"
                  />
                </Field>
                <Field label="Interested in">
                  <select
                    value={draft.interest}
                    onChange={(e) =>
                      setDraft({ ...draft, interest: e.target.value })
                    }
                    className="w-full bg-white border border-line rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                  >
                    <option>4-month Complete Course</option>
                    <option>BS6 Technology only</option>
                    <option>EV Training only</option>
                    <option>Wiring Training</option>
                    <option>Custom</option>
                  </select>
                </Field>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Source">
                  <select
                    value={draft.source}
                    onChange={(e) =>
                      setDraft({ ...draft, source: e.target.value })
                    }
                    className="w-full bg-white border border-line rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                  >
                    {ENQUIRY_SOURCES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Status">
                  <select
                    value={draft.status}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        status: e.target.value as EnquiryStatus,
                      })
                    }
                    className="w-full bg-white border border-line rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                  >
                    {ENQUIRY_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Reminder date">
                  <input
                    type="date"
                    value={draft.reminder_date}
                    onChange={(e) =>
                      setDraft({ ...draft, reminder_date: e.target.value })
                    }
                    className="w-full bg-white border border-line rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                  />
                </Field>
              </div>

              <Field label="Notes">
                <textarea
                  value={draft.notes}
                  onChange={(e) =>
                    setDraft({ ...draft, notes: e.target.value })
                  }
                  rows={3}
                  placeholder="Call summary, follow-up details..."
                  className="w-full bg-white border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-forest"
                />
              </Field>

              {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={pending}
                  className="ghost-btn !py-2 !px-4 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={pending}
                  className="pill-btn text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {pending ? "Creating..." : "Create enquiry"}
                </button>
              </div>
            </div>
          </motion.div>
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
