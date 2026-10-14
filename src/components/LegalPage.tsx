import Link from "next/link";
import type { ReactNode } from "react";
import { SITE_NAME } from "@/lib/site";

/** Plain readable layout for policy pages (linked from the app stores). */
export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-cream px-4 py-12">
      <article className="max-w-2xl mx-auto bg-white border border-line rounded-3xl p-7 sm:p-10 text-[15px] leading-relaxed text-ink/85 [&_h2]:font-semibold [&_h2]:text-ink [&_h2]:text-lg [&_h2]:mt-8 [&_h2]:mb-2 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1 [&_a]:text-forest [&_a]:underline">
        <Link href="/" className="text-sm text-muted no-underline!">
          {SITE_NAME}
        </Link>
        <h1 className="font-display text-3xl text-ink mt-2">{title}</h1>
        <p className="text-sm text-muted">Last updated {updated}</p>
        {children}
      </article>
    </main>
  );
}
