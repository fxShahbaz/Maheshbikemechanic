"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  approveStudent,
  deleteStudentAccount,
  setStudentStatus,
  updateStudentExpiry,
} from "@/app/actions/student-access";
import { hasActiveAccess, todayIST } from "@/lib/types";
import type { StudentProfile } from "@/lib/types";
import { ShowMoreButton, usePagination } from "@/components/pagination";

type Filter = "all" | "pending" | "active" | "expired" | "inactive";

function defaultExpiry(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d.toISOString().slice(0, 10);
}

function badge(a: StudentProfile): { label: string; className: string } {
  if (a.status === "pending")
    return { label: "Pending", className: "bg-amber-100 text-amber-900 border-amber-200" };
  if (a.status === "inactive")
    return { label: "Inactive", className: "bg-zinc-100 text-zinc-600 border-zinc-200" };
  if (!hasActiveAccess(a))
    return { label: "Expired", className: "bg-red-100 text-red-800 border-red-200" };
  return { label: "Active", className: "bg-lime/40 text-ink border-lime" };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateOnly(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PortalTable({
  accounts,
}: {
  accounts: StudentProfile[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  // Row currently showing the approve/extend date picker, and its draft date
  const [dateRow, setDateRow] = useState<string | null>(null);
  const [draftDate, setDraftDate] = useState(defaultExpiry());
  const [confirmDeleteRow, setConfirmDeleteRow] = useState<string | null>(null);

  const counts = useMemo(() => {
    let pendingCount = 0;
    let active = 0;
    let expired = 0;
    let inactive = 0;
    for (const a of accounts) {
      if (a.status === "pending") pendingCount += 1;
      else if (a.status === "inactive") inactive += 1;
      else if (hasActiveAccess(a)) active += 1;
      else expired += 1;
    }
    return { all: accounts.length, pending: pendingCount, active, expired, inactive };
  }, [accounts]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return accounts.filter((a) => {
      if (filter === "pending" && a.status !== "pending") return false;
      if (filter === "inactive" && a.status !== "inactive") return false;
      if (filter === "active" && !hasActiveAccess(a)) return false;
      if (
        filter === "expired" &&
        !(a.status === "active" && !hasActiveAccess(a))
      )
        return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        (a.phone ?? "").toLowerCase().includes(q)
      );
    });
  }, [accounts, filter, search]);

  const { paged, remaining, showMore } = usePagination(
    rows,
    15,
    `${filter}|${search}`
  );

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(undefined);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) setError(result.error ?? "Something went wrong.");
      else {
        setDateRow(null);
        setConfirmDeleteRow(null);
        router.refresh();
      }
    });
  }

  function openDatePicker(a: StudentProfile) {
    setDateRow(a.id);
    setDraftDate(
      hasActiveAccess(a) ? (a.access_expires_at ?? defaultExpiry()) : defaultExpiry()
    );
  }

  function confirmDate(a: StudentProfile) {
    run(() =>
      a.status === "active" && hasActiveAccess(a)
        ? updateStudentExpiry(a.id, draftDate)
        : approveStudent(a.id, draftDate)
    );
  }

  const FILTERS: { value: Filter; label: string; count: number }[] = [
    { value: "all", label: "All", count: counts.all },
    { value: "pending", label: "Pending", count: counts.pending },
    { value: "active", label: "Active", count: counts.active },
    { value: "expired", label: "Expired", count: counts.expired },
    { value: "inactive", label: "Inactive", count: counts.inactive },
  ];

  return (
    <>
      <div className="mt-6 md:mt-8 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={[
                "px-3.5 py-1.5 rounded-full text-sm border transition",
                filter === f.value
                  ? "bg-ink text-white border-ink"
                  : "bg-white border-line text-ink hover:bg-cream",
              ].join(" ")}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name / email / phone..."
          className="w-full md:w-64 bg-white border border-line rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-forest"
        />
      </div>

      {error && (
        <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* MOBILE — card list */}
      <div className="md:hidden mt-5 bg-white border border-line rounded-2xl overflow-hidden">
        {rows.length === 0 ? (
          <Empty total={accounts.length} />
        ) : (
          <ul className="divide-y divide-line">
            {paged.map((a) => {
              const b = badge(a);
              return (
                <li key={a.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{a.name}</div>
                      <div className="text-xs text-muted mt-0.5 truncate">
                        {a.email}
                      </div>
                      {a.phone && (
                        <div className="text-xs text-muted">{a.phone}</div>
                      )}
                    </div>
                    <StatusPill {...b} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <Cell label="Joined" value={formatDate(a.created_at)} />
                    <Cell
                      label="Access till"
                      value={
                        a.access_expires_at
                          ? formatDateOnly(a.access_expires_at)
                          : "—"
                      }
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <RowActions
                      a={a}
                      pending={pending}
                      showDate={dateRow === a.id}
                      confirmingDelete={confirmDeleteRow === a.id}
                      draftDate={draftDate}
                      setDraftDate={setDraftDate}
                      onOpenDate={() => openDatePicker(a)}
                      onConfirmDate={() => confirmDate(a)}
                      onCancelDate={() => setDateRow(null)}
                      onDeactivate={() => run(() => setStudentStatus(a.id, "inactive"))}
                      onAskDelete={() => setConfirmDeleteRow(a.id)}
                      onConfirmDelete={() => run(() => deleteStudentAccount(a.id))}
                      onCancelDelete={() => setConfirmDeleteRow(null)}
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
        {rows.length === 0 ? (
          <Empty total={accounts.length} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream/70 text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium whitespace-nowrap">Joined</th>
                  <th className="px-5 py-3 font-medium whitespace-nowrap">
                    Access till
                  </th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {paged.map((a) => {
                  const b = badge(a);
                  return (
                    <tr key={a.id} className="hover:bg-cream/40 transition">
                      <td className="px-5 py-4">
                        <div className="font-medium">{a.name}</div>
                        <div className="text-xs text-muted">{a.email}</div>
                      </td>
                      <td className="px-5 py-4 text-muted whitespace-nowrap">
                        {a.phone ?? "—"}
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill {...b} />
                      </td>
                      <td className="px-5 py-4 text-muted whitespace-nowrap">
                        {formatDate(a.created_at)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {a.access_expires_at ? (
                          <span className="num-mono">
                            {formatDateOnly(a.access_expires_at)}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          <RowActions
                            a={a}
                            pending={pending}
                            showDate={dateRow === a.id}
                            confirmingDelete={confirmDeleteRow === a.id}
                            draftDate={draftDate}
                            setDraftDate={setDraftDate}
                            onOpenDate={() => openDatePicker(a)}
                            onConfirmDate={() => confirmDate(a)}
                            onCancelDate={() => setDateRow(null)}
                            onDeactivate={() =>
                              run(() => setStudentStatus(a.id, "inactive"))
                            }
                            onAskDelete={() => setConfirmDeleteRow(a.id)}
                            onConfirmDelete={() =>
                              run(() => deleteStudentAccount(a.id))
                            }
                            onCancelDelete={() => setConfirmDeleteRow(null)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ShowMoreButton remaining={remaining} onShowMore={showMore} />
    </>
  );
}

function RowActions({
  a,
  pending,
  showDate,
  confirmingDelete,
  draftDate,
  setDraftDate,
  onOpenDate,
  onConfirmDate,
  onCancelDate,
  onDeactivate,
  onAskDelete,
  onConfirmDelete,
  onCancelDelete,
}: {
  a: StudentProfile;
  pending: boolean;
  showDate: boolean;
  confirmingDelete: boolean;
  draftDate: string;
  setDraftDate: (v: string) => void;
  onOpenDate: () => void;
  onConfirmDate: () => void;
  onCancelDate: () => void;
  onDeactivate: () => void;
  onAskDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}) {
  if (showDate) {
    return (
      <>
        <input
          type="date"
          value={draftDate}
          min={todayIST()}
          onChange={(e) => setDraftDate(e.target.value)}
          className="bg-white border border-line rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-forest"
        />
        <button
          type="button"
          disabled={pending || !draftDate}
          onClick={onConfirmDate}
          className="px-4 py-1.5 rounded-full text-sm bg-ink text-white hover:bg-forest transition disabled:opacity-60"
        >
          {pending ? "Saving…" : "Confirm"}
        </button>
        <button
          type="button"
          onClick={onCancelDate}
          className="px-3 py-1.5 rounded-full text-sm border border-line hover:bg-cream transition"
        >
          Cancel
        </button>
      </>
    );
  }

  if (confirmingDelete) {
    return (
      <>
        <button
          type="button"
          disabled={pending}
          onClick={onConfirmDelete}
          className="px-4 py-1.5 rounded-full text-sm bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60"
        >
          {pending ? "Deleting…" : "Confirm delete"}
        </button>
        <button
          type="button"
          onClick={onCancelDelete}
          className="px-3 py-1.5 rounded-full text-sm border border-line hover:bg-cream transition"
        >
          Cancel
        </button>
      </>
    );
  }

  return (
    <>
      {hasActiveAccess(a) ? (
        <>
          <button
            type="button"
            onClick={onOpenDate}
            className="px-4 py-1.5 rounded-full text-sm border border-line hover:bg-cream transition"
          >
            Change expiry
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onDeactivate}
            className="px-4 py-1.5 rounded-full text-sm border border-line text-red-700 hover:bg-red-50 transition disabled:opacity-60"
          >
            Deactivate
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={onOpenDate}
          className="px-4 py-1.5 rounded-full text-sm bg-lime text-ink hover:bg-lime-dk transition"
        >
          {a.status === "pending" ? "Approve" : "Re-activate"}
        </button>
      )}
      <button
        type="button"
        onClick={onAskDelete}
        title="Delete account"
        className="w-8 h-8 rounded-full text-ink/40 hover:text-red-700 hover:bg-red-50 flex items-center justify-center transition"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
    </>
  );
}

function StatusPill({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] border font-medium " +
        className
      }
    >
      {label}
    </span>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted">
        {label}
      </div>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}

function Empty({ total }: { total: number }) {
  return (
    <div className="p-10 text-center text-muted text-sm">
      {total === 0
        ? "No student accounts yet. Students can sign up from the portal."
        : "No accounts match the current filter."}
    </div>
  );
}
