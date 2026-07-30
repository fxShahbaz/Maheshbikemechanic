import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatDuration, todayIST } from "@/lib/types";
import type { PracticeSessionWithStudent } from "@/lib/types";
import PracticeTable from "./PracticeTable";

export const dynamic = "force-dynamic";

function sumWeekMs(sessions: PracticeSessionWithStudent[]): number {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return sessions.reduce((sum, s) => {
    if (!s.punched_out_at) return sum;
    const start = new Date(s.punched_in_at).getTime();
    if (start < weekAgo) return sum;
    return sum + (new Date(s.punched_out_at).getTime() - start);
  }, 0);
}

export default async function AdminPracticePage() {
  const supabase = supabaseAdmin();
  const { data } = await supabase
    .from("practice_sessions")
    .select("*, student:student_profiles(id, name, email)")
    .order("punched_in_at", { ascending: false })
    .limit(500);

  const sessions = (data ?? []) as PracticeSessionWithStudent[];

  const open = sessions.filter((s) => s.punched_out_at == null);
  const today = todayIST();
  const todayCount = sessions.filter((s) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" })
      .format(new Date(s.punched_in_at))
      .startsWith(today)
  ).length;

  const weekMs = sumWeekMs(sessions);

  return (
    <main className="w-full px-4 md:px-6 lg:px-8 py-6 md:py-10">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Practice</h1>
        <p className="text-muted text-sm mt-1">
          Every punch-in and punch-out across the workshop. Open sessions stay
          highlighted until the student punches out.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3">
        <Kpi
          label="Open now"
          value={String(open.length)}
          accent={open.length > 0 ? "lime" : undefined}
        />
        <Kpi label="Sessions today" value={String(todayCount)} />
        <Kpi label="Hours (7 days)" value={formatDuration(weekMs)} accent="dark" />
      </div>

      <PracticeTable sessions={sessions} />
    </main>
  );
}

function Kpi({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "lime" | "dark";
}) {
  const accentClasses =
    accent === "dark"
      ? "bg-ink text-white border-ink"
      : accent === "lime"
        ? "bg-lime border-lime text-ink"
        : "bg-white border-line text-ink";
  const labelClass = accent === "dark" ? "text-white/60" : "text-muted";

  return (
    <div className={`rounded-2xl border px-4 py-3.5 ${accentClasses}`}>
      <div className={`text-[10px] uppercase tracking-wider ${labelClass}`}>
        {label}
      </div>
      <div className="font-display num-mono text-lg md:text-xl leading-tight mt-1">
        {value}
      </div>
    </div>
  );
}
