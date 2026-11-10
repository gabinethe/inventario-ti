import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";

export const metadata: Metadata = {
  title: "Inventário TI - Gestão Corporativa de Ativos",
  description: "Sistema para controle, atribuição e histórico de equipamentos de TI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex bg-slate-50 text-slate-900 font-sans">
        <Suspense fallback={<aside className="w-64 flex-shrink-0 bg-slate-900 min-h-screen" />}>
          <Sidebar />
        </Suspense>
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden bg-slate-50">
          {children}
        </div>
      </body>
    </html>
  );
}
