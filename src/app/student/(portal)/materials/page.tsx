import { supabaseAdmin } from "@/lib/supabase/admin";
import type { StudyMaterial } from "@/lib/types";
import MaterialsGrid from "./MaterialsGrid";

export const dynamic = "force-dynamic";

export default async function MaterialsPage() {
  const supabase = supabaseAdmin();
  const { data } = await supabase
    .from("study_materials")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  const materials = (data ?? []) as StudyMaterial[];

  return (
    <>
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Study Material</h1>
        <p className="text-muted text-sm mt-1">
          Course PDFs shared by the institute. View only — downloading is
          disabled.
        </p>
      </div>

      {materials.length === 0 ? (
        <div className="mt-8 bg-white border border-line rounded-3xl px-6 py-14 text-center">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cream text-forest mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </span>
          <p className="text-muted text-sm">
            Nothing here yet. Material shared by the institute will appear
            here.
          </p>
        </div>
      ) : (
        <MaterialsGrid materials={materials} />
      )}
    </>
  );
}
