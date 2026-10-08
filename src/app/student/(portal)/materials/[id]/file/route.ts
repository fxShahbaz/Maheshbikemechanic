import { getAuthUser, getStudentProfile } from "@/lib/auth";
import { materialFileResponse } from "@/lib/student-portal";
import { hasActiveAccess, isAdminEmail } from "@/lib/types";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/student/materials/[id]/file">
) {
  const { id } = await ctx.params;

  const user = await getAuthUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  // Admins may preview; students need active, unexpired access.
  const admin = isAdminEmail(user.email);
  if (!admin) {
    const profile = await getStudentProfile();
    if (!profile || !hasActiveAccess(profile)) {
      return new Response("Forbidden", { status: 403 });
    }
  }

  return materialFileResponse(id, { includeUnpublished: admin });
}
