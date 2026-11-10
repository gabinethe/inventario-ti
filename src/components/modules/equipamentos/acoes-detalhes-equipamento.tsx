"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ArrowRightLeft, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModalConfirmacao } from "@/components/ui/modal-confirmacao";
import { ModalAtribuicao } from "@/components/ui/modal-atribuicao";
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

  return (
    <>
      <div className="flex items-center gap-2">
        {equipamento.status === "disponivel" ? (
          <Button
            size="sm"
            onClick={abrirAtribuir}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Atribuir Colaborador
          </Button>
        ) : equipamento.status === "em_uso" ? (
          <Button
            size="sm"
            onClick={abrirDevolver}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Undo2 className="w-4 h-4" />
            Devolver ao Estoque
          </Button>
        ) : null}

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
