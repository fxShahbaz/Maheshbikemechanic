"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

type App = {
  title: string;
  tagline: string;
  url: string;
  icon: string;
};

const APPS: App[] = [
  {
    title: "Bike Engineer",
    tagline: "Learn bike mechanics",
    url: "https://play.google.com/store/apps/details?id=co.mark.efftd",
    icon: "/images/apps/bike-engineer.png",
  },
  {
    title: "InDiag OBD2 Scanner",
    tagline: "Diagnose modern bikes",
    url: "https://play.google.com/store/apps/details?id=com.indiag.mobile",
    icon: "/images/apps/indiag.png",
  },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AppsDialog({ open, onClose }: Props) {
  // Scroll lock + ESC + Lenis pause
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.classList.add("no-scroll");
    document.documentElement.classList.add("no-scroll");
    window.__lenis?.stop();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("no-scroll");
      document.documentElement.classList.remove("no-scroll");
      window.__lenis?.start();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
          <div className="absolute inset-0 bg-ink/55 backdrop-blur-sm" />
          <motion.div
            data-lenis-prevent
            className="relative bg-white border border-line rounded-t-3xl md:rounded-3xl w-full max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto overscroll-contain"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-4">
              <h2 className="font-display text-xl">Get our apps</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 w-9 h-9 rounded-full hover:bg-cream flex items-center justify-center text-ink/70 hover:text-ink transition"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="px-4 pb-5 space-y-2">
              {APPS.map((app) => (
                <a
                  key={app.url}
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-cream transition"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={app.icon}
                    alt=""
                    className="shrink-0 w-11 h-11 rounded-xl object-cover bg-cream"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-[15px] leading-tight">
                      {app.title}
                    </div>
                    <div className="text-xs text-muted mt-0.5">
                      {app.tagline}
                    </div>
                  </div>
                  <div className="shrink-0 text-ink/40 group-hover:text-ink transition">
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
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

