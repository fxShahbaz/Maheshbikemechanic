"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteAdmission,
  updateAdmission,
} from "@/app/actions/admissions";
import { FAMILY_RELATIONS, type Admission } from "@/lib/types";
import PaymentsPanel from "./PaymentsPanel";

type Props = {
  admission: Admission | null;
  onClose: () => void;
};

export default function AdmissionDrawer({ admission, onClose }: Props) {
  return (
    <AnimatePresence>
      {admission && (
        <DrawerContent
          key={admission.id}
          admission={admission}
          onClose={onClose}
        />
      )}
    </AnimatePresence>
  );
}

function DrawerContent({
  admission,
  onClose,
}: {
  admission: Admission;
  onClose: () => void;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Admission>(admission);
  const [saving, startSaving] = useTransition();
  const [deleting, startDeleting] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const [saved, setSaved] = useState(false);

  // Scroll lock + ESC handler — runs once per mount (one per admission)
  useEffect(() => {
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
  }, [onClose]);

  function save() {
    setError(undefined);
    setSaved(false);
    startSaving(async () => {
      const result = await updateAdmission(draft.id, {
        name: draft.name,
        phone: draft.phone,
        address: draft.address,
        email: draft.email,
        age: draft.age,
        aadhar_no: draft.aadhar_no,
        family_name: draft.family_name,
        family_relation: draft.family_relation,
        family_phone: draft.family_phone,
        batch_no: draft.batch_no,
        notes: draft.notes,
        total_fee: draft.total_fee,
      });
      if (result.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(result.error);
      }
    });
  }

  function doDelete() {
    if (!confirm("Delete this admission? This cannot be undone.")) return;
    startDeleting(async () => {
      const result = await deleteAdmission(draft.id);
      if (result.ok) {
        router.refresh();
        onClose();
      } else {
        setError(result.error);
      }
    });
  }

  return (
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
        className="relative ml-auto h-full w-full max-w-2xl bg-white border-l border-line shadow-2xl flex flex-col"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 320 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-line">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider text-muted">
              Admission · {formatDate(admission.created_at)}
              {admission.batch_no && (
                <>
                  {" · "}
                  <span className="text-ink">Batch {admission.batch_no}</span>
                </>
              )}
            </div>
            <h2 className="font-display text-2xl mt-1 truncate">
              {draft.name || "Untitled"}
            </h2>
            <div className="text-sm text-muted mt-1 flex items-center gap-3 flex-wrap">
              <a href={`tel:${draft.phone}`} className="hover:text-ink">
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
              {draft.email && (
                <a
                  href={`mailto:${draft.email}`}
                  className="text-xs hover:text-ink truncate"
                >
                  {draft.email}
                </a>
              )}
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
          className="flex-1 overflow-y-auto overscroll-contain px-6 py-6 space-y-7"
        >
          <Section title="Personal">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name *">
                <Input
                  value={draft.name}
                  onChange={(v) => setDraft({ ...draft, name: v })}
                />
              </Field>
              <Field label="Phone *">
                <Input
                  value={draft.phone}
                  onChange={(v) => setDraft({ ...draft, phone: v })}
                />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Email">
                <Input
                  type="email"
                  value={draft.email ?? ""}
                  onChange={(v) => setDraft({ ...draft, email: v || null })}
                  placeholder="—"
                />
              </Field>
              <Field label="Age">
                <Input
                  type="number"
                  value={draft.age != null ? String(draft.age) : ""}
                  onChange={(v) =>
                    setDraft({
                      ...draft,
                      age: v ? Number(v.replace(/\D/g, "")) : null,
                    })
                  }
                  placeholder="—"
                />
              </Field>
            </div>
            <Field label="Address">
              <textarea
                value={draft.address ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, address: e.target.value || null })
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
                value={draft.aadhar_no ?? ""}
                onChange={(e) => {
                  const digits = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 12);
                  const formatted = digits.replace(
                    /(\d{4})(\d{0,4})(\d{0,4})/,
                    (_, a, b, c) => [a, b, c].filter(Boolean).join(" ")
                  );
                  setDraft({ ...draft, aadhar_no: formatted || null });
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
                  value={draft.family_name ?? ""}
                  onChange={(v) =>
                    setDraft({ ...draft, family_name: v || null })
                  }
                  placeholder="—"
                />
              </Field>
              <Field label="Relation">
                <select
                  value={draft.family_relation ?? ""}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      family_relation: e.target.value || null,
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
                <Input
                  value={draft.family_phone ?? ""}
                  onChange={(v) =>
                    setDraft({ ...draft, family_phone: v || null })
                  }
                  placeholder="—"
                />
              </Field>
            </div>
          </Section>

          <Section title="Admission">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Batch no.">
                <Input
                  value={draft.batch_no ?? ""}
                  onChange={(v) =>
                    setDraft({ ...draft, batch_no: v || null })
                  }
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
                    value={draft.total_fee != null ? String(draft.total_fee) : ""}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
                      setDraft({
                        ...draft,
                        total_fee: digits ? Number(digits) : null,
                      });
                    }}
                    placeholder="42500"
                    className="flex-1 bg-transparent py-2.5 px-3 text-sm focus:outline-none num-mono"
                  />
                </div>
              </Field>
            </div>
            <Field label="Notes">
              <textarea
                value={draft.notes ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, notes: e.target.value || null })
                }
                rows={4}
                placeholder="Internal notes about the student..."
                className="w-full bg-white border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-forest"
              />
            </Field>
          </Section>

          <Section title="Payments">
            <PaymentsPanel
              admissionId={admission.id}
              totalFee={draft.total_fee}
              onChange={() => router.refresh()}
            />
          </Section>

          <div className="text-xs text-muted pt-2 border-t border-line">
            <span className="uppercase tracking-wider">ID:</span>{" "}
            <code className="text-[11px]">{admission.id}</code>
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
