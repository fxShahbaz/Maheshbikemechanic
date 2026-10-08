import { materialFileResponse } from "@/lib/student-portal";
import { authenticateActiveStudent } from "@/lib/student-api";

/** Streams the PDF to the app's in-app viewer. */
export async function GET(
  request: Request,
  ctx: RouteContext<"/api/student/materials/[id]/file">
) {
  const auth = await authenticateActiveStudent(request);
  if (auth instanceof Response) return auth;

  const { id } = await ctx.params;
  return materialFileResponse(id);
}
