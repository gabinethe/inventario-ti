"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ArrowRightLeft, Undo2, Wrench, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModalConfirmacao } from "@/components/ui/modal-confirmacao";
import { ModalAtribuicao } from "@/components/ui/modal-atribuicao";
import { ModalManutencao } from "@/components/ui/modal-manutencao";
import { equipamentosService, EquipamentoComResponsavel } from "@/services/equipamentos.service";

interface AcoesDetalhesEquipamentoProps {
  equipamento: EquipamentoComResponsavel;
}

export function AcoesDetalhesEquipamento({ equipamento }: AcoesDetalhesEquipamentoProps) {
  const router = useRouter();
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const [modalAtribuicaoAberto, setModalAtribuicaoAberto] = useState(false);
  const [modoAtribuicao, setModoAtribuicao] = useState<"atribuir" | "devolver">("atribuir");

  const [modalManutencaoAberto, setModalManutencaoAberto] = useState(false);
  const [modoManutencao, setModoManutencao] = useState<"enviar" | "concluir">("enviar");

  const confirmarExclusao = async () => {
    setExcluindo(true);
    try {
      await equipamentosService.excluirEquipamento(equipamento.id);
      router.push("/equipamentos");
      router.refresh();
    } catch (err) {
      console.error("Erro ao excluir equipamento:", err);
      setExcluindo(false);
    }
  };

  const abrirAtribuir = () => {
    setModoAtribuicao("atribuir");
    setModalAtribuicaoAberto(true);
  };

  const abrirDevolver = () => {
    setModoAtribuicao("devolver");
    setModalAtribuicaoAberto(true);
  };

  const abrirEnvioManutencao = () => {
    setModoManutencao("enviar");
    setModalManutencaoAberto(true);
  };

  const abrirConclusaoManutencao = () => {
    setModoManutencao("concluir");
    setModalManutencaoAberto(true);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {/* Ação primária: Atribuir ou Devolver */}
        {equipamento.status === "disponivel" ? (
          <Button
            size="sm"
            onClick={abrirAtribuir}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Atribuir Colaborador
          </Button>
        ) : equipamento.status === "em_uso" ? (
          <Button
            size="sm"
            onClick={abrirDevolver}
            className="flex items-center gap-1.5 bg-indigo-700 hover:bg-indigo-800 text-white shadow-xs"
          >
            <Undo2 className="w-4 h-4" />
            Devolver ao Estoque
          </Button>
        ) : null}

        {/* Ação de Manutenção Técnica */}
        {equipamento.status === "manutencao" ? (
          <Button
            size="sm"
            onClick={abrirConclusaoManutencao}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            Concluir Manutenção & Retornar ao Estoque
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={abrirEnvioManutencao}
            className="text-amber-700 hover:text-amber-800 hover:bg-amber-50 border-amber-300 flex items-center gap-1.5"
          >
            <Wrench className="w-4 h-4" />
            Enviar para Manutenção
          </Button>
        )}

        {/* Excluir ativo */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setModalExclusaoAberto(true)}
          className="text-slate-600 hover:text-rose-600 hover:bg-rose-50 flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          Excluir
        </Button>
      </div>

      {/* Modal de Atribuição e Devolução */}
      <ModalAtribuicao
        aberto={modalAtribuicaoAberto}
        equipamento={equipamento}
        modo={modoAtribuicao}
        onFechar={() => setModalAtribuicaoAberto(false)}
        onSucesso={() => {
          router.refresh();
        }}
      />

      {/* Modal de Manutenção Técnica */}
      <ModalManutencao
        aberto={modalManutencaoAberto}
        equipamento={equipamento}
        modo={modoManutencao}
        onFechar={() => setModalManutencaoAberto(false)}
        onSucesso={() => {
          router.refresh();
        }}
      />

      {/* Modal de Exclusão Segura */}
      <ModalConfirmacao
        aberto={modalExclusaoAberto}
        titulo="Excluir Equipamento"
        descricao="Tem certeza que deseja excluir este ativo permanentemente do inventário?"
        itemIdentificador={`${equipamento.marca} ${equipamento.modelo} (S/N: ${equipamento.numeroSerie})`}
        onFechar={() => setModalExclusaoAberto(false)}
        onConfirmar={confirmarExclusao}
        processando={excluindo}
      />
    </>
  );
}
