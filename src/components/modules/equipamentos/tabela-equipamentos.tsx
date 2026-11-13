"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Laptop, 
  Search, 
  CheckCircle2, 
  UserCheck, 
  Wrench, 
  Eye,
  Trash2,
  Monitor,
  Smartphone,
  Headphones,
  Boxes,
  ArrowRightLeft,
  Undo2,
  Plus
} from "lucide-react";
import { EquipamentoComResponsavel, equipamentosService } from "@/services/equipamentos.service";
import { StatusEquipamento, TipoEquipamento } from "@/types";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModalConfirmacao } from "@/components/ui/modal-confirmacao";
import { ModalAtribuicao } from "@/components/ui/modal-atribuicao";
import { ModalManutencao } from "@/components/ui/modal-manutencao";

interface TabelaEquipamentosProps {
  equipamentosIniciais: EquipamentoComResponsavel[];
}

export function TabelaEquipamentos({ equipamentosIniciais }: TabelaEquipamentosProps) {
  const searchParams = useSearchParams();
  const tipoParam = searchParams?.get("tipo") as TipoEquipamento | null;

  const [equipamentos, setEquipamentos] = useState<EquipamentoComResponsavel[]>(equipamentosIniciais);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<TipoEquipamento | "todos">(tipoParam || "notebook");
  const [filtroStatus, setFiltroStatus] = useState<StatusEquipamento | "todos">("todos");

  // Sincroniza com parâmetros de URL (caso mude na sidebar)
  useEffect(() => {
    if (tipoParam) {
      setFiltroTipo(tipoParam);
    } else {
      setFiltroTipo("notebook");
    }
  }, [tipoParam]);

  // Sincroniza dados com o serviço para refletir exclusões/atribuições
  const recarregar = async () => {
    const dados = await equipamentosService.listar();
    setEquipamentos(dados);
  };

  useEffect(() => {
    recarregar();
    const handleAtualizacao = () => recarregar();
    window.addEventListener("inventario_alterado", handleAtualizacao);
    return () => window.removeEventListener("inventario_alterado", handleAtualizacao);
  }, []);

  // Modal de Exclusão
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [equipamentoParaExcluir, setEquipamentoParaExcluir] = useState<EquipamentoComResponsavel | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  // Modal de Atribuição / Devolução
  const [modalAtribuicaoAberto, setModalAtribuicaoAberto] = useState(false);
  const [equipamentoEmOperacao, setEquipamentoEmOperacao] = useState<EquipamentoComResponsavel | null>(null);
  const [modoOperacao, setModoOperacao] = useState<"atribuir" | "devolver">("atribuir");

  // Modal de Manutenção Técnica
  const [modalManutencaoAberto, setModalManutencaoAberto] = useState(false);
  const [equipamentoEmManutencao, setEquipamentoEmManutencao] = useState<EquipamentoComResponsavel | null>(null);
  const [modoManutencao, setModoManutencao] = useState<"enviar" | "concluir">("enviar");

  // Contadores por Tipo
  const contadoresTipo = useMemo(() => {
    return {
      todos: equipamentos.length,
      notebook: equipamentos.filter((e) => e.tipo === "notebook").length,
      monitor: equipamentos.filter((e) => e.tipo === "monitor").length,
      smartphone: equipamentos.filter((e) => e.tipo === "smartphone").length,
      periferico: equipamentos.filter((e) => e.tipo === "periferico").length,
    };
  }, [equipamentos]);

  // Contadores por Status (dentro do tipo selecionado)
  const contadoresStatus = useMemo(() => {
    const base = filtroTipo === "todos" ? equipamentos : equipamentos.filter((e) => e.tipo === filtroTipo);
    return {
      todos: base.length,
      disponivel: base.filter((e) => e.status === "disponivel").length,
      em_uso: base.filter((e) => e.status === "em_uso").length,
      manutencao: base.filter((e) => e.status === "manutencao").length,
    };
  }, [equipamentos, filtroTipo]);

  // Filtragem dinâmica combinada
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
        (eq.responsavel?.nome.toLowerCase().includes(termo) ?? false);

      return matchTipo && matchStatus && matchBusca;
    });
  }, [equipamentos, busca, filtroTipo, filtroStatus]);

  const abrirModalExclusao = (item: EquipamentoComResponsavel) => {
    setEquipamentoParaExcluir(item);
    setModalExclusaoAberto(true);
  };

  const confirmarExclusao = async () => {
    if (!equipamentoParaExcluir) return;
    setExcluindo(true);
    try {
      await equipamentosService.excluirEquipamento(equipamentoParaExcluir.id);
      setModalExclusaoAberto(false);
      setEquipamentoParaExcluir(null);
      await recarregar();
    } catch (err) {
      console.error(err);
    } finally {
      setExcluindo(false);
    }
  };

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

  const abrirEnvioManutencao = (item: EquipamentoComResponsavel) => {
    setEquipamentoEmManutencao(item);
    setModoManutencao("enviar");
    setModalManutencaoAberto(true);
  };

  const abrirConclusaoManutencao = (item: EquipamentoComResponsavel) => {
    setEquipamentoEmManutencao(item);
    setModoManutencao("concluir");
    setModalManutencaoAberto(true);
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

  const mudarAba = (novoTipo: TipoEquipamento | "todos") => {
    setFiltroTipo(novoTipo);
    if (typeof window !== "undefined") {
      const url = novoTipo === "todos" ? "/equipamentos" : `/equipamentos?tipo=${novoTipo}`;
      window.history.pushState(null, "", url);
    }
  };

  const rotuloCadastro = (
    {
      notebook: "Cadastrar Notebook",
      monitor: "Cadastrar Monitor",
      smartphone: "Cadastrar Celular",
      periferico: "Cadastrar Periférico",
      todos: "Cadastrar Equipamento",
    } as Record<string, string>
  )[filtroTipo] || "Cadastrar Equipamento";

  const linkCadastro = filtroTipo === "todos"
    ? "/equipamentos/novo?tipo=notebook"
    : `/equipamentos/novo?tipo=${filtroTipo}`;

  return (
    <div className="space-y-6">
      {/* 1. Barra de Seleção de Categorias de Equipamento */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          onClick={() => mudarAba("notebook")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            filtroTipo === "notebook"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Laptop className="w-4 h-4" />
          Notebooks ({contadoresTipo.notebook})
        </button>

        <button
          onClick={() => mudarAba("monitor")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            filtroTipo === "monitor"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Monitor className="w-4 h-4" />
          Monitores ({contadoresTipo.monitor})
        </button>

        <button
          onClick={() => mudarAba("smartphone")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            filtroTipo === "smartphone"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Smartphone className="w-4 h-4" />
          Celulares ({contadoresTipo.smartphone})
        </button>

        <button
          onClick={() => mudarAba("periferico")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            filtroTipo === "periferico"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Headphones className="w-4 h-4" />
          Periféricos ({contadoresTipo.periferico})
        </button>

        <button
          onClick={() => mudarAba("todos")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ml-auto ${
            filtroTipo === "todos"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          <Boxes className="w-4 h-4" />
          Todos os Ativos ({contadoresTipo.todos})
        </button>
      </div>

      {/* 2. Barra de Busca, Filtros e Ação Contextual de Cadastro */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Campo de Busca */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar por patrimônio, modelo, serial ou colaborador..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 shadow-2xs text-slate-900 placeholder:text-slate-400 transition-all"
          />
        </div>

        {/* Botões de Filtro por Status e Botão Contextual de Cadastro */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
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
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                filtroStatus === "disponivel"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-900"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Disponíveis ({contadoresStatus.disponivel})
            </button>

            <button
              onClick={() => setFiltroStatus("em_uso")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                filtroStatus === "em_uso"
                  ? "bg-indigo-700 text-white border-indigo-700 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-indigo-50 hover:text-indigo-900"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              Em Uso ({contadoresStatus.em_uso})
            </button>

            <button
              onClick={() => setFiltroStatus("manutencao")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                filtroStatus === "manutencao"
                  ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-amber-50 hover:text-amber-900"
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-amber-500" />
              Manutenção ({contadoresStatus.manutencao})
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden lg:block" />

          {/* Botão Contextual de Cadastro por Rota/Categoria */}
          <Link href={linkCadastro} prefetch={true} className="flex-shrink-0">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
              <Plus className="w-4 h-4" />
              {rotuloCadastro}
            </Button>
          </Link>
        </div>
      </div>

      {/* 3. Tabela de Resultados Integrada */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Ativo / Patrimônio</th>
                <th className="px-6 py-3.5">Categoria & Detalhes</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Custódia / Responsável</th>
                <th className="px-6 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {equipamentosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <Boxes className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="font-semibold text-slate-600 text-sm">
                      Nenhum ativo encontrado nesta seleção
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Tente alterar a categoria, os filtros ou limpar os termos da busca.
                    </p>
                  </td>
                </tr>
              ) : (
                equipamentosFiltrados.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-indigo-50/30 transition-colors"
                  >
                    {/* Ativo */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                          {getIconeTipo(item.tipo)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {item.marca} {item.modelo}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {item.tipo === "periferico" && item.quantidadeDisponivel !== undefined ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Estoque: {item.quantidadeDisponivel} unid. disponíveis
                              </span>
                            ) : (
                              <span className="font-mono text-slate-400 text-[11px]">S/N: {item.numeroSerie}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Especificações */}
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

                    {/* Responsável / Custódia */}
                    <td className="px-6 py-3.5 text-xs">
                      {item.responsavel ? (
                        <div className="flex items-center gap-2.5 bg-indigo-50/70 border border-indigo-100/90 rounded-xl p-2 max-w-[260px] shadow-2xs">
                          <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0 shadow-2xs">
                            {item.responsavel.nome
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-xs truncate">
                              {item.responsavel.nome}
                            </p>
                            <p className="text-[11px] text-indigo-700 truncate font-medium">
                              {item.responsavel.departamento}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/80 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Estoque Disponível
                        </span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Botão de Atribuir ou Devolver */}
                        {item.status === "disponivel" ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => abrirAtribuicao(item)}
                            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
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
                            className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                            title="Devolver ao estoque de TI"
                          >
                            <Undo2 className="w-3.5 h-3.5" />
                            Devolver
                          </Button>
                        ) : null}

                        {/* Botão de Manutenção Técnica */}
                        {item.status === "manutencao" ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => abrirConclusaoManutencao(item)}
                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                            title="Concluir manutenção e retornar ao estoque disponível"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Concluir
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => abrirEnvioManutencao(item)}
                            className="bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 border border-slate-200"
                            title="Encaminhar equipamento para manutenção"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            Manutenção
                          </Button>
                        )}

                        <Link href={`/equipamentos/${item.id}`} prefetch={true}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-3.5 h-3.5" />
                            Detalhes
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => abrirModalExclusao(item)}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2"
                          title="Excluir ativo com segurança"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Atribuição / Devolução de Custódia */}
      <ModalAtribuicao
        aberto={modalAtribuicaoAberto}
        equipamento={equipamentoEmOperacao}
        modo={modoOperacao}
        onFechar={() => {
          setModalAtribuicaoAberto(false);
          setEquipamentoEmOperacao(null);
        }}
        onSucesso={() => recarregar()}
      />

      {/* Modal de Confirmação Segura de Exclusão */}
      <ModalConfirmacao
        aberto={modalExclusaoAberto}
        titulo="Excluir Ativo"
        descricao="Tem certeza que deseja excluir permanentemente este equipamento do inventário?"
        itemIdentificador={
          equipamentoParaExcluir
            ? `${equipamentoParaExcluir.marca} ${equipamentoParaExcluir.modelo} (S/N: ${equipamentoParaExcluir.numeroSerie})`
            : undefined
        }
        onFechar={() => {
          setModalExclusaoAberto(false);
          setEquipamentoParaExcluir(null);
        }}
        onConfirmar={confirmarExclusao}
        processando={excluindo}
      />

      {/* Modal de Manutenção Técnica */}
      <ModalManutencao
        aberto={modalManutencaoAberto}
        equipamento={equipamentoEmManutencao}
        modo={modoManutencao}
        onFechar={() => {
          setModalManutencaoAberto(false);
          setEquipamentoEmManutencao(null);
        }}
        onSucesso={() => recarregar()}
      />
    </div>
  );
}
