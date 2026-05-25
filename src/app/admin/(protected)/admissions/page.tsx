import { listAdmissionsWithPaid } from "@/app/actions/admissions";
import AdmissionsTable from "./AdmissionsTable";

export const dynamic = "force-dynamic";

export default async function AdmissionsPage() {
  const admissions = await listAdmissionsWithPaid();

  const batches = Array.from(
    new Set(admissions.map((a) => a.batch_no).filter(Boolean) as string[])
  ).sort();

  return (
    <main className="w-full px-4 md:px-6 lg:px-8 py-6 md:py-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Admissions</h1>
          <p className="text-muted text-sm mt-1">
            Enrolled students &middot; profiles, batches and contact records.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm md:max-w-xs md:w-full">
          <Stat label="Total" value={admissions.length} accent="dark" />
          <Stat label="Batches" value={batches.length} />
        </div>
      </div>

      <AdmissionsTable admissions={admissions} batches={batches} />
    </main>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "dark";
}) {
  const cls =
    accent === "dark"
      ? "bg-ink text-white border-ink"
      : "bg-white border-line text-ink";
  return (
    <div className={`rounded-xl border px-3 py-2 ${cls}`}>
      <div
        className={
          "text-[10px] uppercase tracking-wider " +
          (accent === "dark" ? "text-white/60" : "text-muted")
        }
      >
        {label}
      </div>
      <div className="font-display text-2xl num-mono">{value}</div>
    </div>
  );
}
