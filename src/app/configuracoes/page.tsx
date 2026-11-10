import React from "react";
import { Settings, Server, Bell, Shield, Database } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";

export default function ConfiguracoesPage() {
  return (
    <>
      <Header
        title="Configurações do Sistema"
        subtitle="Parâmetros gerais, integrações e ambiente de execução"
      />

      <main className="flex-1 p-8 space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Settings className="h-6 w-6 text-blue-600" />
            Configurações
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Gerencie os parâmetros globais da aplicação Inventário TI.
          </p>
        </div>

        {/* Card de Integração com Banco / Supabase */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Camada de Banco de Dados
              </h2>
              <p className="text-xs text-slate-500">
                Status da persistência de dados do inventário
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-sm font-bold text-slate-800">
                  Modo Memória / Mock Service (Ativo)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                A aplicação está executando com camada desacoplada, pronta para receber o Supabase.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Fase MVP
            </span>
          </div>
        </div>

        {/* Card de Parâmetros de Patrimônio */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Parâmetros de Patrimônio
              </h2>
              <p className="text-xs text-slate-500">
                Regras de etiquetagem e tipos de ativos permitidos
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
              <span className="text-slate-400 font-semibold uppercase">Prefixo de Patrimônio</span>
              <p className="text-sm font-bold text-slate-800 mt-1 font-mono">PAT-</p>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
              <span className="text-slate-400 font-semibold uppercase">Tipo Principal Ativo</span>
              <p className="text-sm font-bold text-slate-800 mt-1">Notebook (Extensível)</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
