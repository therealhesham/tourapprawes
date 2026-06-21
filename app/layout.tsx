import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "باقات سياحية فاخرة | Rawaes",
  description: "باقات سياحية فاخرة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html dir="rtl" lang="ar" className={`${tajawal.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-on-surface font-body-md antialiased selection:bg-secondary selection:text-on-secondary min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
