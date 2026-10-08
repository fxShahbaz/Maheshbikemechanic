import { createStudentAccount } from "@/lib/student-portal";
import { apiError, apiJson } from "@/lib/student-api";

/** Mobile signup. The app signs in with the same credentials afterwards. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return apiError("Invalid request.", 400);

  const result = await createStudentAccount({
    name: String(body.name ?? ""),
    email: String(body.email ?? ""),
    phone: String(body.phone ?? ""),
    password: String(body.password ?? ""),
  });
  if (!result.ok) return apiError(result.error, 400);
  return apiJson({ ok: true }, 201);
}
