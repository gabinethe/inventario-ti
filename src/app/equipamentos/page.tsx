import React from "react";
import { Boxes } from "lucide-react";
import { Header } from "@/components/layout/header";
import { equipamentosService } from "@/services/equipamentos.service";
import { TabelaEquipamentos } from "@/components/modules/equipamentos/tabela-equipamentos";

export default async function EquipamentosPage() {
  const equipamentos = await equipamentosService.listar();

  return (
    <>
      <Header
        title="Inventário de Ativos"
        subtitle="Gerenciamento de notebooks, monitores, celulares corporativos e periféricos"
      />

      <main className="flex-1 w-full max-w-[1600px] 2xl:max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Boxes className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Parque de Ativos de TI
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Controle de custódia, especificações de hardware e disponibilidade em tempo real.
          </p>
        </div>

        {/* Componente interativo com Abas de Categorias, Busca, Filtros e Botão Contextual Único */}
        <TabelaEquipamentos equipamentosIniciais={equipamentos} />
      </main>
    </>
  );
}
