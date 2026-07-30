import "server-only";

import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { hasActiveAccess, isAdminEmail } from "@/lib/types";
import type { StudentProfile } from "@/lib/types";

// cache() dedupes per request: the layout guard and the page both call
// these, but only one auth round-trip / profile query actually runs.
export const getAuthUser = cache(async (): Promise<User | null> => {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export async function requireAdmin(): Promise<User> {
  const user = await getAuthUser();
  if (!user || !isAdminEmail(user.email)) {
    throw new Error("Unauthorized");
  }
  return user;
}

/**
 * Profile for the signed-in user, creating a pending one from auth metadata
 * if it's missing (e.g. signup succeeded but the profile insert failed).
 */
export const getStudentProfile = cache(async (): Promise<StudentProfile | null> => {
  const user = await getAuthUser();
  if (!user || isAdminEmail(user.email)) return null;

  const admin = supabaseAdmin();
  const { data } = await admin
    .from("student_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (data) return data as StudentProfile;

  const { data: created } = await admin
    .from("student_profiles")
    .insert({
      user_id: user.id,
      name:
        (user.user_metadata?.full_name as string | undefined)?.trim() ||
        user.email?.split("@")[0] ||
        "Student",
      email: user.email ?? "",
      phone: (user.user_metadata?.phone as string | undefined) ?? null,
    })
    .select("*")
    .single();
  return (created as StudentProfile) ?? null;
});

/** Signed in, approved and not expired — the only state allowed past the portal gate. */
export async function requireActiveStudent(): Promise<StudentProfile> {
  const profile = await getStudentProfile();
  if (!profile || !hasActiveAccess(profile)) {
    throw new Error("Unauthorized");
  }
  return profile;
}
