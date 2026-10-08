import { supabaseAdmin } from "@/lib/supabase/admin";
import { hasActiveAccess } from "@/lib/types";
import type { Admission, StudentProfile } from "@/lib/types";
import { matchAdmission, sortBatches } from "@/lib/student-admission";
import PortalTable from "./PortalTable";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const supabase = supabaseAdmin();
  const [{ data }, { data: admissionRows }] = await Promise.all([
    supabase
      .from("student_profiles")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("admissions").select("email, phone, batch_no"),
  ]);

  const admissions = (admissionRows ?? []) as Pick<
    Admission,
    "email" | "phone" | "batch_no"
  >[];
  // Fall back to the linked admission's batch so approval is pre-filled
  const accounts = ((data ?? []) as StudentProfile[]).map((a) => ({
    ...a,
    admission_batch: matchAdmission(a, admissions)?.batch_no?.trim() || null,
  }));
  const batches = sortBatches([
    ...admissions.map((a) => a.batch_no),
    ...accounts.map((a) => a.batch_no),
  ]);

  const pending = accounts.filter((a) => a.status === "pending").length;
  const active = accounts.filter((a) => hasActiveAccess(a)).length;
  const expired = accounts.filter(
    (a) => a.status === "active" && !hasActiveAccess(a)
  ).length;
  const inactive = accounts.filter((a) => a.status === "inactive").length;

  return (
    <main className="w-full px-4 md:px-6 lg:px-8 py-6 md:py-10">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Portal Access</h1>
        <p className="text-muted text-sm mt-1">
          Student portal accounts &middot; approve with an expiry date, extend
          or deactivate access.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Pending approval" value={String(pending)} accent="amber" />
        <Kpi label="Active" value={String(active)} accent="lime" />
        <Kpi label="Expired" value={String(expired)} accent="dark" />
        <Kpi label="Inactive" value={String(inactive)} />
      </div>

      <PortalTable accounts={accounts} batches={batches} />
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
  accent?: "lime" | "dark" | "amber";
}) {
  const accentClasses =
    accent === "dark"
      ? "bg-ink text-white border-ink"
      : accent === "lime"
        ? "bg-lime border-lime text-ink"
        : accent === "amber"
          ? "bg-amber-100 border-amber-200 text-ink"
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
