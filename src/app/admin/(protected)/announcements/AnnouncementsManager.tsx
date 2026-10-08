"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
} from "@/app/actions/announcements";
import type { Announcement } from "@/lib/types";
import { ShowMoreButton, usePagination } from "@/components/pagination";

const inputClass =
  "mt-1 w-full bg-white border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-forest";

function Spinner() {
  return (
    <svg
      className="animate-spin w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="9" className="opacity-25" />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return formatDate(iso);
}

/** "All students" or a multi-select of batches. Empty selection = all. */
function AudiencePicker({
  batches,
  value,
  onChange,
  disabled,
}: {
  batches: string[];
  value: string[] | null; // null = all students
  onChange: (next: string[] | null) => void;
  disabled?: boolean;
}) {
  const all = value === null;
  const selected = value ?? [];

  function toggle(b: string) {
    onChange(
      selected.includes(b)
        ? selected.filter((x) => x !== b)
        : [...selected, b]
    );
  }

  const chip = (active: boolean) =>
    [
      "px-3.5 py-1.5 rounded-full text-sm border transition disabled:opacity-60",
      active
        ? "bg-ink text-white border-ink"
        : "bg-white border-line hover:bg-cream",
    ].join(" ");

  return (
    <div>
      <div className="inline-flex p-1 rounded-full bg-cream border border-line">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(null)}
          className={[
            "px-4 py-1.5 rounded-full text-sm transition",
            all ? "bg-white shadow-sm font-medium" : "text-muted hover:text-ink",
          ].join(" ")}
        >
          All students
        </button>
        <button
          type="button"
          disabled={disabled || batches.length === 0}
          onClick={() => onChange(all ? [] : selected)}
          className={[
            "px-4 py-1.5 rounded-full text-sm transition disabled:opacity-50 disabled:cursor-not-allowed",
            !all ? "bg-white shadow-sm font-medium" : "text-muted hover:text-ink",
          ].join(" ")}
        >
          Specific batches
        </button>
      </div>

      {batches.length === 0 && (
        <p className="text-xs text-muted mt-2">
          No batches yet. Set a batch number on admissions to target them.
        </p>
      )}

      {!all && (
        <div className="mt-3">
          <div className="flex flex-wrap gap-2">
            {batches.map((b) => (
              <button
                key={b}
                type="button"
                disabled={disabled}
                onClick={() => toggle(b)}
                className={chip(selected.includes(b))}
              >
                Batch {b}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted mt-2">
            {selected.length === 0
              ? "Pick at least one batch."
              : `Visible only to ${selected.length} batch${
                  selected.length === 1 ? "" : "es"
                }.`}
          </p>
        </div>
      )}
    </div>
  );
}

function AudienceBadge({ batches }: { batches: string[] }) {
  const all = batches.length === 0;
  const label = all
    ? "All students"
    : batches.length <= 2
      ? batches.map((b) => `Batch ${b}`).join(", ")
      : `${batches.length} batches`;
  return (
    <span
      title={all ? undefined : batches.map((b) => `Batch ${b}`).join(", ")}
      className={[
        "inline-flex items-center gap-1.5 text-[11px] rounded-full px-2.5 py-1 border",
        all
          ? "bg-cream/70 border-line text-ink/70"
          : "bg-forest/5 border-forest/20 text-forest",
      ].join(" ")}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
      {label}
    </span>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={[
        "w-8 h-8 rounded-full flex items-center justify-center transition disabled:opacity-50",
        danger
          ? "text-ink/40 hover:text-red-700 hover:bg-red-50"
          : active
            ? "text-ink bg-lime hover:bg-lime-dk"
            : "text-ink/55 hover:text-ink hover:bg-cream",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

const svgProps = {
  width: 15,
  height: 15,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export default function AnnouncementsManager({
  announcements,
  batches,
}: {
  announcements: Announcement[];
  batches: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [audience, setAudience] = useState<string[] | null>(null);

  const [editRow, setEditRow] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [draftAudience, setDraftAudience] = useState<string[] | null>(null);
  const [confirmDeleteRow, setConfirmDeleteRow] = useState<string | null>(null);
  const { paged, remaining, showMore } = usePagination(announcements, 12);

  function run(
    fn: () => Promise<{ ok: boolean; error?: string }>,
    onDone?: () => void
  ) {
    setError(undefined);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) setError(result.error ?? "Something went wrong.");
      else {
        setEditRow(null);
        setConfirmDeleteRow(null);
        onDone?.();
        router.refresh();
      }
    });
  }

  function resetForm() {
    setTitle("");
    setBody("");
    setPinned(false);
    setAudience(null);
    setShowForm(false);
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (audience !== null && audience.length === 0) {
      setError("Pick at least one batch, or choose All students.");
      return;
    }
    run(
      () =>
        createAnnouncement({
          title,
          body,
          pinned,
          batches: audience ?? [],
        }),
      resetForm
    );
  }

  return (
    <>
      <div className="mt-6 md:mt-8 flex items-center justify-between gap-3">
        <div className="text-sm text-muted">
          {announcements.length} announcement
          {announcements.length === 1 ? "" : "s"}
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => {
              setError(undefined);
              setShowForm(true);
            }}
            className="pill-btn"
          >
            + New announcement
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mt-4 bg-white border border-line rounded-3xl p-6"
        >
          <h2 className="font-display text-xl">New announcement</h2>
          <div className="mt-4 space-y-5">
            <div>
              <label className="text-sm">Send to</label>
              <div className="mt-2">
                <AudiencePicker
                  batches={batches}
                  value={audience}
                  onChange={setAudience}
                  disabled={pending}
                />
              </div>
            </div>
            <div>
              <label className="text-sm">Title</label>
              <input
                type="text"
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                placeholder="e.g. Holiday on Friday"
              />
            </div>
            <div>
              <label className="text-sm">Message (optional)</label>
              <textarea
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className={inputClass}
                placeholder="Details for students…"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="accent-forest"
              />
              Pin to top
            </label>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="pill-btn inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pending && <Spinner />}
              {pending ? "Publishing…" : "Publish"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={resetForm}
              className="px-5 py-2.5 rounded-full text-sm border border-line hover:bg-cream transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {announcements.length === 0 ? (
        <p className="text-muted text-sm mt-8 text-center bg-white border border-line rounded-2xl px-5 py-10">
          No announcements yet. Click &ldquo;+ New announcement&rdquo; to post
          one.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paged.map((a) => {
            const editing = editRow === a.id;
            const confirmingDelete = confirmDeleteRow === a.id;
            const aBatches = a.batches ?? [];

            if (editing) {
              return (
                <div
                  key={a.id}
                  className="bg-white border border-forest/40 rounded-3xl p-5 space-y-4 shadow-[0_16px_32px_-24px_rgba(15,20,16,0.4)]"
                >
                  <div className="text-xs uppercase tracking-wider text-muted">
                    Editing
                  </div>
                  <AudiencePicker
                    batches={batches}
                    value={draftAudience}
                    onChange={setDraftAudience}
                    disabled={pending}
                  />
                  <input
                    type="text"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    className="w-full bg-white border border-line rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-forest"
                    placeholder="Title"
                  />
                  <textarea
                    value={draftBody}
                    onChange={(e) => setDraftBody(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-line rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-forest"
                    placeholder="Message"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        if (draftAudience !== null && draftAudience.length === 0) {
                          setError("Pick at least one batch, or choose All students.");
                          return;
                        }
                        run(() =>
                          updateAnnouncement(a.id, {
                            title: draftTitle,
                            body: draftBody || null,
                            published: a.published,
                            pinned: a.pinned,
                            batches: draftAudience ?? [],
                          })
                        );
                      }}
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm bg-ink text-white hover:bg-forest transition disabled:opacity-60"
                    >
                      {pending && <Spinner />}
                      {pending ? "Saving…" : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditRow(null)}
                      className="px-3 py-1.5 rounded-full text-sm border border-line hover:bg-cream transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <article
                key={a.id}
                className={[
                  "group relative overflow-hidden rounded-3xl p-5 flex flex-col border transition",
                  "hover:shadow-[0_16px_32px_-22px_rgba(15,20,16,0.4)] hover:-translate-y-0.5",
                  a.pinned
                    ? "bg-white border-lime"
                    : a.published
                      ? "bg-white border-line"
                      : "bg-white/60 border-dashed border-line",
                ].join(" ")}
              >
                {a.pinned && (
                  <span className="absolute inset-x-0 top-0 h-1 bg-lime" />
                )}

                <div className="flex items-start gap-3">
                  <span
                    className={[
                      "inline-flex items-center justify-center w-10 h-10 rounded-2xl shrink-0",
                      a.pinned ? "bg-lime text-ink" : "bg-cream text-forest",
                    ].join(" ")}
                  >
                    <svg {...svgProps} width={18} height={18}>
                      <path d="M3 11l18-5v12L3 14v-3z" />
                      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span
                        className={[
                          "inline-flex items-center gap-1.5 font-medium",
                          a.published ? "text-forest" : "text-zinc-500",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "w-1.5 h-1.5 rounded-full",
                            a.published ? "bg-emerald-500" : "bg-zinc-400",
                          ].join(" ")}
                        />
                        {a.published ? "Live" : "Hidden"}
                      </span>
                      <span aria-hidden>·</span>
                      <time dateTime={a.created_at} title={formatDate(a.created_at)}>
                        {timeAgo(a.created_at)}
                      </time>
                      {a.pinned && (
                        <span className="ml-auto text-[10px] uppercase tracking-wider font-semibold bg-lime text-ink rounded-full px-2 py-0.5">
                          Pinned
                        </span>
                      )}
                    </div>
                    <h3
                      className={[
                        "font-display text-lg leading-snug mt-1 break-words",
                        !a.published && "text-ink/60",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {a.title}
                    </h3>
                  </div>
                </div>

                {a.body && (
                  <p className="text-sm text-ink/65 mt-3 whitespace-pre-line leading-relaxed line-clamp-4">
                    {a.body}
                  </p>
                )}

                <div className="mt-auto pt-4">
                  <div className="pt-3 border-t border-line flex items-center gap-2">
                    {confirmingDelete ? (
                      <>
                        <span className="text-xs text-red-700 mr-auto">
                          Delete permanently?
                        </span>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteRow(null)}
                          className="px-3 py-1.5 rounded-full text-xs border border-line hover:bg-cream transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => run(() => deleteAnnouncement(a.id))}
                          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60"
                        >
                          {pending && <Spinner />}
                          {pending ? "Deleting…" : "Delete"}
                        </button>
                      </>
                    ) : (
                      <>
                        <AudienceBadge batches={aBatches} />
                        <div className="ml-auto flex items-center gap-0.5">
                          <IconButton
                            label="Edit"
                            onClick={() => {
                              setError(undefined);
                              setEditRow(a.id);
                              setDraftTitle(a.title);
                              setDraftBody(a.body ?? "");
                              setDraftAudience(aBatches.length ? aBatches : null);
                            }}
                          >
                            <svg {...svgProps}>
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                          </IconButton>
                          <IconButton
                            label={a.pinned ? "Unpin" : "Pin to top"}
                            active={a.pinned}
                            disabled={pending}
                            onClick={() =>
                              run(() =>
                                updateAnnouncement(a.id, {
                                  title: a.title,
                                  body: a.body,
                                  published: a.published,
                                  pinned: !a.pinned,
                                })
                              )
                            }
                          >
                            <svg {...svgProps}>
                              <path d="M12 17v5" />
                              <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
                            </svg>
                          </IconButton>
                          <IconButton
                            label={a.published ? "Hide from students" : "Show to students"}
                            disabled={pending}
                            onClick={() =>
                              run(() =>
                                updateAnnouncement(a.id, {
                                  title: a.title,
                                  body: a.body,
                                  published: !a.published,
                                  pinned: a.pinned,
                                })
                              )
                            }
                          >
                            {a.published ? (
                              <svg {...svgProps}>
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                              </svg>
                            ) : (
                              <svg {...svgProps}>
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            )}
                          </IconButton>
                          <IconButton
                            label="Delete"
                            danger
                            onClick={() => setConfirmDeleteRow(a.id)}
                          >
                            <svg {...svgProps}>
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </IconButton>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ShowMoreButton remaining={remaining} onShowMore={showMore} />
    </>
  );
}
