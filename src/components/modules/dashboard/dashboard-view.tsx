"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  Laptop, 
  UserCheck, 
  CheckCircle2, 
  Wrench, 
  Plus, 
  Search, 
  ArrowRight, 
  Eye,
  Monitor,
  Smartphone,
  Headphones,
  Boxes,
  ArrowRightLeft,
  Undo2,
  Filter,
  Check,
  Building2,
  Sparkles
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModalAtribuicao } from "@/components/ui/modal-atribuicao";
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
  
  // Categorias: Notebooks como padrão inicial, Todos os Ativos como última opção
  const [filtroTipo, setFiltroTipo] = useState<TipoEquipamento | "todos">("notebook");
  const [filtroStatus, setFiltroStatus] = useState<StatusEquipamento | "todos">("todos");

  // Modal de Atribuição / Devolução rápida no Dashboard
  const [modalAtribuicaoAberto, setModalAtribuicaoAberto] = useState(false);
  const [equipamentoEmOperacao, setEquipamentoEmOperacao] = useState<EquipamentoComResponsavel | null>(null);
  const [modoOperacao, setModoOperacao] = useState<"atribuir" | "devolver">("atribuir");

  // Sincronização em tempo real com o banco de dados e eventos locais
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

  // Balanço detalhado de Estoque vs Em Uso por Categoria (reativo e dinâmico)
  const categoriasBalanco = useMemo(() => {
    const tipos = [
      { id: "notebook" as const, nome: "Notebooks", icone: Laptop, cor: "indigo" },
      { id: "monitor" as const, nome: "Monitores", icone: Monitor, cor: "indigo" },
      { id: "smartphone" as const, nome: "Celulares Corporativos", icone: Smartphone, cor: "indigo" },
      { id: "periferico" as const, nome: "Periféricos", icone: Headphones, cor: "indigo" },
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

      return {
        ...cat,
        total,
        emUso,
        disponivel,
        qtdFisicaEstoque,
        manutencao,
        taxaUso,
      };
    });
  }, [equipamentos]);

  // Contadores para as abas da tabela do Dashboard
  const contadoresAbasTipo = useMemo(() => {
    return {
      notebook: equipamentos.filter((e) => e.tipo === "notebook").length,
      monitor: equipamentos.filter((e) => e.tipo === "monitor").length,
      smartphone: equipamentos.filter((e) => e.tipo === "smartphone").length,
      periferico: equipamentos.filter((e) => e.tipo === "periferico").length,
      todos: equipamentos.length,
    };
  }, [equipamentos]);

  // Contadores de status conforme o tipo atualmente filtrado
  const contadoresStatus = useMemo(() => {
    const base = filtroTipo === "todos" ? equipamentos : equipamentos.filter((e) => e.tipo === filtroTipo);
    return {
      todos: base.length,
      disponivel: base.filter((e) => e.status === "disponivel").length,
      em_uso: base.filter((e) => e.status === "em_uso").length,
      manutencao: base.filter((e) => e.status === "manutencao").length,
    };
  }, [equipamentos, filtroTipo]);

  // Filtragem na tabela de equipamentos
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

  // Disparar ações rápidas de atribuição / devolução
  const abrirAtribuicao = (item: EquipamentoComResponsavel) => {
    setEquipamentoEmOperacao(item);
    setModoOperacao("atribuir");
    setModalAtribuicaoAberto(true);
  };

  const abrirDevolucao = (item: EquipamentoComResponsavel) => {
    setEquipamentoEmOperacao(item);
    setModoOperacao("devolver");
    setModalAtribuicaoAberto(true);
  };

  const aplicarFiltroRapido = (tipo: TipoEquipamento, status: StatusEquipamento | "todos") => {
    setFiltroTipo(tipo);
    setFiltroStatus(status);
  };

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

  return (
    <div className="space-y-8">
      {/* Barra Superior de Boas-vindas e Ação Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Painel Geral de Ativos
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Visão consolidada em tempo real da alocação de equipamentos e disponibilidade no estoque de TI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/equipamentos/novo" prefetch={true}>
            <Button size="md">
              <Plus className="w-4 h-4" />
              Cadastrar Equipamento
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid de Cards de Indicadores Globais (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => { setFiltroTipo("todos"); setFiltroStatus("todos"); }}
          className="cursor-pointer transition-transform hover:-translate-y-0.5"
          title="Clique para ver todos os ativos no inventário"
        >
          <StatCard
            title="Total de Equipamentos"
            value={metricas.total}
            subtitle="Ativos cadastrados no parque"
            icon={Laptop}
            color="indigo"
          />
        </div>

        <div 
          onClick={() => { setFiltroStatus("em_uso"); }}
          className="cursor-pointer transition-transform hover:-translate-y-0.5"
          title="Clique para filtrar ativos em posse de colaboradores"
        >
          <StatCard
            title="Equipamentos em Uso"
            value={metricas.emUso}
            subtitle="Atribuídos a colaboradores"
            icon={UserCheck}
            color="indigo"
          />
        </div>

        <div 
          onClick={() => { setFiltroStatus("disponivel"); }}
          className="cursor-pointer transition-transform hover:-translate-y-0.5"
          title="Clique para filtrar itens disponíveis no estoque"
        >
          <StatCard
            title="Disponíveis no Estoque"
            value={metricas.disponiveis}
            subtitle="Prontos para atribuição imediata"
            icon={CheckCircle2}
            color="emerald"
          />
        </div>

        <div 
          onClick={() => { setFiltroStatus("manutencao"); }}
          className="cursor-pointer transition-transform hover:-translate-y-0.5"
          title="Clique para filtrar ativos em assistência técnica"
        >
          <StatCard
            title="Em Manutenção"
            value={metricas.emManutencao}
            subtitle="Aguardando assistência de TI"
            icon={Wrench}
            color="amber"
          />
        </div>
      </div>

      {/* SEÇÃO PRINCIPAL: Balanço por Categoria (Estoque vs Em Uso) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-indigo-600" />
              Divisão por Categoria: Estoque vs Em Uso
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Acesse e diferencie instantaneamente o que está livre no estoque e o que está alocado com colaboradores.
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 hidden sm:inline-block">
            Clique nas opções para filtrar a tabela abaixo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoriasBalanco.map((cat) => {
            const Icone = cat.icone;
            const selecionada = filtroTipo === cat.id;

            return (
              <div
                key={cat.id}
                className={`p-4 rounded-2xl bg-white border transition-all duration-200 flex flex-col justify-between ${
                  selecionada
                    ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm"
                    : "border-slate-200 hover:border-indigo-300 hover:shadow-xs"
                }`}
              >
                {/* Topo do Card de Categoria */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        setFiltroTipo(cat.id);
                        setFiltroStatus("todos");
                      }}
                      className="flex items-center gap-2.5 text-left group cursor-pointer"
                      title={`Ver todos os ${cat.nome}`}
                    >
                      <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Icone className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {cat.nome}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Total: <span className="font-semibold text-slate-700">{cat.total} cadastrados</span>
                        </p>
                      </div>
                    </button>

                    <Link
                      href={`/equipamentos?tipo=${cat.id}`}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-colors"
                      title="Abrir módulo completo"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Botões Rápidos de Estoque vs Em Uso */}
                  <div className="grid grid-cols-2 gap-2 my-2">
                    {/* Botão No Estoque */}
                    <button
                      type="button"
                      onClick={() => aplicarFiltroRapido(cat.id, "disponivel")}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        filtroTipo === cat.id && filtroStatus === "disponivel"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                          : "bg-emerald-50/70 border-emerald-200/80 hover:bg-emerald-100/70 text-emerald-950"
                      }`}
                      title={`Filtrar ${cat.nome} disponíveis no estoque`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${
                          filtroTipo === cat.id && filtroStatus === "disponivel" ? "text-emerald-100" : "text-emerald-700"
                        }`}>
                          No Estoque
                        </span>
                        <CheckCircle2 className={`w-3 h-3 ${
                          filtroTipo === cat.id && filtroStatus === "disponivel" ? "text-white" : "text-emerald-600"
                        }`} />
                      </div>
                      <p className="text-lg font-black mt-0.5">
                        {cat.id === "periferico" ? cat.qtdFisicaEstoque : cat.disponivel}
                      </p>
                      <p className={`text-[10px] ${
                        filtroTipo === cat.id && filtroStatus === "disponivel" ? "text-emerald-100" : "text-emerald-600/90"
                      }`}>
                        {cat.id === "periferico" ? "unid. livres" : "livres para entrega"}
                      </p>
                    </button>

                    {/* Botão Em Uso */}
                    <button
                      type="button"
                      onClick={() => aplicarFiltroRapido(cat.id, "em_uso")}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        filtroTipo === cat.id && filtroStatus === "em_uso"
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                          : "bg-indigo-50/70 border-indigo-200/80 hover:bg-indigo-100/70 text-indigo-950"
                      }`}
                      title={`Filtrar ${cat.nome} em uso com colaboradores`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${
                          filtroTipo === cat.id && filtroStatus === "em_uso" ? "text-indigo-100" : "text-indigo-700"
                        }`}>
                          Em Uso
                        </span>
                        <UserCheck className={`w-3 h-3 ${
                          filtroTipo === cat.id && filtroStatus === "em_uso" ? "text-white" : "text-indigo-600"
                        }`} />
                      </div>
                      <p className="text-lg font-black mt-0.5">{cat.emUso}</p>
                      <p className={`text-[10px] ${
                        filtroTipo === cat.id && filtroStatus === "em_uso" ? "text-indigo-100" : "text-indigo-600/90"
                      }`}>
                        com colaboradores
                      </p>
                    </button>
                  </div>
                </div>

                {/* Barra de Proporção Visual de Ocupação */}
                <div className="pt-2 border-t border-slate-100 mt-2">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400 font-medium">Taxa de Ocupação</span>
                    <span className="font-bold text-slate-700">{cat.taxaUso}% em uso</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-indigo-600 h-full transition-all duration-300"
                      style={{ width: `${cat.taxaUso}%` }}
                      title={`${cat.emUso} em uso`}
                    />
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${100 - cat.taxaUso}%` }}
                      title={`${cat.disponivel} disponíveis`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SEÇÃO DA TABELA DO DASHBOARD */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        {/* Topo da Tabela: Abas de Categoria com "Todos os Ativos" no final */}
        <div className="p-5 border-b border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Inventário Operacional
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {filtroTipo === "todos" ? (
                  "Exibindo visão geral de todos os ativos do parque"
                ) : (
                  <>
                    Exibindo <span className="font-semibold text-slate-800 capitalize">{filtroTipo}s</span>
                    {filtroStatus === "disponivel" && " disponíveis no estoque"}
                    {filtroStatus === "em_uso" && " em posse de colaboradores"}
                    {filtroStatus === "manutencao" && " em assistência técnica"}
                    {filtroStatus === "todos" && " (todos os estados)"}
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(filtroTipo !== "notebook" || filtroStatus !== "todos" || busca) && (
                <button
                  type="button"
                  onClick={() => {
                    setFiltroTipo("notebook");
                    setFiltroStatus("todos");
                    setBusca("");
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Restaurar padrão
                </button>
              )}

              <Link
                href="/equipamentos"
                prefetch={true}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
              >
                Gerenciar módulo completo <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Abas de Categorias: Notebooks, Monitores, Celulares, Periféricos, e Todos os Ativos no final */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-100">
            <button
              onClick={() => setFiltroTipo("notebook")}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                filtroTipo === "notebook"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Laptop className="w-4 h-4" />
              Notebooks ({contadoresAbasTipo.notebook})
            </button>

            <button
              onClick={() => setFiltroTipo("monitor")}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                filtroTipo === "monitor"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Monitor className="w-4 h-4" />
              Monitores ({contadoresAbasTipo.monitor})
            </button>

            <button
              onClick={() => setFiltroTipo("smartphone")}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                filtroTipo === "smartphone"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Celulares ({contadoresAbasTipo.smartphone})
            </button>

            <button
              onClick={() => setFiltroTipo("periferico")}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                filtroTipo === "periferico"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Headphones className="w-4 h-4" />
              Periféricos ({contadoresAbasTipo.periferico})
            </button>

            <button
              onClick={() => setFiltroTipo("todos")}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ml-auto ${
                filtroTipo === "todos"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
              title="Exibir todos os ativos consolidadores"
            >
              <Boxes className="w-4 h-4" />
              Todos os Ativos ({contadoresAbasTipo.todos})
            </button>
          </div>

          {/* Barra de Pesquisa e Filtros de Estado Operacional */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between pt-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar por modelo, serial, marca ou colaborador..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 focus:bg-white transition-all placeholder:text-slate-400 text-slate-800"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setFiltroStatus("todos")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  filtroStatus === "todos"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-indigo-50 hover:text-indigo-900"
                }`}
              >
                Todos ({contadoresStatus.todos})
              </button>
              <button
                onClick={() => setFiltroStatus("disponivel")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                  filtroStatus === "disponivel"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-900"
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                No Estoque ({contadoresStatus.disponivel})
              </button>
              <button
                onClick={() => setFiltroStatus("em_uso")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                  filtroStatus === "em_uso"
                    ? "bg-indigo-700 text-white border-indigo-700 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-indigo-50 hover:text-indigo-900"
                }`}
              >
                <UserCheck className="w-3 h-3 text-indigo-300" />
                Em Uso ({contadoresStatus.em_uso})
              </button>
              <button
                onClick={() => setFiltroStatus("manutencao")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                  filtroStatus === "manutencao"
                    ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-amber-50 hover:text-amber-900"
                }`}
              >
                <Wrench className="w-3 h-3 text-amber-500" />
                Manutenção ({contadoresStatus.manutencao})
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Dados com Destaque Visual para Ativos em Uso */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Ativo / Identificação</th>
                <th className="px-6 py-3.5">Categoria & Especificação</th>
                <th className="px-6 py-3.5">Situação</th>
                <th className="px-6 py-3.5">Custódia / Responsável</th>
                <th className="px-6 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {equipamentosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <Laptop className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="font-semibold text-slate-600 text-sm">
                      Nenhum equipamento encontrado com estes filtros
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Tente alterar a categoria ou clique em &quot;Restaurar padrão&quot;.
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
                          ? "bg-indigo-50/20 hover:bg-indigo-50/40" 
                          : "hover:bg-slate-50/80"
                      }`}
                    >
                      {/* Ativo e Serial */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl border transition-colors ${
                            estaEmUso
                              ? "bg-indigo-600 text-white border-indigo-700 shadow-2xs"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}>
                            {getIconeTipo(item.tipo)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              <span>{item.marca} {item.modelo}</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {item.tipo === "periferico" && item.quantidadeDisponivel !== undefined ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Estoque: {item.quantidadeDisponivel} unid. disponíveis
                                </span>
                              ) : (
                                <span className="font-mono text-slate-400 text-[11px]">
                                  S/N: {item.numeroSerie}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Categoria & Specs */}
                      <td className="px-6 py-4 text-xs text-slate-600">
                        <div className="font-semibold text-slate-800 uppercase text-[11px] tracking-wider text-indigo-600">
                          {item.tipo} {item.subtipo ? `• ${item.subtipo}` : ""}
                        </div>
                        <div className="text-slate-500 line-clamp-1">
                          {item.processador
                            ? `${item.processador} • ${item.memoriaRam || ""}`
                            : item.especificacoes || "Configuração corporativa"}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusBadge status={item.status} />
                      </td>

                      {/* Responsável / Custódia com Destaque Visual Forte */}
                      <td className="px-6 py-3.5 text-xs">
                        {estaEmUso ? (
                          <div className="flex items-center gap-2.5 bg-indigo-50/80 border border-indigo-100 rounded-xl p-2 max-w-[260px] shadow-2xs">
                            <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0 shadow-2xs">
                              {item.responsavel!.nome
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 text-xs truncate">
                                {item.responsavel!.nome}
                              </p>
                              <p className="text-[11px] text-indigo-700 truncate font-medium">
                                {item.responsavel!.departamento}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/80 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Estoque de TI
                          </span>
                        )}
                      </td>

                      {/* Ações: Atribuir, Devolver ou Detalhes */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status === "disponivel" ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => abrirAtribuicao(item)}
                              className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs"
                              title="Atribuir a um colaborador"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                              Atribuir
                            </Button>
                          ) : item.status === "em_uso" ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => abrirDevolucao(item)}
                              className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 text-xs"
                              title="Devolver ao estoque de TI"
                            >
                              <Undo2 className="w-3.5 h-3.5" />
                              Devolver
                            </Button>
                          ) : null}

                          <Link href={`/equipamentos/${item.id}`} prefetch={true}>
                            <Button variant="outline" size="sm" className="text-xs">
                              <Eye className="w-3.5 h-3.5" />
                              Detalhes
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Atribuição / Devolução Integrado */}
      <ModalAtribuicao
        aberto={modalAtribuicaoAberto}
        equipamento={equipamentoEmOperacao}
        modo={modoOperacao}
        onFechar={() => {
          setModalAtribuicaoAberto(false);
          setEquipamentoEmOperacao(null);
        }}
        onSucesso={() => {
          setModalAtribuicaoAberto(false);
          setEquipamentoEmOperacao(null);
          sincronizar();
        }}
      />
    </div>
  );
}
