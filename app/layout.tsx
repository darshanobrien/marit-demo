import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marit",
  description: "AI business case prioritization and evaluation demo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-CA">
      <body>{children}</body>
    </html>
  );
}
