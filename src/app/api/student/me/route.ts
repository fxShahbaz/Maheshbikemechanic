import { accessLock } from "@/lib/student-portal";
import { apiJson, authenticateStudent, publicProfile } from "@/lib/student-api";
import { hasActiveAccess } from "@/lib/types";

/** Who's signed in and whether the portal is unlocked for them. */
export async function GET(request: Request) {
  const auth = await authenticateStudent(request);
  if (auth instanceof Response) return auth;

  const { profile } = auth;
  const active = hasActiveAccess(profile);
  return apiJson({
    profile: publicProfile(profile),
    active,
    lock: active ? null : accessLock(profile),
  });
}
