import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Enquiry } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false });

  const enquiries = (data ?? []) as Enquiry[];

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const weekAgo = now - 7 * dayMs;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const stats = {
    total: enquiries.length,
    new: enquiries.filter((e) => e.status === "new").length,
    contacted: enquiries.filter((e) => e.status === "contacted").length,
    enrolled: enquiries.filter((e) => e.status === "enrolled").length,
    today: enquiries.filter(
      (e) => new Date(e.created_at).getTime() >= todayStart.getTime()
    ).length,
    week: enquiries.filter(
      (e) => new Date(e.created_at).getTime() >= weekAgo
    ).length,
  };

  const recent = enquiries.slice(0, 5);

  return (
    <main className="w-full px-4 md:px-8 lg:px-10 py-6 md:py-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Dashboard</h1>
          <p className="text-muted text-sm mt-1">
            Overview of enquiries and recent activity.
          </p>
        </div>
        <div className="text-xs text-muted">
          {new Date().toLocaleString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      {error ? (
        <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-5 text-red-800">
          <div className="font-medium">Could not load data.</div>
          <pre className="text-xs mt-2 overflow-auto">{error.message}</pre>
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Kpi label="Total" value={stats.total} accent="dark" />
            <Kpi label="New" value={stats.new} accent="lime" />
            <Kpi label="Contacted" value={stats.contacted} />
            <Kpi label="Enrolled" value={stats.enrolled} accent="emerald" />
            <Kpi label="Today" value={stats.today} />
            <Kpi label="Last 7 days" value={stats.week} />
          </div>

          {/* Recent enquiries */}
          <div className="mt-10 bg-white border border-line rounded-3xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-line">
              <div>
                <div className="font-display text-xl">Recent enquiries</div>
                <div className="text-xs text-muted">
                  Latest 5 leads from the homepage form.
                </div>
              </div>
              <Link
                href="/admin/enquiries"
                className="ghost-btn !py-1.5 !px-4 text-xs"
              >
                See all
              </Link>
            </div>
            {recent.length === 0 ? (
              <div className="p-10 text-center text-muted text-sm">
                No enquiries yet. They&apos;ll appear here as soon as the form is
                submitted on the homepage.
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {recent.map((e) => (
                  <li
                    key={e.id}
                    className="px-6 py-4 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{e.name}</div>
                      <div className="text-xs text-muted truncate">
                        {e.phone} · {e.city ?? "—"} · {e.interest ?? "—"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusPill status={e.status} />
                      <div className="text-xs text-muted whitespace-nowrap">
                        {relativeTime(e.created_at)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </main>
  );
}

function Kpi({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "lime" | "dark" | "emerald";
}) {
  const accentClasses =
    accent === "dark"
      ? "bg-ink text-white border-ink"
      : accent === "lime"
        ? "bg-lime border-lime"
        : accent === "emerald"
          ? "bg-emerald-100 border-emerald-200"
          : "bg-white border-line";

  const labelClass =
    accent === "dark" ? "text-white/60" : "text-muted";

  return (
    <div className={`rounded-2xl border px-4 py-3.5 ${accentClasses}`}>
      <div className={`text-[10px] uppercase tracking-wider ${labelClass}`}>
        {label}
      </div>
      <div className="font-display text-3xl num-mono mt-1">{value}</div>
    </div>
  );
}

const STATUS_STYLES: Record<Enquiry["status"], string> = {
  new: "bg-lime/40 text-forest border-lime",
  contacted: "bg-amber-100 text-amber-900 border-amber-200",
  dormant: "bg-sky-100 text-sky-900 border-sky-200",
  enrolled: "bg-emerald-100 text-emerald-900 border-emerald-200",
  closed: "bg-zinc-100 text-zinc-700 border-zinc-200",
};

function StatusPill({ status }: { status: Enquiry["status"] }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] border font-medium ${STATUS_STYLES[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function relativeTime(iso: string): string {
  const d = new Date(iso);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}
