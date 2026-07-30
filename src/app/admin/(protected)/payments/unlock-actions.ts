"use server";

import { requireAdmin } from "@/lib/auth";
import {
  clearPaymentsUnlock,
  setPaymentsUnlocked,
  verifyPaymentsPin,
} from "@/lib/payments-unlock";
import { revalidatePath } from "next/cache";

type UnlockResult = { ok: true } | { ok: false; error: string };

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
