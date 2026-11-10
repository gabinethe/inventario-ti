"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModalConfirmacao } from "@/components/ui/modal-confirmacao";
import { equipamentosService, EquipamentoComResponsavel } from "@/services/equipamentos.service";

interface AcoesDetalhesEquipamentoProps {
  equipamento: EquipamentoComResponsavel;
}

export function AcoesDetalhesEquipamento({ equipamento }: AcoesDetalhesEquipamentoProps) {
  const router = useRouter();
  const [modalAberto, setModalAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

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

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="danger"
          size="sm"
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          Excluir Equipamento
        </Button>
      </div>

      <ModalConfirmacao
        aberto={modalAberto}
        titulo="Excluir Equipamento"
        descricao="Tem certeza que deseja excluir este notebook permanentemente do inventário?"
        itemIdentificador={`${equipamento.marca} ${equipamento.modelo} (Patrimônio: ${equipamento.patrimonio} • S/N: ${equipamento.numeroSerie})`}
        onFechar={() => setModalAberto(false)}
        onConfirmar={confirmarExclusao}
        processando={excluindo}
      />
    </>
  );
}
