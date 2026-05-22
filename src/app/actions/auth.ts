"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { ADMIN_EMAIL } from "@/lib/types";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

type SignInResult = { ok: true } | { ok: false; error: string };

export async function signInWithPassword(
  formData: FormData
): Promise<SignInResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, error: "Email and password are required." };
  }

  if (email !== ADMIN_EMAIL) {
    return { ok: false, error: "Not an admin account." };
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function signOut() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/admin/login");
}
