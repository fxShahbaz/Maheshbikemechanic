"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { ADMIN_EMAIL } from "@/lib/types";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }
}

function normalisePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length < 10) return null;
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  return `+91${digits.slice(-10)}`;
}

function normaliseAadhar(input: string | null | undefined): string | null {
  if (!input) return null;
  const digits = input.replace(/\D/g, "");
  if (digits.length !== 12) return null;
  // Format as "XXXX XXXX XXXX"
  return digits.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3");
}

type AdmissionInput = {
  name: string;
  phone: string;
  address?: string | null;
  email?: string | null;
  age?: number | null;
  aadhar_no?: string | null;
  family_name?: string | null;
  family_relation?: string | null;
  family_phone?: string | null;
  batch_no?: string | null;
  notes?: string | null;
  total_fee?: number | null;
};

type Result<T = void> =
  | ({ ok: true } & (T extends void ? object : { value: T }))
  | { ok: false; error: string };

function validate(input: AdmissionInput): { ok: true; data: ReturnType<typeof buildRow> } | { ok: false; error: string } {
  const name = input.name?.trim();
  if (!name) return { ok: false, error: "Name is required." };

  const phone = normalisePhone(input.phone);
  if (!phone) return { ok: false, error: "Phone must include at least 10 digits." };

  if (input.email && input.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    return { ok: false, error: "Email is not a valid address." };
  }

  if (input.age != null) {
    const ageNum = Number(input.age);
    if (!Number.isFinite(ageNum) || ageNum < 10 || ageNum > 100) {
      return { ok: false, error: "Age must be between 10 and 100." };
    }
  }

  let aadhar: string | null = null;
  if (input.aadhar_no && input.aadhar_no.trim()) {
    aadhar = normaliseAadhar(input.aadhar_no);
    if (!aadhar) {
      return { ok: false, error: "Aadhar number must be exactly 12 digits." };
    }
  }

  let familyPhone: string | null = null;
  if (input.family_phone && input.family_phone.trim()) {
    familyPhone = normalisePhone(input.family_phone);
    if (!familyPhone) {
      return { ok: false, error: "Family contact phone must include at least 10 digits." };
    }
  }

  let totalFee: number | null = null;
  if (input.total_fee != null && input.total_fee !== ("" as unknown as number)) {
    const n = Number(input.total_fee);
    if (!Number.isFinite(n) || n < 0) {
      return { ok: false, error: "Total fee must be a positive number." };
    }
    totalFee = Math.round(n);
  }

  return {
    ok: true,
    data: buildRow({
      name,
      phone,
      address: input.address?.trim() || null,
      email: input.email?.trim() || null,
      age: input.age != null ? Number(input.age) : null,
      aadhar_no: aadhar,
      family_name: input.family_name?.trim() || null,
      family_relation: input.family_relation?.trim() || null,
      family_phone: familyPhone,
      batch_no: input.batch_no?.trim() || null,
      notes: input.notes?.trim() || null,
      total_fee: totalFee,
    }),
  };
}

function buildRow(row: Record<string, unknown>) {
  return row;
}

export async function createAdmission(
  input: AdmissionInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await requireAdmin();
  const v = validate(input);
  if (!v.ok) return v;

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("admissions")
    .insert(v.data)
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not create admission." };
  }

  revalidatePath("/admin/admissions");
  return { ok: true, id: data.id };
}

export async function updateAdmission(
  id: string,
  input: AdmissionInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  const v = validate(input);
  if (!v.ok) return v;

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("admissions")
    .update(v.data)
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/admissions");
  return { ok: true };
}

export type AdmissionWithPaid = import("@/lib/types").Admission & {
  paid: number;
  payment_count: number;
};

export async function listAdmissionsWithPaid(): Promise<AdmissionWithPaid[]> {
  await requireAdmin();
  const supabase = supabaseAdmin();
  const [{ data: admissions }, { data: payments }] = await Promise.all([
    supabase
      .from("admissions")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("payments").select("admission_id, amount"),
  ]);

  const totals = new Map<string, { paid: number; count: number }>();
  for (const p of payments ?? []) {
    const cur = totals.get(p.admission_id as string) ?? { paid: 0, count: 0 };
    cur.paid += Number(p.amount) || 0;
    cur.count += 1;
    totals.set(p.admission_id as string, cur);
  }

  return (admissions ?? []).map((a) => {
    const t = totals.get(a.id) ?? { paid: 0, count: 0 };
    return { ...(a as import("@/lib/types").Admission), paid: t.paid, payment_count: t.count };
  });
}

export async function deleteAdmission(id: string): Promise<Result> {
  await requireAdmin();
  const supabase = supabaseAdmin();
  const { error } = await supabase.from("admissions").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/admissions");
  return { ok: true };
}
