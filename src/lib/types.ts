export type EnquiryStatus =
  | "new"
  | "contacted"
  | "dormant"
  | "enrolled"
  | "closed";

export function formatStatus(s: EnquiryStatus): string {
  return s
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export type Enquiry = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  city: string | null;
  interest: string | null;
  status: EnquiryStatus;
  notes: string | null;
  source: string | null;
  reminder_date: string | null;
};

export type NewEnquiry = {
  name: string;
  phone: string;
  city?: string;
  interest?: string;
  source?: string;
  reminder_date?: string | null;
  notes?: string;
  status?: EnquiryStatus;
};

export const ENQUIRY_STATUSES: EnquiryStatus[] = [
  "new",
  "contacted",
  "dormant",
  "enrolled",
  "closed",
];

export const ENQUIRY_SOURCES = [
  "website",
  "chat",
  "admin",
  "phone",
  "whatsapp",
  "walk-in",
  "referral",
  "other",
] as const;

export const ADMIN_EMAILS: ReadonlySet<string> = new Set([
  "team.celvix@gmail.com",
  "bmm2wservice@gmail.com",
]);

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.has(email.trim().toLowerCase());
}

// ============== Admissions ==============

export type Admission = {
  id: string;
  created_at: string;
  name: string;
  address: string | null;
  phone: string;
  email: string | null;
  age: number | null;
  aadhar_no: string | null;
  family_name: string | null;
  family_relation: string | null;
  family_phone: string | null;
  batch_no: string | null;
  notes: string | null;
  total_fee: number | null;
};

// ============== Payments ==============

export type PaymentMode = "cash" | "upi" | "bank" | "card" | "cheque" | "other";
export type PaymentPurpose =
  | "registration"
  | "course_fee"
  | "hostel"
  | "other";

export type Payment = {
  id: string;
  created_at: string;
  admission_id: string;
  amount: number;
  paid_on: string;
  mode: PaymentMode;
  purpose: PaymentPurpose;
  reference: string | null;
  receipt_no: string | null;
  notes: string | null;
};

export const PAYMENT_MODES: PaymentMode[] = [
  "cash",
  "upi",
  "bank",
  "card",
  "cheque",
  "other",
];

export const PAYMENT_PURPOSES: PaymentPurpose[] = [
  "registration",
  "course_fee",
  "hostel",
  "other",
];

export function formatPurpose(p: PaymentPurpose): string {
  return p
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function formatINR(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const FAMILY_RELATIONS = [
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Spouse",
  "Guardian",
  "Other",
] as const;

export function maskAadhar(aadhar: string | null): string {
  if (!aadhar) return "—";
  const digits = aadhar.replace(/\D/g, "");
  if (digits.length < 4) return aadhar;
  const last4 = digits.slice(-4);
  return `XXXX XXXX ${last4}`;
}
