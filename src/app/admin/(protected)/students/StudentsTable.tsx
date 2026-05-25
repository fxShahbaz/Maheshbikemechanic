"use client";

import { useMemo, useState } from "react";
import { formatINR, type Admission } from "@/lib/types";
import type { AdmissionWithPaid } from "@/app/actions/admissions";
import AdmissionDrawer from "../admissions/AdmissionDrawer";

type FeeFilter = "all" | "dues" | "paid" | "nopay";
type SortKey = "due" | "paid" | "name" | "recent";

type FeeStatus = "paid" | "partial" | "unpaid" | "advance" | "none";

/** Outstanding balance — 0 when no fee target is set. */
function balanceOf(s: AdmissionWithPaid): number {
  if (s.total_fee == null) return 0;
  return Math.max(0, s.total_fee - s.paid);
}

function statusOf(s: AdmissionWithPaid): FeeStatus {
  if (s.total_fee == null || s.total_fee === 0) {
    return s.paid > 0 ? "advance" : "none";
  }
  const balance = s.total_fee - s.paid;
  if (balance <= 0) return "paid";
  if (s.paid > 0) return "partial";
  return "unpaid";
}

const STATUS_STYLES: Record<FeeStatus, string> = {
  paid: "bg-emerald-100 text-emerald-900 border-emerald-200",
  partial: "bg-amber-100 text-amber-900 border-amber-200",
  unpaid: "bg-red-100 text-red-800 border-red-200",
  advance: "bg-sky-100 text-sky-900 border-sky-200",
  none: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

const STATUS_LABEL: Record<FeeStatus, string> = {
  paid: "Paid",
  partial: "Partial",
  unpaid: "Unpaid",
  advance: "Paid",
  none: "No fee set",
};

export default function StudentsTable({
  students,
  batches,
}: {
  students: AdmissionWithPaid[];
  batches: string[];
}) {
  const [filter, setFilter] = useState<FeeFilter>("all");
  const [batch, setBatch] = useState<"all" | string>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("due");
  const [selected, setSelected] = useState<Admission | null>(null);

  const counts = useMemo(() => {
    let dues = 0;
    let paid = 0;
    let nopay = 0;
    for (const s of students) {
      if (balanceOf(s) > 0) dues += 1;
      if (s.total_fee != null && s.total_fee > 0 && s.paid >= s.total_fee)
        paid += 1;
      if (s.paid === 0) nopay += 1;
    }
    return { all: students.length, dues, paid, nopay };
  }, [students]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = students.filter((s) => {
      if (batch !== "all" && s.batch_no !== batch) return false;
      if (filter === "dues" && balanceOf(s) <= 0) return false;
      if (
        filter === "paid" &&
        !(s.total_fee != null && s.total_fee > 0 && s.paid >= s.total_fee)
      )
        return false;
      if (filter === "nopay" && s.paid !== 0) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        (s.batch_no ?? "").toLowerCase().includes(q)
      );
    });

    return rows.sort((a, b) => {
      switch (sort) {
        case "due":
          return balanceOf(b) - balanceOf(a);
        case "paid":
          return b.paid - a.paid;
        case "name":
          return a.name.localeCompare(b.name);
        case "recent":
          return (b.last_paid_on ?? "").localeCompare(a.last_paid_on ?? "");
      }
    });
  }, [students, filter, batch, query, sort]);

  return (
    <>
      <div className="mt-6 md:mt-8 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
            All ({counts.all})
          </FilterPill>
          <FilterPill
            active={filter === "dues"}
            onClick={() => setFilter("dues")}
          >
            Dues ({counts.dues})
          </FilterPill>
          <FilterPill
            active={filter === "paid"}
            onClick={() => setFilter("paid")}
          >
            Fully paid ({counts.paid})
          </FilterPill>
          <FilterPill
            active={filter === "nopay"}
            onClick={() => setFilter("nopay")}
          >
            No payments ({counts.nopay})
          </FilterPill>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {batches.length > 0 && (
            <select
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="bg-white border border-line rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-forest"
            >
              <option value="all">All batches</option>
              {batches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          )}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="bg-white border border-line rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-forest"
          >
            <option value="due">Sort: Due (high→low)</option>
            <option value="paid">Sort: Paid (high→low)</option>
            <option value="name">Sort: Name (A→Z)</option>
            <option value="recent">Sort: Recent payment</option>
          </select>
          <input
            type="search"
            placeholder="Search name / phone / batch..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 md:w-64 bg-white border border-line rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-forest"
          />
        </div>
      </div>

      {/* MOBILE — card list */}
      <div className="md:hidden mt-5 bg-white border border-line rounded-2xl overflow-hidden">
        {visible.length === 0 ? (
          <Empty total={students.length} />
        ) : (
          <ul className="divide-y divide-line">
            {visible.map((s) => {
              const status = statusOf(s);
              const balance = balanceOf(s);
              return (
                <li
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className="cursor-pointer hover:bg-cream/60 active:bg-cream transition px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{s.name}</div>
                      <div className="text-xs text-muted mt-0.5">
                        {s.phone}
                        {s.batch_no && <> · Batch {s.batch_no}</>}
                      </div>
                    </div>
                    <StatusPill status={status} />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <Money label="Total" value={s.total_fee} muted />
                    <Money label="Paid" value={s.paid} />
                    <Money
                      label="Due"
                      value={balance > 0 ? balance : 0}
                      tone={balance > 0 ? "amber" : "ok"}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* DESKTOP table */}
      <div className="hidden md:block mt-5 bg-white border border-line rounded-3xl overflow-hidden">
        {visible.length === 0 ? (
          <Empty total={students.length} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream/70 text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Batch</th>
                  <th className="px-5 py-3 font-medium text-right">Total fee</th>
                  <th className="px-5 py-3 font-medium text-right">Paid</th>
                  <th className="px-5 py-3 font-medium text-right">Due</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium whitespace-nowrap">
                    Last payment
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((s) => {
                  const status = statusOf(s);
                  const balance = balanceOf(s);
                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelected(s)}
                      className="cursor-pointer hover:bg-cream/60 transition"
                    >
                      <td className="px-5 py-4 font-medium">
                        <div>{s.name}</div>
                        <div className="text-xs text-muted">{s.phone}</div>
                      </td>
                      <td className="px-5 py-4">
                        {s.batch_no ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border font-medium bg-ink text-white border-ink">
                            {s.batch_no}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right num-mono text-muted">
                        {s.total_fee != null ? formatINR(s.total_fee) : "—"}
                      </td>
                      <td className="px-5 py-4 text-right num-mono">
                        {formatINR(s.paid)}
                      </td>
                      <td className="px-5 py-4 text-right num-mono">
                        {balance > 0 ? (
                          <span className="text-amber-800 font-medium">
                            {formatINR(balance)}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill status={status} />
                      </td>
                      <td className="px-5 py-4 text-muted whitespace-nowrap">
                        {s.last_paid_on ? formatDate(s.last_paid_on) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdmissionDrawer admission={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function Empty({ total }: { total: number }) {
  return (
    <div className="p-10 text-center text-muted text-sm">
      {total === 0
        ? "No students yet. Add one from the Admissions page."
        : "No students match the current filter."}
    </div>
  );
}

function StatusPill({ status }: { status: FeeStatus }) {
  return (
    <span
      className={
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] border font-medium " +
        STATUS_STYLES[status]
      }
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function Money({
  label,
  value,
  muted,
  tone,
}: {
  label: string;
  value: number | null;
  muted?: boolean;
  tone?: "amber" | "ok";
}) {
  const valueClass =
    tone === "amber"
      ? "text-amber-800 font-medium"
      : tone === "ok"
        ? "text-muted"
        : muted
          ? "text-ink/70"
          : "text-ink";
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted">
        {label}
      </div>
      <div className={"num-mono mt-0.5 " + valueClass}>
        {value != null && (label !== "Due" || value > 0)
          ? formatINR(value)
          : "—"}
      </div>
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
        "px-3.5 py-1.5 rounded-full text-sm border transition " +
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
