import { getStudentProfile } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { PracticeSession } from "@/lib/types";
import PracticePanel from "./PracticePanel";

export const dynamic = "force-dynamic";

export default async function PracticePage() {
  const profile = await getStudentProfile();
  if (!profile) return null; // layout guard already redirects

  const supabase = supabaseAdmin();
  const [{ data }, { data: engineRows }] = await Promise.all([
    supabase
      .from("practice_sessions")
      .select("*")
      .eq("student_id", profile.id)
      .order("punched_in_at", { ascending: false })
      .limit(200),
    supabase
      .from("engines")
      .select("name, brand")
      .eq("active", true)
      .order("sort_order")
      .order("name"),
  ]);

  const sessions = (data ?? []) as PracticeSession[];
  const engines = (engineRows ?? []) as { name: string; brand: string | null }[];

  return (
    <>
      <div>
        <p className="text-sm font-medium text-forest">
          Hi {profile.name.split(" ")[0]} 👋
        </p>
        <h1 className="font-display text-3xl md:text-4xl mt-1">Practice</h1>
        <p className="text-muted text-sm mt-1">
          Punch in when you start on an engine, punch out when you finish.
        </p>
      </div>
      <PracticePanel sessions={sessions} engines={engines} />
    </>
  );
}
