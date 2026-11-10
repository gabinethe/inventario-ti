"use client";

import React, { useState, useEffect } from "react";
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
  Boxes
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

      <main className="flex-1 p-8 space-y-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <Users className="h-6 w-6 text-indigo-600" />
              Quadro de Colaboradores & Custódia
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Consulte quem está em posse de cada computador, monitor, celular ou acessório da empresa.
            </p>
          </div>

          <Link href="/responsaveis/novo" prefetch={true}>
            <Button size="sm">
              <UserPlus className="w-4 h-4" />
              Novo Colaborador
            </Button>
          </Link>
        </div>

        {carregando ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">Carregando lista de colaboradores...</p>
          </div>
        ) : colaboradores.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80">
            <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-700 text-sm">Nenhum colaborador cadastrado</p>
            <p className="text-xs text-slate-400 mt-1">Clique em "Novo Colaborador" para adicionar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {colaboradores.map((colab) => (
              <div
                key={colab.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 hover:border-indigo-200/80 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center border border-indigo-100 shadow-2xs">
                      {colab.nome
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <h2 className="font-bold text-sm text-slate-900">
                        {colab.nome}
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">{colab.cargo}</p>
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
                              <span className="text-slate-400 ml-1.5 font-mono text-[11px]">
                                ({item.patrimonio})
                              </span>
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
