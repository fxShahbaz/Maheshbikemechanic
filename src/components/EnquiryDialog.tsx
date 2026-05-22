"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import EnquiryForm from "./EnquiryForm";

type Ctx = { open: () => void; close: () => void };

const EnquiryDialogContext = createContext<Ctx | null>(null);

const AUTO_OPEN_DELAY_MS = 8000;
const SEEN_KEY = "mbi-enquiry-shown";

export function useEnquiryDialog() {
  const ctx = useContext(EnquiryDialogContext);
  if (!ctx)
    throw new Error(
      "useEnquiryDialog must be used inside <EnquiryDialogProvider>"
    );
  return ctx;
}

export function EnquiryDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const markSeen = useCallback(() => {
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* sessionStorage can be blocked in private modes — ignore */
    }
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    markSeen();
  }, [markSeen]);

  const close = useCallback(() => setIsOpen(false), []);

  // Auto-open once per session, after a short delay (skip on /admin)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname.startsWith("/admin")) return;
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
    } catch {
      return;
    }

    const t = window.setTimeout(() => {
      setIsOpen(true);
      markSeen();
    }, AUTO_OPEN_DELAY_MS);

    return () => window.clearTimeout(t);
  }, [markSeen]);

  // Lock background scroll (CSS class + halt Lenis if it's running)
  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add("no-scroll");
    document.documentElement.classList.add("no-scroll");
    window.__lenis?.stop();
    return () => {
      document.body.classList.remove("no-scroll");
      document.documentElement.classList.remove("no-scroll");
      window.__lenis?.start();
    };
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <EnquiryDialogContext.Provider value={{ open, close }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            aria-modal="true"
            role="dialog"
          >
            <div className="absolute inset-0 bg-ink/55 backdrop-blur-sm" />
            <motion.div
              data-lenis-prevent
              className="relative bg-white border border-line rounded-t-3xl md:rounded-3xl w-full max-w-md shadow-2xl max-h-[92vh] overflow-y-auto overscroll-contain"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between p-6 pb-2 sticky top-0 bg-white/95 backdrop-blur z-10">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted">
                    Quick Enquiry
                  </div>
                  <h2 className="font-display text-2xl mt-1">
                    Let&apos;s start your training
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={close}
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
              <div className="px-6 pb-6">
                <EnquiryForm />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </EnquiryDialogContext.Provider>
  );
}
