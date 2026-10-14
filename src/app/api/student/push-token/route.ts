import { apiError, apiJson, authenticateStudent } from "@/lib/student-api";
import { supabaseAdmin } from "@/lib/supabase/admin";

const TOKEN_RE = /^Expo(nent)?PushToken\[[^\]]+\]$/;

function readToken(body: { token?: unknown } | null): string | null {
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  return TOKEN_RE.test(token) ? token : null;
}

/** Registers this device for announcement pushes (any signed-in student). */
export async function POST(request: Request) {
  const auth = await authenticateStudent(request);
  if (auth instanceof Response) return auth;

  const body = await request.json().catch(() => null);
  const token = readToken(body);
  if (!token) return apiError("Invalid push token.", 400);
  const platform = body?.platform === "ios" || body?.platform === "android" ? body.platform : null;

  const { error } = await supabaseAdmin()
    .from("push_tokens")
    .upsert(
      { token, student_id: auth.profile.id, platform, updated_at: new Date().toISOString() },
      { onConflict: "token" }
    );
  if (error) return apiError("Could not register for notifications.", 500);
  return apiJson({ ok: true });
}

/** Signing out: stop pushes to this device for this student. */
export async function DELETE(request: Request) {
  const auth = await authenticateStudent(request);
  if (auth instanceof Response) return auth;

  const token = readToken(await request.json().catch(() => null));
  if (!token) return apiError("Invalid push token.", 400);

  await supabaseAdmin()
    .from("push_tokens")
    .delete()
    .eq("token", token)
    .eq("student_id", auth.profile.id);
  return apiJson({ ok: true });
}
