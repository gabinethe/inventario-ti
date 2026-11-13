import React from "react";
import { Settings, Server, Shield, Database, UserCircle2, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/layout/header";

export default function ConfiguracoesPage() {
  return (
    <>
      <Header
        title="Configurações do Sistema"
        subtitle="Parâmetros gerais, ambiente de execução e integrações"
      />

      <main className="flex-1 w-full max-w-[1600px] 2xl:max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Settings className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Configurações
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Gerencie os parâmetros globais da aplicação TI Inventory.
          </p>
        </div>

        {/* Card de Perfil do Administrador */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-indigo-950/70 bg-white dark:bg-[#0f142b] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
              <UserCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Perfil de Acesso e Identidade
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Os dados de exibição do administrador no topo da tela podem ser editados clicando no seu avatar no cabeçalho.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100/80 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Gerenciamento Dinâmico de Sessão
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                Ao alterar seu nome ou cargo através do menu do cabeçalho, suas preferências são sincronizadas com a sua conta no Supabase Auth.
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Ativo
            </span>
          </div>
        </div>

        {/* Card de Integração com Banco / Supabase */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-indigo-950/70 bg-white dark:bg-[#0f142b] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Persistência e Banco de Dados
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Status da conexão com o PostgreSQL na nuvem (Supabase)
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-indigo-950/70 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Supabase Cloud Conectado
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Persistência relacional em PostgreSQL com proteção ativa por Row Level Security (RLS).
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Online
            </span>
          </div>
        </div>

        {/* Card de Parâmetros de Patrimônio */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-indigo-950/70 bg-white dark:bg-[#0f142b] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-indigo-950/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-indigo-900/50">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Parâmetros de Patrimônio
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Regras de etiquetagem e tipos de ativos permitidos
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-indigo-950/70 bg-slate-50/50 dark:bg-[#0b0f19]">
              <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase">Prefixo de Patrimônio</span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 font-mono">PAT-</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-indigo-950/70 bg-slate-50/50 dark:bg-[#0b0f19]">
              <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase">Tipo Principal Ativo</span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">Notebook Corporativo</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
