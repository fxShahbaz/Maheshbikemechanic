"use server";

import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { EnquiryStatus } from "@/lib/types";
import { revalidatePath } from "next/cache";

type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitEnquiry(formData: FormData): Promise<SubmitResult> {
  const name = String(formData.get("name") ?? "").trim();
  const phoneDigits = String(formData.get("phone") ?? "").replace(/\D/g, "");
  const city = String(formData.get("city") ?? "").trim() || null;
  const interest = String(formData.get("interest") ?? "").trim() || null;
  const rawSource = String(formData.get("source") ?? "").trim();
  const source = rawSource === "chat" ? "chat" : "website";

  if (!name) {
    return { ok: false, error: "Name is required." };
  }
  if (phoneDigits.length !== 10) {
    return { ok: false, error: "Phone must be a valid 10-digit number." };
  }
  if (name.length > 120) {
    return { ok: false, error: "Name too long." };
  }
  const phone = `+91${phoneDigits}`;

  const supabase = supabaseAdmin();
  const { error } = await supabase.from("enquiries").insert({
    name,
    phone,
    city,
    interest,
    status: "new",
    source,
  });

  if (error) {
    console.error("submitEnquiry error:", error);
    return { ok: false, error: "Could not save your enquiry. Please call us." };
  }

  return { ok: true };
}

export async function updateEnquiryStatus(id: string, status: EnquiryStatus) {
  await requireAdmin();
  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("enquiries")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/enquiries");
}

export async function updateEnquiryNotes(id: string, notes: string) {
  await requireAdmin();
  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("enquiries")
    .update({ notes: notes.trim() || null })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/enquiries");
}

type UpdateInput = {
  name: string;
  phone: string;
  city: string | null;
  interest: string | null;
  notes: string | null;
  status: EnquiryStatus;
  source: string | null;
  reminder_date: string | null;
};

function normalisePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length < 10) return null;
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  return `+91${digits.slice(-10)}`;
}

export async function updateEnquiry(
  id: string,
  input: UpdateInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();

  const name = input.name.trim();
  if (!name) return { ok: false, error: "Name is required." };
  const phone = normalisePhone(input.phone);
  if (!phone) {
    return { ok: false, error: "Phone must include at least 10 digits." };
  }

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("enquiries")
    .update({
      name,
      phone,
      city: input.city?.trim() || null,
      interest: input.interest?.trim() || null,
      notes: input.notes?.trim() || null,
      status: input.status,
      source: input.source?.trim() || null,
      reminder_date: input.reminder_date || null,
    })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin/dashboard");
  return { ok: true };
}

type CreateInput = {
  name: string;
  phone: string;
  city?: string;
  interest?: string;
  notes?: string;
  source?: string;
  status?: EnquiryStatus;
  reminder_date?: string | null;
};

export async function createEnquiry(
  input: CreateInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await requireAdmin();

  const name = input.name.trim();
  if (!name) return { ok: false, error: "Name is required." };
  const phone = normalisePhone(input.phone);
  if (!phone) {
    return { ok: false, error: "Phone must include at least 10 digits." };
  }

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("enquiries")
    .insert({
      name,
      phone,
      city: input.city?.trim() || null,
      interest: input.interest?.trim() || null,
      notes: input.notes?.trim() || null,
      status: input.status ?? "new",
      source: input.source?.trim() || "admin",
      reminder_date: input.reminder_date || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not create enquiry." };
  }

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin/dashboard");
  return { ok: true, id: data.id };
}

export type EnquirySuggestion = {
  id: string;
  name: string;
  phone: string;
  city: string | null;
  interest: string | null;
  notes: string | null;
};

export async function getEnquirySuggestions(): Promise<EnquirySuggestion[]> {
  await requireAdmin();
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("enquiries")
    .select("id, name, phone, city, interest, notes")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return [];
  return (data ?? []) as EnquirySuggestion[];
}

export async function deleteEnquiry(id: string) {
  await requireAdmin();
  const supabase = supabaseAdmin();
  const { error } = await supabase.from("enquiries").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/enquiries");
}
