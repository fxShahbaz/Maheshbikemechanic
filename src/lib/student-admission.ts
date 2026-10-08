import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Admission, StudentProfile } from "@/lib/types";

function last10(phone: string | null | undefined): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : null;
}

/** Match a portal account to its admission record by email, else phone. */
export function matchAdmission<A extends Pick<Admission, "email" | "phone">>(
  profile: Pick<StudentProfile, "email" | "phone">,
  admissions: A[]
): A | null {
  const email = profile.email.toLowerCase();
  const phone = last10(profile.phone);
  return (
    admissions.find((a) => (a.email ?? "").toLowerCase() === email) ??
    (phone ? admissions.find((a) => last10(a.phone) === phone) : undefined) ??
    null
  );
}

/** Link a portal account to its admission record by email, else phone. */
export async function findStudentAdmission(
  profile: Pick<StudentProfile, "email" | "phone">
): Promise<Admission | null> {
  const { data } = await supabaseAdmin().from("admissions").select("*");
  return matchAdmission(profile, (data ?? []) as Admission[]);
}

/** The student's batch: assigned on the portal account, else from admission. */
export function studentBatch(
  profile: Pick<StudentProfile, "batch_no">,
  admission: Pick<Admission, "batch_no"> | null
): string | null {
  return profile.batch_no?.trim() || admission?.batch_no?.trim() || null;
}

/** Distinct, naturally sorted batch numbers. */
export function sortBatches(values: (string | null | undefined)[]): string[] {
  return Array.from(
    new Set(values.map((v) => v?.trim()).filter(Boolean) as string[])
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}
