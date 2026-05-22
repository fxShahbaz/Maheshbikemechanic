"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { useState } from "react";
import EnrollButton from "./EnrollButton";
import ChatPanel from "./ChatPanel";

const PHONE = "+917972024406";

export default function FloatingDock() {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    const delta = current - previous;

    // Scroll-direction reveal: show on upward, hide on downward
    if (delta < -4) setVisible(true);
    else if (delta > 4) setVisible(false);
  });

  return (
    <>
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 96, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 96, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-[65]"
        >
          <div className="bg-ink/85 backdrop-blur-lg border border-white/10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] rounded-full p-2 sm:p-1.5 flex items-center gap-1.5 sm:gap-1">
            <a
              href={`tel:${PHONE}`}
              aria-label="Call now"
              className="group inline-flex items-center gap-2 px-3.5 sm:px-4 py-3 sm:py-2.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition text-sm font-medium"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-[18px] h-[18px] sm:w-4 sm:h-4"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span className="hidden sm:inline">Call</span>
            </a>

            <button
              type="button"
              onClick={() => setChatOpen((v) => !v)}
              aria-label="Open chat"
              aria-expanded={chatOpen}
              className="group inline-flex items-center gap-2 px-3.5 sm:px-4 py-3 sm:py-2.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition text-sm font-medium"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-[18px] h-[18px] sm:w-4 sm:h-4"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="hidden sm:inline">Chat</span>
            </button>

            <span className="w-px h-7 sm:h-6 bg-white/15 mx-1" aria-hidden />

            <EnrollButton className="inline-flex items-center gap-2 px-4 py-3 sm:py-2.5 rounded-full bg-lime hover:bg-limeDk text-ink text-sm font-semibold transition">
              <span>Enroll</span>
              <span className="inline-flex items-center justify-center w-6 h-6 sm:w-5 sm:h-5 rounded-full bg-ink text-lime">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-2.5 h-2.5 sm:w-[9px] sm:h-[9px]"
                >
                  <path d="M7 17 17 7" />
                  <path d="M8 7h9v9" />
                </svg>
              </span>
            </EnrollButton>

            <a
              href="/admin/login"
              aria-label="Admin login"
              className="group inline-flex items-center gap-2 px-3.5 sm:px-4 py-3 sm:py-2.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition text-sm font-medium"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-[18px] h-[18px] sm:w-4 sm:h-4"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              <span className="hidden sm:inline">Login</span>
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
