import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { QueryProvider } from "@/components/QueryProvider";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Header } from "@/components/Store/Header";
import { Footer } from "@/components/Store/Footer";
import { NewsletterBar } from "@/components/Store/NewsletterBar";
import { asset } from "@/lib/paths";

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-cormorant", display: "swap" });
const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-jost", display: "swap" });

export const metadata: Metadata = {
  title: { default: `${site.name} — ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
  metadataBase: new URL(site.url),
  icons: { icon: asset("/favicon.svg") },
  openGraph: { siteName: site.name, type: "website", locale: "en_AE" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="min-h-screen flex flex-col">
        <QueryProvider>
          <SmoothScroll>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <NewsletterBar />
          </SmoothScroll>
          <ScrollReveal />
        </QueryProvider>
      </body>
    </html>
  );
}
