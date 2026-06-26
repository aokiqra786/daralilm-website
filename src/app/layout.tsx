import type { Metadata } from "next";
import { Inter, Playfair_Display, Amiri } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  weight: ["400", "700"],
  subsets: ["arabic"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://socalaok.org";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SoCal Academy of Knowledge",
    template: "%s · SoCal Academy of Knowledge",
  },
  description: "Providing Quality Islamic Education for Our Community",
  openGraph: {
    type: "website",
    siteName: "SoCal Academy of Knowledge",
    url: siteUrl,
    images: ["/brand/logo/AoK_Logo_Color.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${amiri.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-slate-800 bg-slate-50">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
