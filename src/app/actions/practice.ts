"use server";

import { requireActiveStudent, requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

type Result = { ok: true } | { ok: false; error: string };

export async function punchIn(formData: FormData): Promise<Result> {
  const profile = await requireActiveStudent();

  const engine = String(formData.get("engine") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  if (!engine) return { ok: false, error: "Enter the engine number / name." };

  const supabase = supabaseAdmin();

  // When the admin has defined an engine list, the punch-in must be one of
  // the active engines; free text is only allowed while the list is empty.
  const { count: engineCount } = await supabase
    .from("engines")
    .select("id", { count: "exact", head: true });
  if ((engineCount ?? 0) > 0) {
    const { data: match } = await supabase
      .from("engines")
      .select("id")
      .eq("name", engine)
      .eq("active", true)
      .maybeSingle();
    if (!match) {
      return { ok: false, error: "Select an engine from the list." };
    }
  }

  const { data: open } = await supabase
    .from("practice_sessions")
    .select("id")
    .eq("student_id", profile.id)
    .is("punched_out_at", null)
    .limit(1);
  if (open && open.length > 0) {
    return { ok: false, error: "You already have an open session. Punch out first." };
  }

  const { error } = await supabase.from("practice_sessions").insert({
    student_id: profile.id,
    engine,
    notes: notes || null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/student/practice");
  revalidatePath("/admin/practice");
  return { ok: true };
}

export async function punchOut(sessionId: string): Promise<Result> {
  const profile = await requireActiveStudent();

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("practice_sessions")
    .update({ punched_out_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("student_id", profile.id)
    .is("punched_out_at", null)
    .select("id");

  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) {
    return { ok: false, error: "Session not found or already punched out." };
  }

  revalidatePath("/student/practice");
  revalidatePath("/admin/practice");
  return { ok: true };
}

/** Admin can close a session a student forgot to punch out of. */
export async function adminPunchOut(sessionId: string): Promise<Result> {
  await requireAdmin();

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("practice_sessions")
    .update({ punched_out_at: new Date().toISOString() })
    .eq("id", sessionId)
    .is("punched_out_at", null);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/practice");
  revalidatePath("/student/practice");
  return { ok: true };
}
