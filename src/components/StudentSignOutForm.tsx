"use client";

import { signOutStudent } from "@/app/actions/student-auth";
import { clearPdfCache } from "@/lib/pdf-cache";

/** Sign-out form that also wipes cached study PDFs from this browser. */
export default function StudentSignOutForm({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <form action={signOutStudent} onSubmit={clearPdfCache} className={className}>
      {children}
    </form>
  );
}
