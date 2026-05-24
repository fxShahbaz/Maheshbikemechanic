import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/types";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import AdminShell from "./AdminShell";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  if (!isAdminEmail(user.email)) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-cream">
        <div className="max-w-md text-center">
          <h1 className="font-display text-3xl">Not authorised</h1>
          <p className="text-muted text-sm mt-3">
            <code className="px-1.5 py-0.5 rounded bg-white border border-line">
              {user.email}
            </code>{" "}
            is not allowed in the admin panel.
          </p>
          <form action={signOut} className="mt-6">
            <button type="submit" className="pill-btn">
              Sign out
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <AdminShell user={{ email: user.email! }}>
      {children}
    </AdminShell>
  );
}
