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
import { ModalConfirmacao } from "@/components/ui/modal-confirmacao";
import { equipamentosService } from "@/services/equipamentos.service";
import { Movimentacao, TipoMovimentacao } from "@/types";

export default function MovimentacoesPage() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [modalLimparAberto, setModalLimparAberto] = useState(false);

  const carregarDados = async () => {
    try {
      const lista = await equipamentosService.listarMovimentacoes();
      const sanitizadas = lista.map((m) => {
        let motivoLimpo = m.motivo
          .replace(/\s*\(\s*\)/g, "")
          .replace(/\s*\(undefined\)/gi, "")
          .replace(/\s*\(null\)/gi, "")
          .replace(/\([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\)/gi, "")
          .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, "Equipamento")
          .replace(/\s{2,}/g, " ")
          .trim();

        let nomeLimpo = m.equipamentoNome
          ? m.equipamentoNome
              .replace(/\s*\(\s*\)/g, "")
              .replace(/\s*\(undefined\)/gi, "")
              .replace(/\s*\(null\)/gi, "")
              .replace(/\([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\)/gi, "")
              .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, "Equipamento")
              .replace(/\s{2,}/g, " ")
              .trim()
          : undefined;

        return {
          ...m,
          motivo: motivoLimpo,
          equipamentoNome: nomeLimpo,
        };
      });
      setMovimentacoes(sanitizadas);
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
          classes: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60",
          icone: <UserCheck className="w-3.5 h-3.5" />,
        };
      case "devolucao":
        return {
          label: "Devolução",
          classes: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60",
          icone: <Undo2 className="w-3.5 h-3.5" />,
        };
      case "entrada":
        return {
          label: "Entrada Estoque",
          classes: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",
          icone: <PackagePlus className="w-3.5 h-3.5" />,
        };
      case "colaborador":
        return {
          label: "Novo Colaborador",
          classes: "bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60",
          icone: <UserPlus className="w-3.5 h-3.5" />,
        };
      case "exclusao":
        return {
          label: "Baixa / Exclusão",
          classes: "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60",
          icone: <Trash2 className="w-3.5 h-3.5" />,
        };
      default:
        return {
          label: tipo,
          classes: "bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
          icone: <Clock className="w-3.5 h-3.5" />,
        };
    }
  };

  return (
    <>
      <Header
        title="Histórico de Auditoria e Movimentações"
        subtitle="Registro em tempo real de atribuições, entradas no estoque, devoluções e colaboradores"
      />

      <main className="flex-1 w-full max-w-[1600px] 2xl:max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <ArrowLeftRight className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              Linha do Tempo de Movimentações
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Trilha de auditoria cronológica gerada automaticamente a cada ação no inventário corporativo.
            </p>
          </div>

          {movimentacoes.length > 0 && (
            <button
              onClick={() => setModalLimparAberto(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/50 rounded-xl transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpar Histórico
            </button>
          )}
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
              className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-[#0f142b] border border-slate-300 dark:border-indigo-950/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 shadow-2xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFiltroTipo("todos")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                filtroTipo === "todos"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-white dark:bg-[#0f142b] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-indigo-950/70 hover:bg-slate-50 dark:hover:bg-indigo-950/30"
              }`}
            >
              Todas ({movimentacoes.length})
            </button>

            <button
              onClick={() => setFiltroTipo("atribuicao_devolucao")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                filtroTipo === "atribuicao_devolucao"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-white dark:bg-[#0f142b] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-indigo-950/70 hover:bg-slate-50 dark:hover:bg-indigo-950/30"
              }`}
            >
              Custódia e Devoluções
            </button>

            <button
              onClick={() => setFiltroTipo("entrada")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                filtroTipo === "entrada"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-white dark:bg-[#0f142b] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-indigo-950/70 hover:bg-slate-50 dark:hover:bg-indigo-950/30"
              }`}
            >
              Entradas no Estoque
            </button>

            <button
              onClick={() => setFiltroTipo("colaborador")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                filtroTipo === "colaborador"
                  ? "bg-sky-600 text-white border-sky-600 shadow-xs"
                  : "bg-white dark:bg-[#0f142b] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-indigo-950/70 hover:bg-slate-50 dark:hover:bg-indigo-950/30"
              }`}
            >
              Colaboradores
            </button>

            <button
              onClick={() => setFiltroTipo("exclusao")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                filtroTipo === "exclusao"
                  ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                  : "bg-white dark:bg-[#0f142b] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-indigo-950/70 hover:bg-slate-50 dark:hover:bg-indigo-950/30"
              }`}
            >
              Baixas / Exclusões
            </button>
          </div>
        </div>

        {/* Linha do Tempo Dinâmica */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-indigo-950/70 bg-white dark:bg-[#0f142b] p-6 shadow-xs">
          {carregando ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
              Carregando histórico de auditoria...
            </div>
          ) : movimentacoesFiltradas.length === 0 ? (
            <div className="p-12 text-center text-slate-400 dark:text-slate-500">
              <Boxes className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="font-semibold text-slate-600 dark:text-slate-300 text-sm">Nenhuma movimentação encontrada</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Todas as ações (adicionar equipamentos, vincular pessoas ou devolver ao estoque) aparecerão registradas aqui.
              </p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-indigo-950/80">
              {movimentacoesFiltradas.map((mov) => {
                const badge = getBadgeTipo(mov.tipo);

                return (
                  <div key={mov.id} className="relative animate-in fade-in duration-150">
                    <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-[#0f142b] bg-indigo-600 ring-2 ring-indigo-100 dark:ring-indigo-950 shadow-xs" />
                    
                    <div className="bg-slate-50/80 dark:bg-[#0b0f19]/80 border border-slate-200/80 dark:border-indigo-950/70 rounded-2xl p-4 space-y-3 hover:border-indigo-200/80 dark:hover:border-indigo-700/50 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${badge.classes}`}>
                            {badge.icone}
                            {badge.label}
                          </span>

                          {mov.equipamentoNome && (
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {mov.equipamentoNome}
                            </span>
                          )}
                        </div>

                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                          {new Date(mov.data).toLocaleDateString("pt-BR")} às{" "}
                          {new Date(mov.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                        {mov.motivo}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-indigo-950/60 text-xs text-slate-500 dark:text-slate-400">
                        <div>
                          {mov.responsavelNome && (
                            <span>
                              Colaborador: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{mov.responsavelNome}</strong>
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                          Registrado por: <strong className="text-slate-600 dark:text-slate-300">{mov.registradoPor}</strong>
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

      <ModalConfirmacao
        aberto={modalLimparAberto}
        titulo="Limpar Histórico de Auditoria?"
        descricao="Você está prestes a excluir todos os registros da linha do tempo de auditoria. Esta ação deixará o histórico limpo para novos testes."
        itemIdentificador="Todos os registros de movimentação"
        onConfirmar={async () => {
          await equipamentosService.limparMovimentacoes();
          setModalLimparAberto(false);
        }}
        onFechar={() => setModalLimparAberto(false)}
      />
    </>
  );
}
