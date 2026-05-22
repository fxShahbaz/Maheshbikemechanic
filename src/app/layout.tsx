import type { Metadata, Viewport } from "next";
import { Inter, Fraunces, Noto_Sans_Devanagari } from "next/font/google";
import ScrollProgress from "@/components/animations/ScrollProgress";
import SmoothScroll from "@/components/SmoothScroll";
import { EnquiryDialogProvider } from "@/components/EnquiryDialog";
import RegisterSW from "@/components/RegisterSW";
import GlobalClickSound from "@/components/GlobalClickSound";
import GlobalTypingSound from "@/components/GlobalTypingSound";
import { BRAND_COLORS, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — 4 Months Professional Bike Mechanic Training, Pune`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "bike mechanic course",
    "bike mechanic training Pune",
    "motorcycle mechanic course India",
    "two wheeler mechanic training",
    "BS6 bike training",
    "EV bike training",
    "bike wiring course",
    "Mahesh Bike Institute",
    "4 month bike mechanic course",
    "Hindi bike mechanic course",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Education",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: ["hi_IN"],
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — 4 Months Professional Bike Mechanic Training, Pune`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — 4 Months Professional Bike Mechanic Training, Pune`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: BRAND_COLORS.cream },
    { media: "(prefers-color-scheme: dark)", color: BRAND_COLORS.ink },
  ],
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
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
