"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/types";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

type AuthResult = { ok: true } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signUpStudent(formData: FormData): Promise<AuthResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name) return { ok: false, error: "Name is required." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Enter a valid email address." };
  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }
  if (isAdminEmail(email)) {
    return { ok: false, error: "This email belongs to the admin panel." };
  }

  // Created pre-confirmed via the service role: no confirmation email, so
  // Supabase's built-in email sender (and its tight rate limit) is never hit.
  // Admin approval on the profile is the real gate.
  const admin = supabaseAdmin();
  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name, phone: phone || null },
    });

  if (createError || !created.user) {
    const exists =
      createError?.code === "email_exists" ||
      /already.*registered/i.test(createError?.message ?? "");
    return {
      ok: false,
      error: exists
        ? "An account with this email already exists. Sign in instead."
        : (createError?.message ?? "Could not create the account."),
    };
  }

  const { error: profileError } = await admin.from("student_profiles").upsert(
    {
      user_id: created.user.id,
      name,
      email,
      phone: phone || null,
      status: "pending",
    },
    { onConflict: "user_id" }
  );
  if (profileError) {
    return { ok: false, error: profileError.message };
  }

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
