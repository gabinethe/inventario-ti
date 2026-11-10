"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  ArrowLeftRight, 
  Laptop, 
  Search, 
  Boxes, 
  UserCheck, 
  Undo2, 
  PackagePlus, 
  UserPlus, 
  Trash2,
  Clock
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { equipamentosService } from "@/services/equipamentos.service";
import { Movimentacao, TipoMovimentacao } from "@/types";

export default function MovimentacoesPage() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");

  const carregarDados = async () => {
    try {
      const lista = await equipamentosService.listarMovimentacoes();
      setMovimentacoes(lista);
    } catch (err) {
      console.error("Erro ao carregar movimentações:", err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();

    const handleAtualizacao = () => carregarDados();
    window.addEventListener("inventario_alterado", handleAtualizacao);
    return () => window.removeEventListener("inventario_alterado", handleAtualizacao);
  }, []);

  // Filtragem dinâmica
  const movimentacoesFiltradas = useMemo(() => {
    return movimentacoes.filter((mov) => {
      let matchTipo = true;
      if (filtroTipo === "atribuicao_devolucao") {
        matchTipo = mov.tipo === "atribuicao" || mov.tipo === "devolucao";
      } else if (filtroTipo === "entrada") {
        matchTipo = mov.tipo === "entrada";
      } else if (filtroTipo === "colaborador") {
        matchTipo = mov.tipo === "colaborador";
      } else if (filtroTipo === "exclusao") {
        matchTipo = mov.tipo === "exclusao";
      }

      const termo = busca.toLowerCase();
      const matchBusca =
        !busca ||
        mov.motivo.toLowerCase().includes(termo) ||
        (mov.equipamentoNome && mov.equipamentoNome.toLowerCase().includes(termo)) ||
        (mov.responsavelNome && mov.responsavelNome.toLowerCase().includes(termo)) ||
        mov.registradoPor.toLowerCase().includes(termo);

      return matchTipo && matchBusca;
    });
  }, [movimentacoes, busca, filtroTipo]);

  const getBadgeTipo = (tipo: TipoMovimentacao) => {
    switch (tipo) {
      case "atribuicao":
        return {
          label: "Atribuição",
          classes: "bg-indigo-50 text-indigo-700 border-indigo-200",
          icone: <UserCheck className="w-3.5 h-3.5" />,
        };
      case "devolucao":
        return {
          label: "Devolução",
          classes: "bg-amber-50 text-amber-700 border-amber-200",
          icone: <Undo2 className="w-3.5 h-3.5" />,
        };
      case "entrada":
        return {
          label: "Entrada Estoque",
          classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icone: <PackagePlus className="w-3.5 h-3.5" />,
        };
      case "colaborador":
        return {
          label: "Novo Colaborador",
          classes: "bg-sky-50 text-sky-700 border-sky-200",
          icone: <UserPlus className="w-3.5 h-3.5" />,
        };
      case "exclusao":
        return {
          label: "Baixa / Exclusão",
          classes: "bg-rose-50 text-rose-700 border-rose-200",
          icone: <Trash2 className="w-3.5 h-3.5" />,
        };
      default:
        return {
          label: tipo,
          classes: "bg-slate-100 text-slate-700 border-slate-200",
          icone: <Clock className="w-3.5 h-3.5" />,
        };
    }
  };

  return (
    <>
      <Header
        title="Histórico de Auditoria & Movimentações"
        subtitle="Registro em tempo real de atribuições, entradas no estoque, devoluções e colaboradores"
      />

      <main className="flex-1 p-8 space-y-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <ArrowLeftRight className="h-6 w-6 text-indigo-600" />
              Linha do Tempo de Movimentações
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Trilha de auditoria cronológica gerada automaticamente a cada ação no inventário corporativo.
            </p>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar em motivos, ativos ou colaboradores..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 shadow-2xs text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFiltroTipo("todos")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                filtroTipo === "todos"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Todas ({movimentacoes.length})
            </button>

            <button
              onClick={() => setFiltroTipo("atribuicao_devolucao")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                filtroTipo === "atribuicao_devolucao"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Custódia & Devoluções
            </button>

            <button
              onClick={() => setFiltroTipo("entrada")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                filtroTipo === "entrada"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Entradas no Estoque
            </button>

            <button
              onClick={() => setFiltroTipo("colaborador")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                filtroTipo === "colaborador"
                  ? "bg-sky-600 text-white border-sky-600 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Colaboradores
            </button>

            <button
              onClick={() => setFiltroTipo("exclusao")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                filtroTipo === "exclusao"
                  ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Baixas / Exclusões
            </button>
          </div>
        </div>

        {/* Linha do Tempo Dinâmica */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          {carregando ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Carregando histórico de auditoria...
            </div>
          ) : movimentacoesFiltradas.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Boxes className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="font-semibold text-slate-600 text-sm">Nenhuma movimentação encontrada</p>
              <p className="text-xs text-slate-400 mt-1">
                Todas as ações (adicionar equipamentos, vincular pessoas ou devolver ao estoque) aparecerão registradas aqui.
              </p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {movimentacoesFiltradas.map((mov) => {
                const badge = getBadgeTipo(mov.tipo);

                return (
                  <div key={mov.id} className="relative animate-in fade-in duration-150">
                    <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-indigo-600 ring-2 ring-indigo-100 shadow-xs" />
                    
                    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-3 hover:border-indigo-200/80 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${badge.classes}`}>
                            {badge.icone}
                            {badge.label}
                          </span>

                          {mov.equipamentoNome && (
                            <span className="text-xs font-bold text-slate-800">
                              {mov.equipamentoNome}
                            </span>
                          )}
                        </div>

                        <span className="text-xs text-slate-400 font-medium">
                          {new Date(mov.data).toLocaleDateString("pt-BR")} às{" "}
                          {new Date(mov.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      <p className="text-sm text-slate-700 font-medium">
                        {mov.motivo}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-xs text-slate-500">
                        <div>
                          {mov.responsavelNome && (
                            <span>
                              Colaborador: <strong className="text-slate-800 font-semibold">{mov.responsavelNome}</strong>
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Registrado por: <strong>{mov.registradoPor}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
