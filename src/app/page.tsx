import React from "react";
import { Header } from "@/components/layout/header";
import { equipamentosService } from "@/services/equipamentos.service";
import { DashboardView } from "@/components/modules/dashboard/dashboard-view";

export default async function DashboardPage() {
  const metricas = await equipamentosService.obterMetricas();
  const notebooks = await equipamentosService.listar();

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Visão geral e indicadores do parque de ativos de TI"
      />

      <main className="flex-1 w-full max-w-[1600px] 2xl:max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <DashboardView
          notebooksIniciais={notebooks}
          metricas={metricas}
        />
      </main>
    </>
  );
}
