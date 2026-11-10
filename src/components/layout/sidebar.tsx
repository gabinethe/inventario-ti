"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { 
  Laptop, 
  LayoutDashboard, 
  ArrowLeftRight, 
  Users, 
  Settings,
  ShieldCheck, 
  Box,
  Monitor,
  Smartphone,
  Headphones,
  Boxes
} from "lucide-react";
import { cn } from "@/lib/utils";
import { equipamentosService } from "@/services/equipamentos.service";

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tipoAtivo = searchParams?.get("tipo");

  const [totais, setTotais] = useState({
    todos: 0,
    notebook: 0,
    monitor: 0,
    smartphone: 0,
    periferico: 0,
    colaboradores: 0,
    movimentacoes: 0,
  });

  useEffect(() => {
    async function carregarTotais() {
      try {
        const metricas = await equipamentosService.obterMetricas();
        setTotais({
          todos: metricas.total,
          notebook: metricas.porTipo.notebook,
          monitor: metricas.porTipo.monitor,
          smartphone: metricas.porTipo.smartphone,
          periferico: metricas.porTipo.periferico,
          colaboradores: metricas.totalColaboradores,
          movimentacoes: metricas.totalMovimentacoes,
        });
      } catch (err) {
        console.error("Erro ao carregar totais da sidebar:", err);
      }
    }

    carregarTotais();

    const handleAtualizacao = () => carregarTotais();
    window.addEventListener("inventario_alterado", handleAtualizacao);
    return () => window.removeEventListener("inventario_alterado", handleAtualizacao);
  }, [pathname, searchParams]);

  // Oculta a barra lateral na tela de login
  if (pathname === "/login") {
    return null;
  }

  const isLinkActive = (href: string, tipo?: string) => {
    if (href === "/") return pathname === "/";
    if (pathname.startsWith("/equipamentos")) {
      if (tipo) return tipoAtivo === tipo;
      return !tipoAtivo;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0b0e24] text-indigo-200 flex flex-col justify-between border-r border-indigo-950/80 min-h-screen">
      <div className="overflow-y-auto">
        {/* Logotipo / Marca no topo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-indigo-900/30 bg-[#0e122b]/60 sticky top-0 z-10">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
            <Box className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">
              Inventário TI
            </h1>
            <p className="text-[11px] text-indigo-300/70 font-medium">
              Gestão Corporativa de Ativos
            </p>
          </div>
        </div>

        {/* Links de Navegação */}
        <div className="p-4 space-y-6">
          {/* Seção 1: Geral */}
          <div className="space-y-1">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-indigo-400/60">
              Painel Principal
            </p>
            <Link
              href="/"
              prefetch={true}
              className={cn(
                "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
                isLinkActive("/")
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                  : "text-indigo-200/80 hover:bg-indigo-950/60 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </div>
            </Link>
          </div>

          {/* Seção 2: Categorias de Ativos de TI */}
          <div className="space-y-1">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-indigo-400/60">
              Inventário de Ativos
            </p>

            {/* Todos os Ativos */}
            <Link
              href="/equipamentos"
              prefetch={true}
              className={cn(
                "flex items-center justify-between rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-150",
                isLinkActive("/equipamentos")
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                  : "text-indigo-200/80 hover:bg-indigo-950/60 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Boxes className="h-4 w-4" />
                <span>Todos os Ativos</span>
              </div>
              <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/40">
                {totais.todos}
              </span>
            </Link>

            {/* Notebooks */}
            <Link
              href="/equipamentos?tipo=notebook"
              prefetch={true}
              className={cn(
                "flex items-center justify-between rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-150",
                isLinkActive("/equipamentos", "notebook")
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                  : "text-indigo-200/80 hover:bg-indigo-950/60 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Laptop className="h-4 w-4" />
                <span>Notebooks</span>
              </div>
              <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/40">
                {totais.notebook}
              </span>
            </Link>

            {/* Monitores */}
            <Link
              href="/equipamentos?tipo=monitor"
              prefetch={true}
              className={cn(
                "flex items-center justify-between rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-150",
                isLinkActive("/equipamentos", "monitor")
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                  : "text-indigo-200/80 hover:bg-indigo-950/60 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Monitor className="h-4 w-4" />
                <span>Monitores</span>
              </div>
              <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/40">
                {totais.monitor}
              </span>
            </Link>

            {/* Smartphones */}
            <Link
              href="/equipamentos?tipo=smartphone"
              prefetch={true}
              className={cn(
                "flex items-center justify-between rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-150",
                isLinkActive("/equipamentos", "smartphone")
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                  : "text-indigo-200/80 hover:bg-indigo-950/60 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4" />
                <span>Celulares</span>
              </div>
              <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/40">
                {totais.smartphone}
              </span>
            </Link>

            {/* Periféricos */}
            <Link
              href="/equipamentos?tipo=periferico"
              prefetch={true}
              className={cn(
                "flex items-center justify-between rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-150",
                isLinkActive("/equipamentos", "periferico")
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                  : "text-indigo-200/80 hover:bg-indigo-950/60 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Headphones className="h-4 w-4" />
                <span>Periféricos</span>
              </div>
              <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/40">
                {totais.periferico}
              </span>
            </Link>
          </div>

          {/* Seção 3: Pessoas e Governança */}
          <div className="space-y-1">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-indigo-400/60">
              Governança & Pessoas
            </p>

            <Link
              href="/responsaveis"
              prefetch={true}
              className={cn(
                "flex items-center justify-between rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-150",
                isLinkActive("/responsaveis")
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                  : "text-indigo-200/80 hover:bg-indigo-950/60 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4" />
                <span>Colaboradores</span>
              </div>
              <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/40">
                {totais.colaboradores}
              </span>
            </Link>

            <Link
              href="/movimentacoes"
              prefetch={true}
              className={cn(
                "flex items-center justify-between rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-150",
                isLinkActive("/movimentacoes")
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                  : "text-indigo-200/80 hover:bg-indigo-950/60 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <ArrowLeftRight className="h-4 w-4" />
                <span>Movimentações</span>
              </div>
              <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/40">
                {totais.movimentacoes}
              </span>
            </Link>

            <Link
              href="/configuracoes"
              prefetch={true}
              className={cn(
                "flex items-center justify-between rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-150",
                isLinkActive("/configuracoes")
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                  : "text-indigo-200/80 hover:bg-indigo-950/60 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </div>
            </Link>
          </div>
        </div>
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
