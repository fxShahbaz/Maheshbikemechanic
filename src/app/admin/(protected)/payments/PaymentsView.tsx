"use client";

import { useState } from "react";
import {
  formatINR,
  formatPurpose,
  PAYMENT_MODES,
  PAYMENT_PURPOSES,
  type PaymentMode,
  type PaymentPurpose,
} from "@/lib/types";
import type { PaymentRow } from "./page";
import PaymentDetailDrawer from "./PaymentDetailDrawer";
import { ShowMoreButton, usePagination } from "@/components/pagination";

const MODE_STYLES: Record<PaymentMode, string> = {
  cash: "bg-amber-100 text-amber-900 border-amber-200",
  upi: "bg-violet-100 text-violet-900 border-violet-200",
  bank: "bg-sky-100 text-sky-900 border-sky-200",
  card: "bg-emerald-100 text-emerald-900 border-emerald-200",
  cheque: "bg-zinc-100 text-zinc-700 border-zinc-200",
  other: "bg-cream text-ink border-line",
};

type ModeFilter = "all" | PaymentMode;
type PurposeFilter = "all" | PaymentPurpose;

export default function PaymentsView({ payments }: { payments: PaymentRow[] }) {
  const [mode, setMode] = useState<ModeFilter>("all");
  const [purpose, setPurpose] = useState<PurposeFilter>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PaymentRow | null>(null);

  const visible = payments.filter((p) => {
    if (mode !== "all" && p.mode !== mode) return false;
    if (purpose !== "all" && p.purpose !== purpose) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      (p.admission?.name ?? "").toLowerCase().includes(q) ||
      (p.admission?.phone ?? "").toLowerCase().includes(q) ||
      (p.admission?.batch_no ?? "").toLowerCase().includes(q) ||
      (p.receipt_no ?? "").toLowerCase().includes(q) ||
      (p.reference ?? "").toLowerCase().includes(q)
    );
  });

  const { paged, remaining, showMore } = usePagination(
    visible,
    20,
    `${mode}|${purpose}|${query}`
  );

  return (
    <>
      <div className="mt-6 md:mt-8 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterPill active={mode === "all"} onClick={() => setMode("all")}>
            All modes
          </FilterPill>
          {PAYMENT_MODES.map((m) => (
            <FilterPill
              key={m}
              active={mode === m}
              onClick={() => setMode(m)}
            >
              {m}
            </FilterPill>
          ))}
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value as PurposeFilter)}
            className="bg-white border border-line rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-forest"
          >
            <option value="all">All purposes</option>
            {PAYMENT_PURPOSES.map((p) => (
              <option key={p} value={p}>
                {formatPurpose(p)}
              </option>
            ))}
          </select>
          <input
            type="search"
            placeholder="Search student / receipt / reference..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 md:w-72 bg-white border border-line rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-forest"
          />
        </div>
      </div>

      {/* MOBILE list */}
      <div className="md:hidden mt-5 bg-white border border-line rounded-2xl overflow-hidden">
        {visible.length === 0 ? (
          <Empty />
        ) : (
          <ul className="divide-y divide-line">
            {paged.map((p) => (
              <li
                key={p.id}
                onClick={() => setSelected(p)}
                className="cursor-pointer hover:bg-cream/60 active:bg-cream transition px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-medium num-mono">
                        {formatINR(p.amount)}
                      </span>
                      <span
                        className={
                          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] border font-medium " +
                          MODE_STYLES[p.mode]
                        }
                      >
                        {p.mode}
                      </span>
                    </div>
                    <div className="text-xs text-muted mt-0.5">
                      {p.admission?.name ?? "—"}
                      {p.admission?.batch_no && (
                        <> · Batch {p.admission.batch_no}</>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] num-mono">{p.receipt_no}</div>
                    <div className="text-[11px] text-muted">
                      {formatDate(p.paid_on)}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted">
                  {formatPurpose(p.purpose)}
                  {p.reference && <> · {p.reference}</>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* DESKTOP table */}
      <div className="hidden md:block mt-5 bg-white border border-line rounded-3xl overflow-hidden">
        {visible.length === 0 ? (
          <Empty />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream/70 text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Receipt</th>
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Mode</th>
                  <th className="px-5 py-3 font-medium">Purpose</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {paged.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className="cursor-pointer hover:bg-cream/60 transition"
                  >
                    <td className="px-5 py-3.5 num-mono text-xs">
                      {p.receipt_no ?? "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      {p.admission ? (
                        <div>
                          <div className="font-medium">{p.admission.name}</div>
                          <div className="text-xs text-muted">
                            {p.admission.phone}
                            {p.admission.batch_no && (
                              <> · Batch {p.admission.batch_no}</>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-medium num-mono">
                      {formatINR(p.amount)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={
                          "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border font-medium " +
                          MODE_STYLES[p.mode]
                        }
                      >
                        {p.mode}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted">
                      {formatPurpose(p.purpose)}
                    </td>
                    <td className="px-5 py-3.5 text-muted whitespace-nowrap">
                      {formatDate(p.paid_on)}
                    </td>
                    <td className="px-5 py-3.5 text-muted text-xs truncate max-w-[160px]">
                      {p.reference ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ShowMoreButton remaining={remaining} onShowMore={showMore} />

      <PaymentDetailDrawer
        payment={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

function Empty() {
  return (
    <div className="p-10 text-center text-muted text-sm">
      No payments yet. Record one from an admission's profile.
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "px-3 py-1.5 rounded-full text-xs border transition capitalize " +
        (active
          ? "bg-ink text-white border-ink"
          : "bg-white text-ink border-line hover:bg-cream")
      }
    >
      {children}
    </button>
  );
}

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
