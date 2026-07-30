import { supabaseAdmin } from "@/lib/supabase/admin";
import type { StudyMaterial } from "@/lib/types";
import MaterialsManager from "./MaterialsManager";

export const dynamic = "force-dynamic";

export default async function AdminMaterialsPage() {
  const supabase = supabaseAdmin();
  const { data } = await supabase
    .from("study_materials")
    .select("*")
    .order("created_at", { ascending: false });

  const materials = (data ?? []) as StudyMaterial[];

  return (
    <main className="w-full px-4 md:px-6 lg:px-8 py-6 md:py-10">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Study Material</h1>
        <p className="text-muted text-sm mt-1">
          Upload course PDFs for the student portal. Students can only view
          them — no download or share links.
        </p>
      </div>

      <MaterialsManager materials={materials} />
    </main>
  );
}
