"use server";

import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

type Result = { ok: true } | { ok: false; error: string };

type AnnouncementInput = {
  title: string;
  body?: string | null;
  published?: boolean;
  pinned?: boolean;
  /** Target batches; empty = all students. */
  batches?: string[];
};

function cleanBatches(batches: string[] | undefined): string[] {
  return Array.from(
    new Set((batches ?? []).map((b) => b.trim()).filter(Boolean))
  );
}

function revalidateAnnouncements() {
  revalidatePath("/admin/announcements");
  revalidatePath("/student/updates");
}

export async function createAnnouncement(
  input: AnnouncementInput
): Promise<Result> {
  await requireAdmin();

  const title = input.title?.trim();
  if (!title) return { ok: false, error: "Title is required." };

  const supabase = supabaseAdmin();
  const { error } = await supabase.from("announcements").insert({
    title,
    body: input.body?.trim() || null,
    published: input.published ?? true,
    pinned: input.pinned ?? false,
    batches: cleanBatches(input.batches),
  });
  if (error) return { ok: false, error: error.message };

  revalidateAnnouncements();
  return { ok: true };
}

export async function updateAnnouncement(
  id: string,
  input: AnnouncementInput
): Promise<Result> {
  await requireAdmin();

  const title = input.title?.trim();
  if (!title) return { ok: false, error: "Title is required." };

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("announcements")
    .update({
      title,
      body: input.body?.trim() || null,
      published: input.published ?? true,
      pinned: input.pinned ?? false,
      ...(input.batches !== undefined && {
        batches: cleanBatches(input.batches),
      }),
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidateAnnouncements();
  return { ok: true };
}

export async function deleteAnnouncement(id: string): Promise<Result> {
  await requireAdmin();

  const supabase = supabaseAdmin();
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidateAnnouncements();
  return { ok: true };
}
