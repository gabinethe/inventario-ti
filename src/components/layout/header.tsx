"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Search, 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  Check, 
  X, 
  ShieldCheck, 
  Laptop, 
  Monitor, 
  Smartphone, 
  Headphones, 
  Users, 
  Wrench, 
  LayoutDashboard, 
  ArrowRight,
  Boxes,
  ArrowLeftRight,
  Settings
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/context/theme-context";
import { EquipamentoComResponsavel, equipamentosService } from "@/services/equipamentos.service";
import { Responsavel } from "@/types";
import { getIconeEquipamento as getIconeUniversal } from "@/components/common/icone-equipamento";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // Estados do Perfil
  const [modalAberto, setModalAberto] = useState(false);
  const [nome, setNome] = useState("Gabriela Chagas");
  const [cargo, setCargo] = useState("Administradora de TI");
  const [email, setEmail] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Estados da Barra de Pesquisa Global
  const [termoBusca, setTermoBusca] = useState("");
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [equipamentos, setEquipamentos] = useState<EquipamentoComResponsavel[]>([]);
  const [colaboradores, setColaboradores] = useState<Responsavel[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Carrega os dados reais do usuário logado no Supabase
  useEffect(() => {
    async function carregarPerfil() {
      try {
        const salvoNome = localStorage.getItem("user_perfil_nome");
        const salvoCargo = localStorage.getItem("user_perfil_cargo");
        if (salvoNome) setNome(salvoNome);
        if (salvoCargo) setCargo(salvoCargo);

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setEmail(user.email || "");
          const metadataNome = user.user_metadata?.nome || user.user_metadata?.full_name;
          const metadataCargo = user.user_metadata?.cargo;

          if (metadataNome && !salvoNome) {
            setNome(metadataNome);
            localStorage.setItem("user_perfil_nome", metadataNome);
          } else if (!metadataNome && !salvoNome && user.email) {
            const prefixo = user.email.split("@")[0].replace(".", " ");
            const capitalizado = prefixo
              .split(" ")
              .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
              .join(" ");
            setNome(capitalizado);
          }

          if (metadataCargo && !salvoCargo) {
            setCargo(metadataCargo);
            localStorage.setItem("user_perfil_cargo", metadataCargo);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados do usuário:", err);
      }
    }

    carregarPerfil();
  }, []);

  // Carrega equipamentos e colaboradores para pesquisa global rápida
  useEffect(() => {
    const carregarDadosBusca = async () => {
      try {
        const [eq, resp] = await Promise.all([
          equipamentosService.listar(),
          equipamentosService.listarResponsaveis(),
        ]);
        setEquipamentos(eq);
        setColaboradores(resp);
      } catch (err) {
        console.warn("Aviso ao carregar dados de pesquisa:", err);
      }
    };

    carregarDadosBusca();
    const handleAtualizacao = () => carregarDadosBusca();
    window.addEventListener("inventario_alterado", handleAtualizacao);
    return () => window.removeEventListener("inventario_alterado", handleAtualizacao);
  }, []);

  // Atalho global Ctrl+K para focar a barra de pesquisa
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setBuscaAberta(true);
      }
      if (e.key === "Escape") {
        setBuscaAberta(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fecha busca ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setBuscaAberta(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtra resultados da pesquisa global
  const resultados = React.useMemo(() => {
    if (!termoBusca.trim()) return null;
    const t = termoBusca.toLowerCase().trim();

    const eqEncontrados = equipamentos
      .filter((eq) => {
        return (
          eq.marca.toLowerCase().includes(t) ||
          eq.modelo.toLowerCase().includes(t) ||
          (eq.numeroSerie && eq.numeroSerie.toLowerCase().includes(t)) ||
          (eq.patrimonio && eq.patrimonio.toLowerCase().includes(t)) ||
          (eq.subtipo && eq.subtipo.toLowerCase().includes(t)) ||
          (eq.responsavel?.nome.toLowerCase().includes(t) ?? false)
        );
      })
      .slice(0, 5);

    const colabEncontrados = colaboradores
      .filter((colab) => {
        return (
          colab.nome.toLowerCase().includes(t) ||
          colab.email.toLowerCase().includes(t) ||
          colab.cargo.toLowerCase().includes(t) ||
          colab.departamento.toLowerCase().includes(t)
        );
      })
      .slice(0, 4);

    return {
      equipamentos: eqEncontrados,
      colaboradores: colabEncontrados,
    };
  }, [termoBusca, equipamentos, colaboradores]);

  // Iniciais do nome para o avatar
  const iniciais = nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("") || "AD";

  const handleSalvarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setSucesso(false);

    try {
      localStorage.setItem("user_perfil_nome", nome);
      localStorage.setItem("user_perfil_cargo", cargo);

      const supabase = createClient();
      await supabase.auth.updateUser({
        data: {
          nome: nome,
          cargo: cargo,
        },
      });

      setSucesso(true);
      setTimeout(() => {
        setSalvando(false);
        setSucesso(false);
        setModalAberto(false);
      }, 700);
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      setSalvando(false);
    }
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Erro ao deslogar:", err);
      router.push("/login");
    }
  };

  const getIconeEquipamento = (tipo: string) => {
    switch (tipo) {
      case "monitor":
        return <Monitor className="w-3.5 h-3.5 text-indigo-500" />;
      case "smartphone":
        return <Smartphone className="w-3.5 h-3.5 text-emerald-500" />;
      case "periferico":
        return <Headphones className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Laptop className="w-3.5 h-3.5 text-indigo-600" />;
    }
  };

  return (
    <>
      <header className="h-16 border-b border-slate-200/80 dark:border-indigo-950/80 bg-white/95 dark:bg-[#0c1022]/95 backdrop-blur-md sticky top-0 z-20 shadow-xs transition-colors duration-200">
        <div className="w-full max-w-[1600px] 2xl:max-w-[1760px] mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Título e Subtítulo da Página Atual com Identidade TI Inventory */}
          <div className="min-w-0 flex items-center gap-3 flex-shrink-0">
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate flex items-center gap-2">
                <span>{title}</span>
              </h2>
              {subtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate hidden md:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Barra de Pesquisa Global Inteligente */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-md mx-2 sm:mx-4">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={termoBusca}
                onChange={(e) => {
                  setTermoBusca(e.target.value);
                  setBuscaAberta(true);
                }}
                onFocus={() => setBuscaAberta(true)}
                placeholder="Pesquisar ativos, seriais, pessoas..."
                className="w-full pl-9 pr-9 py-1.5 text-xs bg-slate-100/80 dark:bg-[#131938] hover:bg-slate-100 dark:hover:bg-[#182046] border border-slate-200/90 dark:border-indigo-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:bg-white dark:focus:bg-[#131938] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-2xs"
              />
              {termoBusca && (
                <button
                  type="button"
                  onClick={() => {
                    setTermoBusca("");
                    setBuscaAberta(false);
                  }}
                  className="absolute right-2.5 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown de Resultados da Pesquisa Global */}
            {buscaAberta && termoBusca.trim() && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#0e132c] border border-slate-200 dark:border-indigo-900/60 rounded-2xl shadow-2xl p-2 z-50 max-h-[460px] overflow-y-auto space-y-3 animate-in fade-in zoom-in-95 duration-100">
                {/* Seção 1: Equipamentos */}
                <div>
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
                    <span>Equipamentos e Ativos</span>
                    <span>{resultados?.equipamentos.length || 0} resultado(s)</span>
                  </div>

                  {resultados?.equipamentos && resultados.equipamentos.length > 0 ? (
                    <div className="space-y-1 mt-1">
                      {resultados.equipamentos.map((eq) => (
                        <Link
                          key={eq.id}
                          href={`/equipamentos/${eq.id}`}
                          onClick={() => setBuscaAberta(false)}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-indigo-950 border border-slate-200/80 dark:border-indigo-900/50 flex-shrink-0 text-indigo-600 dark:text-indigo-400">
                              {getIconeUniversal(eq, "w-3.5 h-3.5")}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                {eq.marca} {eq.modelo}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                                S/N: {eq.numeroSerie || "N/A"}
                                {eq.responsavel ? ` • ${eq.responsavel.nome}` : " • Estoque livre"}
                              </p>
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                            eq.status === "manutencao"
                              ? "bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700/80"
                              : eq.status === "em_uso"
                              ? "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-950 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700/80"
                              : "bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/80"
                          }`}>
                            {eq.status === "manutencao" ? "Manutenção" : eq.status === "em_uso" ? "Em Uso" : "Disponível"}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500 px-3 py-1">
                      Nenhum equipamento correspondente.
                    </p>
                  )}
                </div>

                {/* Seção 2: Colaboradores */}
                <div className="pt-2 border-t border-slate-100 dark:border-indigo-950/60">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
                    <span>Colaboradores e Pessoas</span>
                    <span>{resultados?.colaboradores.length || 0}</span>
                  </div>

                  {resultados?.colaboradores && resultados.colaboradores.length > 0 ? (
                    <div className="space-y-1 mt-1">
                      {resultados.colaboradores.map((colab) => (
                        <Link
                          key={colab.id}
                          href="/responsaveis"
                          onClick={() => setBuscaAberta(false)}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0 shadow-2xs">
                              {colab.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                {colab.nome}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {colab.cargo} • {colab.departamento}
                              </p>
                            </div>
                          </div>
                          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                            →
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500 px-3 py-1">
                      Nenhum colaborador correspondente.
                    </p>
                  )}
                </div>

                {/* Rodapé da busca com atalhos */}
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#131938] border border-slate-100 dark:border-indigo-950/60 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                  <span>Pressione <kbd className="font-mono bg-white dark:bg-[#0b0e24] px-1 rounded border">Esc</kbd> para fechar</span>
                  <Link 
                    href={`/equipamentos?busca=${encodeURIComponent(termoBusca)}`}
                    onClick={() => setBuscaAberta(false)}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Ver todos no inventário →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Controles da Direita: Modo Claro/Escuro & Perfil */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
            {/* Botão de Alternância: Modo Claro / Modo Escuro */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-indigo-950/60 border border-slate-200/80 dark:border-indigo-900/40 transition-colors cursor-pointer"
              title={theme === "dark" ? "Alternar para Modo Claro" : "Alternar para Modo Escuro"}
              aria-label="Alternar tema claro/escuro"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-600 transition-transform hover:-rotate-12" />
              )}
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-indigo-950" />

            {/* Perfil do Usuário Interativo */}
            <button
              type="button"
              onClick={() => setModalAberto(true)}
              className="flex items-center gap-2.5 sm:gap-3 p-1 rounded-xl hover:bg-slate-100/80 dark:hover:bg-indigo-950/50 transition-colors text-left cursor-pointer group"
              title="Clique para editar seu perfil"
            >
              <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform flex-shrink-0">
                {iniciais}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate max-w-[140px]">
                  {nome}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[140px]">
                  {cargo}
                </p>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Modal de Edição de Perfil */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0f142b] border border-slate-200 dark:border-indigo-950 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-600/30">
                  {iniciais}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Perfil do Administrador
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {email || "Conta ativa no Supabase"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {sucesso && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>Perfil e sessão corporativa atualizados com sucesso!</span>
              </div>
            )}

            <form onSubmit={handleSalvarPerfil} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nome Completo
                </label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome corporativo"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Cargo / Função
                </label>
                <Input
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  placeholder="Ex: Administradora de TI"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  E-mail do Administrador (Supabase)
                </label>
                <Input
                  value={email}
                  disabled
                  className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  Identificador autêntico vinculado ao Supabase Auth.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-indigo-950/60">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sair do Sistema
                </button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setModalAberto(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" disabled={salvando}>
                    {salvando ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
