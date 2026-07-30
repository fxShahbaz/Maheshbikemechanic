"use client";

import { useEffect, useState } from "react";
import {
  ENQUIRY_STATUSES,
  formatStatus,
  type Enquiry,
  type EnquiryStatus,
} from "@/lib/types";
import EnquiryDrawer from "./EnquiryDrawer";
import NewEnquiryDialog from "./NewEnquiryDialog";
import BoardView from "./BoardView";
import { ShowMoreButton, usePagination } from "@/components/pagination";

type ViewMode = "table" | "board";
const VIEW_KEY = "mbi-admin-enquiries-view";

const STATUS_STYLES: Record<EnquiryStatus, string> = {
  new: "bg-lime/40 text-forest border-lime",
  contacted: "bg-amber-100 text-amber-900 border-amber-200",
  dormant: "bg-sky-100 text-sky-900 border-sky-200",
  enrolled: "bg-emerald-100 text-emerald-900 border-emerald-200",
  closed: "bg-zinc-100 text-zinc-700 border-zinc-200",
};

type Filter = "all" | EnquiryStatus;

export default function EnquiriesTable({
  enquiries,
}: {
  enquiries: Enquiry[];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [view, setView] = useState<ViewMode>("table");

  // Hydrate persisted view preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_KEY);
      if (saved === "board" || saved === "table") setView(saved);
    } catch {
      /* ignore */
    }
  }, []);

  function setViewAndPersist(v: ViewMode) {
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      /* ignore */
    }
  }

  const visible = enquiries.filter((e) => {
    // Board view's columns already partition by status — don't apply the status
    // filter pill there, otherwise dragging a card to a new status would remove
    // it from the dataset (it'd no longer match the active filter) and the card
    // would disappear after drop.
    if (view === "table" && filter !== "all" && e.status !== filter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.phone.toLowerCase().includes(q) ||
      (e.city ?? "").toLowerCase().includes(q) ||
      (e.interest ?? "").toLowerCase().includes(q)
    );
  });

  // Board view shows the full set; the mobile list and desktop table page it
  const { paged, remaining, showMore } = usePagination(
    visible,
    20,
    `${filter}|${query}|${view}`
  );

  return (
    <>
      <div className="mt-6 md:mt-8 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        {/* Filter pills — always on mobile (mobile is locked to card view);
            on desktop only when table view is active. */}
        <div
          className={
            view === "board"
              ? "md:hidden flex flex-wrap gap-2"
              : "flex flex-wrap gap-2"
          }
        >
          <FilterPill
            active={filter === "all"}
            onClick={() => setFilter("all")}
          >
            All ({enquiries.length})
          </FilterPill>
          {ENQUIRY_STATUSES.map((s) => (
            <FilterPill
              key={s}
              active={filter === s}
              onClick={() => setFilter(s)}
            >
              {formatStatus(s)}
            </FilterPill>
          ))}
        </div>
        {/* Drag hint — desktop board view only */}
        {view === "board" && (
          <div className="hidden md:block text-xs text-muted">
            Drag cards between columns to change status
          </div>
        )}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* View toggle is desktop-only; mobile is forced to the card list */}
          <div className="hidden md:inline-flex">
            <ViewSwitch view={view} onChange={setViewAndPersist} />
          </div>
          <input
            type="search"
            placeholder="Search name / phone / city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 md:w-60 bg-white border border-line rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-forest"
          />
          <button
            type="button"
            onClick={() => setNewOpen(true)}
            className="pill-btn text-sm whitespace-nowrap shrink-0"
          >
            <span className="hidden sm:inline">+ New enquiry</span>
            <span className="sm:hidden">+ New</span>
          </button>
        </div>
      </div>

      {/* MOBILE: always card list, regardless of view toggle */}
      <div className="md:hidden mt-5 bg-white border border-line rounded-2xl overflow-hidden">
        {visible.length === 0 ? (
          <div className="p-10 text-center text-muted text-sm">
            {enquiries.length === 0
              ? "No enquiries yet. They'll appear here as soon as the form is submitted on the homepage."
              : "No enquiries match the current filter."}
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {paged.map((e) => (
              <li
                key={e.id}
                onClick={() => setSelected(e)}
                className="cursor-pointer hover:bg-cream/60 active:bg-cream transition px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{e.name}</div>
                    <div
                      className="inline-flex items-center gap-2 text-xs mt-0.5"
                      onClick={(ev) => ev.stopPropagation()}
                    >
                      <a
                        href={`tel:${e.phone}`}
                        className="text-ink hover:text-forest"
                      >
                        {e.phone}
                      </a>
                      <a
                        href={`https://wa.me/${e.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open WhatsApp chat"
                        title="WhatsApp"
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white bg-[#25D366] hover:bg-[#1da856] transition"
                      >
                        <WhatsAppIcon size={11} />
                      </a>
                    </div>
                  </div>
                  <span
                    className={
                      "shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] border font-medium " +
                      STATUS_STYLES[e.status]
                    }
                  >
                    {formatStatus(e.status)}
                  </span>
                </div>

                {(e.city || e.interest) && (
                  <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    {e.city && (
                      <div>
                        <span className="text-muted">City: </span>
                        <span className="text-ink">{e.city}</span>
                      </div>
                    )}
                    {e.interest && (
                      <div className="truncate">
                        <span className="text-muted">Interest: </span>
                        <span className="text-ink">{e.interest}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <SourceChip source={e.source} />
                  <span className="px-2 py-0.5 rounded-full bg-cream border border-line text-muted">
                    {formatDate(e.created_at)}
                  </span>
                  {e.reminder_date && (
                    <ReminderCell date={e.reminder_date} />
                  )}
                </div>

                {e.notes && (
                  <div className="mt-2 text-xs text-ink/80 bg-cream/60 border border-line rounded-lg px-2.5 py-1.5 line-clamp-2">
                    {e.notes}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* DESKTOP: respect the view toggle (table or board) */}
      <div className="hidden md:block">
        {view === "board" ? (
          <div className="mt-5">
            <BoardView enquiries={visible} onSelect={setSelected} />
          </div>
        ) : (
          <div className="mt-5 bg-white border border-line rounded-3xl overflow-hidden">
            {visible.length === 0 ? (
              <div className="p-10 text-center text-muted text-sm">
                {enquiries.length === 0
                  ? "No enquiries yet. They'll appear here as soon as the form is submitted on the homepage."
                  : "No enquiries match the current filter."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-cream/70 text-left text-xs uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-5 py-3 font-medium">Name</th>
                      <th className="px-5 py-3 font-medium">Phone</th>
                      <th className="px-5 py-3 font-medium">City</th>
                      <th className="px-5 py-3 font-medium">Interest</th>
                      <th className="px-5 py-3 font-medium">Source</th>
                      <th className="px-5 py-3 font-medium">Received</th>
                      <th className="px-5 py-3 font-medium">Reminder</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {paged.map((e) => (
                      <tr
                        key={e.id}
                        onClick={() => setSelected(e)}
                        className="cursor-pointer hover:bg-cream/60 transition"
                      >
                        <td className="px-5 py-4 font-medium">{e.name}</td>
                        <td
                          className="px-5 py-4"
                          onClick={(ev) => ev.stopPropagation()}
                        >
                          <div className="inline-flex items-center gap-2">
                            <a
                              href={`tel:${e.phone}`}
                              className="text-ink hover:text-forest"
                            >
                              {e.phone}
                            </a>
                            <a
                              href={`https://wa.me/${e.phone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Open WhatsApp chat"
                              title="WhatsApp"
                              className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white bg-[#25D366] hover:bg-[#1da856] transition"
                            >
                              <WhatsAppIcon />
                            </a>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-muted">{e.city ?? "—"}</td>
                        <td className="px-5 py-4 text-muted">
                          {e.interest ?? "—"}
                        </td>
                        <td className="px-5 py-4">
                          <SourceChip source={e.source} />
                        </td>
                        <td className="px-5 py-4 text-muted whitespace-nowrap">
                          {formatDate(e.created_at)}
                        </td>
                        <td className="px-5 py-4">
                          <ReminderCell date={e.reminder_date} />
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] border font-medium " +
                              STATUS_STYLES[e.status]
                            }
                          >
                            {formatStatus(e.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Board view renders every card, so hide the pager there on desktop */}
      <ShowMoreButton
        remaining={remaining}
        onShowMore={showMore}
        className={view === "board" ? "md:hidden" : ""}
      />

      <EnquiryDrawer enquiry={selected} onClose={() => setSelected(null)} />
      <NewEnquiryDialog open={newOpen} onClose={() => setNewOpen(false)} />
    </>
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

function ViewSwitch({
  view,
  onChange,
}: {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div className="inline-flex items-center bg-white border border-line rounded-xl p-0.5 shrink-0">
      <button
        type="button"
        onClick={() => onChange("table")}
        aria-pressed={view === "table"}
        title="Table view"
        className={
          "inline-flex items-center justify-center w-9 h-9 rounded-lg transition " +
          (view === "table"
            ? "bg-ink text-white"
            : "text-ink/70 hover:bg-cream")
        }
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => onChange("board")}
        aria-pressed={view === "board"}
        title="Board view"
        className={
          "inline-flex items-center justify-center w-9 h-9 rounded-lg transition " +
          (view === "board"
            ? "bg-ink text-white"
            : "text-ink/70 hover:bg-cream")
        }
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M8 7v7" />
          <path d="M12 7v4" />
          <path d="M16 7v9" />
        </svg>
      </button>
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

function SourceChip({ source }: { source: string | null }) {
  if (!source) return <span className="text-muted text-xs">—</span>;
  const cls =
    source === "website"
      ? "bg-cream text-ink border-line"
      : source === "admin"
        ? "bg-ink text-white border-ink"
        : "bg-white text-ink border-line";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border font-medium ${cls}`}
    >
      {source}
    </span>
  );
}

function ReminderCell({ date }: { date: string | null }) {
  if (!date) return <span className="text-muted">—</span>;
  const d = new Date(date + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (d.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
  );
  const overdue = diffDays < 0;
  const soon = !overdue && diffDays <= 2;
  const cls = overdue
    ? "bg-red-100 text-red-800 border-red-200"
    : soon
      ? "bg-amber-100 text-amber-900 border-amber-200"
      : "bg-white text-ink border-line";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border font-medium ${cls}`}
    >
      ⏰ {formatReminder(date)}
    </span>
  );
}

function formatReminder(date: string): string {
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
