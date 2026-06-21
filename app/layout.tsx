import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const calSans = localFont({ src: "../public/fonts/CalSans-Regular.woff2", variable: "--font-cal" });
const gotham = localFont({ src: [{ path: "../public/fonts/Gotham-Light.woff2", weight: "300" }, { path: "../public/fonts/Gotham-Book.woff2", weight: "400" }, { path: "../public/fonts/Gotham-Medium.woff2", weight: "500" }], variable: "--font-gotham" });

export const metadata: Metadata = {
  title: "Rezo | Client portal",
  description: "Client projects, documents, invoices, and approvals.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body className={`${calSans.variable} ${gotham.variable}`}>{children}</body></html>;
}
