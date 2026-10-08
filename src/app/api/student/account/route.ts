import { supabaseAdmin } from "@/lib/supabase/admin";
import { apiError, apiJson, authenticateStudent } from "@/lib/student-api";

/**
 * In-app account deletion (required by the App Store for apps with signup).
 * Deleting the auth user cascades to the portal profile and practice
 * history; the institute's admission and payment records are kept.
 */
export async function DELETE(request: Request) {
  const auth = await authenticateStudent(request);
  if (auth instanceof Response) return auth;

  const { error } = await supabaseAdmin().auth.admin.deleteUser(auth.user.id);
  if (error) return apiError(error.message, 500);
  return apiJson({ ok: true });
}
