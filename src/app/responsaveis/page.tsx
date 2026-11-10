import React from "react";
import Link from "next/link";
import { Users, Mail, Laptop, Building2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { MOCK_RESPONSAVEIS, MOCK_EQUIPAMENTOS } from "@/services/mock-data";

export default function ResponsaveisPage() {
  const colaboradores = MOCK_RESPONSAVEIS.map((resp) => ({
    ...resp,
    notebooks: MOCK_EQUIPAMENTOS.filter((e) => e.responsavelId === resp.id),
  }));

  return (
    <>
      <Header
        title="Usuários e Colaboradores"
        subtitle="Gerenciamento de responsáveis e posse de equipamentos"
      />

      <main className="flex-1 p-8 space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Users className="h-6 w-6 text-blue-600" />
            Usuários e Posse de Ativos
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Relação de colaboradores e os equipamentos corporativos sob sua responsabilidade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {colaboradores.map((colab) => (
            <div
              key={colab.id}
              className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-100">
                    {colab.nome
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-slate-900">
                      {colab.nome}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">{colab.cargo}</p>
                  </div>
                </div>

                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {colab.notebooks.length} {colab.notebooks.length === 1 ? "ativo" : "ativos"}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium text-slate-700">{colab.departamento}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium text-slate-700">{colab.email}</span>
                </div>
              </div>

              {/* Notebooks em posse deste colaborador */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Equipamento sob custódia:
                </p>
                {colab.notebooks.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Nenhum equipamento vinculado</p>
                ) : (
                  <div className="space-y-2">
                    {colab.notebooks.map((nb) => (
                      <Link
                        key={nb.id}
                        href={`/equipamentos/${nb.id}`}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50/70 border border-slate-200/60 text-xs transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <Laptop className="w-4 h-4 text-blue-600" />
                          <div>
                            <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                              {nb.marca} {nb.modelo}
                            </span>
                            <span className="text-slate-400 ml-1.5 font-mono">
                              ({nb.patrimonio})
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-blue-600">
                          Ver ativo →
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
