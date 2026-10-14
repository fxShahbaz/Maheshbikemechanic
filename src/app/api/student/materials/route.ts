import { listMaterials } from "@/lib/student-portal";
import { apiJson, authenticateActiveStudent } from "@/lib/student-api";

export async function GET(request: Request) {
  const auth = await authenticateActiveStudent(request);
  if (auth instanceof Response) return auth;

  // Storage paths stay server-side; the app fetches files by id
  const materials = (await listMaterials(auth.profile)).map((m) => ({
    id: m.id,
    created_at: m.created_at,
    title: m.title,
    description: m.description,
    category: m.category,
    file_size: m.file_size,
  }));
  return apiJson({ materials });
}
