"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Renders the PDF onto canvases via pdf.js — there is no embedded file the
 * browser can "Save as", and the source URL only streams for signed-in,
 * active students. Right-click, print and save shortcuts are blocked and
 * every page carries the student's watermark. (True screenshot prevention
 * isn't possible on the web; the watermark makes leaks traceable.)
 */
export default function PdfViewer({
  fileUrl,
  watermark,
}: {
  fileUrl: string;
  watermark: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const container = containerRef.current;
      if (!container) return;

      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();

        const doc = await pdfjs.getDocument({ url: fileUrl }).promise;
        if (cancelled) return;
        setPageCount(doc.numPages);

        container.replaceChildren();
        const containerWidth = Math.min(container.clientWidth, 900);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        for (let i = 1; i <= doc.numPages; i++) {
          if (cancelled) return;
          const page = await doc.getPage(i);
          const base = page.getViewport({ scale: 1 });
          const scale = containerWidth / base.width;
          const viewport = page.getViewport({ scale: scale * dpr });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = `${viewport.width / dpr}px`;
          canvas.style.height = `${viewport.height / dpr}px`;
          canvas.className =
            "block mx-auto mb-4 rounded-xl border border-line bg-white shadow-sm";

          await page.render({
            canvas,
            canvasContext: canvas.getContext("2d")!,
            viewport,
          }).promise;
          if (cancelled) return;
          container.appendChild(canvas);
        }
        setState("ready");
      } catch {
        if (!cancelled) setState("error");
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  // Deterrents: no right-click, no save/print shortcuts, no printing
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && ["s", "p"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      className="mt-6 relative select-none print:hidden"
      onContextMenu={(e) => e.preventDefault()}
    >
      {state === "loading" && (
        <div className="text-center py-16">
          <div className="skeleton rounded-xl h-96 max-w-2xl mx-auto" />
          <p className="text-muted text-sm mt-4">Loading document…</p>
        </div>
      )}
      {state === "error" && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          Could not load the document. Refresh the page or contact the
          institute.
        </div>
      )}

      <div ref={containerRef} />

      {/* Tiled watermark above the canvases; pointer-events off so scrolling works */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute inset-0 flex flex-wrap content-start gap-x-24 gap-y-32 opacity-[0.13] -rotate-12 origin-center scale-110">
          {Array.from({ length: 60 }).map((_, i) => (
            <span
              key={i}
              className="text-ink text-sm font-medium whitespace-nowrap"
            >
              {watermark}
            </span>
          ))}
        </div>
      </div>

      {state === "ready" && (
        <p className="text-center text-xs text-muted mt-2">
          {pageCount} page{pageCount === 1 ? "" : "s"} · View only
        </p>
      )}
    </div>
  );
}
