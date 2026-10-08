"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import type { ReactNode } from "react";

const NAV = [
  {
    href: "/student/practice",
    label: "Practice",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    href: "/student/materials",
    label: "PDFs",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    href: "/student/updates",
    label: "Updates",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
        <path d="M3 11l18-5v12L3 14v-3z" />
        <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
      </svg>
    ),
  },
  {
    href: "/student/profile",
    label: "Profile",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
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
  const initial = student.name.trim().charAt(0).toUpperCase() || "S";

  return (
    <div className="min-h-dvh bg-cream">
      {/* App bar */}
      <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur-xl border-b border-line/70 pt-[env(safe-area-inset-top)]">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-between gap-3">
          <Link href="/student/practice" className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-lime shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f1410" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </span>
            <span className="font-semibold text-[15px] whitespace-nowrap">
              Student Portal
            </span>
          </Link>

          <Link
            href="/student/profile"
            aria-label="Your profile"
            title={student.email}
            className="w-8 h-8 rounded-full bg-ink text-lime text-sm font-semibold flex items-center justify-center active:scale-95 transition"
          >
            {initial}
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-3 pb-[calc(6rem+env(safe-area-inset-bottom))]">
        {children}
      </main>

      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 inset-x-0 z-[65] bg-white/90 backdrop-blur-xl border-t border-line pb-[env(safe-area-inset-bottom)]"
        aria-label="Portal navigation"
      >
        <div className="max-w-lg mx-auto grid grid-cols-4">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex flex-col items-center gap-1 pt-2 pb-2.5 select-none [-webkit-tap-highlight-color:transparent] transition-colors",
                  active ? "text-ink" : "text-muted",
                ].join(" ")}
              >
                <span className="relative flex items-center justify-center w-16 h-8 rounded-full">
                  {active && (
                    <motion.span
                      layoutId="student-tab-active"
                      transition={{ type: "spring", damping: 30, stiffness: 400 }}
                      className="absolute inset-0 rounded-full bg-lime"
                    />
                  )}
                  <span className="relative">{item.icon}</span>
                </span>
                <span
                  className={`text-[11px] leading-none ${active ? "font-semibold" : "font-medium"}`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
