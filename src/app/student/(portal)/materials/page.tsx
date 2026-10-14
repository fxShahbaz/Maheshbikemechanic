import { getStudentProfile } from "@/lib/auth";
import { listMaterials } from "@/lib/student-portal";
import MaterialsGrid from "./MaterialsGrid";
import { EmptyState, PageHeader } from "../_components/ui";

export const dynamic = "force-dynamic";

export default async function MaterialsPage() {
  const profile = await getStudentProfile();
  if (!profile) return null; // layout guard already redirects
  const materials = await listMaterials(profile);

  return (
    <>
      <PageHeader title="PDFs" subtitle="Course notes and manuals · view only" />

      {materials.length === 0 ? (
        <EmptyState
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          }
          title="Nothing here yet"
          text="Material shared by the institute will appear here."
        />
      ) : (
        <MaterialsGrid materials={materials} />
      )}
    </>
  );
}
