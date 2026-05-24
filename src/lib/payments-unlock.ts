import "server-only";
import { cookies } from "next/headers";

const PIN = process.env.PAYMENTS_PIN ?? "5050";
const COOKIE = "mbi_payments_unlock";
const COOKIE_VALUE = "1";
const MAX_AGE_SECONDS = 60 * 60 * 4;

export async function isPaymentsUnlocked(): Promise<boolean> {
  const store = await cookies();
  return store.get(COOKIE)?.value === COOKIE_VALUE;
}

export function verifyPaymentsPin(input: string): boolean {
  return input.trim() === PIN;
}

export async function setPaymentsUnlocked(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin/payments",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearPaymentsUnlock(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
