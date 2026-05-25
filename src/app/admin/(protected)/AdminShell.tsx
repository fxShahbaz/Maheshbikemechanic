"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { signOut } from "@/app/actions/auth";

const NAV = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: (
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
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/admin/enquiries",
    label: "Enquiries",
    icon: (
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
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    href: "/admin/admissions",
    label: "Admissions",
    icon: (
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
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    href: "/admin/students",
    label: "Students",
    icon: (
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
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/admin/payments",
    label: "Payments",
    icon: (
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
        <rect x="2" y="6" width="20" height="13" rx="2" />
        <path d="M2 10h20" />
        <path d="M7 15h3" />
      </svg>
    ),
  },
];

const COLLAPSED_KEY = "mbi-admin-sidebar-collapsed";

export default function AdminShell({
  user,
  children,
}: {
  user: { email: string };
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hydrate persisted collapsed state from localStorage
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSED_KEY) === "1");
    } catch {
      /* ignore */
    }
    setMounted(true);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const sidebarWidth = collapsed ? "w-[72px]" : "w-[240px]";
  const contentMargin = collapsed ? "md:ml-[72px]" : "md:ml-[240px]";

  return (
    <div className="min-h-screen bg-cream">
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-white/90 backdrop-blur border-b border-line">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="w-9 h-9 rounded-full hover:bg-cream flex items-center justify-center"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <Link href="/admin/dashboard" className="font-display text-base">
          Admin
        </Link>
        <div className="w-9" />
      </div>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-ink/55 z-50"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed top-0 left-0 h-screen z-50 bg-white border-r border-line flex flex-col",
          "transition-[width,transform] duration-200 ease-out",
          // Desktop width (only animate after mount to avoid hydration flash)
          mounted ? sidebarWidth : "w-[240px]",
          // Mobile slide-in
          "md:translate-x-0",
          mobileOpen ? "translate-x-0 w-[240px]" : "-translate-x-full w-[240px] md:w-auto",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="h-16 flex items-center px-4 border-b border-line shrink-0">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 min-w-0"
          >
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-lime shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f1410" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
              </svg>
            </span>
            {(!collapsed || mobileOpen) && (
              <span className="font-display text-base whitespace-nowrap">
                Admin
              </span>
            )}
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={[
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  collapsed && !mobileOpen ? "justify-center" : "",
                  active
                    ? "bg-ink text-white"
                    : "text-ink/80 hover:bg-cream hover:text-ink",
                ].join(" ")}
              >
                <span className="shrink-0">{item.icon}</span>
                {(!collapsed || mobileOpen) && <span>{item.label}</span>}
              </Link>
            );
          })}

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="View site"
            className={[
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-cream hover:text-ink transition",
              collapsed && !mobileOpen ? "justify-center" : "",
            ].join(" ")}
          >
            <span className="shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </span>
            {(!collapsed || mobileOpen) && <span>View site</span>}
          </a>
        </nav>

        {/* Footer: user + sign out + collapse */}
        <div className="border-t border-line p-3 shrink-0 space-y-2">
          {(!collapsed || mobileOpen) && (
            <div className="px-2 py-1.5">
              <div className="text-[10px] uppercase tracking-wider text-muted">
                Signed in as
              </div>
              <div className="text-sm font-medium truncate" title={user.email}>
                {user.email}
              </div>
            </div>
          )}
          <form action={signOut}>
            <button
              type="submit"
              title="Sign out"
              className={[
                "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink/80 hover:bg-cream hover:text-ink transition",
                collapsed && !mobileOpen ? "justify-center" : "",
              ].join(" ")}
            >
              <span className="shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </span>
              {(!collapsed || mobileOpen) && <span>Sign out</span>}
            </button>
          </form>
          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand" : "Collapse"}
            className={[
              "hidden md:flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-muted hover:bg-cream hover:text-ink transition",
              collapsed ? "justify-center" : "",
            ].join(" ")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: collapsed ? "rotate(180deg)" : "none" }}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {!collapsed && <span>Collapse</span>}
          </button>
          {/* Mobile close */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs text-muted hover:bg-cream hover:text-ink transition"
          >
            Close menu
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={[
          "transition-[margin] duration-200 ease-out",
          mounted ? contentMargin : "md:ml-[240px]",
        ].join(" ")}
      >
        {children}
      </main>
    </div>
  );
}
