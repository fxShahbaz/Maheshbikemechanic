"use server";

import { requireActiveStudent, requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { endPractice, startPractice } from "@/lib/student-portal";
import { revalidatePath } from "next/cache";

type Result = { ok: true } | { ok: false; error: string };

export async function punchIn(formData: FormData): Promise<Result> {
  const profile = await requireActiveStudent();
  const result = await startPractice(
    profile,
    String(formData.get("engine") ?? ""),
    String(formData.get("notes") ?? "")
  );
  if (!result.ok) return result;

  revalidatePath("/student/practice");
  revalidatePath("/admin/practice");
  return { ok: true };
}

export async function punchOut(sessionId: string): Promise<Result> {
  const profile = await requireActiveStudent();
  const result = await endPractice(profile, sessionId);
  if (!result.ok) return result;

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
