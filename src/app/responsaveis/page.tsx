"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Users, 
  Mail, 
  Laptop, 
  Building2, 
  UserPlus, 
  Trash2, 
  Monitor, 
  Smartphone, 
  Headphones, 
  Undo2,
  Boxes,
  Search,
  X,
  Filter
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { ModalConfirmacao } from "@/components/ui/modal-confirmacao";
import { ModalAtribuicao } from "@/components/ui/modal-atribuicao";
import { equipamentosService, EquipamentoComResponsavel } from "@/services/equipamentos.service";
import { Responsavel, TipoEquipamento } from "@/types";

interface ColaboradorComAtivos extends Responsavel {
  ativos: EquipamentoComResponsavel[];
}

export default function ResponsaveisPage() {
  const [colaboradores, setColaboradores] = useState<ColaboradorComAtivos[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Barra de Pesquisa e Filtros
  const [busca, setBusca] = useState("");
  const [departamentoFiltro, setDepartamentoFiltro] = useState<string>("todos");

  // Modal de exclusão segura
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [colaboradorParaExcluir, setColaboradorParaExcluir] = useState<ColaboradorComAtivos | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  // Modal de Devolução rápida
  const [modalDevolucaoAberto, setModalDevolucaoAberto] = useState(false);
  const [ativoParaDevolver, setAtivoParaDevolver] = useState<EquipamentoComResponsavel | null>(null);

  useEffect(() => {
    carregarDados();

    const handleAtualizacao = () => carregarDados();
    window.addEventListener("inventario_alterado", handleAtualizacao);
    return () => window.removeEventListener("inventario_alterado", handleAtualizacao);
  }, []);

  async function carregarDados() {
    setCarregando(true);
    try {
      const [resps, eqs] = await Promise.all([
        equipamentosService.listarResponsaveis(),
        equipamentosService.listar(),
      ]);

      const lista = resps.map((resp) => ({
        ...resp,
        ativos: eqs.filter((e) => e.responsavelId === resp.id),
      }));

      setColaboradores(lista);
    } catch (err) {
      console.error("Erro ao carregar colaboradores:", err);
    } finally {
      setCarregando(false);
    }
  }

  // Lista dinâmica de departamentos únicos para os filtros rápidos
  const departamentosDisponiveis = useMemo(() => {
    const deps = new Set(colaboradores.map((c) => c.departamento).filter(Boolean));
    return Array.from(deps);
  }, [colaboradores]);

  // Filtragem dinâmica de colaboradores
  const colaboradoresFiltrados = useMemo(() => {
    return colaboradores.filter((colab) => {
      const termo = busca.toLowerCase();
      const matchBusca =
        !busca ||
        colab.nome.toLowerCase().includes(termo) ||
        colab.email.toLowerCase().includes(termo) ||
        colab.cargo.toLowerCase().includes(termo) ||
        colab.departamento.toLowerCase().includes(termo) ||
        colab.ativos.some((ativo) =>
          ativo.modelo.toLowerCase().includes(termo) ||
          ativo.marca.toLowerCase().includes(termo) ||
          ativo.numeroSerie.toLowerCase().includes(termo) ||
          (ativo.subtipo && ativo.subtipo.toLowerCase().includes(termo))
        );

      const matchDepartamento =
        departamentoFiltro === "todos" || colab.departamento === departamentoFiltro;

      return matchBusca && matchDepartamento;
    });
  }, [colaboradores, busca, departamentoFiltro]);

  const abrirModalExclusao = (colab: ColaboradorComAtivos) => {
    setColaboradorParaExcluir(colab);
    setModalExclusaoAberto(true);
  };

  const confirmarExclusao = async () => {
    if (!colaboradorParaExcluir) return;
    setExcluindo(true);

    try {
      await equipamentosService.excluirResponsavel(colaboradorParaExcluir.id);
      setColaboradores((prev) => prev.filter((c) => c.id !== colaboradorParaExcluir.id));
      setModalExclusaoAberto(false);
      setColaboradorParaExcluir(null);
    } catch (err) {
      console.error("Erro ao excluir colaborador:", err);
    } finally {
      setExcluindo(false);
    }
  };

  const abrirDevolucaoAtivo = (ativo: EquipamentoComResponsavel) => {
    setAtivoParaDevolver(ativo);
    setModalDevolucaoAberto(true);
  };

  const getIconeAtivo = (tipo: TipoEquipamento) => {
    switch (tipo) {
      case "monitor":
        return <Monitor className="w-4 h-4 text-indigo-600" />;
      case "smartphone":
        return <Smartphone className="w-4 h-4 text-indigo-600" />;
      case "periferico":
        return <Headphones className="w-4 h-4 text-indigo-600" />;
      case "notebook":
      default:
        return <Laptop className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <>
      <Header
        title="Colaboradores e Posse de Ativos"
        subtitle="Rastreamento centralizado de equipamentos sob a responsabilidade de cada profissional"
      />

      <main className="flex-1 w-full max-w-[1600px] 2xl:max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Cabeçalho da Página */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              Quadro de Colaboradores e Custódia
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Consulte quem está em posse de cada computador, monitor, celular ou periférico da empresa.
            </p>
          </div>

          <Link href="/responsaveis/novo" prefetch={true}>
            <Button size="sm">
              <UserPlus className="w-4 h-4" />
              Novo Colaborador
            </Button>
          </Link>
        </div>

        {/* Barra de Pesquisa e Filtros de Colaboradores */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-indigo-950/70 bg-white dark:bg-[#0f142b] p-4 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Campo de Pesquisa em Tempo Real */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar por nome, cargo, departamento ou ativo em posse..."
                className="w-full pl-10 pr-10 py-2 text-sm bg-slate-50 dark:bg-[#0a0e20] border border-slate-200 dark:border-indigo-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 focus:bg-white dark:focus:bg-[#0a0e20] transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Contador de Resultados */}
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 self-center">
              Mostrando <strong className="text-slate-800 dark:text-slate-200">{colaboradoresFiltrados.length}</strong> de{" "}
              {colaboradores.length} colaboradores
            </div>
          </div>

          {/* Filtros Rápidos por Departamento */}
          {departamentosDisponiveis.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 border-t border-slate-100 dark:border-indigo-950/70 text-xs">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-indigo-500" />
                Filtrar:
              </span>

              <button
                onClick={() => setDepartamentoFiltro("todos")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  departamentoFiltro === "todos"
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-slate-100 dark:bg-[#0a0e20] text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-indigo-950/50"
                }`}
              >
                Todos ({colaboradores.length})
              </button>

              {departamentosDisponiveis.map((dep) => {
                const count = colaboradores.filter((c) => c.departamento === dep).length;
                return (
                  <button
                    key={dep}
                    onClick={() => setDepartamentoFiltro(dep)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      departamentoFiltro === dep
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "bg-slate-100 dark:bg-[#0a0e20] text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-indigo-950/50"
                    }`}
                  >
                    {dep} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Lista de Colaboradores e seus Ativos */}
        {carregando ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">Carregando lista de colaboradores...</p>
          </div>
        ) : colaboradoresFiltrados.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#0f142b] rounded-2xl border border-slate-200/80 dark:border-indigo-950/70">
            <Users className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
              {busca || departamentoFiltro !== "todos"
                ? "Nenhum colaborador encontrado com estes critérios"
                : "Nenhum colaborador cadastrado"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {busca || departamentoFiltro !== "todos" ? (
                <button
                  type="button"
                  onClick={() => {
                    setBusca("");
                    setDepartamentoFiltro("todos");
                  }}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Limpar filtros e busca
                </button>
              ) : (
                "Clique em 'Novo Colaborador' para adicionar."
              )}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {colaboradoresFiltrados.map((colab) => (
              <div
                key={colab.id}
                className="rounded-2xl border border-slate-200/80 dark:border-indigo-950/70 bg-white dark:bg-[#0f142b] p-5 shadow-xs space-y-4 hover:border-indigo-200/80 dark:hover:border-indigo-800 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 shadow-2xs">
                      {colab.nome
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                        {colab.nome}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{colab.cargo}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {colab.ativos.length} {colab.ativos.length === 1 ? "ativo em posse" : "ativos em posse"}
                    </span>
                    <button
                      type="button"
                      onClick={() => abrirModalExclusao(colab)}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                      title="Excluir colaborador com segurança"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-medium text-slate-700">{colab.departamento}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-medium text-slate-700">{colab.email}</span>
                  </div>
                </div>

                {/* Ativos em posse deste colaborador */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Equipamentos sob custódia ({colab.ativos.length}):
                    </p>
                    <Link
                      href="/equipamentos"
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      + Atribuir Ativo
                    </Link>
                  </div>

                  {colab.ativos.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">Nenhum equipamento em posse no momento.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {colab.ativos.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/60 text-xs transition-colors group"
                        >
                          <Link
                            href={`/equipamentos/${item.id}`}
                            className="flex items-center gap-2.5 flex-1 min-w-0"
                          >
                            <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                              {getIconeAtivo(item.tipo)}
                            </div>
                            <div className="truncate">
                              <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                {item.marca} {item.modelo}
                              </span>
                              {item.numeroSerie && (
                                <span className="text-slate-400 ml-1.5 font-mono text-[11px]">
                                  • S/N: {item.numeroSerie}
                                </span>
                              )}
                            </div>
                          </Link>

                          <button
                            type="button"
                            onClick={() => abrirDevolucaoAtivo(item)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg text-amber-700 hover:bg-amber-100/80 transition-colors cursor-pointer ml-2"
                            title="Devolver equipamento para o estoque de TI"
                          >
                            <Undo2 className="w-3 h-3" />
                            Devolver
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de Devolução Rápida */}
      <ModalAtribuicao
        aberto={modalDevolucaoAberto}
        equipamento={ativoParaDevolver}
        modo="devolver"
        onFechar={() => {
          setModalDevolucaoAberto(false);
          setAtivoParaDevolver(null);
        }}
        onSucesso={() => carregarDados()}
      />

      {/* Modal de Confirmação Segura de Exclusão de Colaborador */}
      <ModalConfirmacao
        aberto={modalExclusaoAberto}
        titulo="Excluir Colaborador"
        descricao="Tem certeza que deseja excluir este colaborador? Qualquer equipamento que estiver sob sua custódia voltará automaticamente para o status 'Disponível no estoque de TI'."
        itemIdentificador={
          colaboradorParaExcluir
            ? `${colaboradorParaExcluir.nome} (${colaboradorParaExcluir.departamento} • ${colaboradorParaExcluir.email})`
            : undefined
        }
        onFechar={() => {
          setModalExclusaoAberto(false);
          setColaboradorParaExcluir(null);
        }}
        onConfirmar={confirmarExclusao}
        processando={excluindo}
      />
    </>
  );
}
