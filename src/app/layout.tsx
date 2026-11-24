import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import { Header } from "@/components/layout/Header/Header";
import "../styles/globals.css";

const manrope = localFont({
  src: "../../public/fonts/Manrope-VariableFont_wght.ttf",
  variable: "--font-manrope",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "eGenHub",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>
        <div className="site-shell" data-site-shell>
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
