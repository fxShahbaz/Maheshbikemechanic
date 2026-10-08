import { endPractice } from "@/lib/student-portal";
import { apiError, apiJson, authenticateActiveStudent } from "@/lib/student-api";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/student/practice/[id]/punch-out">
) {
  const auth = await authenticateActiveStudent(request);
  if (auth instanceof Response) return auth;

  const { id } = await ctx.params;
  const result = await endPractice(auth.profile, id);
  if (!result.ok) return apiError(result.error, 400);
  return apiJson({ ok: true });
}
