import React from "react";
import Link from "next/link";
import { Plus, Laptop } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { equipamentosService } from "@/services/equipamentos.service";
import { TabelaEquipamentos } from "@/components/modules/equipamentos/tabela-equipamentos";

export default async function EquipamentosPage() {
  const equipamentos = await equipamentosService.listar();

  return (
    <>
      <Header
        title="Notebooks"
        subtitle="Gerenciamento de todos os notebooks cadastrados no parque"
      />

      <main className="flex-1 p-8 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
              <Laptop className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Parque de Notebooks
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Consulte, filtre e acompanhe o estado de cada equipamento em tempo real.
            </p>
          </div>

          <Link href="/equipamentos/novo">
            <Button size="sm">
              <Plus className="w-4 h-4" />
              Novo Notebook
            </Button>
          </Link>
        </div>

        {/* Componente interativo de Busca, Filtros e Listagem */}
        <TabelaEquipamentos equipamentosIniciais={equipamentos} />
      </main>
    </>
  );
}
