import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { ThemeProvider } from "@/context/theme-context";

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
    <html lang="pt-BR" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('inventario_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                if (t === 'dark') document.documentElement.classList.add('dark');
                else document.documentElement.classList.remove('dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex bg-slate-50 dark:bg-[#070913] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
        <ThemeProvider>
          <Suspense fallback={<aside className="w-64 flex-shrink-0 bg-slate-900 min-h-screen" />}>
            <Sidebar />
          </Suspense>
          <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden bg-slate-50 dark:bg-[#070913] min-w-0 transition-colors duration-200">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
