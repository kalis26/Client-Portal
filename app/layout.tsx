import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rezo | Client portal",
  description: "Client projects, documents, invoices, and approvals.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body>{children}</body></html>;
}
