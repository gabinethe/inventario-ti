import React from "react";
import Link from "next/link";
import { Plus, Boxes } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { equipamentosService } from "@/services/equipamentos.service";
import { TabelaEquipamentos } from "@/components/modules/equipamentos/tabela-equipamentos";

interface EquipamentosPageProps {
  searchParams: Promise<{ tipo?: string }>;
}

export default async function EquipamentosPage({ searchParams }: EquipamentosPageProps) {
  const params = await searchParams;
  const tipoAtual = params?.tipo || "notebook";
  const equipamentos = await equipamentosService.listar();

  const rotuloBotao = {
    notebook: "Cadastrar Notebook",
    monitor: "Cadastrar Monitor",
    smartphone: "Cadastrar Celular",
    periferico: "Cadastrar Periférico",
    todos: "Cadastrar Equipamento",
  }[tipoAtual] || "Cadastrar Equipamento";

  const linkCadastro = tipoAtual && tipoAtual !== "todos"
    ? `/equipamentos/novo?tipo=${tipoAtual}`
    : "/equipamentos/novo?tipo=notebook";

  return (
    <>
      <Header
        title="Inventário de Ativos"
        subtitle="Gerenciamento de notebooks, monitores, celulares corporativos e periféricos"
      />

      <main className="flex-1 w-full max-w-[1600px] 2xl:max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
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

          <Link href={linkCadastro} prefetch={true}>
            <Button size="sm">
              <Plus className="w-4 h-4" />
              {rotuloBotao}
            </Button>
          </Link>
        </div>

        {/* Componente interativo com Abas de Categorias, Busca, Filtros e Ações */}
        <TabelaEquipamentos equipamentosIniciais={equipamentos} />
      </main>
    </>
  );
}
