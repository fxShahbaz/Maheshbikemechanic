"use server";

import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { StudentStatus } from "@/lib/types";
import { revalidatePath } from "next/cache";

type Result = { ok: true } | { ok: false; error: string };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function revalidatePortal() {
  revalidatePath("/admin/portal");
  revalidatePath("/student", "layout");
}

/** Approve (or re-approve) a student. Access always gets an expiry date. */
export async function approveStudent(
  id: string,
  expiresOn: string
): Promise<Result> {
  await requireAdmin();
  if (!DATE_RE.test(expiresOn)) {
    return { ok: false, error: "Pick a valid expiry date." };
  }

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("student_profiles")
    .update({
      status: "active",
      access_expires_at: expiresOn,
      approved_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePortal();
  return { ok: true };
}

export async function setStudentStatus(
  id: string,
  status: StudentStatus
): Promise<Result> {
  await requireAdmin();

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("student_profiles")
    .update({ status })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePortal();
  return { ok: true };
}

export async function updateStudentExpiry(
  id: string,
  expiresOn: string
): Promise<Result> {
  await requireAdmin();
  if (!DATE_RE.test(expiresOn)) {
    return { ok: false, error: "Pick a valid expiry date." };
  }

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("student_profiles")
    .update({ access_expires_at: expiresOn })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePortal();
  return { ok: true };
}

/** Deletes the auth user; the profile and practice sessions cascade. */
export async function deleteStudentAccount(id: string): Promise<Result> {
  await requireAdmin();

  const supabase = supabaseAdmin();
  const { data: profile, error: fetchError } = await supabase
    .from("student_profiles")
    .select("user_id")
    .eq("id", id)
    .single();
  if (fetchError || !profile) {
    return { ok: false, error: fetchError?.message ?? "Student not found." };
  }

  const { error } = await supabase.auth.admin.deleteUser(profile.user_id);
  if (error) return { ok: false, error: error.message };

  revalidatePortal();
  return { ok: true };
}
