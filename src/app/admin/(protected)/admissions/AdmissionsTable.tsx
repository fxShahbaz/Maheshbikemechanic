"use client";

import { useState } from "react";
import { formatINR, maskAadhar, type Admission } from "@/lib/types";
import type { AdmissionWithPaid } from "@/app/actions/admissions";
import AdmissionDrawer from "./AdmissionDrawer";
import NewAdmissionDialog from "./NewAdmissionDialog";

type BatchFilter = "all" | string;

export default function AdmissionsTable({
  admissions,
  batches,
}: {
  admissions: AdmissionWithPaid[];
  batches: string[];
}) {
  const [filter, setFilter] = useState<BatchFilter>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Admission | null>(null);
  const [newOpen, setNewOpen] = useState(false);

  const visible = admissions.filter((a) => {
    if (filter !== "all" && a.batch_no !== filter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.phone.toLowerCase().includes(q) ||
      (a.email ?? "").toLowerCase().includes(q) ||
      (a.batch_no ?? "").toLowerCase().includes(q) ||
      (a.address ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="mt-6 md:mt-8 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterPill
            active={filter === "all"}
            onClick={() => setFilter("all")}
          >
            All ({admissions.length})
          </FilterPill>
          {batches.map((b) => (
            <FilterPill
              key={b}
              active={filter === b}
              onClick={() => setFilter(b)}
            >
              {b}
            </FilterPill>
          ))}
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="search"
            placeholder="Search name / phone / email / batch..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 md:w-72 bg-white border border-line rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-forest"
          />
          <button
            type="button"
            onClick={() => setNewOpen(true)}
            className="pill-btn text-sm whitespace-nowrap shrink-0"
          >
            <span className="hidden sm:inline">+ New admission</span>
            <span className="sm:hidden">+ New</span>
          </button>
        </div>
      </div>

      {/* MOBILE — always card list */}
      <div className="md:hidden mt-5 bg-white border border-line rounded-2xl overflow-hidden">
        {visible.length === 0 ? (
          <Empty total={admissions.length} />
        ) : (
          <ul className="divide-y divide-line">
            {visible.map((a) => (
              <li
                key={a.id}
                onClick={() => setSelected(a)}
                className="cursor-pointer hover:bg-cream/60 active:bg-cream transition px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{a.name}</div>
                    <div className="inline-flex items-center gap-2 text-xs mt-0.5">
                      <a
                        href={`tel:${a.phone}`}
                        onClick={(ev) => ev.stopPropagation()}
                        className="text-ink hover:text-forest"
                      >
                        {a.phone}
                      </a>
                      <a
                        href={`https://wa.me/${a.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(ev) => ev.stopPropagation()}
                        aria-label="WhatsApp"
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white bg-[#25D366] hover:bg-[#1da856] transition"
                      >
                        <WhatsAppIcon size={11} />
                      </a>
                    </div>
                  </div>
                  {a.batch_no && (
                    <span className="shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] border font-medium bg-ink text-white border-ink">
                      Batch {a.batch_no}
                    </span>
                  )}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  {a.age != null && (
                    <div>
                      <span className="text-muted">Age: </span>
                      <span>{a.age}</span>
                    </div>
                  )}
                  {a.email && (
                    <div className="truncate col-span-2">
                      <span className="text-muted">Email: </span>
                      <a
                        href={`mailto:${a.email}`}
                        onClick={(ev) => ev.stopPropagation()}
                        className="text-ink hover:text-forest"
                      >
                        {a.email}
                      </a>
                    </div>
                  )}
                  {a.address && (
                    <div className="col-span-2 line-clamp-2 text-ink/80">
                      <span className="text-muted">Address: </span>
                      {a.address}
                    </div>
                  )}
                </div>
                {(a.family_name || a.family_phone) && (
                  <div className="mt-2 text-xs bg-cream/60 border border-line rounded-lg px-2.5 py-1.5">
                    <span className="text-muted">Family: </span>
                    <span className="text-ink">
                      {a.family_name ?? "—"}
                      {a.family_relation ? ` (${a.family_relation})` : ""}
                      {a.family_phone ? ` · ${a.family_phone}` : ""}
                    </span>
                  </div>
                )}
                <div className="mt-2">
                  <FeesCell paid={a.paid} total={a.total_fee} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* DESKTOP table */}
      <div className="hidden md:block mt-5 bg-white border border-line rounded-3xl overflow-hidden">
        {visible.length === 0 ? (
          <Empty total={admissions.length} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream/70 text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Age</th>
                  <th className="px-5 py-3 font-medium">Aadhar</th>
                  <th className="px-5 py-3 font-medium">Family contact</th>
                  <th className="px-5 py-3 font-medium">Fees</th>
                  <th className="px-5 py-3 font-medium">Batch</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => setSelected(a)}
                    className="cursor-pointer hover:bg-cream/60 transition"
                  >
                    <td className="px-5 py-4 font-medium">
                      <div>{a.name}</div>
                      {a.address && (
                        <div className="text-xs text-muted truncate max-w-[240px]">
                          {a.address}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-2">
                        <a
                          href={`tel:${a.phone}`}
                          onClick={(ev) => ev.stopPropagation()}
                          className="text-ink hover:text-forest"
                        >
                          {a.phone}
                        </a>
                        <a
                          href={`https://wa.me/${a.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(ev) => ev.stopPropagation()}
                          aria-label="WhatsApp"
                          className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white bg-[#25D366] hover:bg-[#1da856] transition"
                        >
                          <WhatsAppIcon />
                        </a>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {a.email ? (
                        <a
                          href={`mailto:${a.email}`}
                          onClick={(ev) => ev.stopPropagation()}
                          className="hover:text-ink"
                        >
                          {a.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted">{a.age ?? "—"}</td>
                    <td className="px-5 py-4 text-muted num-mono text-xs">
                      {maskAadhar(a.aadhar_no)}
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {a.family_name ? (
                        <div>
                          <div className="text-ink text-[13px]">
                            {a.family_name}
                            {a.family_relation && (
                              <span className="text-muted">
                                {" "}
                                · {a.family_relation}
                              </span>
                            )}
                          </div>
                          {a.family_phone && (
                            <div className="text-xs">{a.family_phone}</div>
                          )}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <FeesCell paid={a.paid} total={a.total_fee} />
                    </td>
                    <td className="px-5 py-4">
                      {a.batch_no ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border font-medium bg-ink text-white border-ink">
                          {a.batch_no}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted whitespace-nowrap">
                      {formatDate(a.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdmissionDrawer
        admission={selected}
        onClose={() => setSelected(null)}
      />
      <NewAdmissionDialog open={newOpen} onClose={() => setNewOpen(false)} />
    </>
  );
}

function Empty({ total }: { total: number }) {
  return (
    <div className="p-10 text-center text-muted text-sm">
      {total === 0
        ? "No admissions yet. Click '+ New admission' to add the first student."
        : "No admissions match the current filter."}
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

function FeesCell({
  paid,
  total,
}: {
  paid: number;
  total: number | null;
}) {
  if (!total) {
    return paid > 0 ? (
      <span className="text-emerald-700 text-xs font-medium num-mono">
        {formatINR(paid)} paid
      </span>
    ) : (
      <span className="text-muted text-xs">—</span>
    );
  }
  const pct = Math.min(100, Math.round((paid / total) * 100));
  const balance = total - paid;
  const fullyPaid = balance <= 0;
  return (
    <div className="min-w-[140px]">
      <div className="flex items-baseline justify-between gap-2 text-xs num-mono">
        <span className={fullyPaid ? "text-emerald-700 font-medium" : "text-ink"}>
          {formatINR(paid)}
        </span>
        <span className="text-muted">/ {formatINR(total)}</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-line overflow-hidden">
        <div
          className={
            "h-full transition-all " +
            (fullyPaid ? "bg-emerald-500" : "bg-forest")
          }
          style={{ width: `${pct}%` }}
        />
      </div>
      {!fullyPaid && (
        <div className="mt-1 text-[10px] text-amber-800 num-mono">
          {formatINR(balance)} due
        </div>
      )}
    </div>
  );
}

function WhatsAppIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-1 1.2-.4.2-.7.1c-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4-.1-.5-.1-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2 3 4.8 4.2 1.7.7 2.3.8 3.1.7.5-.1 1.6-.6 1.8-1.3.2-.7.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.7.4 3.4 1.3 4.9L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
    </svg>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDay = Math.floor(
    (now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000)
  );
  if (diffDay < 1) return "today";
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
