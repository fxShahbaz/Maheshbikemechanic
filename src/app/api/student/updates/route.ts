import { getUpdatesFeed } from "@/lib/student-portal";
import { apiJson, authenticateActiveStudent } from "@/lib/student-api";

export async function GET(request: Request) {
  const auth = await authenticateActiveStudent(request);
  if (auth instanceof Response) return auth;

  return apiJson(await getUpdatesFeed(auth.profile));
}
