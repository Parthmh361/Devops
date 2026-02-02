import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter as requested/standard
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Event Sponsorship & Collaboration Platform",
  description: "Connect organizers and sponsors seamlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} flex flex-col min-h-screen bg-gray-50`}
        style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#F9FAFB', margin: 0, padding: 0 }}
      >
        <Navbar />
        <main className="flex-grow" style={{ flexGrow: 1 }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
