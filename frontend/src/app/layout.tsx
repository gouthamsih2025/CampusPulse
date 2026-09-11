import type { Metadata } from "next";
import "./globals.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import { Footer } from "@/components/Footer";
export const metadata: Metadata = {
  metadataBase: new URL("https://campuspulse.vercel.app"),
  title: {
    default: "CampusPulse — Smarter Campus. Faster Resolution.",
    template: "%s | CampusPulse",
  },
  description:
    "Intelligent campus operations and issue-management platform. Report broken facilities, track live ticket resolution, and leverage AI triage for campus infrastructure.",
  keywords: [
    "campus operations",
    "issue management",
    "facilities management",
    "AI triage",
    "student ticketing system",
    "smart campus",
  ],
  authors: [{ name: "Campus Operations Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://campuspulse.vercel.app",
    title: "CampusPulse — Smarter Campus. Faster Resolution.",
    description:
      "Modern campus issue reporting, live status tracking, and AI-assisted facilities management.",
    siteName: "CampusPulse",
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusPulse — Smarter Campus Operations",
    description:
      "Automated campus issue triage, facilities dispatch, and operational analytics.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CampusPulse",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Intelligent campus operations and facilities issue-management platform.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <html lang="en" className="h-full">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased font-sans">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ConditionalNavbar />
        <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 focus:outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
