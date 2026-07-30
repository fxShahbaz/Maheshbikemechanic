import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Engine } from "@/lib/types";
import EnginesManager from "./EnginesManager";

export const dynamic = "force-dynamic";

export default async function AdminEnginesPage() {
  const supabase = supabaseAdmin();
  const { data } = await supabase
    .from("engines")
    .select("*")
    .order("sort_order")
    .order("name");

  const engines = (data ?? []) as Engine[];

  return (
    <main className="w-full px-4 md:px-6 lg:px-8 py-6 md:py-10">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Engines</h1>
        <p className="text-muted text-sm mt-1">
          The engines students can punch in on for practice. Disabled engines
          disappear from the student dropdown but keep their history.
        </p>
      </div>

      <EnginesManager engines={engines} />
    </main>
  );
}
