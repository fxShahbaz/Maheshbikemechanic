import { materialFileResponse } from "@/lib/student-portal";
import { authenticateActiveStudent } from "@/lib/student-api";

/** Redirects the (older) app to a short-lived signed URL for the PDF. */
export async function GET(
  request: Request,
  ctx: RouteContext<"/api/student/materials/[id]/file">
) {
  const auth = await authenticateActiveStudent(request);
  if (auth instanceof Response) return auth;

  const { id } = await ctx.params;
  return materialFileResponse(id, auth.profile);
}
