"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { signOutStudent } from "@/app/actions/student-auth";

const NAV = [
  {
    href: "/student/practice",
    label: "Practice",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    href: "/student/materials",
    label: "Study",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    href: "/student/updates",
    label: "Updates",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
        <path d="M3 11l18-5v12L3 14v-3z" />
        <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
      </svg>
    ),
  },
  {
    href: "/student/profile",
    label: "Profile",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function StudentShell({
  student,
  children,
}: {
  student: { name: string; email: string; accessExpiresAt: string | null };
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-line">
        <div className="max-w-4xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-3">
          <Link href="/student/practice" className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-lime shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f1410" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </span>
            <span className="font-display text-base whitespace-nowrap">
              Student Portal
            </span>
          </Link>

          <div className="flex items-center gap-2 min-w-0">
            <div className="text-right min-w-0">
              <div className="text-sm font-medium truncate" title={student.email}>
                {student.name}
              </div>
              {student.accessExpiresAt && (
                <div className="text-[10px] text-muted">
                  Access till {student.accessExpiresAt}
                </div>
              )}
            </div>
            <form action={signOutStudent}>
              <button
                type="submit"
                title="Sign out"
                className="w-9 h-9 rounded-full hover:bg-cream flex items-center justify-center text-ink/70 hover:text-ink transition"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10 pb-32 md:pb-36">
        {children}
      </main>

      {/* Floating footer dock */}
      <motion.nav
        initial={{ y: 96, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-[65]"
        aria-label="Portal navigation"
      >
        <div className="bg-ink/85 backdrop-blur-lg border border-white/10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] rounded-full p-1.5 flex items-center gap-1">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "relative inline-flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-2.5 rounded-full text-sm font-medium transition",
                  active
                    ? "text-ink"
                    : "text-white/85 hover:text-white hover:bg-white/10",
                ].join(" ")}
              >
                {active && (
                  <motion.span
                    layoutId="student-dock-active"
                    transition={{ type: "spring", damping: 30, stiffness: 380 }}
                    className="absolute inset-0 rounded-full bg-lime"
                  />
                )}
                <span className="relative">{item.icon}</span>
                <span
                  className={[
                    "relative",
                    active ? "" : "hidden sm:inline",
                  ].join(" ")}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </motion.nav>
    </div>
  );
}
