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
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { equipamentosService, EquipamentoComResponsavel } from "@/services/equipamentos.service";
import { Responsavel, TipoEquipamento } from "@/types";
import { getIconeEquipamento } from "@/components/common/icone-equipamento";

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
      } else if (window.innerWidth < 1024) {
        setIsCollapsed(true);
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
        "flex-shrink-0 bg-[#0b0e24] text-indigo-200 flex flex-col justify-between border-r border-indigo-950/80 min-h-screen transition-all duration-300 ease-in-out relative z-30 select-none shadow-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        isCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className={cn("overflow-y-auto flex-1 flex flex-col [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", isCollapsed ? "overflow-x-hidden" : "overflow-x-hidden")}>
        {/* Cabeçalho da Sidebar: Apenas o ícone da caixinha (sem título) + Botão de Toggle */}
        <div
          className={cn(
            "border-b border-indigo-900/30 bg-[#0e122b]/70 sticky top-0 z-10 transition-all duration-300 ease-in-out overflow-hidden flex",
            isCollapsed 
              ? "h-20 flex-col items-center justify-center gap-2 px-3 py-2" 
              : "h-16 flex-row items-center justify-between px-3"
          )}
        >
          {/* Logo da caixinha quadrada sem título conforme solicitado */}
          <Link
            href="/"
            prefetch={true}
            className="flex items-center justify-center group cursor-pointer flex-shrink-0"
            title="TI Inventory - Início"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600/30 to-purple-600/20 border border-indigo-500/40 p-1 flex-shrink-0 group-hover:scale-105 group-hover:border-indigo-400 transition-all duration-200 shadow-md shadow-indigo-950/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-icon.png"
                alt="TI Inventory Logo"
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
          </Link>

          {/* Botão de Minimizar / Expandir */}
          <button
            type="button"
            onClick={alternarColapso}
            className={cn(
              "rounded-xl text-indigo-300 hover:text-white transition-all cursor-pointer flex items-center justify-center flex-shrink-0",
              isCollapsed 
                ? "w-10 h-6 bg-indigo-950/80 hover:bg-indigo-900/80 border border-indigo-900/60" 
                : "p-2 hover:bg-indigo-900/60"
            )}
            title={isCollapsed ? "Expandir barra lateral (Ctrl+B)" : "Recolher barra lateral (Ctrl+B)"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-3.5 h-3.5" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Barra de Busca Integrada na Sidebar - Fluida e Rigorosamente Centralizada */}
        <div ref={buscaRef} className="px-3 pt-3 pb-1 relative transition-all duration-300 ease-in-out">
          <div
            onClick={() => {
              if (isCollapsed) {
                setIsCollapsed(false);
                setBuscaAtiva(true);
              }
            }}
            className={cn(
              "relative flex items-center rounded-xl bg-indigo-950/40 hover:bg-indigo-950/60 border border-indigo-900/50 transition-all duration-300 h-10 overflow-hidden group cursor-pointer",
              isCollapsed ? "w-12 mx-auto justify-center" : "w-full"
            )}
            title={isCollapsed ? "Pesquisar ativos ou pessoas" : undefined}
          >
            <div className="w-12 h-10 flex items-center justify-center flex-shrink-0">
              <Search className="w-4 h-4 text-indigo-400/80" />
            </div>

            <input
              type="text"
              value={termoBusca}
              onChange={(e) => {
                setTermoBusca(e.target.value);
                setBuscaAtiva(true);
              }}
              onFocus={() => {
                if (isCollapsed) setIsCollapsed(false);
                setBuscaAtiva(true);
              }}
              placeholder="Buscar ativo ou pessoa..."
              className={cn(
                "text-xs bg-transparent text-white placeholder:text-indigo-400/50 focus:outline-none transition-all duration-300 flex-1 pr-2",
                isCollapsed ? "opacity-0 w-0 pointer-events-none p-0" : "opacity-100 w-full"
              )}
            />

            {!isCollapsed && termoBusca && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTermoBusca("");
                  setBuscaAtiva(false);
                }}
                className="p-1 mr-1 text-indigo-400 hover:text-white flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tooltip flutuante quando colapsado */}
          {isCollapsed && (
            <div className="absolute left-[76px] top-3.5 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
              Buscar
            </div>
          )}

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
                            <div className="flex items-center gap-2 min-w-0 truncate">
                              <div className="p-1 rounded bg-indigo-900/60 text-indigo-300 flex-shrink-0">
                                {getIconeEquipamento(eq, "w-3 h-3")}
                              </div>
                              <div className="truncate">
                                <p className="font-semibold text-white truncate">
                                  {eq.marca} {eq.modelo}
                                </p>
                                <p className="text-[10px] text-indigo-300/70 font-mono truncate">
                                  S/N: {eq.numeroSerie} • {eq.subtipo || eq.tipo}
                                </p>
                              </div>
                            </div>
                            <ExternalLink className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Colaboradores encontrados */}
                  {resultadosBusca.colaboradores.length > 0 && (
                    <div>
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

        {/* Links de Navegação com Posicionamento Estável dos Ícones */}
        <div className="p-3 space-y-5">
          {/* Seção 1: Geral */}
          <div className="space-y-1">
            <div className={cn("overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out px-3", isCollapsed ? "max-w-0 opacity-0 h-0" : "max-w-xs opacity-100 pb-1")}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400/60">
                Painel Principal
              </p>
            </div>

            {/* Dashboard */}
            <Link
              href="/"
              prefetch={true}
              title={isCollapsed ? "Dashboard" : undefined}
              className={cn(
                "w-full h-10 flex items-center rounded-xl text-sm font-medium transition-all duration-300 ease-in-out group relative overflow-hidden",
                isLinkActive("/")
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                  : "text-indigo-200/80 hover:bg-indigo-950/60 hover:text-white"
              )}
            >
              <div className="w-12 h-10 flex items-center justify-center flex-shrink-0">
                <LayoutDashboard className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out text-xs font-semibold",
                  isCollapsed ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none" : "max-w-xs opacity-100 translate-x-0"
                )}
              >
                Dashboard
              </span>

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
            <button
              type="button"
              onClick={() => {
                if (isCollapsed) {
                  setIsCollapsed(false);
                  setAtivosAberto(true);
                } else {
                  setAtivosAberto(!ativosAberto);
                }
              }}
              className="w-full h-10 flex items-center text-xs font-semibold text-indigo-200 hover:text-white bg-indigo-950/40 hover:bg-indigo-950/70 border border-indigo-900/40 rounded-xl transition-all duration-300 ease-in-out cursor-pointer group shadow-2xs relative overflow-hidden"
              title={isCollapsed ? "Inventário de Ativos" : "Clique para expandir ou recolher as categorias"}
            >
              <div className="w-12 h-10 flex items-center justify-center flex-shrink-0">
                <Boxes className="w-4 h-4 text-indigo-300 group-hover:text-white transition-colors" />
              </div>

              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out font-bold text-xs text-indigo-100 flex-1 text-left",
                  isCollapsed ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none" : "max-w-xs opacity-100 translate-x-0"
                )}
              >
                Inventário de Ativos
              </span>

              <div
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out flex items-center gap-1.5 mr-2.5",
                  isCollapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-xs opacity-100"
                )}
              >
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

              {isCollapsed && (
                <div className="absolute left-[76px] px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
                  Inventário de Ativos ({totais.todos})
                </div>
              )}
            </button>

            {/* Categorias ordenadas */}
            {(ativosAberto || isCollapsed) && (
              <div className="space-y-1 pt-1">
                {/* 1. Notebooks */}
                <Link
                  href="/equipamentos?tipo=notebook"
                  prefetch={true}
                  title={isCollapsed ? `Notebooks (${totais.notebook})` : undefined}
                  className={cn(
                    "w-full h-10 flex items-center rounded-xl text-sm font-medium transition-all duration-300 ease-in-out group relative overflow-hidden",
                    isLinkActive("/equipamentos", "notebook")
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                      : "text-indigo-200/80 hover:bg-indigo-950/60 hover:text-white"
                  )}
                >
                  <div className="w-12 h-10 flex items-center justify-center flex-shrink-0">
                    <Laptop className="h-4 w-4" />
                  </div>
                  <span
                    className={cn(
                      "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out text-xs font-semibold",
                      isCollapsed ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none" : "max-w-xs opacity-100 translate-x-0"
                    )}
                  >
                    Notebooks
                  </span>
                  <span
                    className={cn(
                      "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ml-auto mr-2.5 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/40",
                      isCollapsed ? "max-w-0 opacity-0 pointer-events-none p-0 border-0" : "max-w-xs opacity-100"
                    )}
                  >
                    {totais.notebook}
                  </span>
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
                  title={isCollapsed ? `Monitores (${totais.monitor})` : undefined}
                  className={cn(
                    "w-full h-10 flex items-center rounded-xl text-sm font-medium transition-all duration-300 ease-in-out group relative overflow-hidden",
                    isLinkActive("/equipamentos", "monitor")
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                      : "text-indigo-200/80 hover:bg-indigo-950/60 hover:text-white"
                  )}
                >
                  <div className="w-12 h-10 flex items-center justify-center flex-shrink-0">
                    <Monitor className="h-4 w-4" />
                  </div>
                  <span
                    className={cn(
                      "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out text-xs font-semibold",
                      isCollapsed ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none" : "max-w-xs opacity-100 translate-x-0"
                    )}
                  >
                    Monitores
                  </span>
                  <span
                    className={cn(
                      "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ml-auto mr-2.5 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/40",
                      isCollapsed ? "max-w-0 opacity-0 pointer-events-none p-0 border-0" : "max-w-xs opacity-100"
                    )}
                  >
                    {totais.monitor}
                  </span>
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
                  title={isCollapsed ? `Celulares (${totais.smartphone})` : undefined}
                  className={cn(
                    "w-full h-10 flex items-center rounded-xl text-sm font-medium transition-all duration-300 ease-in-out group relative overflow-hidden",
                    isLinkActive("/equipamentos", "smartphone")
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                      : "text-indigo-200/80 hover:bg-indigo-950/60 hover:text-white"
                  )}
                >
                  <div className="w-12 h-10 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <span
                    className={cn(
                      "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out text-xs font-semibold",
                      isCollapsed ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none" : "max-w-xs opacity-100 translate-x-0"
                    )}
                  >
                    Celulares
                  </span>
                  <span
                    className={cn(
                      "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ml-auto mr-2.5 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/40",
                      isCollapsed ? "max-w-0 opacity-0 pointer-events-none p-0 border-0" : "max-w-xs opacity-100"
                    )}
                  >
                    {totais.smartphone}
                  </span>
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
                  title={isCollapsed ? `Periféricos (${totais.periferico})` : undefined}
                  className={cn(
                    "w-full h-10 flex items-center rounded-xl text-sm font-medium transition-all duration-300 ease-in-out group relative overflow-hidden",
                    isLinkActive("/equipamentos", "periferico")
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                      : "text-indigo-200/80 hover:bg-indigo-950/60 hover:text-white"
                  )}
                >
                  <div className="w-12 h-10 flex items-center justify-center flex-shrink-0">
                    <Headphones className="h-4 w-4" />
                  </div>
                  <span
                    className={cn(
                      "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out text-xs font-semibold",
                      isCollapsed ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none" : "max-w-xs opacity-100 translate-x-0"
                    )}
                  >
                    Periféricos
                  </span>
                  <span
                    className={cn(
                      "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ml-auto mr-2.5 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/40",
                      isCollapsed ? "max-w-0 opacity-0 pointer-events-none p-0 border-0" : "max-w-xs opacity-100"
                    )}
                  >
                    {totais.periferico}
                  </span>
                  {isCollapsed && (
                    <div className="absolute left-[76px] px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
                      Periféricos ({totais.periferico})
                    </div>
                  )}
                </Link>

                {/* 5. Todos os Ativos */}
                <Link
                  href="/equipamentos?tipo=todos"
                  prefetch={true}
                  title={isCollapsed ? `Todos os Ativos (${totais.todos})` : undefined}
                  className={cn(
                    "w-full h-10 flex items-center rounded-xl text-sm font-medium transition-all duration-300 ease-in-out group relative border-t border-indigo-950/40 pt-1 mt-1 overflow-hidden",
                    isLinkActive("/equipamentos", "todos")
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                      : "text-indigo-200/70 hover:bg-indigo-950/60 hover:text-white"
                  )}
                >
                  <div className="w-12 h-10 flex items-center justify-center flex-shrink-0">
                    <Boxes className="h-4 w-4" />
                  </div>
                  <span
                    className={cn(
                      "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out text-xs font-semibold",
                      isCollapsed ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none" : "max-w-xs opacity-100 translate-x-0"
                    )}
                  >
                    Todos os Ativos
                  </span>
                  <span
                    className={cn(
                      "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ml-auto mr-2.5 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/40",
                      isCollapsed ? "max-w-0 opacity-0 pointer-events-none p-0 border-0" : "max-w-xs opacity-100"
                    )}
                  >
                    {totais.todos}
                  </span>
                  {isCollapsed && (
                    <div className="absolute left-[76px] px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
                      Todos os Ativos ({totais.todos})
                    </div>
                  )}
                </Link>
              </div>
            )}
          </div>

          {/* Seção 3: Governança & Gestão */}
          <div className="space-y-1">
            <div className={cn("overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out px-3", isCollapsed ? "max-w-0 opacity-0 h-0" : "max-w-xs opacity-100 pb-1")}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400/60">
                Governança e Equipe
              </p>
            </div>

            {/* Colaboradores */}
            <Link
              href="/responsaveis"
              prefetch={true}
              title={isCollapsed ? `Colaboradores (${totais.colaboradores})` : undefined}
              className={cn(
                "w-full h-10 flex items-center rounded-xl text-sm font-medium transition-all duration-300 ease-in-out group relative overflow-hidden",
                isLinkActive("/responsaveis")
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                  : "text-indigo-200/80 hover:bg-indigo-950/60 hover:text-white"
              )}
            >
              <div className="w-12 h-10 flex items-center justify-center flex-shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out text-xs font-semibold",
                  isCollapsed ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none" : "max-w-xs opacity-100 translate-x-0"
                )}
              >
                Colaboradores
              </span>
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ml-auto mr-2.5 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/40",
                  isCollapsed ? "max-w-0 opacity-0 pointer-events-none p-0 border-0" : "max-w-xs opacity-100"
                )}
              >
                {totais.colaboradores}
              </span>
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
              title={isCollapsed ? `Movimentações (${totais.movimentacoes})` : undefined}
              className={cn(
                "w-full h-10 flex items-center rounded-xl text-sm font-medium transition-all duration-300 ease-in-out group relative overflow-hidden",
                isLinkActive("/movimentacoes")
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                  : "text-indigo-200/80 hover:bg-indigo-950/60 hover:text-white"
              )}
            >
              <div className="w-12 h-10 flex items-center justify-center flex-shrink-0">
                <ArrowLeftRight className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out text-xs font-semibold",
                  isCollapsed ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none" : "max-w-xs opacity-100 translate-x-0"
                )}
              >
                Movimentações
              </span>
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ml-auto mr-2.5 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/40",
                  isCollapsed ? "max-w-0 opacity-0 pointer-events-none p-0 border-0" : "max-w-xs opacity-100"
                )}
              >
                {totais.movimentacoes}
              </span>
              {isCollapsed && (
                <div className="absolute left-[76px] px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
                  Movimentações ({totais.movimentacoes})
                </div>
              )}
            </Link>

            {/* Usuários e Acesso Administrativo */}
            <Link
              href="/usuarios"
              prefetch={true}
              title={isCollapsed ? "Usuários e Acesso" : undefined}
              className={cn(
                "w-full h-10 flex items-center rounded-xl text-sm font-medium transition-all duration-300 ease-in-out group relative overflow-hidden",
                isLinkActive("/usuarios")
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                  : "text-indigo-200/80 hover:bg-indigo-950/60 hover:text-white"
              )}
            >
              <div className="w-12 h-10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out text-xs font-semibold",
                  isCollapsed ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none" : "max-w-xs opacity-100 translate-x-0"
                )}
              >
                Usuários e Acesso
              </span>
              {isCollapsed && (
                <div className="absolute left-[76px] px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
                  Usuários e Acesso
                </div>
              )}
            </Link>

            {/* Configurações */}
            <Link
              href="/configuracoes"
              prefetch={true}
              title={isCollapsed ? "Configurações" : undefined}
              className={cn(
                "w-full h-10 flex items-center rounded-xl text-sm font-medium transition-all duration-300 ease-in-out group relative overflow-hidden",
                isLinkActive("/configuracoes")
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                  : "text-indigo-200/80 hover:bg-indigo-950/60 hover:text-white"
              )}
            >
              <div className="w-12 h-10 flex items-center justify-center flex-shrink-0">
                <Settings className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out text-xs font-semibold",
                  isCollapsed ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none" : "max-w-xs opacity-100 translate-x-0"
                )}
              >
                Configurações
              </span>
              {isCollapsed && (
                <div className="absolute left-[76px] px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
                  Configurações
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Rodapé da Sidebar: Status do Sistema e Versão - Rigorosamente Centralizado */}
      <div className="border-t border-indigo-900/30 bg-[#0e122b]/50 transition-all duration-300 ease-in-out p-3">
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-2.5 rounded-xl bg-indigo-950/40 p-2.5 border border-indigo-900/40">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/20 flex-shrink-0 animate-pulse" />
              <span className="text-[11px] font-bold text-slate-300">
                TI Inventory
              </span>
            </div>
            <Link
              href="/usuarios"
              className="text-[10px] font-mono text-indigo-400 hover:text-indigo-200 bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-800/40 hover:border-indigo-700 transition-colors"
              title="Gerenciar usuários"
            >
              v1.2
            </Link>
          </div>
        ) : (
          <Link
            href="/usuarios"
            className="w-12 h-10 mx-auto flex items-center justify-center group relative cursor-pointer"
            title="TI Inventory v1.2 (Gerenciar Usuários)"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-950/60 flex items-center justify-center border border-indigo-900/40 text-emerald-400 group-hover:text-white transition-colors">
              <ShieldCheck className="w-4 h-4" />
            </div>
            {/* Tooltip flutuante */}
            <div className="absolute left-[76px] bottom-0 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
              TI Inventory (v1.2)
            </div>
          </Link>
        )}
      </div>
    </aside>
  );
}
