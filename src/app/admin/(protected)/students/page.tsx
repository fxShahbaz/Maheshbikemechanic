import { listAdmissionsWithPaid } from "@/app/actions/admissions";
import { formatINR } from "@/lib/types";
import StudentsTable from "./StudentsTable";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const students = await listAdmissionsWithPaid();

  const batches = Array.from(
    new Set(students.map((s) => s.batch_no).filter(Boolean) as string[])
  ).sort();

  // Fee roll-up across all students.
  let billed = 0; // sum of total_fee where set
  let collected = 0; // sum of all payments
  let due = 0; // sum of positive balances (fee set & under-paid)
  let withDues = 0; // students that still owe

  for (const s of students) {
    collected += s.paid;
    if (s.total_fee != null) {
      billed += s.total_fee;
      const balance = s.total_fee - s.paid;
      if (balance > 0) {
        due += balance;
        withDues += 1;
      }
    }
  }

  return (
    <main className="w-full px-4 md:px-6 lg:px-8 py-6 md:py-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Students</h1>
          <p className="text-muted text-sm mt-1">
            Fee ledger &middot; total billed, collected and outstanding per
            student.
          </p>
        </div>
      </div>

      {/* Fee roll-up */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3">
        <Kpi label="Students" value={String(students.length)} accent="dark" />
        <Kpi label="Billed" value={formatINR(billed)} />
        <Kpi label="Collected" value={formatINR(collected)} accent="lime" />
        <Kpi label="Outstanding" value={formatINR(due)} accent="amber" />
        <Kpi label="With dues" value={String(withDues)} accent="emerald" />
      </div>

      <StudentsTable students={students} batches={batches} />
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
  accent?: "lime" | "dark" | "emerald" | "amber";
}) {
  const accentClasses =
    accent === "dark"
      ? "bg-ink text-white border-ink"
      : accent === "lime"
        ? "bg-lime border-lime text-ink"
        : accent === "emerald"
          ? "bg-emerald-100 border-emerald-200 text-ink"
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
