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
      <div className="flex items-start gap-3">
        <Link
          href="/student/materials"
          className="shrink-0 w-9 h-9 rounded-full bg-white border border-line hover:bg-cream flex items-center justify-center transition"
          aria-label="Back to study material"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
        </Link>
        <div className="min-w-0">
          <h1 className="font-display text-2xl md:text-3xl leading-tight">
            {material.title}
          </h1>
          {material.description && (
            <p className="text-muted text-sm mt-1">{material.description}</p>
          )}
        </div>
      </div>

      <PdfViewer
        fileUrl={`/student/materials/${material.id}/file`}
        watermark={`${profile.name} · ${profile.email}`}
      />
    </>
  );
}
