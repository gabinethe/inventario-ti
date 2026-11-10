"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Laptop, 
  Search, 
  CheckCircle2, 
  UserCheck, 
  Wrench, 
  Eye
} from "lucide-react";
import { EquipamentoComResponsavel } from "@/services/equipamentos.service";
import { StatusEquipamento } from "@/types";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TabelaEquipamentosProps {
  equipamentosIniciais: EquipamentoComResponsavel[];
}

export function TabelaEquipamentos({ equipamentosIniciais }: TabelaEquipamentosProps) {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusEquipamento | "todos">("todos");

  // Contadores para os botões de filtro
  const contadores = useMemo(() => {
    return {
      todos: equipamentosIniciais.length,
      disponivel: equipamentosIniciais.filter((e) => e.status === "disponivel").length,
      em_uso: equipamentosIniciais.filter((e) => e.status === "em_uso").length,
      manutencao: equipamentosIniciais.filter((e) => e.status === "manutencao").length,
    };
  }, [equipamentosIniciais]);

  // Filtragem dinâmica e instantânea
  const equipamentosFiltrados = useMemo(() => {
    return equipamentosIniciais.filter((eq) => {
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
  }, [equipamentosIniciais, busca, filtroStatus]);

  return (
    <div className="space-y-4">
      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Campo de Busca */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar por patrimônio, modelo, serial ou responsável..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 shadow-2xs text-slate-900 placeholder:text-slate-400 transition-all"
          />
        </div>

        {/* Botões de Filtro por Status */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFiltroStatus("todos")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
              filtroStatus === "todos"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Todos ({contadores.todos})
          </button>

          <button
            onClick={() => setFiltroStatus("disponivel")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
              filtroStatus === "disponivel"
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Disponíveis ({contadores.disponivel})
          </button>

          <button
            onClick={() => setFiltroStatus("em_uso")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
              filtroStatus === "em_uso"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-500" />
            Em Uso ({contadores.em_uso})
          </button>

          <button
            onClick={() => setFiltroStatus("manutencao")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
              filtroStatus === "manutencao"
                ? "bg-amber-600 text-white border-amber-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-amber-500" />
            Manutenção ({contadores.manutencao})
          </button>
        </div>
      </div>

      {/* Tabela de Resultados */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
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
                      Tente alterar os termos da busca ou limpar os filtros selecionados.
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
                        <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
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
                      <div className="font-semibold text-slate-800">{notebook.processador}</div>
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
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                          No estoque de TI
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
