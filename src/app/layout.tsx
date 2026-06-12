import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Global Mobility Adviser Partner Portal",
  description: "Manage your GMA partner listing, membership, and reviews.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const isAdmin = headersList.get("x-admin-route") === "1";

  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {!isAdmin && <Navbar />}
        {children}
        {!isAdmin && <Footer />}
      </body>
    </html>
  );
}
