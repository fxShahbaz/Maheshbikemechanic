import { getAuthUser, getStudentProfile } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hasActiveAccess, isAdminEmail } from "@/lib/types";

const BUCKET = "study-materials";

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

  const supabase = supabaseAdmin();
  let query = supabase.from("study_materials").select("storage_path").eq("id", id);
  if (!admin) query = query.eq("published", true);
  const { data: material } = await query.maybeSingle();
  if (!material) return new Response("Not found", { status: 404 });

  const { data: blob, error } = await supabase.storage
    .from(BUCKET)
    .download(material.storage_path);
  if (error || !blob) return new Response("Not found", { status: 404 });

  return new Response(blob.stream(), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(blob.size),
      // inline + no-store: viewable in the app, never cached to disk
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
