"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAdmission } from "@/app/actions/admissions";
import {
  getEnquirySuggestions,
  type EnquirySuggestion,
} from "@/app/actions/enquiries";
import { FAMILY_RELATIONS } from "@/lib/types";

type Draft = {
  name: string;
  phone: string;
  email: string;
  age: string;
  address: string;
  aadhar_no: string;
  family_name: string;
  family_relation: string;
  family_phone: string;
  batch_no: string;
  notes: string;
  total_fee: string;
};

const EMPTY: Draft = {
  name: "",
  phone: "",
  email: "",
  age: "",
  address: "",
  aadhar_no: "",
  family_name: "",
  family_relation: "",
  family_phone: "",
  batch_no: "",
  notes: "",
  total_fee: "40000",
};

export default function NewAdmissionDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const [suggestions, setSuggestions] = useState<EnquirySuggestion[]>([]);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [linkedEnquiryId, setLinkedEnquiryId] = useState<string | null>(null);
  const phoneWrapRef = useRef<HTMLDivElement>(null);

  // Load suggestions when dialog opens
  useEffect(() => {
    if (!open) return;
    setDraft(EMPTY);
    setError(undefined);
    setLinkedEnquiryId(null);
    getEnquirySuggestions().then(setSuggestions).catch(() => setSuggestions([]));
  }, [open]);

  // Close suggestion dropdown when clicking outside
  useEffect(() => {
    if (!phoneFocused) return;
    function onClick(e: MouseEvent) {
      if (!phoneWrapRef.current?.contains(e.target as Node)) {
        setPhoneFocused(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [phoneFocused]);

  // Match suggestions whose phone last-10-digits contain the input digits
  const phoneMatches =
    draft.phone.length >= 2
      ? suggestions
          .filter((s) => {
            const candidate = s.phone.replace(/\D/g, "").slice(-10);
            return candidate.includes(draft.phone);
          })
          .slice(0, 6)
      : [];

  function applySuggestion(s: EnquirySuggestion) {
    setLinkedEnquiryId(s.id);
    setPhoneFocused(false);
    setDraft((d) => ({
      ...d,
      // Only overwrite empty fields — preserve anything the user already typed
      name: d.name || s.name,
      phone: s.phone.replace(/\D/g, "").slice(-10),
      address: d.address || s.city || "",
      notes:
        d.notes ||
        [s.interest, s.notes].filter(Boolean).join(" · "),
    }));
  }

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
      const result = await createAdmission({
        name: draft.name,
        phone: draft.phone,
        email: draft.email || null,
        age: draft.age ? Number(draft.age) : null,
        address: draft.address || null,
        aadhar_no: draft.aadhar_no || null,
        family_name: draft.family_name || null,
        family_relation: draft.family_relation || null,
        family_phone: draft.family_phone || null,
        batch_no: draft.batch_no || null,
        notes: draft.notes || null,
        total_fee: draft.total_fee ? Number(draft.total_fee) : null,
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
            className="relative bg-white border border-line rounded-t-3xl md:rounded-3xl w-full max-w-2xl shadow-2xl max-h-[92vh] overflow-y-auto overscroll-contain"
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
                <h2 className="font-display text-2xl mt-1">New admission</h2>
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

            <div className="px-6 pt-5 pb-6 space-y-6">
              <Section title="Personal">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Phone *">
                    <div ref={phoneWrapRef} className="relative">
                      <div className="flex items-stretch bg-white border border-line rounded-xl overflow-hidden focus-within:border-forest">
                        <span className="inline-flex items-center pl-3 pr-2 text-sm text-muted bg-cream/60 border-r border-line select-none">
                          +91
                        </span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          value={draft.phone}
                          onFocus={() => setPhoneFocused(true)}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                            setDraft((d) => ({ ...d, phone: v }));
                            setLinkedEnquiryId(null);
                            setPhoneFocused(true);
                          }}
                          placeholder="9876543210"
                          maxLength={10}
                          className="flex-1 bg-transparent py-2.5 px-3 text-sm focus:outline-none num-mono"
                        />
                      </div>
                      {linkedEnquiryId && (
                        <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-emerald-800">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                          Filled from existing enquiry
                        </div>
                      )}
                      {phoneFocused && phoneMatches.length > 0 && !linkedEnquiryId && (
                        <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-line rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                          <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-muted bg-cream/60 border-b border-line">
                            Existing enquiries
                          </div>
                          {phoneMatches.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => applySuggestion(s)}
                              className="w-full text-left px-3 py-2 hover:bg-cream transition border-b border-line last:border-0"
                            >
                              <div className="flex items-baseline justify-between gap-2">
                                <span className="font-medium text-sm">
                                  {s.name}
                                </span>
                                <span className="text-xs text-muted num-mono">
                                  {s.phone}
                                </span>
                              </div>
                              {(s.city || s.interest) && (
                                <div className="text-xs text-muted mt-0.5 truncate">
                                  {[s.city, s.interest].filter(Boolean).join(" · ")}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </Field>
                  <Field label="Full name *">
                    <Input
                      value={draft.name}
                      onChange={(v) => setDraft({ ...draft, name: v })}
                      placeholder="Student name"
                    />
                  </Field>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Email">
                    <Input
                      type="email"
                      value={draft.email}
                      onChange={(v) => setDraft({ ...draft, email: v })}
                      placeholder="student@example.com"
                    />
                  </Field>
                  <Field label="Age">
                    <Input
                      type="number"
                      value={draft.age}
                      onChange={(v) =>
                        setDraft({
                          ...draft,
                          age: v.replace(/\D/g, "").slice(0, 3),
                        })
                      }
                      placeholder="—"
                    />
                  </Field>
                </div>
                <Field label="Address">
                  <textarea
                    value={draft.address}
                    onChange={(e) =>
                      setDraft({ ...draft, address: e.target.value })
                    }
                    rows={2}
                    placeholder="House / street / city / state / pincode"
                    className="w-full bg-white border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest"
                  />
                </Field>
                <Field label="Aadhar Card no.">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={draft.aadhar_no}
                    onChange={(e) => {
                      const digits = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 12);
                      const formatted = digits.replace(
                        /(\d{4})(\d{0,4})(\d{0,4})/,
                        (_, a, b, c) =>
                          [a, b, c].filter(Boolean).join(" ")
                      );
                      setDraft({ ...draft, aadhar_no: formatted });
                    }}
                    placeholder="XXXX XXXX XXXX"
                    className="w-full bg-white border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest num-mono"
                  />
                </Field>
              </Section>

              <Section title="Family contact">
                <div className="grid sm:grid-cols-3 gap-4">
                  <Field label="Name">
                    <Input
                      value={draft.family_name}
                      onChange={(v) =>
                        setDraft({ ...draft, family_name: v })
                      }
                      placeholder="—"
                    />
                  </Field>
                  <Field label="Relation">
                    <select
                      value={draft.family_relation}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          family_relation: e.target.value,
                        })
                      }
                      className="w-full bg-white border border-line rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                    >
                      <option value="">—</option>
                      {FAMILY_RELATIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Phone">
                    <div className="flex items-stretch bg-white border border-line rounded-xl overflow-hidden focus-within:border-forest">
                      <span className="inline-flex items-center pl-2 pr-1.5 text-xs text-muted bg-cream/60 border-r border-line select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={draft.family_phone}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            family_phone: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10),
                          })
                        }
                        placeholder="9876543210"
                        maxLength={10}
                        className="flex-1 bg-transparent py-2.5 px-2 text-sm focus:outline-none num-mono"
                      />
                    </div>
                  </Field>
                </div>
              </Section>

              <Section title="Admission">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Batch no.">
                    <Input
                      value={draft.batch_no}
                      onChange={(v) => setDraft({ ...draft, batch_no: v })}
                      placeholder="e.g. B-2026-05"
                    />
                  </Field>
                  <Field label="Total fee (₹)">
                    <div className="flex items-stretch bg-white border border-line rounded-xl overflow-hidden focus-within:border-forest">
                      <span className="inline-flex items-center pl-3 pr-2 text-sm text-muted bg-cream/60 border-r border-line select-none">
                        ₹
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={draft.total_fee}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            total_fee: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 8),
                          })
                        }
                        placeholder="40000"
                        className="flex-1 bg-transparent py-2.5 px-3 text-sm focus:outline-none num-mono"
                      />
                    </div>
                  </Field>
                </div>
                <Field label="Notes">
                  <textarea
                    value={draft.notes}
                    onChange={(e) =>
                      setDraft({ ...draft, notes: e.target.value })
                    }
                    rows={3}
                    placeholder="Internal notes about the student..."
                    className="w-full bg-white border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-forest"
                  />
                </Field>
              </Section>

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
                  {pending ? "Creating..." : "Create admission"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="text-[11px] uppercase tracking-wider text-muted font-medium">
        {title}
      </div>
      {children}
    </div>
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
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest"
    />
  );
}
