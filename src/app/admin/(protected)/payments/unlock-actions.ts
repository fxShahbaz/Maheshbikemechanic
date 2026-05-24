"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/types";
import {
  clearPaymentsUnlock,
  setPaymentsUnlocked,
  verifyPaymentsPin,
} from "@/lib/payments-unlock";
import { revalidatePath } from "next/cache";

type UnlockResult = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    throw new Error("Unauthorized");
  }
}

export async function unlockPayments(formData: FormData): Promise<UnlockResult> {
  await requireAdmin();
  const pin = String(formData.get("pin") ?? "");
  if (!pin) return { ok: false, error: "Enter the PIN." };
  if (!verifyPaymentsPin(pin)) return { ok: false, error: "Incorrect PIN." };

  await setPaymentsUnlocked();
  revalidatePath("/admin/payments");
  return { ok: true };
}

export async function lockPayments(): Promise<void> {
  await requireAdmin();
  await clearPaymentsUnlock();
  revalidatePath("/admin/payments");
}
