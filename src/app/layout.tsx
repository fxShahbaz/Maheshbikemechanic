import type { Metadata } from "next";
import { Inter, Fraunces, Noto_Sans_Devanagari } from "next/font/google";
import ScrollProgress from "@/components/animations/ScrollProgress";
import SmoothScroll from "@/components/SmoothScroll";
import { EnquiryDialogProvider } from "@/components/EnquiryDialog";
import RegisterSW from "@/components/RegisterSW";
import GlobalClickSound from "@/components/GlobalClickSound";
import GlobalTypingSound from "@/components/GlobalTypingSound";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const devanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Mahesh Bike Institute — 4 Months Professional Bike Mechanic Training, Pune",
  description:
    "India's most practical 4-month bike mechanic training. Live engines, BS3/BS4/BS6 wiring, customer bike workshop and EV training in Pune, Maharashtra.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${devanagari.variable} antialiased`}
    >
      <body>
        <RegisterSW />
        <GlobalClickSound />
        <GlobalTypingSound />
        <SmoothScroll />
        <ScrollProgress />
        <EnquiryDialogProvider>{children}</EnquiryDialogProvider>
      </body>
    </html>
  );
}
