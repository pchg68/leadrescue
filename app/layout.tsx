import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeadRescue · Operação de resgate",
  description: "Demonstração privada de priorização e revisão humana de leads imobiliários. Somente cenários sintéticos.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
