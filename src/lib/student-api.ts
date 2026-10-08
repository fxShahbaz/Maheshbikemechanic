import "server-only";

import type { User } from "@supabase/supabase-js";
import { loadStudentProfile } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hasActiveAccess, isAdminEmail } from "@/lib/types";
import type { StudentProfile } from "@/lib/types";

/**
 * Auth for the mobile app's JSON API. The app signs in with Supabase Auth
 * directly and sends its access token as `Authorization: Bearer <jwt>`;
 * all data access still goes through the service role here, exactly like
 * the web portal.
 */

export function apiError(error: string, status: number): Response {
  return Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

export function apiJson(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

type Authed = { user: User; profile: StudentProfile };

/** Signed-in student (any status). Returns an error Response otherwise. */
export async function authenticateStudent(
  request: Request
): Promise<Authed | Response> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return apiError("Unauthorized", 401);

  const {
    data: { user },
  } = await supabaseAdmin().auth.getUser(token);
  if (!user) return apiError("Unauthorized", 401);
  if (isAdminEmail(user.email)) {
    return apiError("Admin accounts can't use the student app.", 403);
  }

  const profile = await loadStudentProfile(user);
  if (!profile) return apiError("Unauthorized", 401);
  return { user, profile };
}

/** Signed in, approved and not expired — required for all portal data. */
export async function authenticateActiveStudent(
  request: Request
): Promise<Authed | Response> {
  const auth = await authenticateStudent(request);
  if (auth instanceof Response) return auth;
  if (!hasActiveAccess(auth.profile)) return apiError("Forbidden", 403);
  return auth;
}

/** Profile as sent to the app — admin notes are internal to the institute. */
export function publicProfile(profile: StudentProfile): Omit<StudentProfile, "notes"> {
  const copy: Partial<StudentProfile> = { ...profile };
  delete copy.notes;
  return copy as Omit<StudentProfile, "notes">;
}
