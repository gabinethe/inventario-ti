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
    name: "Usuários",
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

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 min-h-screen">
      <div>
        {/* Logotipo / Marca no topo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <Box className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">
              Inventário TI
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Gestão de Ativos
            </p>
          </div>
        </div>

        {/* Links de Navegação */}
        <nav className="p-4 space-y-1.5">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
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
                className={cn(
                  "flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-blue-600 text-white shadow-xs font-semibold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive ? "text-white" : "text-slate-400"
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors",
                      isActive
                        ? "bg-blue-700 text-white"
                        : "bg-slate-800 text-slate-300"
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
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/20">
        <div className="flex items-center gap-3 rounded-lg bg-slate-800/60 p-3 border border-slate-700/50">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="text-xs">
            <p className="font-semibold text-white">
              Sistema Operacional
            </p>
            <p className="text-[11px] text-slate-400">
              Ambiente Corporativo
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
