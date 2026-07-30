"use client";

import { useRef, useState, useTransition } from "react";
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

export default function AnnouncementsManager({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [showForm, setShowForm] = useState(false);
  const [editRow, setEditRow] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
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

  function handleCreate(formData: FormData) {
    run(
      () =>
        createAnnouncement({
          title: String(formData.get("title") ?? ""),
          body: String(formData.get("body") ?? ""),
          pinned: formData.get("pinned") === "on",
        }),
      () => {
        formRef.current?.reset();
        setShowForm(false);
      }
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
          ref={formRef}
          action={handleCreate}
          className="mt-4 bg-white border border-line rounded-3xl p-6"
        >
          <h2 className="font-display text-xl">New announcement</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm">Title</label>
              <input
                name="title"
                type="text"
                required
                autoFocus
                className={inputClass}
                placeholder="e.g. Holiday on Friday"
              />
            </div>
            <div>
              <label className="text-sm">Message (optional)</label>
              <textarea
                name="body"
                rows={3}
                className={inputClass}
                placeholder="Details for students…"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="pinned" className="accent-forest" />
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
              onClick={() => setShowForm(false)}
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
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {paged.map((a) => {
            const editing = editRow === a.id;
            const confirmingDelete = confirmDeleteRow === a.id;
            return (
              <div
                key={a.id}
                className={[
                  "border rounded-2xl p-5 flex flex-col",
                  a.pinned ? "bg-lime/20 border-lime" : "bg-white border-line",
                ].join(" ")}
              >
                {editing ? (
                  <div className="space-y-3 flex-1">
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
                        onClick={() =>
                          run(() =>
                            updateAnnouncement(a.id, {
                              title: draftTitle,
                              body: draftBody || null,
                              published: a.published,
                              pinned: a.pinned,
                            })
                          )
                        }
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
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-wrap">
                      {a.pinned && (
                        <span className="text-[10px] uppercase tracking-wider bg-lime text-ink rounded-full px-2 py-0.5">
                          Pinned
                        </span>
                      )}
                      {!a.published && (
                        <span className="text-[10px] uppercase tracking-wider bg-zinc-100 text-zinc-600 border border-zinc-200 rounded-full px-2 py-0.5">
                          Hidden
                        </span>
                      )}
                      <time className="text-xs text-muted ml-auto">
                        {formatDate(a.created_at)}
                      </time>
                    </div>

                    <div className="mt-2 font-medium text-[15px] leading-tight">
                      {a.title}
                    </div>
                    {a.body && (
                      <p className="text-xs text-ink/70 mt-1.5 whitespace-pre-line line-clamp-4">
                        {a.body}
                      </p>
                    )}

                    <div className="mt-4 pt-3 border-t border-line flex items-center gap-1.5 flex-wrap">
                      {confirmingDelete ? (
                        <>
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => run(() => deleteAnnouncement(a.id))}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60"
                          >
                            {pending && <Spinner />}
                            {pending ? "Deleting…" : "Confirm delete"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteRow(null)}
                            className="px-3 py-1.5 rounded-full text-xs border border-line hover:bg-cream transition"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditRow(a.id);
                              setDraftTitle(a.title);
                              setDraftBody(a.body ?? "");
                            }}
                            className="px-3.5 py-1.5 rounded-full text-xs border border-line hover:bg-cream transition"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
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
                            className="px-3.5 py-1.5 rounded-full text-xs border border-line hover:bg-cream transition disabled:opacity-60"
                          >
                            {a.pinned ? "Unpin" : "Pin"}
                          </button>
                          <button
                            type="button"
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
                            className="px-3.5 py-1.5 rounded-full text-xs border border-line hover:bg-cream transition disabled:opacity-60"
                          >
                            {a.published ? "Hide" : "Publish"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteRow(a.id)}
                            title="Delete"
                            className="ml-auto w-7 h-7 rounded-full text-ink/40 hover:text-red-700 hover:bg-red-50 flex items-center justify-center transition"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ShowMoreButton remaining={remaining} onShowMore={showMore} />
    </>
  );
}
