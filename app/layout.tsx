import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google"; // Mixed typography
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant"
});

export const metadata: Metadata = {
  title: "Momori",
  description: "A sanctuary for your digital memories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.variable, cormorant.variable, "font-sans antialiased bg-[#050505] text-[#e1e1e1]")}>
        {children}
      </body>
    </html>
  );
}
