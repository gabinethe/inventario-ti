import React from "react";
import Link from "next/link";
import { Plus, Boxes } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
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

      <main className="flex-1 p-8 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <Boxes className="h-6 w-6 text-indigo-600" />
              Parque de Ativos de TI
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Controle de custódia, especificações de hardware e disponibilidade em tempo real.
            </p>
          </div>

          <Link href="/equipamentos/novo" prefetch={true}>
            <Button size="sm">
              <Plus className="w-4 h-4" />
              Cadastrar Equipamento
            </Button>
          </Link>
        </div>

        {/* Componente interativo com Abas de Categorias, Busca, Filtros e Ações */}
        <TabelaEquipamentos equipamentosIniciais={equipamentos} />
      </main>
    </>
  );
}
