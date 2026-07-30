"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createEngine,
  deleteEngine,
  renameEngine,
  setEngineActive,
} from "@/app/actions/engines";
import type { Engine } from "@/lib/types";
import { ShowMoreButton, usePagination } from "@/components/pagination";

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

export default function EnginesManager({ engines }: { engines: Engine[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [showForm, setShowForm] = useState(false);
  const [editRow, setEditRow] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [confirmDeleteRow, setConfirmDeleteRow] = useState<string | null>(null);
  const { paged, remaining, showMore } = usePagination(engines, 15);

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
        createEngine(
          String(formData.get("name") ?? ""),
          String(formData.get("brand") ?? "")
        ),
      () => formRef.current?.reset()
    );
  }

  const active = engines.filter((e) => e.active).length;

  return (
    <>
      <div className="mt-6 md:mt-8 flex items-center justify-between gap-3">
        <div className="text-sm text-muted">
          {engines.length} engine{engines.length === 1 ? "" : "s"} · {active}{" "}
          active
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
            + Add engine
          </button>
        )}
      </div>

      {showForm && (
        <form
          ref={formRef}
          action={handleCreate}
          className="mt-4 bg-white border border-line rounded-3xl p-6"
        >
          <h2 className="font-display text-xl">Add an engine</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 md:max-w-2xl">
            <div>
              <label className="text-sm">Engine name / number</label>
              <input
                name="name"
                type="text"
                required
                autoFocus
                className="mt-1 w-full bg-white border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-forest"
                placeholder="e.g. Hero Splendor (Old Model)"
              />
            </div>
            <div>
              <label className="text-sm">Brand (optional)</label>
              <input
                name="brand"
                type="text"
                className="mt-1 w-full bg-white border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-forest"
                placeholder="e.g. HERO MOTOCORP"
              />
            </div>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="pill-btn inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pending && <Spinner />}
              {pending ? "Adding…" : "Add engine"}
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

      <div className="mt-4 bg-white border border-line rounded-2xl md:rounded-3xl overflow-hidden">
        {engines.length === 0 ? (
          <p className="text-muted text-sm px-5 py-10 text-center">
            No engines yet. Add one so students get a dropdown when punching
            in. Until then, students type the engine name freely.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream/70 text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Engine</th>
                  <th className="px-5 py-3 font-medium">Brand</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium whitespace-nowrap">Added</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {paged.map((e) => {
                  const editing = editRow === e.id;
                  const confirmingDelete = confirmDeleteRow === e.id;
                  return (
                    <tr key={e.id} className="hover:bg-cream/40 transition">
                      <td className="px-5 py-4">
                        {editing ? (
                          <input
                            type="text"
                            value={draftName}
                            onChange={(ev) => setDraftName(ev.target.value)}
                            className="w-full max-w-xs bg-white border border-line rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-forest"
                          />
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-cream text-forest shrink-0">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                              </svg>
                            </span>
                            <span className="font-medium">{e.name}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-muted whitespace-nowrap text-xs">
                        {e.brand ?? "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={[
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] border font-medium",
                            e.active
                              ? "bg-lime/40 text-ink border-lime"
                              : "bg-zinc-100 text-zinc-600 border-zinc-200",
                          ].join(" ")}
                        >
                          {e.active ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted whitespace-nowrap">
                        {formatDate(e.created_at)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {editing ? (
                            <>
                              <button
                                type="button"
                                disabled={pending}
                                onClick={() =>
                                  run(() => renameEngine(e.id, draftName))
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
                            </>
                          ) : confirmingDelete ? (
                            <>
                              <button
                                type="button"
                                disabled={pending}
                                onClick={() => run(() => deleteEngine(e.id))}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60"
                              >
                                {pending && <Spinner />}
                                {pending ? "Deleting…" : "Confirm delete"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteRow(null)}
                                className="px-3 py-1.5 rounded-full text-sm border border-line hover:bg-cream transition"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditRow(e.id);
                                  setDraftName(e.name);
                                }}
                                className="px-4 py-1.5 rounded-full text-sm border border-line hover:bg-cream transition"
                              >
                                Rename
                              </button>
                              <button
                                type="button"
                                disabled={pending}
                                onClick={() =>
                                  run(() => setEngineActive(e.id, !e.active))
                                }
                                className="px-4 py-1.5 rounded-full text-sm border border-line hover:bg-cream transition disabled:opacity-60"
                              >
                                {e.active ? "Disable" : "Enable"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteRow(e.id)}
                                title="Delete engine"
                                className="w-8 h-8 rounded-full text-ink/40 hover:text-red-700 hover:bg-red-50 flex items-center justify-center transition"
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </>
                          )}
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
