import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
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
    <html lang={locale} className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-gray-950 text-gray-100 font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
