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

      <main className="flex-1 p-8 max-w-7xl">
        <DashboardView
          notebooksIniciais={notebooks}
          metricas={metricas}
        />
      </main>
    </>
  );
}
