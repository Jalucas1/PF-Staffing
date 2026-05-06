import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PF Staff Schedule",
  description: "Employee scheduling and staff management portal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}