import React from "react";
import Link from "next/link";
import { ArrowLeftRight, Laptop } from "lucide-react";
import { Header } from "@/components/layout/header";
import { MOCK_MOVIMENTACOES, MOCK_EQUIPAMENTOS, MOCK_RESPONSAVEIS } from "@/services/mock-data";

export default function MovimentacoesPage() {
  const movimentacoes = MOCK_MOVIMENTACOES.map((mov) => ({
    ...mov,
    equipamento: MOCK_EQUIPAMENTOS.find((e) => e.id === mov.equipamentoId),
    responsavelDestino: MOCK_RESPONSAVEIS.find((r) => r.id === mov.responsavelDestinoId),
    responsavelOrigem: MOCK_RESPONSAVEIS.find((r) => r.id === mov.responsavelOrigemId),
  }));

  return (
    <>
      <Header
        title="Histórico de Movimentações"
        subtitle="Auditoria e rastreamento de atribuições, manutenções e transferências"
      />

      <main className="flex-1 p-8 space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <ArrowLeftRight className="h-6 w-6 text-blue-600" />
            Movimentações de Ativos
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Registro imutável de todas as transferências, entregas e manutenções do inventário.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {movimentacoes.map((mov) => (
              <div key={mov.id} className="relative">
                <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-600" />
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {mov.tipo}
                      </span>
                      {mov.equipamento && (
                        <Link
                          href={`/equipamentos/${mov.equipamento.id}`}
                          className="text-xs font-bold text-slate-800 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
                        >
                          <Laptop className="w-3.5 h-3.5 text-blue-600" />
                          {mov.equipamento.marca} {mov.equipamento.modelo} ({mov.equipamento.patrimonio})
                        </Link>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(mov.data).toLocaleDateString("pt-BR")} às{" "}
                      {new Date(mov.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 font-medium">
                    {mov.motivo}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-xs text-slate-500">
                    <div>
                      {mov.responsavelDestino && (
                        <span>
                          Atribuído para: <strong className="text-slate-800 font-bold">{mov.responsavelDestino.nome}</strong> ({mov.responsavelDestino.departamento})
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Operador: {mov.registradoPor}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
