"use server";

import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

type Result = { ok: true } | { ok: false; error: string };

function revalidateEngines() {
  revalidatePath("/admin/engines");
  revalidatePath("/student/practice");
}

export async function createEngine(
  name: string,
  brand?: string
): Promise<Result> {
  await requireAdmin();

  const trimmed = name?.trim();
  if (!trimmed) return { ok: false, error: "Engine name is required." };

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("engines")
    .insert({ name: trimmed, brand: brand?.trim() || null });
  if (error) {
    return {
      ok: false,
      error: error.code === "23505" ? "This engine already exists." : error.message,
    };
  }

  revalidateEngines();
  return { ok: true };
}

export async function renameEngine(id: string, name: string): Promise<Result> {
  await requireAdmin();

  const trimmed = name?.trim();
  if (!trimmed) return { ok: false, error: "Engine name is required." };

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("engines")
    .update({ name: trimmed })
    .eq("id", id);
  if (error) {
    return {
      ok: false,
      error: error.code === "23505" ? "This engine already exists." : error.message,
    };
  }

  revalidateEngines();
  return { ok: true };
}

export async function setEngineActive(
  id: string,
  active: boolean
): Promise<Result> {
  await requireAdmin();

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("engines")
    .update({ active })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidateEngines();
  return { ok: true };
}

export async function deleteEngine(id: string): Promise<Result> {
  await requireAdmin();

  const supabase = supabaseAdmin();
  const { error } = await supabase.from("engines").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidateEngines();
  return { ok: true };
}
