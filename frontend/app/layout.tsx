import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KYNC Emlak & Otomotiv",
  description: "Lüks ve Prestijli Gayrimenkul Portföyü",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full antialiased">
      {/* 
          Aşağıdaki body içindeki 'vercel-toolbar-no-render' sınıfı 
          veya globals.css'e eklediğimiz kod o N harfini uçuracak.
      */}
      <body className="min-h-full flex flex-col bg-white">
        {children}
      </body>
    </html>
  );
}