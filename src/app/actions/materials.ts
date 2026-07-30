"use server";

import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const BUCKET = "study-materials";

type Result = { ok: true } | { ok: false; error: string };

function revalidateMaterials() {
  revalidatePath("/admin/materials");
  revalidatePath("/student/materials");
}

/**
 * The browser uploads straight to storage with this one-time signed URL —
 * server actions would cap the PDF at the request body limit.
 */
export async function createMaterialUpload(
  fileName: string
): Promise<
  | { ok: true; path: string; token: string }
  | { ok: false; error: string }
> {
  await requireAdmin();

  if (!/\.pdf$/i.test(fileName)) {
    return { ok: false, error: "Only PDF files are allowed." };
  }
  const safeName = fileName
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(-100);
  const path = `${crypto.randomUUID()}/${safeName}`;

  const supabase = supabaseAdmin();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not prepare the upload." };
  }
  return { ok: true, path: data.path, token: data.token };
}

export async function addMaterial(input: {
  title: string;
  description?: string | null;
  storage_path: string;
  file_size?: number | null;
}): Promise<Result> {
  await requireAdmin();

  const title = input.title?.trim();
  if (!title) return { ok: false, error: "Title is required." };
  if (!input.storage_path) return { ok: false, error: "Upload the PDF first." };

  const supabase = supabaseAdmin();
  const { error } = await supabase.from("study_materials").insert({
    title,
    description: input.description?.trim() || null,
    storage_path: input.storage_path,
    file_size: input.file_size ?? null,
  });
  if (error) return { ok: false, error: error.message };

  revalidateMaterials();
  return { ok: true };
}

export async function updateMaterial(
  id: string,
  input: { title: string; description?: string | null }
): Promise<Result> {
  await requireAdmin();

  const title = input.title?.trim();
  if (!title) return { ok: false, error: "Title is required." };

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("study_materials")
    .update({ title, description: input.description?.trim() || null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidateMaterials();
  return { ok: true };
}

export async function setMaterialPublished(
  id: string,
  published: boolean
): Promise<Result> {
  await requireAdmin();

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("study_materials")
    .update({ published })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidateMaterials();
  return { ok: true };
}

export async function deleteMaterial(id: string): Promise<Result> {
  await requireAdmin();

  const supabase = supabaseAdmin();
  const { data: mat, error: fetchError } = await supabase
    .from("study_materials")
    .select("storage_path")
    .eq("id", id)
    .single();
  if (fetchError || !mat) {
    return { ok: false, error: fetchError?.message ?? "Material not found." };
  }

  const { error } = await supabase.from("study_materials").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  await supabase.storage.from(BUCKET).remove([mat.storage_path]);

  revalidateMaterials();
  return { ok: true };
}
