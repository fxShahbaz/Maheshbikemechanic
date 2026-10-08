import { getPracticeData, startPractice } from "@/lib/student-portal";
import { apiError, apiJson, authenticateActiveStudent } from "@/lib/student-api";

export async function GET(request: Request) {
  const auth = await authenticateActiveStudent(request);
  if (auth instanceof Response) return auth;

  return apiJson(await getPracticeData(auth.profile));
}

/** Punch in. */
export async function POST(request: Request) {
  const auth = await authenticateActiveStudent(request);
  if (auth instanceof Response) return auth;

  const body = await request.json().catch(() => null);
  const result = await startPractice(
    auth.profile,
    String(body?.engine ?? ""),
    String(body?.notes ?? "")
  );
  if (!result.ok) return apiError(result.error, 400);
  return apiJson({ ok: true }, 201);
}
