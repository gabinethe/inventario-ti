"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  Laptop, 
  UserCheck, 
  CheckCircle2, 
  Wrench, 
  Search, 
  ArrowRight, 
  Eye, 
  Monitor, 
  Smartphone, 
  Headphones, 
  Boxes, 
  Sparkles,
  Layers,
  Activity,
  AlertTriangle,
  ArrowUpRight
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EquipamentoComResponsavel, equipamentosService } from "@/services/equipamentos.service";
import { StatusEquipamento, TipoEquipamento } from "@/types";

interface DashboardViewProps {
  notebooksIniciais: EquipamentoComResponsavel[];
  metricas: {
    total: number;
    emUso: number;
    disponiveis: number;
    emManutencao: number;
    valorTotalParque: number;
    porTipo?: {
      notebook: number;
      monitor: number;
      smartphone: number;
      periferico: number;
    };
  };
}

export function DashboardView({ notebooksIniciais, metricas: metricasIniciais }: DashboardViewProps) {
  const [equipamentos, setEquipamentos] = useState<EquipamentoComResponsavel[]>(notebooksIniciais);
  const [metricas, setMetricas] = useState(metricasIniciais);
  const [busca, setBusca] = useState("");
  
  // Categorias e status da visualização simplificada do inventário
  const [filtroTipo, setFiltroTipo] = useState<TipoEquipamento | "todos">("notebook");
  const [filtroStatus, setFiltroStatus] = useState<StatusEquipamento | "todos">("todos");

  // Sincronização em tempo real
  const sincronizar = async () => {
    try {
      const [lista, met] = await Promise.all([
        equipamentosService.listar(),
        equipamentosService.obterMetricas(),
      ]);
      setEquipamentos(lista);
      setMetricas(met);
    } catch (err) {
      console.error("Erro ao sincronizar dashboard:", err);
    }
  };

  useEffect(() => {
    sincronizar();
    const handleAtualizacao = () => sincronizar();
    window.addEventListener("inventario_alterado", handleAtualizacao);
    return () => window.removeEventListener("inventario_alterado", handleAtualizacao);
  }, []);

  // Análise detalhada de métricas por categoria
  const categoriasAnalise = useMemo(() => {
    const tipos = [
      { id: "notebook" as const, nome: "Notebooks", icone: Laptop },
      { id: "monitor" as const, nome: "Monitores", icone: Monitor },
      { id: "smartphone" as const, nome: "Celulares Corporativos", icone: Smartphone },
      { id: "periferico" as const, nome: "Periféricos", icone: Headphones },
    ];

    return tipos.map((cat) => {
      const itens = equipamentos.filter((e) => e.tipo === cat.id);
      const total = itens.length;
      const emUso = itens.filter((e) => e.status === "em_uso").length;
      const disponivel = itens.filter((e) => e.status === "disponivel").length;
      const manutencao = itens.filter((e) => e.status === "manutencao").length;

      // Soma de quantidades físicas em estoque para periféricos em lote
      const qtdFisicaEstoque = cat.id === "periferico"
        ? itens.reduce((soma, item) => soma + (item.quantidadeDisponivel ?? (item.status === "disponivel" ? 1 : 0)), 0)
        : disponivel;

      const taxaUso = total > 0 ? Math.round((emUso / total) * 100) : 0;
      const taxaDisponivel = total > 0 ? Math.round((disponivel / total) * 100) : 0;

      // Classificação de saúde de reserva
      let saude = {
        label: "Reserva Saudável",
        cor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      };
      if (disponivel === 0 && qtdFisicaEstoque === 0) {
        saude = {
          label: "Sem Reserva Livre",
          cor: "text-rose-700 bg-rose-50 border-rose-200",
        };
      } else if (disponivel <= 1 && qtdFisicaEstoque <= 2) {
        saude = {
          label: "Estoque em Alerta",
          cor: "text-amber-700 bg-amber-50 border-amber-200",
        };
      }

      return {
        ...cat,
        total,
        emUso,
        disponivel,
        qtdFisicaEstoque,
        manutencao,
        taxaUso,
        taxaDisponivel,
        saude,
      };
    });
  }, [equipamentos]);

  // Cálculo da prontidão de Onboarding (Kits completos de novos funcionários: Notebook + Periférico + Monitor)
  const prontidaoOnboarding = useMemo(() => {
    const notebooksLivres = categoriasAnalise.find((c) => c.id === "notebook")?.disponivel || 0;
    const monitoresLivres = categoriasAnalise.find((c) => c.id === "monitor")?.disponivel || 0;
    const perifericosLivres = categoriasAnalise.find((c) => c.id === "periferico")?.qtdFisicaEstoque || 0;

    const kitsCompletos = Math.min(notebooksLivres, perifericosLivres);

    return {
      notebooksLivres,
      monitoresLivres,
      perifericosLivres,
      kitsCompletos,
    };
  }, [categoriasAnalise]);

  // Contadores para as abas do inventário simplificado
  const contadoresAbasTipo = useMemo(() => {
    return {
      notebook: equipamentos.filter((e) => e.tipo === "notebook").length,
      monitor: equipamentos.filter((e) => e.tipo === "monitor").length,
      smartphone: equipamentos.filter((e) => e.tipo === "smartphone").length,
      periferico: equipamentos.filter((e) => e.tipo === "periferico").length,
      todos: equipamentos.length,
    };
  }, [equipamentos]);

  const contadoresStatus = useMemo(() => {
    const base = filtroTipo === "todos" ? equipamentos : equipamentos.filter((e) => e.tipo === filtroTipo);
    return {
      todos: base.length,
      disponivel: base.filter((e) => e.status === "disponivel").length,
      em_uso: base.filter((e) => e.status === "em_uso").length,
      manutencao: base.filter((e) => e.status === "manutencao").length,
    };
  }, [equipamentos, filtroTipo]);

  // Filtragem da tabela simplificada
  const equipamentosFiltrados = useMemo(() => {
    return equipamentos.filter((eq) => {
      const matchTipo = filtroTipo === "todos" || eq.tipo === filtroTipo;
      const matchStatus = filtroStatus === "todos" || eq.status === filtroStatus;

      const termo = busca.toLowerCase();
      const matchBusca =
        !busca ||
        (eq.patrimonio && eq.patrimonio.toLowerCase().includes(termo)) ||
        eq.modelo.toLowerCase().includes(termo) ||
        eq.marca.toLowerCase().includes(termo) ||
        eq.numeroSerie.toLowerCase().includes(termo) ||
        (eq.subtipo && eq.subtipo.toLowerCase().includes(termo)) ||
        (eq.responsavel?.nome.toLowerCase().includes(termo) ?? false) ||
        (eq.responsavel?.departamento.toLowerCase().includes(termo) ?? false);

      return matchTipo && matchStatus && matchBusca;
    });
  }, [equipamentos, busca, filtroTipo, filtroStatus]);

  const getIconeTipo = (tipo: TipoEquipamento) => {
    switch (tipo) {
      case "monitor":
        return <Monitor className="w-4 h-4" />;
      case "smartphone":
        return <Smartphone className="w-4 h-4" />;
      case "periferico":
        return <Headphones className="w-4 h-4" />;
      case "notebook":
      default:
        return <Laptop className="w-4 h-4" />;
    }
  };

  const taxaAlocacaoGeral = metricas.total > 0 ? Math.round((metricas.emUso / metricas.total) * 100) : 0;
  const taxaDisponibilidadeGeral = metricas.total > 0 ? Math.round((metricas.disponiveis / metricas.total) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* 1. Cabeçalho Executivo do Painel com Logo TI Inventory */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-indigo-950/80">
        <div className="flex items-center gap-4">
          <div className="relative w-36 sm:w-44 h-16 sm:h-20 flex items-center justify-center p-1.5 rounded-2xl bg-white/60 dark:bg-indigo-950/30 border border-slate-200/70 dark:border-indigo-900/40 shadow-xs flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="TI Inventory"
              className="w-full h-full object-contain filter drop-shadow-xs"
            />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Painel Executivo e Métricas do Parque
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Indicadores analíticos consolidados em tempo real, taxas de disponibilidade e saúde do inventário corporativo.
            </p>
          </div>
        </div>

        {/* Botão de Ação Executiva: Acesso ao Inventário Completo */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <Link href="/equipamentos" prefetch={true}>
            <Button size="md" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
              <Boxes className="w-4 h-4" />
              Acessar Inventário Completo
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. KPIs Globais de Alto Nível */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Equipamentos"
          value={metricas.total}
          subtitle="Ativos cadastrados no parque"
          icon={Laptop}
          color="indigo"
        />

        <StatCard
          title="Equipamentos em Uso"
          value={metricas.emUso}
          subtitle={`${taxaAlocacaoGeral}% da frota alocada a pessoas`}
          icon={UserCheck}
          color="indigo"
        />

        <StatCard
          title="Reserva no Estoque"
          value={metricas.disponiveis}
          subtitle={`${taxaDisponibilidadeGeral}% prontos para entrega`}
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="Em Assistência Técnica"
          value={metricas.emManutencao}
          subtitle="Aguardando reparo ou garantia"
          icon={Wrench}
          color="amber"
        />
      </div>

      {/* 3. Métricas de Disponibilidade e Saúde por Categoria */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Métricas de Disponibilidade e Alocação por Categoria
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Acompanhamento analítico da proporção de hardware alocado versus estoque de reserva.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoriasAnalise.map((cat) => {
            const Icone = cat.icone;

            return (
              <div
                key={cat.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#0f142b] border border-slate-200/90 dark:border-indigo-950/70 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all space-y-4"
              >
                {/* Cabeçalho do Card */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 shadow-2xs">
                      <Icone className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {cat.nome}
                      </h3>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                        Total: <span className="font-bold text-slate-700 dark:text-slate-300">{cat.total} unidades</span>
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cat.saude.cor}`}>
                    {cat.saude.label}
                  </span>
                </div>

                {/* Grid de Métricas Numéricas */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0a0e20] border border-slate-100 dark:border-indigo-950/50">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3" />
                      Disponível
                    </div>
                    <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      {cat.id === "periferico" ? cat.qtdFisicaEstoque : cat.disponivel}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      {cat.id === "periferico" ? "unid. livres" : "livres no estoque"}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0a0e20] border border-slate-100 dark:border-indigo-950/50">
                    <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                      <UserCheck className="w-3 h-3" />
                      Em Uso
                    </div>
                    <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{cat.emUso}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">com colaboradores</p>
                  </div>
                </div>

                {/* Barra de Proporção Visual */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 dark:text-slate-500 font-medium">Taxa de Ocupação</span>
                    <span className="font-bold text-indigo-900 dark:text-indigo-300">{cat.taxaUso}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-[#0a0e20] rounded-full overflow-hidden flex">
                    <div 
                      className="bg-indigo-600 h-full transition-all duration-300"
                      style={{ width: `${cat.taxaUso}%` }}
                      title={`${cat.emUso} em uso`}
                    />
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${cat.taxaDisponivel}%` }}
                      title={`${cat.disponivel} disponíveis`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>{cat.taxaUso}% alocado</span>
                    <span>{cat.taxaDisponivel}% livre</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Card Estratégico: Prontidão de Onboarding e Kits de TI */}
      <div className="rounded-2xl border border-indigo-100 dark:border-indigo-950/70 bg-gradient-to-r from-indigo-50/70 via-white to-indigo-50/40 dark:from-[#0f142b] dark:via-[#131938] dark:to-[#0f142b] p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-2xs">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Prontidão de Onboarding de Novos Colaboradores
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl font-medium">
              Com base nos notebooks e periféricos livres no almoxarifado, seu parque de TI tem capacidade para admissão imediata de:
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white dark:bg-[#0c1022] px-5 py-3 rounded-2xl border border-indigo-100/80 dark:border-indigo-950/70 shadow-2xs">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Kits de Entrada Prontos
              </p>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 leading-tight">
                {prontidaoOnboarding.kitsCompletos}{" "}
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">
                  {prontidaoOnboarding.kitsCompletos === 1 ? "novo contratado" : "novos contratados"}
                </span>
              </p>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-indigo-950" />
            <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
              <p>💻 {prontidaoOnboarding.notebooksLivres} notebooks livres</p>
              <p>🎧 {prontidaoOnboarding.perifericosLivres} periféricos no estoque</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Visualização Simplificada do Inventário */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-indigo-950/70 bg-white dark:bg-[#0f142b] shadow-xs overflow-hidden">
        {/* Topo: Abas de Categoria e Busca */}
        <div className="p-5 border-b border-slate-200/80 dark:border-indigo-950/70 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Visualização Simplificada do Inventário
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Consulte de forma rápida os equipamentos mais recentes com status e custódia nominal
              </p>
            </div>

            <Link
              href="/equipamentos"
              prefetch={true}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 transition-colors"
            >
              Ver tabela completa detalhada <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Abas de Categorias: Notebooks, Monitores, Celulares, Periféricos, e Todos no final */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-100 dark:border-indigo-950/70">
            <button
              onClick={() => setFiltroTipo("notebook")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                filtroTipo === "notebook"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-indigo-950/70 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Laptop className="w-4 h-4" />
              Notebooks ({contadoresAbasTipo.notebook})
            </button>

            <button
              onClick={() => setFiltroTipo("monitor")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                filtroTipo === "monitor"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-indigo-950/70 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Monitor className="w-4 h-4" />
              Monitores ({contadoresAbasTipo.monitor})
            </button>

            <button
              onClick={() => setFiltroTipo("smartphone")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                filtroTipo === "smartphone"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-indigo-950/70 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Celulares ({contadoresAbasTipo.smartphone})
            </button>

            <button
              onClick={() => setFiltroTipo("periferico")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                filtroTipo === "periferico"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-indigo-950/70 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Headphones className="w-4 h-4" />
              Periféricos ({contadoresAbasTipo.periferico})
            </button>

            <button
              onClick={() => setFiltroTipo("todos")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ml-auto ${
                filtroTipo === "todos"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-indigo-950/70 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Boxes className="w-4 h-4" />
              Todos ({contadoresAbasTipo.todos})
            </button>
          </div>

          {/* Barra de Pesquisa e Filtros de Estado */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between pt-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar por modelo, serial ou responsável..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-[#0a0e20] border border-slate-200 dark:border-indigo-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 focus:bg-white dark:focus:bg-[#0a0e20] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setFiltroStatus("todos")}
                className={`px-3 py-1 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  filtroStatus === "todos"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-white dark:bg-[#0e132c] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-indigo-950/70 hover:bg-slate-50 dark:hover:bg-indigo-950/50"
                }`}
              >
                Todos ({contadoresStatus.todos})
              </button>
              <button
                onClick={() => setFiltroStatus("disponivel")}
                className={`px-3 py-1 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                  filtroStatus === "disponivel"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                No Estoque ({contadoresStatus.disponivel})
              </button>
              <button
                onClick={() => setFiltroStatus("em_uso")}
                className={`px-3 py-1 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                  filtroStatus === "em_uso"
                    ? "bg-indigo-700 text-white border-indigo-700 shadow-xs"
                    : "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200 border-indigo-200 dark:border-indigo-900/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/60"
                }`}
              >
                <UserCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                Em Uso ({contadoresStatus.em_uso})
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Dados Simplificada */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-[#0a0e20] text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-indigo-950/70">
              <tr>
                <th className="px-6 py-3.5">Ativo / Identificação</th>
                <th className="px-6 py-3.5">Categoria e Detalhes</th>
                <th className="px-6 py-3.5">Situação</th>
                <th className="px-6 py-3.5">Custódia / Responsável</th>
                <th className="px-6 py-3.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {equipamentosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <Laptop className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="font-semibold text-slate-600 text-sm">
                      Nenhum equipamento encontrado com estes critérios
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Tente alterar a categoria ou limpar a busca.
                    </p>
                  </td>
                </tr>
              ) : (
                equipamentosFiltrados.map((item) => {
                  const estaEmUso = item.status === "em_uso" && item.responsavel;

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        estaEmUso 
                          ? "bg-indigo-50/20 dark:bg-indigo-950/20 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/40" 
                          : "hover:bg-slate-50/80 dark:hover:bg-indigo-950/20"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl border transition-colors ${
                            estaEmUso
                              ? "bg-indigo-600 text-white border-indigo-700 shadow-2xs"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                          }`}>
                            {getIconeTipo(item.tipo)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {item.marca} {item.modelo}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {item.tipo === "periferico" && item.quantidadeDisponivel !== undefined ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/80">
                                  Estoque: {item.quantidadeDisponivel} unid. disponíveis
                                </span>
                              ) : (
                                <span className="font-mono text-slate-400 dark:text-slate-500 text-[11px]">
                                  S/N: {item.numeroSerie}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">
                        <div className="font-bold uppercase text-[11px] tracking-wider text-indigo-600 dark:text-indigo-400">
                          {item.tipo} {item.subtipo ? `• ${item.subtipo}` : ""}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {item.processador
                            ? `${item.processador} • ${item.memoriaRam || ""}`
                            : item.especificacoes || "Configuração corporativa"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={item.status} />
                      </td>

                      <td className="px-6 py-3.5 text-xs">
                        {estaEmUso ? (
                          <div className="flex items-center gap-2.5 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-2 max-w-[260px] shadow-2xs">
                            <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0 shadow-2xs">
                              {item.responsavel!.nome
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
                                {item.responsavel!.nome}
                              </p>
                              <p className="text-[11px] text-indigo-700 dark:text-indigo-400 truncate font-semibold">
                                {item.responsavel!.departamento}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-emerald-900 dark:text-emerald-300 font-bold bg-emerald-100/90 dark:bg-emerald-950/80 px-2.5 py-1 rounded-xl border border-emerald-300 dark:border-emerald-700/80 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            Estoque de TI
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link href={`/equipamentos/${item.id}`} prefetch={true}>
                          <Button variant="outline" size="sm" className="text-xs">
                            <Eye className="w-3.5 h-3.5" />
                            Detalhes
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
