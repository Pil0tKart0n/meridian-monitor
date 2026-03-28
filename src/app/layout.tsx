import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Providers } from "@/components/providers";
import { BottomNav } from "@/components/layout/bottom-nav";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meridian Monitor — Geopolitische Intelligence in Echtzeit",
  description:
    "Datengetriebene Konfliktanalyse mit dem Global Escalation Index. Verstehe die Risiken, bevor sie Schlagzeilen werden.",
  openGraph: {
    title: "Meridian Monitor",
    description:
      "Echtzeit-Eskalationsindex und Konfliktanalyse aus 30+ internationalen Quellen.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable}`}>
      <body className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased pb-16 md:pb-0">
        <Providers>
          <NextIntlClientProvider messages={messages}>
            {children}
            <BottomNav />
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
