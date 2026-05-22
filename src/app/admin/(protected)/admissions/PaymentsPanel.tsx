"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  createPayment,
  deletePayment,
  listPaymentsForAdmission,
} from "@/app/actions/payments";
import {
  formatINR,
  formatPurpose,
  PAYMENT_MODES,
  PAYMENT_PURPOSES,
  type Payment,
  type PaymentMode,
  type PaymentPurpose,
} from "@/lib/types";

const MODE_STYLES: Record<PaymentMode, string> = {
  cash: "bg-amber-100 text-amber-900 border-amber-200",
  upi: "bg-violet-100 text-violet-900 border-violet-200",
  bank: "bg-sky-100 text-sky-900 border-sky-200",
  card: "bg-emerald-100 text-emerald-900 border-emerald-200",
  cheque: "bg-zinc-100 text-zinc-700 border-zinc-200",
  other: "bg-cream text-ink border-line",
};

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type Props = {
  admissionId: string;
  totalFee: number | null;
  onChange?: () => void;
};

export default function PaymentsPanel({ admissionId, totalFee, onChange }: Props) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    let live = true;
    setLoading(true);
    listPaymentsForAdmission(admissionId)
      .then((rows) => {
        if (live) setPayments(rows);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [admissionId]);

  const paid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const balance = totalFee != null ? totalFee - paid : null;
  const pct =
    totalFee && totalFee > 0
      ? Math.min(100, Math.round((paid / totalFee) * 100))
      : 0;

  function refresh() {
    listPaymentsForAdmission(admissionId).then(setPayments);
    onChange?.();
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="rounded-xl border border-line bg-white p-4">
        <div className="flex items-baseline justify-between">
          <div className="text-[11px] uppercase tracking-wider text-muted">
            Paid
          </div>
          <div className="text-[11px] text-muted">
            {payments.length} payment{payments.length === 1 ? "" : "s"}
          </div>
        </div>
        <div className="mt-1 flex items-baseline gap-3 flex-wrap">
          <span className="font-display text-2xl num-mono">
            {formatINR(paid)}
          </span>
          {totalFee != null && (
            <span className="text-sm text-muted num-mono">
              / {formatINR(totalFee)}
            </span>
          )}
        </div>
        {totalFee != null && totalFee > 0 && (
          <>
            <div className="mt-3 h-2 rounded-full bg-line overflow-hidden">
              <div
                className={
                  "h-full transition-all " +
                  (balance != null && balance <= 0
                    ? "bg-emerald-500"
                    : "bg-forest")
                }
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              {balance != null && balance > 0 ? (
                <span className="text-amber-800 num-mono">
                  {formatINR(balance)} remaining
                </span>
              ) : (
                <span className="text-emerald-700 font-medium">
                  Fully paid ✓
                </span>
              )}
              <span className="text-muted">{pct}%</span>
            </div>
          </>
        )}
      </div>

      {/* Add payment */}
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wider text-muted font-medium">
          Payment history
        </div>
        <button
          type="button"
          onClick={() => setAddOpen((o) => !o)}
          className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-lime hover:bg-limeDk text-ink font-medium transition"
        >
          {addOpen ? "Close" : "+ Record payment"}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {addOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <AddPaymentForm
              admissionId={admissionId}
              onSaved={() => {
                refresh();
                setAddOpen(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {loading ? (
        <div className="text-xs text-muted py-4 text-center">Loading...</div>
      ) : payments.length === 0 ? (
        <div className="text-xs text-muted py-6 text-center border border-dashed border-line rounded-xl">
          No payments recorded yet.
        </div>
      ) : (
        <ul className="space-y-2">
          {payments.map((p) => (
            <PaymentRow key={p.id} payment={p} onDeleted={refresh} />
          ))}
        </ul>
      )}
    </div>
  );
}

function AddPaymentForm({
  admissionId,
  onSaved,
}: {
  admissionId: string;
  onSaved: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [paidOn, setPaidOn] = useState(todayIso());
  const [mode, setMode] = useState<PaymentMode>("cash");
  const [purpose, setPurpose] = useState<PaymentPurpose>("course_fee");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(undefined);
    const amt = Number(amount.replace(/\D/g, ""));
    if (!amt || amt <= 0) {
      setError("Enter an amount.");
      return;
    }
    startTransition(async () => {
      const result = await createPayment({
        admission_id: admissionId,
        amount: amt,
        paid_on: paidOn,
        mode,
        purpose,
        reference: reference || null,
        notes: notes || null,
      });
      if (result.ok) {
        setAmount("");
        setReference("");
        setNotes("");
        onSaved();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="bg-cream/60 border border-line rounded-xl p-4 space-y-3">
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted">
            Amount (₹) *
          </label>
          <div className="mt-1 flex items-stretch bg-white border border-line rounded-lg overflow-hidden focus-within:border-forest">
            <span className="inline-flex items-center pl-2.5 pr-1.5 text-sm text-muted bg-cream border-r border-line">
              ₹
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value.replace(/\D/g, "").slice(0, 8))
              }
              placeholder="2500"
              className="flex-1 bg-transparent px-2 py-2 text-sm focus:outline-none num-mono"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted">
            Date *
          </label>
          <input
            type="date"
            value={paidOn}
            onChange={(e) => setPaidOn(e.target.value)}
            className="mt-1 w-full bg-white border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-forest"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted">
            Mode
          </label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as PaymentMode)}
            className="mt-1 w-full bg-white border border-line rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-forest"
          >
            {PAYMENT_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted">
            Purpose
          </label>
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value as PaymentPurpose)}
            className="mt-1 w-full bg-white border border-line rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-forest"
          >
            {PAYMENT_PURPOSES.map((p) => (
              <option key={p} value={p}>
                {formatPurpose(p)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted">
            Reference
          </label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="UPI ref / cheque # / txn id"
            className="mt-1 w-full bg-white border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-forest"
          />
        </div>
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-wider text-muted">
          Notes
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional"
          className="mt-1 w-full bg-white border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-forest"
        />
      </div>
      {error && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5">
          {error}
        </div>
      )}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="pill-btn text-sm disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save payment"}
        </button>
      </div>
    </div>
  );
}

function PaymentRow({
  payment,
  onDeleted,
}: {
  payment: Payment;
  onDeleted: () => void;
}) {
  const [deleting, startDeleting] = useTransition();

  function del() {
    if (!confirm(`Delete payment of ${formatINR(payment.amount)}?`)) return;
    startDeleting(async () => {
      const result = await deletePayment(payment.id);
      if (result.ok) onDeleted();
    });
  }

  return (
    <li className="bg-white border border-line rounded-xl px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-medium num-mono">
            {formatINR(payment.amount)}
          </span>
          <span
            className={
              "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] border font-medium " +
              MODE_STYLES[payment.mode]
            }
          >
            {payment.mode}
          </span>
          <span className="text-[11px] text-muted">
            {formatPurpose(payment.purpose)}
          </span>
        </div>
        <div className="text-[11px] text-muted mt-0.5 flex items-center gap-2 flex-wrap">
          <span>{formatDate(payment.paid_on)}</span>
          {payment.receipt_no && (
            <>
              <span>·</span>
              <span className="num-mono">{payment.receipt_no}</span>
            </>
          )}
          {payment.reference && (
            <>
              <span>·</span>
              <span className="truncate">{payment.reference}</span>
            </>
          )}
        </div>
        {payment.notes && (
          <div className="text-[11px] text-ink/70 mt-1">{payment.notes}</div>
        )}
      </div>
      <button
        type="button"
        onClick={del}
        disabled={deleting}
        className="text-xs text-red-700 hover:text-red-900 disabled:opacity-50"
      >
        {deleting ? "..." : "Delete"}
      </button>
    </li>
  );
}

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
