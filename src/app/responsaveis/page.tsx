"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Mail, Laptop, Building2, UserPlus, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { ModalConfirmacao } from "@/components/ui/modal-confirmacao";
import { equipamentosService, EquipamentoComResponsavel } from "@/services/equipamentos.service";
import { Responsavel } from "@/types";

interface ColaboradorComAtivos extends Responsavel {
  notebooks: EquipamentoComResponsavel[];
}

export default function ResponsaveisPage() {
  const [colaboradores, setColaboradores] = useState<ColaboradorComAtivos[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Modal de exclusão segura
  const [modalAberto, setModalAberto] = useState(false);
  const [colaboradorParaExcluir, setColaboradorParaExcluir] = useState<ColaboradorComAtivos | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    carregarDados();
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
        notebooks: eqs.filter((e) => e.responsavelId === resp.id),
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
    setModalAberto(true);
  };

  const confirmarExclusao = async () => {
    if (!colaboradorParaExcluir) return;
    setExcluindo(true);

    try {
      await equipamentosService.excluirResponsavel(colaboradorParaExcluir.id);
      setColaboradores((prev) => prev.filter((c) => c.id !== colaboradorParaExcluir.id));
      setModalAberto(false);
      setColaboradorParaExcluir(null);
    } catch (err) {
      console.error("Erro ao excluir colaborador:", err);
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <>
      <Header
        title="Usuários e Colaboradores"
        subtitle="Gerenciamento de responsáveis e posse de equipamentos"
      />

      <main className="flex-1 p-8 space-y-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <Users className="h-6 w-6 text-indigo-600" />
              Usuários e Posse de Ativos
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Relação de colaboradores e os equipamentos corporativos sob sua responsabilidade.
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
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center border border-indigo-100">
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
                      {colab.notebooks.length} {colab.notebooks.length === 1 ? "ativo" : "ativos"}
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

                {/* Notebooks em posse deste colaborador */}
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Equipamento sob custódia:
                  </p>
                  {colab.notebooks.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Nenhum equipamento vinculado</p>
                  ) : (
                    <div className="space-y-2">
                      {colab.notebooks.map((nb) => (
                        <Link
                          key={nb.id}
                          href={`/equipamentos/${nb.id}`}
                          prefetch={true}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/60 text-xs transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            <Laptop className="w-4 h-4 text-indigo-600" />
                            <div>
                              <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                {nb.marca} {nb.modelo}
                              </span>
                              <span className="text-slate-400 ml-1.5 font-mono">
                                ({nb.patrimonio})
                              </span>
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold text-indigo-600">
                            Ver ativo →
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de Confirmação Segura de Exclusão de Colaborador */}
      <ModalConfirmacao
        aberto={modalAberto}
        titulo="Excluir Colaborador"
        descricao="Tem certeza que deseja excluir este colaborador? Qualquer equipamento que estiver sob sua custódia voltará automaticamente para o status 'Disponível no estoque'."
        itemIdentificador={
          colaboradorParaExcluir
            ? `${colaboradorParaExcluir.nome} (${colaboradorParaExcluir.departamento} • ${colaboradorParaExcluir.email})`
            : undefined
        }
        onFechar={() => {
          setModalAberto(false);
          setColaboradorParaExcluir(null);
        }}
        onConfirmar={confirmarExclusao}
        processando={excluindo}
      />
    </>
  );
}
