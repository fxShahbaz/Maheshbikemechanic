import Link from "next/link";
import { notFound } from "next/navigation";
import { getStudentProfile } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { StudyMaterial } from "@/lib/types";
import PdfViewer from "./PdfViewer";

export const dynamic = "force-dynamic";

export default async function MaterialViewerPage({
  params,
}: PageProps<"/student/materials/[id]">) {
  const { id } = await params;
  const profile = await getStudentProfile();
  if (!profile) return null; // layout guard already redirects

  const supabase = supabaseAdmin();
  const { data } = await supabase
    .from("study_materials")
    .select("*")
    .eq("id", id)
    .eq("published", true)
    .maybeSingle();
  if (!data) notFound();

  const material = data as StudyMaterial;

  return (
    <>
      <Link
        href="/student/materials"
        className="-ml-1 inline-flex items-center gap-0.5 h-9 pr-2 text-[15px] font-medium text-forest active:opacity-60"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m15 18-6-6 6-6" />
        </svg>
        PDFs
      </Link>
      <div className="mt-1 mb-4">
        <h1 className="font-semibold text-xl leading-snug break-words">
          {material.title}
        </h1>
        {material.description && (
          <p className="text-muted text-sm mt-1">{material.description}</p>
        )}
      </div>

      <PdfViewer
        fileUrl={`/student/materials/${material.id}/file`}
        watermark={`${profile.name} · ${profile.email}`}
      />
    </>
  );
}
