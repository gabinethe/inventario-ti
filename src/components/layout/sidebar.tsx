"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
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
  Boxes,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  X,
  User,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { equipamentosService, EquipamentoComResponsavel } from "@/services/equipamentos.service";
import { Responsavel, TipoEquipamento } from "@/types";

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tipoAtivo = searchParams?.get("tipo");

  // Estado da sidebar: recolhida (só ícones) ou expandida
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [ativosAberto, setAtivosAberto] = useState(true);

  // Busca rápida na Sidebar
  const [termoBusca, setTermoBusca] = useState("");
  const [buscaAtiva, setBuscaAtiva] = useState(false);
  const [equipamentos, setEquipamentos] = useState<EquipamentoComResponsavel[]>([]);
  const [colaboradores, setColaboradores] = useState<Responsavel[]>([]);
  const buscaRef = useRef<HTMLDivElement>(null);

  // Totais e contadores de itens
  const [totais, setTotais] = useState({
    todos: 0,
    notebook: 0,
    monitor: 0,
    smartphone: 0,
    periferico: 0,
    colaboradores: 0,
    movimentacoes: 0,
  });

  // Carrega preferência de colapso do localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const salvo = localStorage.getItem("inventario_sidebar_collapsed");
      if (salvo !== null) {
        setIsCollapsed(salvo === "true");
      }
    }
  }, []);

  const alternarColapso = () => {
    setIsCollapsed((prev) => {
      const novo = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("inventario_sidebar_collapsed", String(novo));
      }
      return novo;
    });
  };

  // Carrega totais e dados para a busca rápida
  const carregarDados = async () => {
    try {
      const [metricas, listaEq, listaResp] = await Promise.all([
        equipamentosService.obterMetricas(),
        equipamentosService.listar(),
        equipamentosService.listarResponsaveis(),
      ]);

      setTotais({
        todos: metricas.total,
        notebook: metricas.porTipo.notebook,
        monitor: metricas.porTipo.monitor,
        smartphone: metricas.porTipo.smartphone,
        periferico: metricas.porTipo.periferico,
        colaboradores: metricas.totalColaboradores,
        movimentacoes: metricas.totalMovimentacoes,
      });

      setEquipamentos(listaEq);
      setColaboradores(listaResp);
    } catch (err) {
      console.error("Erro ao carregar dados da sidebar:", err);
    }
  };

  useEffect(() => {
    carregarDados();
    const handleAtualizacao = () => carregarDados();
    window.addEventListener("inventario_alterado", handleAtualizacao);
    return () => window.removeEventListener("inventario_alterado", handleAtualizacao);
  }, [pathname, searchParams]);

  // Atalho de teclado: Ctrl+B para colapsar, Ctrl+K para buscar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        alternarColapso();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isCollapsed) setIsCollapsed(false);
        setBuscaAtiva(true);
      }
      if (e.key === "Escape") {
        setBuscaAtiva(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCollapsed]);

  // Fecha popup de busca ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (buscaRef.current && !buscaRef.current.contains(e.target as Node)) {
        setBuscaAtiva(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Oculta a barra lateral na tela de login
  if (pathname === "/login") {
    return null;
  }

  const isLinkActive = (href: string, tipo?: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/equipamentos")) {
      if (!pathname.startsWith("/equipamentos")) return false;
      if (tipo === "todos") return tipoAtivo === "todos";
      if (tipo) return tipoAtivo === tipo || (!tipoAtivo && tipo === "notebook");
      return !tipoAtivo;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Resultados da busca rápida na sidebar
  const resultadosBusca = termoBusca.trim()
    ? {
        equipamentos: equipamentos.filter((eq) => {
          const t = termoBusca.toLowerCase();
          return (
            eq.modelo.toLowerCase().includes(t) ||
            eq.marca.toLowerCase().includes(t) ||
            eq.numeroSerie.toLowerCase().includes(t) ||
            (eq.subtipo && eq.subtipo.toLowerCase().includes(t)) ||
            (eq.responsavel?.nome.toLowerCase().includes(t) ?? false)
          );
        }).slice(0, 4),
        colaboradores: colaboradores.filter((colab) => {
          const t = termoBusca.toLowerCase();
          return (
            colab.nome.toLowerCase().includes(t) ||
            colab.email.toLowerCase().includes(t) ||
            colab.cargo.toLowerCase().includes(t) ||
            colab.departamento.toLowerCase().includes(t)
          );
        }).slice(0, 3),
      }
    : null;

  return (
    <aside
      className={cn(
        "flex-shrink-0 bg-[#0b0e24] text-indigo-200 flex flex-col justify-between border-r border-indigo-950/80 min-h-screen transition-all duration-300 ease-in-out relative z-30 select-none shadow-lg",
        isCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className="overflow-y-auto overflow-x-hidden flex-1 flex flex-col">
        {/* Cabeçalho da Sidebar */}
        <div
          className={cn(
            "h-16 flex items-center border-b border-indigo-900/30 bg-[#0e122b]/60 sticky top-0 z-10 transition-all",
            isCollapsed ? "justify-center px-2" : "justify-between px-4"
          )}
        >
          {/* Logo e Nome */}
          <Link
            href="/"
            prefetch={true}
            className={cn("flex items-center gap-2.5 group cursor-pointer", isCollapsed && "justify-center")}
            title="Inventário TI - Início"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform flex-shrink-0">
              <Box className="h-5 w-5" />
            </div>

            {!isCollapsed && (
              <div className="overflow-hidden">
                <h1 className="text-sm font-bold text-white tracking-tight leading-tight truncate">
                  Inventário TI
                </h1>
                <p className="text-[11px] text-indigo-300/70 font-medium truncate">
                  Gestão Corporativa
                </p>
              </div>
            )}
          </Link>

          {/* Botão de Minimizar / Expandir */}
          <button
            type="button"
            onClick={alternarColapso}
            className={cn(
              "p-1.5 rounded-lg text-indigo-400 hover:text-white hover:bg-indigo-900/50 transition-colors cursor-pointer flex-shrink-0",
              isCollapsed && "mt-1"
            )}
            title={isCollapsed ? "Expandir barra lateral (Ctrl+B)" : "Recolher barra lateral (Ctrl+B)"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Barra de Busca Integrada na Sidebar */}
        <div ref={buscaRef} className="px-3 pt-3 pb-1 relative">
          {isCollapsed ? (
            <button
              type="button"
              onClick={() => {
                setIsCollapsed(false);
                setBuscaAtiva(true);
              }}
              className="w-full flex items-center justify-center p-2.5 rounded-xl text-indigo-400 hover:text-white hover:bg-indigo-950/80 border border-transparent hover:border-indigo-900/50 transition-all cursor-pointer group relative"
              title="Pesquisar ativos ou pessoas (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
              {/* Tooltip flutuante */}
              <div className="absolute left-[76px] px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
                Buscar (Ctrl+K)
              </div>
            </button>
          ) : (
            <div className="relative">
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-3.5 h-3.5 text-indigo-400/80 pointer-events-none" />
                <input
                  type="text"
                  value={termoBusca}
                  onChange={(e) => {
                    setTermoBusca(e.target.value);
                    setBuscaAtiva(true);
                  }}
                  onFocus={() => setBuscaAtiva(true)}
                  placeholder="Buscar ativo ou pessoa..."
                  className="w-full pl-8 pr-12 py-1.5 text-xs bg-indigo-950/40 hover:bg-indigo-950/60 focus:bg-indigo-950/80 text-white placeholder:text-indigo-400/50 border border-indigo-900/50 rounded-xl focus:outline-none focus:border-indigo-500 transition-all"
                />
                {termoBusca ? (
                  <button
                    type="button"
                    onClick={() => {
                      setTermoBusca("");
                      setBuscaAtiva(false);
                    }}
                    className="absolute right-2.5 p-0.5 text-indigo-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="absolute right-2.5 text-[9px] font-mono text-indigo-400/50 bg-indigo-900/40 px-1 py-0.5 rounded border border-indigo-800/40">
                    ⌘K
                  </span>
                )}
              </div>

              {/* Dropdown de Resultados da Busca Rápida */}
              {buscaAtiva && resultadosBusca && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#0e122b] border border-indigo-900/80 rounded-xl shadow-2xl p-2 z-50 text-xs space-y-2 animate-in fade-in zoom-in-95 duration-100 max-h-80 overflow-y-auto">
                  {/* Equipamentos encontrados */}
                  {resultadosBusca.equipamentos.length > 0 && (
                    <div>
                      <p className="px-2 py-1 text-[10px] uppercase font-bold text-indigo-400/70 tracking-wider">
                        Equipamentos
                      </p>
                      <div className="space-y-0.5">
                        {resultadosBusca.equipamentos.map((eq) => (
                          <Link
                            key={eq.id}
                            href={`/equipamentos/${eq.id}`}
                            onClick={() => {
                              setBuscaAtiva(false);
                              setTermoBusca("");
                            }}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-indigo-950 text-slate-200 hover:text-white transition-colors group"
                          >
                            <div className="truncate">
                              <p className="font-semibold text-white truncate">
                                {eq.marca} {eq.modelo}
                              </p>
                              <p className="text-[10px] text-indigo-300/70 truncate">
                                S/N: {eq.numeroSerie || "N/A"}
                              </p>
                            </div>
                            <ExternalLink className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Colaboradores encontrados */}
                  {resultadosBusca.colaboradores.length > 0 && (
                    <div className="pt-1 border-t border-indigo-950">
                      <p className="px-2 py-1 text-[10px] uppercase font-bold text-indigo-400/70 tracking-wider">
                        Colaboradores
                      </p>
                      <div className="space-y-0.5">
                        {resultadosBusca.colaboradores.map((colab) => (
                          <Link
                            key={colab.id}
                            href="/responsaveis"
                            onClick={() => {
                              setBuscaAtiva(false);
                              setTermoBusca("");
                            }}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-indigo-950 text-slate-200 hover:text-white transition-colors group"
                          >
                            <div className="truncate">
                              <p className="font-semibold text-white truncate">
                                {colab.nome}
                              </p>
                              <p className="text-[10px] text-indigo-300/70 truncate">
                                {colab.cargo} • {colab.departamento}
                              </p>
                            </div>
                            <ExternalLink className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {resultadosBusca.equipamentos.length === 0 && resultadosBusca.colaboradores.length === 0 && (
                    <div className="p-3 text-center text-indigo-400/60 text-xs">
                      Nenhum resultado para &quot;{termoBusca}&quot;
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Links de Navegação */}
        <div className="p-3 space-y-5">
          {/* Seção 1: Geral */}
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-400/60">
                Painel Principal
              </p>
            )}

            {/* Dashboard */}
            <Link
              href="/"
              prefetch={true}
              className={cn(
                "flex items-center rounded-xl text-sm font-medium transition-all duration-150 group relative",
                isCollapsed
                  ? "justify-center p-2.5"
                  : "justify-between px-3.5 py-2",
                isLinkActive("/")
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                  : "text-indigo-200/80 hover:bg-indigo-950/60 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span>Dashboard</span>}
              </div>

              {/* Tooltip no modo colapsado */}
              {isCollapsed && (
                <div className="absolute left-[76px] px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
                  Dashboard
                </div>
              )}
            </Link>
          </div>

          {/* Seção 2: Inventário de Ativos (Gaveta Retrátil) */}
          <div className="space-y-1">
            {!isCollapsed ? (
              <button
                type="button"
                onClick={() => setAtivosAberto(!ativosAberto)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-indigo-200 hover:text-white bg-indigo-950/40 hover:bg-indigo-950/70 border border-indigo-900/40 rounded-xl transition-all cursor-pointer group shadow-2xs"
                title="Clique para expandir ou recolher as categorias"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded-lg bg-indigo-800/40 text-indigo-300 group-hover:text-white transition-colors">
                    <Box className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-xs text-indigo-100">Inventário de Ativos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-indigo-300 font-mono bg-indigo-950 px-1.5 py-0.5 rounded-md border border-indigo-800/40">
                    {totais.todos}
                  </span>
                  <div className="p-0.5 text-indigo-400 group-hover:text-white transition-colors">
                    {ativosAberto ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                  </div>
                </div>
              </button>
            ) : (
              <div className="h-px bg-indigo-900/30 my-2 mx-1" />
            )}

            {/* Categorias ordenadas */}
            {(ativosAberto || isCollapsed) && (
              <div className={cn("space-y-1 pt-1", !isCollapsed && "pl-1")}>
                {/* 1. Notebooks */}
                <Link
                  href="/equipamentos?tipo=notebook"
                  prefetch={true}
                  className={cn(
                    "flex items-center rounded-xl text-sm font-medium transition-all duration-150 group relative",
                    isCollapsed
                      ? "justify-center p-2.5"
                      : "justify-between px-3 py-1.5",
                    isLinkActive("/equipamentos", "notebook")
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                      : "text-indigo-200/80 hover:bg-indigo-950/60 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Laptop className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span>Notebooks</span>}
                  </div>
                  {!isCollapsed && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/40">
                      {totais.notebook}
                    </span>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-[76px] px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
                      Notebooks ({totais.notebook})
                    </div>
                  )}
                </Link>

                {/* 2. Monitores */}
                <Link
                  href="/equipamentos?tipo=monitor"
                  prefetch={true}
                  className={cn(
                    "flex items-center rounded-xl text-sm font-medium transition-all duration-150 group relative",
                    isCollapsed
                      ? "justify-center p-2.5"
                      : "justify-between px-3 py-1.5",
                    isLinkActive("/equipamentos", "monitor")
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                      : "text-indigo-200/80 hover:bg-indigo-950/60 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Monitor className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span>Monitores</span>}
                  </div>
                  {!isCollapsed && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/40">
                      {totais.monitor}
                    </span>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-[76px] px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
                      Monitores ({totais.monitor})
                    </div>
                  )}
                </Link>

                {/* 3. Celulares */}
                <Link
                  href="/equipamentos?tipo=smartphone"
                  prefetch={true}
                  className={cn(
                    "flex items-center rounded-xl text-sm font-medium transition-all duration-150 group relative",
                    isCollapsed
                      ? "justify-center p-2.5"
                      : "justify-between px-3 py-1.5",
                    isLinkActive("/equipamentos", "smartphone")
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                      : "text-indigo-200/80 hover:bg-indigo-950/60 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span>Celulares</span>}
                  </div>
                  {!isCollapsed && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/40">
                      {totais.smartphone}
                    </span>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-[76px] px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
                      Celulares ({totais.smartphone})
                    </div>
                  )}
                </Link>

                {/* 4. Periféricos */}
                <Link
                  href="/equipamentos?tipo=periferico"
                  prefetch={true}
                  className={cn(
                    "flex items-center rounded-xl text-sm font-medium transition-all duration-150 group relative",
                    isCollapsed
                      ? "justify-center p-2.5"
                      : "justify-between px-3 py-1.5",
                    isLinkActive("/equipamentos", "periferico")
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                      : "text-indigo-200/80 hover:bg-indigo-950/60 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Headphones className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span>Periféricos</span>}
                  </div>
                  {!isCollapsed && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/40">
                      {totais.periferico}
                    </span>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-[76px] px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
                      Periféricos ({totais.periferico})
                    </div>
                  )}
                </Link>

                {/* 5. Todos os Ativos (Último item) */}
                <Link
                  href="/equipamentos?tipo=todos"
                  prefetch={true}
                  className={cn(
                    "flex items-center rounded-xl text-sm font-medium transition-all duration-150 group relative mt-1 pt-1.5 border-t border-indigo-900/30",
                    isCollapsed
                      ? "justify-center p-2.5"
                      : "justify-between px-3 py-1.5",
                    isLinkActive("/equipamentos", "todos")
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                      : "text-indigo-300/60 hover:bg-indigo-950/60 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Boxes className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span className="text-xs">Todos os Ativos</span>}
                  </div>
                  {!isCollapsed && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/40">
                      {totais.todos}
                    </span>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-[76px] px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
                      Todos os Ativos ({totais.todos})
                    </div>
                  )}
                </Link>
              </div>
            )}
          </div>

          {/* Seção 3: Pessoas e Governança */}
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-400/60">
                Governança
              </p>
            )}

            {/* Colaboradores */}
            <Link
              href="/responsaveis"
              prefetch={true}
              className={cn(
                "flex items-center rounded-xl text-sm font-medium transition-all duration-150 group relative",
                isCollapsed
                  ? "justify-center p-2.5"
                  : "justify-between px-3.5 py-2",
                isLinkActive("/responsaveis")
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                  : "text-indigo-200/80 hover:bg-indigo-950/60 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span>Colaboradores</span>}
              </div>
              {!isCollapsed && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/40">
                  {totais.colaboradores}
                </span>
              )}
              {isCollapsed && (
                <div className="absolute left-[76px] px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
                  Colaboradores ({totais.colaboradores})
                </div>
              )}
            </Link>

            {/* Movimentações */}
            <Link
              href="/movimentacoes"
              prefetch={true}
              className={cn(
                "flex items-center rounded-xl text-sm font-medium transition-all duration-150 group relative",
                isCollapsed
                  ? "justify-center p-2.5"
                  : "justify-between px-3.5 py-2",
                isLinkActive("/movimentacoes")
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                  : "text-indigo-200/80 hover:bg-indigo-950/60 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <ArrowLeftRight className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span>Movimentações</span>}
              </div>
              {!isCollapsed && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/40">
                  {totais.movimentacoes}
                </span>
              )}
              {isCollapsed && (
                <div className="absolute left-[76px] px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
                  Movimentações ({totais.movimentacoes})
                </div>
              )}
            </Link>

            {/* Configurações */}
            <Link
              href="/configuracoes"
              prefetch={true}
              className={cn(
                "flex items-center rounded-xl text-sm font-medium transition-all duration-150 group relative",
                isCollapsed
                  ? "justify-center p-2.5"
                  : "justify-between px-3.5 py-2",
                isLinkActive("/configuracoes")
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                  : "text-indigo-200/80 hover:bg-indigo-950/60 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Settings className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span>Configurações</span>}
              </div>
              {isCollapsed && (
                <div className="absolute left-[76px] px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
                  Configurações
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Rodapé da Sidebar: Perfil do Administrador */}
      <div className={cn("border-t border-indigo-900/30 bg-[#0e122b]/50 transition-all", isCollapsed ? "p-2" : "p-3")}>
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-2.5 rounded-xl bg-indigo-950/60 p-2.5 border border-indigo-900/40">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
                GC
              </div>
              <div className="text-xs overflow-hidden">
                <p className="font-bold text-white truncate">Gabriela Chagas</p>
                <p className="text-[10px] text-indigo-300/70 truncate">Administradora TI</p>
              </div>
            </div>

            <div className="h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/20 flex-shrink-0" title="Sistema Online" />
          </div>
        ) : (
          <div className="flex justify-center group relative cursor-pointer" title="Gabriela Chagas (Administradora TI)">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
              GC
            </div>
            {/* Tooltip flutuante */}
            <div className="absolute left-[76px] bottom-0 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
              Gabriela Chagas (Admin)
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
