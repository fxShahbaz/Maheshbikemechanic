"use server";

import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Payment, PaymentMode, PaymentPurpose } from "@/lib/types";
import { revalidatePath } from "next/cache";

type PaymentInput = {
  admission_id: string;
  amount: number;
  paid_on: string;
  mode: PaymentMode;
  purpose: PaymentPurpose;
  reference?: string | null;
  notes?: string | null;
};

type Result<T = void> =
  | (T extends void ? { ok: true } : { ok: true; value: T })
  | { ok: false; error: string };

function validate(input: PaymentInput): { ok: true } | { ok: false; error: string } {
  if (!input.admission_id) return { ok: false, error: "Admission is required." };
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, error: "Amount must be a positive number." };
  }
  if (input.amount > 10_000_000) {
    return { ok: false, error: "Amount exceeds reasonable limit." };
  }
  if (!input.paid_on) return { ok: false, error: "Payment date is required." };
  return { ok: true };
}

export async function createPayment(
  input: PaymentInput
): Promise<{ ok: true; id: string; receipt_no: string } | { ok: false; error: string }> {
  await requireAdmin();
  const v = validate(input);
  if (!v.ok) return v;

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("payments")
    .insert({
      admission_id: input.admission_id,
      amount: Math.round(input.amount),
      paid_on: input.paid_on,
      mode: input.mode,
      purpose: input.purpose,
      reference: input.reference?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .select("id, receipt_no")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not save payment." };
  }

  revalidatePath("/admin/admissions");
  revalidatePath("/admin/payments");
  return { ok: true, id: data.id, receipt_no: data.receipt_no ?? "" };
}

export async function updatePayment(
  id: string,
  input: PaymentInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  const v = validate(input);
  if (!v.ok) return v;

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("payments")
    .update({
      amount: Math.round(input.amount),
      paid_on: input.paid_on,
      mode: input.mode,
      purpose: input.purpose,
      reference: input.reference?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/admissions");
  revalidatePath("/admin/payments");
  return { ok: true };
}

export async function deletePayment(id: string): Promise<Result> {
  await requireAdmin();
  const supabase = supabaseAdmin();
  const { error } = await supabase.from("payments").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/admissions");
  revalidatePath("/admin/payments");
  return { ok: true };
}

export async function listPaymentsForAdmission(
  admissionId: string
): Promise<Payment[]> {
  await requireAdmin();
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("admission_id", admissionId)
    .order("paid_on", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as Payment[];
}
