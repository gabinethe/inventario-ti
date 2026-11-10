"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Laptop, 
  UserCheck, 
  CheckCircle2, 
  Wrench, 
  Plus, 
  Search, 
  ArrowRight, 
  DollarSign,
  Filter,
  Eye,
  Monitor,
  Smartphone,
  Headphones
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EquipamentoComResponsavel, equipamentosService } from "@/services/equipamentos.service";
import { StatusEquipamento } from "@/types";

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
  const [notebooks, setNotebooks] = useState<EquipamentoComResponsavel[]>(notebooksIniciais);
  const [metricas, setMetricas] = useState(metricasIniciais);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusEquipamento | "todos">("todos");

  React.useEffect(() => {
    async function sincronizar() {
      const [lista, met] = await Promise.all([
        equipamentosService.listar(),
        equipamentosService.obterMetricas(),
      ]);
      setNotebooks(lista);
      setMetricas(met);
    }
    sincronizar();

    const handleAtualizacao = () => sincronizar();
    window.addEventListener("inventario_alterado", handleAtualizacao);
    return () => window.removeEventListener("inventario_alterado", handleAtualizacao);
  }, []);

  // Filtragem na tabela do dashboard
  const equipamentosFiltrados = useMemo(() => {
    return notebooks.filter((eq) => {
      const termo = busca.toLowerCase();
      const matchBusca =
        !busca ||
        (eq.patrimonio && eq.patrimonio.toLowerCase().includes(termo)) ||
        eq.modelo.toLowerCase().includes(termo) ||
        eq.marca.toLowerCase().includes(termo) ||
        eq.numeroSerie.toLowerCase().includes(termo) ||
        (eq.subtipo && eq.subtipo.toLowerCase().includes(termo)) ||
        (eq.responsavel?.nome.toLowerCase().includes(termo) ?? false);

      const matchStatus = filtroStatus === "todos" || eq.status === filtroStatus;

      return matchBusca && matchStatus;
    });
  }, [notebooks, busca, filtroStatus]);

  return (
    <div className="space-y-8">
      {/* Barra Superior de Boas-vindas e Ação Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Painel Geral de Ativos
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Acompanhe em tempo real a alocação, disponibilidade e saúde do parque de TI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/equipamentos/novo">
            <Button size="md">
              <Plus className="w-4 h-4" />
              Cadastrar Equipamento
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid de Cards de Indicadores (KPIs) */}
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
          subtitle="Atribuídos a colaboradores"
          icon={UserCheck}
          color="indigo"
        />
        <StatCard
          title="Disponíveis no Estoque"
          value={metricas.disponiveis}
          subtitle="Prontos para atribuição"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Em Manutenção"
          value={metricas.emManutencao}
          subtitle="Aguardando assistência"
          icon={Wrench}
          color="amber"
        />
      </div>

      {/* Atalhos de Categorias de Equipamentos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/equipamentos?tipo=notebook"
          prefetch={true}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Notebooks</p>
              <p className="text-[11px] text-slate-400">Ver inventário</p>
            </div>
          </div>
          <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
            {metricas.porTipo?.notebook || 0}
          </span>
        </Link>

        <Link
          href="/equipamentos?tipo=monitor"
          prefetch={true}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Monitores</p>
              <p className="text-[11px] text-slate-400">Ver inventário</p>
            </div>
          </div>
          <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
            {metricas.porTipo?.monitor || 0}
          </span>
        </Link>

        <Link
          href="/equipamentos?tipo=smartphone"
          prefetch={true}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Celulares</p>
              <p className="text-[11px] text-slate-400">Ver inventário</p>
            </div>
          </div>
          <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
            {metricas.porTipo?.smartphone || 0}
          </span>
        </Link>

        <Link
          href="/equipamentos?tipo=periferico"
          prefetch={true}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Periféricos</p>
              <p className="text-[11px] text-slate-400">Ver inventário</p>
            </div>
          </div>
          <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
            {metricas.porTipo?.periferico || 0}
          </span>
        </Link>
      </div>

      {/* Seção da Tabela com Barra de Pesquisa e Filtros */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        {/* Topo da Tabela com Filtros Integrados */}
        <div className="p-5 border-b border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Equipamentos Recentes
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Consulte, filtre e gerencie os notebooks do inventário
              </p>
            </div>

            <Link
              href="/equipamentos"
              prefetch={true}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
            >
              Ver todos os equipamentos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Barra de Pesquisa e Botões de Status */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between pt-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar por patrimônio, modelo, serial ou responsável..."
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
                Todos
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
                Disponíveis
              </button>
              <button
                onClick={() => setFiltroStatus("em_uso")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                  filtroStatus === "em_uso"
                    ? "bg-indigo-700 text-white border-indigo-700 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-indigo-50 hover:text-indigo-900"
                }`}
              >
                <UserCheck className="w-3 h-3 text-indigo-400" />
                Em Uso
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
                Manutenção
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Dados */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Equipamento / Modelo</th>
                <th className="px-6 py-3.5">Configuração</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Responsável Atual</th>
                <th className="px-6 py-3.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {equipamentosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <Laptop className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="font-semibold text-slate-600 text-sm">
                      Nenhum equipamento encontrado
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Tente alterar os termos da busca ou clique em &quot;Todos&quot;.
                    </p>
                  </td>
                </tr>
              ) : (
                equipamentosFiltrados.map((notebook) => (
                  <tr
                    key={notebook.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                          <Laptop className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {notebook.marca} {notebook.modelo}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {notebook.tipo === "periferico" && notebook.quantidadeDisponivel !== undefined ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Estoque: {notebook.quantidadeDisponivel} unid. disponíveis
                              </span>
                            ) : (
                              <span className="font-mono text-slate-400 text-[11px]">S/N: {notebook.numeroSerie}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <div className="font-semibold text-slate-800 uppercase text-[11px] tracking-wider text-indigo-600">
                        {notebook.tipo} {notebook.subtipo ? `• ${notebook.subtipo}` : ""}
                      </div>
                      <div className="text-slate-500 line-clamp-1">
                        {notebook.processador
                          ? `${notebook.processador} • ${notebook.memoriaRam || ""}`
                          : notebook.especificacoes || "Configuração corporativa"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={notebook.status} />
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {notebook.responsavel ? (
                        <div>
                          <p className="font-bold text-slate-800">
                            {notebook.responsavel.nome}
                          </p>
                          <p className="text-slate-400">
                            {notebook.responsavel.departamento}
                          </p>
                        </div>
                      ) : (
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          Estoque de TI
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/equipamentos/${notebook.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-3.5 h-3.5" />
                          Detalhes
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
