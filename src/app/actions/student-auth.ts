"use server";

import { createStudentAccount } from "@/lib/student-portal";
import { supabaseServer } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/types";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

type AuthResult = { ok: true } | { ok: false; error: string };

export async function signUpStudent(formData: FormData): Promise<AuthResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const created = await createStudentAccount({ name, email, phone, password });
  if (!created.ok) return created;

  const supabase = await supabaseServer();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) {
    return {
      ok: false,
      error: "Account created — sign in with your email and password.",
    };
  }

  revalidatePath("/admin/portal");
  return { ok: true };
}

export async function signInStudent(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, error: "Email and password are required." };
  }
  if (isAdminEmail(email)) {
    return { ok: false, error: "Admin accounts sign in at /admin/login." };
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

export async function signOutStudent() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/student/login");
}
