import type { Metadata, Viewport } from "next";
import { Yellowtail, Patrick_Hand } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const scriptFont = Yellowtail({
  variable: "--font-script",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const handFont = Patrick_Hand({
  variable: "--font-hand",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Wedding of Tama & Septi — 10.07.2027",
  description:
    "Undangan pernikahan Tama & Septi. Mohon doa restu untuk kami berdua.",
  openGraph: {
    title: "The Wedding of Tama & Septi",
    description: "Mohon doa restu untuk kami berdua.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#e0587a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${scriptFont.variable} ${handFont.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
