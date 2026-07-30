"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addMaterial,
  createMaterialUpload,
  deleteMaterial,
  setMaterialPublished,
  updateMaterial,
} from "@/app/actions/materials";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { StudyMaterial } from "@/lib/types";
import { ShowMoreButton, usePagination } from "@/components/pagination";

const BUCKET = "study-materials";

const inputClass =
  "mt-1 w-full bg-white border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-forest";

function formatSize(bytes: number | null): string {
  if (bytes == null) return "—";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MaterialsManager({
  materials,
}: {
  materials: StudyMaterial[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();
  const [showUpload, setShowUpload] = useState(false);
  const [editRow, setEditRow] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [confirmDeleteRow, setConfirmDeleteRow] = useState<string | null>(null);
  const { paged, remaining, showMore } = usePagination(materials, 12);

  async function handleUpload(formData: FormData) {
    setError(undefined);
    const file = formData.get("file") as File | null;
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    if (!file || file.size === 0) {
      setError("Choose a PDF file.");
      return;
    }
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }
    if (!title) {
      setError("Title is required.");
      return;
    }

    setUploading(true);
    try {
      const prep = await createMaterialUpload(file.name);
      if (!prep.ok) {
        setError(prep.error);
        return;
      }

      const supabase = supabaseBrowser();
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .uploadToSignedUrl(prep.path, prep.token, file);
      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const saved = await addMaterial({
        title,
        description: description || null,
        storage_path: prep.path,
        file_size: file.size,
      });
      if (!saved.ok) {
        setError(saved.error);
        return;
      }

      formRef.current?.reset();
      setShowUpload(false);
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(undefined);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) setError(result.error ?? "Something went wrong.");
      else {
        setEditRow(null);
        setConfirmDeleteRow(null);
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className="mt-6 md:mt-8 flex items-center justify-between gap-3">
        <div className="text-sm text-muted">
          {materials.length} file{materials.length === 1 ? "" : "s"}
        </div>
        {!showUpload && (
          <button
            type="button"
            onClick={() => {
              setError(undefined);
              setShowUpload(true);
            }}
            className="pill-btn"
          >
            + Add PDF
          </button>
        )}
      </div>

      {showUpload && (
        <form
          ref={formRef}
          action={handleUpload}
          className="mt-4 bg-white border border-line rounded-3xl p-6"
        >
          <h2 className="font-display text-xl">Upload a PDF</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm">Title</label>
              <input
                name="title"
                type="text"
                required
                autoFocus
                className={inputClass}
                placeholder="e.g. Engine assembly guide"
              />
            </div>
            <div>
              <label className="text-sm">Description (optional)</label>
              <input
                name="description"
                type="text"
                className={inputClass}
                placeholder="Short summary for students"
              />
            </div>
            <div>
              <label className="text-sm">PDF file</label>
              <input
                name="file"
                type="file"
                accept="application/pdf"
                required
                className="mt-1 w-full text-sm file:mr-3 file:px-4 file:py-2.5 file:rounded-xl file:border file:border-line file:bg-cream file:text-sm file:font-medium hover:file:bg-cream/70 file:cursor-pointer file:transition"
              />
            </div>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button
              type="submit"
              disabled={uploading}
              className="pill-btn inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {uploading && (
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
              )}
              {uploading ? "Uploading…" : "Upload"}
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={() => setShowUpload(false)}
              className="px-5 py-2.5 rounded-full text-sm border border-line hover:bg-cream transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            {uploading && (
              <span className="text-sm text-muted">
                Uploading the PDF — keep this page open…
              </span>
            )}
          </div>
        </form>
      )}

      {error && (
        <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {materials.length === 0 ? (
        <p className="text-muted text-sm mt-8 text-center bg-white border border-line rounded-2xl px-5 py-10">
          No study material uploaded yet. Click &ldquo;+ Add PDF&rdquo; to get
          started.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {paged.map((m) => {
            const editing = editRow === m.id;
            const confirmingDelete = confirmDeleteRow === m.id;
            return (
              <div
                key={m.id}
                className="bg-white border border-line rounded-2xl p-5 flex flex-col"
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
                    <input
                      type="text"
                      value={draftDescription}
                      onChange={(e) => setDraftDescription(e.target.value)}
                      className="w-full bg-white border border-line rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-forest"
                      placeholder="Description"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          run(() =>
                            updateMaterial(m.id, {
                              title: draftTitle,
                              description: draftDescription || null,
                            })
                          )
                        }
                        className="px-4 py-1.5 rounded-full text-sm bg-ink text-white hover:bg-forest transition disabled:opacity-60"
                      >
                        Save
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
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-cream text-forest shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </span>
                      <span
                        className={[
                          "text-[10px] uppercase tracking-wider border rounded-full px-2 py-0.5",
                          m.published
                            ? "bg-lime/40 text-ink border-lime"
                            : "bg-zinc-100 text-zinc-600 border-zinc-200",
                        ].join(" ")}
                      >
                        {m.published ? "Published" : "Hidden"}
                      </span>
                    </div>

                    <div className="mt-3 font-medium text-[15px] leading-tight">
                      {m.title}
                    </div>
                    <div className="text-xs text-muted mt-1">
                      {formatSize(m.file_size)} · {formatDate(m.created_at)}
                    </div>
                    {m.description && (
                      <p className="text-xs text-muted mt-1.5 line-clamp-2">
                        {m.description}
                      </p>
                    )}

                    <div className="mt-4 pt-3 border-t border-line flex items-center gap-1.5 flex-wrap">
                      {confirmingDelete ? (
                        <>
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => run(() => deleteMaterial(m.id))}
                            className="px-3.5 py-1.5 rounded-full text-xs bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60"
                          >
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
                          <a
                            href={`/student/materials/${m.id}/file`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 rounded-full text-xs border border-line hover:bg-cream transition"
                          >
                            Preview
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              setEditRow(m.id);
                              setDraftTitle(m.title);
                              setDraftDescription(m.description ?? "");
                            }}
                            className="px-3.5 py-1.5 rounded-full text-xs border border-line hover:bg-cream transition"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() =>
                              run(() => setMaterialPublished(m.id, !m.published))
                            }
                            className="px-3.5 py-1.5 rounded-full text-xs border border-line hover:bg-cream transition disabled:opacity-60"
                          >
                            {m.published ? "Hide" : "Publish"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteRow(m.id)}
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
