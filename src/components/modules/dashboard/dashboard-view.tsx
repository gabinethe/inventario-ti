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
  Eye
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EquipamentoComResponsavel } from "@/services/equipamentos.service";
import { StatusEquipamento } from "@/types";

interface DashboardViewProps {
  notebooksIniciais: EquipamentoComResponsavel[];
  metricas: {
    total: number;
    emUso: number;
    disponiveis: number;
    emManutencao: number;
    valorTotalParque: number;
  };
}

export function DashboardView({ notebooksIniciais, metricas }: DashboardViewProps) {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusEquipamento | "todos">("todos");

  // Formatação de moeda BRL
  const valorFormatado = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(metricas.valorTotalParque);

  // Filtragem na tabela do dashboard
  const equipamentosFiltrados = useMemo(() => {
    return notebooksIniciais.filter((eq) => {
      const termo = busca.toLowerCase();
      const matchBusca =
        !busca ||
        eq.patrimonio.toLowerCase().includes(termo) ||
        eq.modelo.toLowerCase().includes(termo) ||
        eq.marca.toLowerCase().includes(termo) ||
        eq.numeroSerie.toLowerCase().includes(termo) ||
        (eq.responsavel?.nome.toLowerCase().includes(termo) ?? false);

      const matchStatus = filtroStatus === "todos" || eq.status === filtroStatus;

      return matchBusca && matchStatus;
    });
  }, [notebooksIniciais, busca, filtroStatus]);

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
          color="blue"
        />
        <StatCard
          title="Equipamentos em Uso"
          value={metricas.emUso}
          subtitle="Atribuídos a colaboradores"
          icon={UserCheck}
          color="emerald"
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

      {/* Banner Financeiro Corporativo */}
      <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Valor Total do Patrimônio Ativo
            </p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">
              {valorFormatado}
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-500 max-w-sm sm:text-right font-medium">
          Valor de aquisição acumulado de todos os equipamentos ativos no inventário corporativo.
        </p>
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
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              Ver todos os equipamentos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Barra de Pesquisa e Botões de Status */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between pt-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar por patrimônio, modelo, serial ou responsável..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 focus:bg-white transition-all placeholder:text-slate-400 text-slate-800"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setFiltroStatus("todos")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  filtroStatus === "todos"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFiltroStatus("disponivel")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filtroStatus === "disponivel"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Disponíveis
              </button>
              <button
                onClick={() => setFiltroStatus("em_uso")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filtroStatus === "em_uso"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <UserCheck className="w-3 h-3 text-blue-500" />
                Em Uso
              </button>
              <button
                onClick={() => setFiltroStatus("manutencao")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filtroStatus === "manutencao"
                    ? "bg-amber-600 text-white border-amber-600"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
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
                <th className="px-6 py-3.5">Patrimônio / Equipamento</th>
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
                          <div className="text-xs text-slate-500 font-mono">
                            {notebook.patrimonio} • S/N: {notebook.numeroSerie}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <div className="font-medium text-slate-800">{notebook.processador}</div>
                      <div className="text-slate-400">
                        {notebook.memoriaRam} • {notebook.armazenamento}
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
