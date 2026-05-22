"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePayment, updatePayment } from "@/app/actions/payments";
import {
  formatINR,
  formatPurpose,
  PAYMENT_MODES,
  PAYMENT_PURPOSES,
  type PaymentMode,
  type PaymentPurpose,
} from "@/lib/types";
import type { PaymentRow } from "./page";

const MODE_STYLES: Record<PaymentMode, string> = {
  cash: "bg-amber-100 text-amber-900 border-amber-200",
  upi: "bg-violet-100 text-violet-900 border-violet-200",
  bank: "bg-sky-100 text-sky-900 border-sky-200",
  card: "bg-emerald-100 text-emerald-900 border-emerald-200",
  cheque: "bg-zinc-100 text-zinc-700 border-zinc-200",
  other: "bg-cream text-ink border-line",
};

type Props = {
  payment: PaymentRow | null;
  onClose: () => void;
};

export default function PaymentDetailDrawer({ payment, onClose }: Props) {
  return (
    <AnimatePresence>
      {payment && (
        <DrawerContent
          key={payment.id}
          payment={payment}
          onClose={onClose}
        />
      )}
    </AnimatePresence>
  );
}

function DrawerContent({
  payment,
  onClose,
}: {
  payment: PaymentRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(String(payment.amount));
  const [paidOn, setPaidOn] = useState(payment.paid_on);
  const [mode, setMode] = useState<PaymentMode>(payment.mode);
  const [purpose, setPurpose] = useState<PaymentPurpose>(payment.purpose);
  const [reference, setReference] = useState(payment.reference ?? "");
  const [notes, setNotes] = useState(payment.notes ?? "");
  const [error, setError] = useState<string | undefined>();
  const [saved, setSaved] = useState(false);
  const [saving, startSaving] = useTransition();
  const [deleting, startDeleting] = useTransition();

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
    const amt = Number(amount.replace(/\D/g, ""));
    if (!amt || amt <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    startSaving(async () => {
      const result = await updatePayment(payment.id, {
        admission_id: payment.admission_id,
        amount: amt,
        paid_on: paidOn,
        mode,
        purpose,
        reference: reference || null,
        notes: notes || null,
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
    if (!confirm(`Delete payment ${payment.receipt_no} of ${formatINR(payment.amount)}?`))
      return;
    startDeleting(async () => {
      const result = await deletePayment(payment.id);
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
              Receipt &middot;{" "}
              <span className="num-mono text-ink">{payment.receipt_no}</span>
            </div>
            <div className="font-display text-2xl mt-1 num-mono">
              {formatINR(payment.amount)}
            </div>
            <div className="text-sm text-muted mt-1 flex items-center gap-3 flex-wrap">
              <span
                className={
                  "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border font-medium " +
                  MODE_STYLES[payment.mode]
                }
              >
                {payment.mode}
              </span>
              <span>{formatPurpose(payment.purpose)}</span>
              <span>{formatDate(payment.paid_on)}</span>
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
          className="flex-1 overflow-y-auto overscroll-contain px-6 py-6 space-y-6"
        >
          {/* Student card */}
          <section>
            <div className="text-[11px] uppercase tracking-wider text-muted font-medium mb-2">
              Student
            </div>
            {payment.admission ? (
              <div className="bg-cream/60 border border-line rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-lg">{payment.admission.name}</div>
                    <div className="text-sm text-muted mt-0.5 flex items-center gap-3 flex-wrap">
                      <a
                        href={`tel:${payment.admission.phone}`}
                        className="hover:text-ink"
                      >
                        {payment.admission.phone}
                      </a>
                      <a
                        href={`https://wa.me/${payment.admission.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white bg-[#25D366] hover:bg-[#1da856] transition"
                        aria-label="WhatsApp"
                      >
                        <WhatsAppIcon />
                      </a>
                    </div>
                  </div>
                  {payment.admission.batch_no && (
                    <span className="shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] border font-medium bg-ink text-white border-ink">
                      Batch {payment.admission.batch_no}
                    </span>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-line">
                  <a
                    href={`/admin/admissions?focus=${payment.admission.id}`}
                    className="text-xs font-medium text-forest hover:underline inline-flex items-center gap-1"
                  >
                    Open student profile
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-cream/60 border border-line rounded-2xl p-4 text-sm text-muted">
                Student record was deleted.
              </div>
            )}
          </section>

          {/* Editable payment details */}
          <section>
            <div className="text-[11px] uppercase tracking-wider text-muted font-medium mb-3">
              Payment
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Amount (₹) *">
                <div className="flex items-stretch bg-white border border-line rounded-xl overflow-hidden focus-within:border-forest">
                  <span className="inline-flex items-center pl-3 pr-2 text-sm text-muted bg-cream/60 border-r border-line">
                    ₹
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value.replace(/\D/g, "").slice(0, 8))
                    }
                    className="flex-1 bg-transparent py-2.5 px-3 text-sm focus:outline-none num-mono"
                  />
                </div>
              </Field>
              <Field label="Date *">
                <input
                  type="date"
                  value={paidOn}
                  onChange={(e) => setPaidOn(e.target.value)}
                  className="w-full bg-white border border-line rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                />
              </Field>
              <Field label="Mode">
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as PaymentMode)}
                  className="w-full bg-white border border-line rounded-xl px-2 py-2.5 text-sm focus:outline-none focus:border-forest capitalize"
                >
                  {PAYMENT_MODES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <Field label="Purpose">
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value as PaymentPurpose)}
                  className="w-full bg-white border border-line rounded-xl px-2 py-2.5 text-sm focus:outline-none focus:border-forest"
                >
                  {PAYMENT_PURPOSES.map((p) => (
                    <option key={p} value={p}>
                      {formatPurpose(p)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Reference">
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="UPI ref / cheque # / txn id"
                  className="w-full bg-white border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest"
                />
              </Field>
            </div>
            <Field label="Notes">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Optional"
                className="w-full bg-white border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-forest"
              />
            </Field>
          </section>

          <div className="text-xs text-muted pt-2 border-t border-line space-y-1">
            <div>
              <span className="uppercase tracking-wider">Receipt:</span>{" "}
              <code className="num-mono">{payment.receipt_no}</code>
            </div>
            <div>
              <span className="uppercase tracking-wider">Created:</span>{" "}
              {new Date(payment.created_at).toLocaleString("en-IN")}
            </div>
            <div>
              <span className="uppercase tracking-wider">ID:</span>{" "}
              <code className="text-[11px]">{payment.id}</code>
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

function WhatsAppIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-1 1.2-.4.2-.7.1c-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4-.1-.5-.1-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2 3 4.8 4.2 1.7.7 2.3.8 3.1.7.5-.1 1.6-.6 1.8-1.3.2-.7.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.7.4 3.4 1.3 4.9L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
    </svg>
  );
}

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
