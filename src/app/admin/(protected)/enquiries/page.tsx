import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Enquiry } from "@/lib/types";
import EnquiriesTable from "./EnquiriesTable";

export const dynamic = "force-dynamic";

export default async function EnquiriesPage() {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="w-full px-4 md:px-8 lg:px-10 py-6 md:py-10">
        <h1 className="font-display text-3xl mb-4">Enquiries</h1>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-800">
          <div className="font-medium">Could not load enquiries.</div>
          <pre className="text-xs mt-2 overflow-auto">{error.message}</pre>
          <p className="text-xs mt-3 text-red-700">
            If the table doesn't exist yet, run the SQL in <code>/admin/setup.sql</code> in your Supabase SQL Editor.
          </p>
        </div>
      </main>
    );
  }

  const enquiries = (data ?? []) as Enquiry[];

  const counts = {
    new: enquiries.filter((e) => e.status === "new").length,
    contacted: enquiries.filter((e) => e.status === "contacted").length,
    enrolled: enquiries.filter((e) => e.status === "enrolled").length,
    closed: enquiries.filter((e) => e.status === "closed").length,
    total: enquiries.length,
  };

  return (
    <main className="w-full px-4 md:px-8 lg:px-10 py-6 md:py-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Enquiries</h1>
          <p className="text-muted text-sm mt-1">
            Leads from the homepage contact form, newest first.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-2 text-sm md:max-w-md md:w-full">
          <StatChip label="New" value={counts.new} accent="lime" />
          <StatChip label="Contacted" value={counts.contacted} />
          <StatChip label="Enrolled" value={counts.enrolled} />
          <StatChip label="Closed" value={counts.closed} />
        </div>
      </div>

      <EnquiriesTable enquiries={enquiries} />
    </main>
  );
}

function StatChip({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "lime";
}) {
  return (
    <div className="bg-white border border-line rounded-xl px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted">
        {label}
      </div>
      <div
        className={
          "font-display text-2xl num-mono " +
          (accent === "lime" ? "text-forest" : "")
        }
      >
        {value}
      </div>
    </div>
  );
}
