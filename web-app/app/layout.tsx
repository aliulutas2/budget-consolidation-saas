import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using next/font instead of CDN
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Global Bütçe Konsolidasyon Platformu | Enterprise Çözümler",
  description: "Çok lokasyonlu işletmeler için tasarlanmış, Excel kaosunu bitiren, gerçek zamanlı bütçe konsolidasyon platformu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
