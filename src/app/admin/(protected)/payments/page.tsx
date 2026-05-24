import Link from "next/link";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  formatINR,
  formatPurpose,
  type Payment,
  type PaymentMode,
} from "@/lib/types";
import PaymentsView from "./PaymentsView";
import PinGate from "./PinGate";
import { isPaymentsUnlocked } from "@/lib/payments-unlock";

export const dynamic = "force-dynamic";

export type PaymentRow = Payment & {
  admission: {
    id: string;
    name: string;
    phone: string;
    batch_no: string | null;
  } | null;
};

export default async function PaymentsPage() {
  const h = await headers();
  const referer = h.get("referer") ?? "";
  let cameFromPayments = false;
  try {
    cameFromPayments = new URL(referer).pathname.startsWith("/admin/payments");
  } catch {
    cameFromPayments = false;
  }

  if (!cameFromPayments || !(await isPaymentsUnlocked())) {
    return <PinGate />;
  }

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("payments")
    .select(
      "*, admission:admissions(id, name, phone, batch_no)"
    )
    .order("paid_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="w-full px-4 md:px-8 lg:px-10 py-6 md:py-10">
        <h1 className="font-display text-3xl mb-4">Payments</h1>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-800">
          <div className="font-medium">Could not load payments.</div>
          <pre className="text-xs mt-2 overflow-auto">{error.message}</pre>
        </div>
      </main>
    );
  }

  const payments = (data ?? []) as PaymentRow[];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const stats = {
    total: payments.reduce((s, p) => s + Number(p.amount || 0), 0),
    count: payments.length,
    today: payments
      .filter((p) => new Date(p.paid_on + "T00:00:00") >= today)
      .reduce((s, p) => s + Number(p.amount || 0), 0),
    month: payments
      .filter((p) => new Date(p.paid_on + "T00:00:00") >= monthStart)
      .reduce((s, p) => s + Number(p.amount || 0), 0),
  };

  return (
    <main className="w-full px-4 md:px-8 lg:px-10 py-6 md:py-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Payments</h1>
          <p className="text-muted text-sm mt-1">
            Every receipt across all students &middot; auto-generated receipt numbers.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm md:max-w-lg md:w-full">
          <Kpi label="Today" value={formatINR(stats.today)} />
          <Kpi label="This month" value={formatINR(stats.month)} accent="lime" />
          <Kpi label="Lifetime" value={formatINR(stats.total)} accent="dark" />
        </div>
      </div>

      <PaymentsView payments={payments} />
    </main>
  );
}

function Kpi({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "lime" | "dark";
}) {
  const cls =
    accent === "dark"
      ? "bg-ink text-white border-ink"
      : accent === "lime"
        ? "bg-lime border-lime text-ink"
        : "bg-white border-line text-ink";
  const labelCls =
    accent === "dark" ? "text-white/60" : "text-muted";
  return (
    <div className={`rounded-xl border px-3 py-2 ${cls}`}>
      <div className={`text-[10px] uppercase tracking-wider ${labelCls}`}>
        {label}
      </div>
      <div className="font-display num-mono text-lg leading-tight mt-0.5">
        {value}
      </div>
    </div>
  );
}
