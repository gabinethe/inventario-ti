"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Laptop, 
  LayoutDashboard, 
  ArrowLeftRight, 
  Users, 
  Settings,
  ShieldCheck, 
  Box
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Equipamentos",
    href: "/equipamentos",
    icon: Laptop,
    badge: "5",
  },
  {
    name: "Colaboradores",
    href: "/responsaveis",
    icon: Users,
    badge: "4",
  },
  {
    name: "Movimentações",
    href: "/movimentacoes",
    icon: ArrowLeftRight,
  },
  {
    name: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  // Oculta a barra lateral na tela de login
  if (pathname === "/login") {
    return null;
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0b0e24] text-indigo-200 flex flex-col justify-between border-r border-indigo-950/80 min-h-screen">
      <div>
        {/* Logotipo / Marca no topo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-indigo-900/30 bg-[#0e122b]/60">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
            <Box className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">
              Inventário TI
            </h1>
            <p className="text-[11px] text-indigo-300/70 font-medium">
              Gestão de Ativos
            </p>
          </div>
        </div>

        {/* Links de Navegação */}
        <nav className="p-4 space-y-1.5">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-indigo-400/60">
            Navegação Principal
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                    : "text-indigo-200/80 hover:bg-indigo-950/60 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive ? "text-white" : "text-indigo-400/80"
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors",
                      isActive
                        ? "bg-indigo-700/80 text-white"
                        : "bg-indigo-950/80 text-indigo-300 border border-indigo-800/40"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Rodapé da Sidebar */}
      <div className="p-4 border-t border-indigo-900/30 bg-[#0e122b]/40">
        <div className="flex items-center gap-3 rounded-xl bg-indigo-950/50 p-3 border border-indigo-900/40">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="text-xs">
            <p className="font-semibold text-white">
              Sistema Operacional
            </p>
            <p className="text-[11px] text-indigo-300/60">
              Ambiente Corporativo
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
