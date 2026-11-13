"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Laptop, 
  Monitor, 
  Smartphone, 
  Headphones, 
  Boxes,
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Calendar, 
  Barcode, 
  DollarSign, 
  User, 
  Clock, 
  CheckCircle, 
  Building2, 
  Mail,
  Layers,
  Sparkles
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { equipamentosService, EquipamentoComResponsavel } from "@/services/equipamentos.service";
import { AcoesDetalhesEquipamento } from "@/components/modules/equipamentos/acoes-detalhes-equipamento";
import { Movimentacao } from "@/types";

export default function DetalhesEquipamentoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [equipamento, setEquipamento] = useState<EquipamentoComResponsavel | null>(null);
  const [historico, setHistorico] = useState<Movimentacao[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregarDados = async () => {
    if (!id) return;
    try {
      const item = await equipamentosService.buscarPorId(id);
      if (item) {
        setEquipamento(item);
        const movs = await equipamentosService.listarHistorico(item.id);
        setHistorico(movs);
      } else {
        setEquipamento(null);
      }
    } catch (err) {
      console.error("Erro ao carregar detalhes:", err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();

    const handleAtualizacao = () => carregarDados();
    window.addEventListener("inventario_alterado", handleAtualizacao);
    return () => window.removeEventListener("inventario_alterado", handleAtualizacao);
  }, [id]);

  if (carregando) {
    return (
      <>
        <Header title="Carregando Detalhes..." subtitle="Consultando base de ativos corporativos" />
        <main className="flex-1 w-full max-w-[1600px] 2xl:max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="p-12 text-center text-slate-400 text-sm">
            Buscando dados do ativo...
          </div>
        </main>
      </>
    );
  }

  if (!equipamento) {
    return (
      <>
        <Header title="Ativo não Encontrado" subtitle="O equipamento consultado não foi localizado" />
        <main className="flex-1 w-full max-w-[1600px] 2xl:max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-4 shadow-xs">
            <Boxes className="w-12 h-12 mx-auto text-slate-300" />
            <h2 className="text-lg font-bold text-slate-900">Equipamento não encontrado</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              O ativo pode ter sido excluído ou transferido. Retorne à listagem de ativos para consultar o estoque atual.
            </p>
            <Link href="/equipamentos">
              <Button size="md" className="mt-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Inventário
              </Button>
            </Link>
          </div>
        </main>
      </>
    );
  }

  const getIconeTipo = (tipo: string) => {
    switch (tipo) {
      case "monitor":
        return <Monitor className="w-8 h-8" />;
      case "smartphone":
        return <Smartphone className="w-8 h-8" />;
      case "periferico":
        return <Headphones className="w-8 h-8" />;
      default:
        return <Laptop className="w-8 h-8" />;
    }
  };

  const getNomeTipo = (tipo: string) => {
    switch (tipo) {
      case "monitor":
        return "Monitor";
      case "smartphone":
        return "Celular Corporativo";
      case "periferico":
        return equipamento.subtipo ? `Periférico (${equipamento.subtipo})` : "Periférico";
      default:
        return "Notebook Corporativo";
    }
  };

  return (
    <>
      <Header
        title={`${equipamento.marca} ${equipamento.modelo}`}
        subtitle={getNomeTipo(equipamento.tipo)}
      />

      <main className="flex-1 w-full max-w-[1600px] 2xl:max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Link para voltar */}
        <div>
          <Link
            href="/equipamentos"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para lista de equipamentos
          </Link>
        </div>

        {/* Banner do Equipamento */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-indigo-950/70 bg-white dark:bg-[#0f142b] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-900/60">
              {getIconeTipo(equipamento.tipo)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {equipamento.marca} {equipamento.modelo}
                </h1>
                <StatusBadge status={equipamento.status} />
                {equipamento.subtipo && (
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-indigo-950/60 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-indigo-900/60">
                    {equipamento.subtipo}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                {equipamento.quantidadeDisponivel !== undefined ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                    Estoque: {equipamento.quantidadeDisponivel} disponíveis {equipamento.quantidadeTotal ? `de ${equipamento.quantidadeTotal}` : ""}
                  </span>
                ) : (
                  <span>Serial (S/N): <strong className="font-mono text-slate-800 dark:text-slate-200">{equipamento.numeroSerie}</strong></span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AcoesDetalhesEquipamento equipamento={equipamento} />
          </div>
        </div>

        {/* Grade de 2 Colunas: Especificações + Responsável */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1 e 2: Especificações Técnicas */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-200/80 dark:border-indigo-950/70 bg-white dark:bg-[#0f142b] p-6 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
                Especificações e Detalhes Técnicos
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Se for notebook */}
                {equipamento.tipo === "notebook" && (
                  <>
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-100 dark:border-indigo-950/70">
                      <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Processador</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {equipamento.processador || "Padrão"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-100 dark:border-indigo-950/70">
                      <MemoryStick className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Memória RAM</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {equipamento.memoriaRam || "Padrão"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-100 dark:border-indigo-950/70">
                      <HardDrive className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Armazenamento</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {equipamento.armazenamento || "Padrão"}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Se for smartphone */}
                {equipamento.tipo === "smartphone" && equipamento.armazenamento && (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-100 dark:border-indigo-950/70">
                    <HardDrive className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Armazenamento Interno</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {equipamento.armazenamento}
                      </p>
                    </div>
                  </div>
                )}

                {/* Se for periférico em lote */}
                {equipamento.tipo === "periferico" && equipamento.quantidadeDisponivel !== undefined && (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60">
                    <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-bold">Estoque do Lote</p>
                      <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                        {equipamento.quantidadeDisponivel} unidades disponíveis
                      </p>
                    </div>
                  </div>
                )}

                {/* Especificações Livres */}
                {equipamento.especificacoes && (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-100 dark:border-indigo-950/70 sm:col-span-2">
                    <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Configuração e Recursos</p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {equipamento.especificacoes}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-100 dark:border-indigo-950/70">
                  <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Data de Aquisição</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {new Date(equipamento.dataAquisicao).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-100 dark:border-indigo-950/70">
                  <Barcode className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Número de Série / Lote</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      {equipamento.numeroSerie}
                    </p>
                  </div>
                </div>
              </div>

              {equipamento.observacoes && (
                <div className="mt-4 p-3.5 rounded-xl border border-slate-200 dark:border-indigo-950/70 bg-slate-50/60 dark:bg-[#0b0f19]/60">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Observações de TI:</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{equipamento.observacoes}</p>
                </div>
              )}
            </div>

            {/* Linha do Tempo / Histórico de Auditoria */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-indigo-950/70 bg-white dark:bg-[#0f142b] p-6 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Histórico de Movimentações (Auditoria)
              </h2>

              {historico.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">
                  Nenhuma movimentação registrada para este equipamento ainda.
                </p>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-indigo-950/80">
                  {historico.map((mov) => (
                    <div key={mov.id} className="relative">
                      <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-[#0f142b] bg-indigo-600 shadow-xs" />
                      <div className="bg-slate-50/70 dark:bg-[#0b0f19]/70 border border-slate-200/60 dark:border-indigo-950/60 rounded-xl p-3.5 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/50">
                            {mov.tipo}
                          </span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                            {new Date(mov.data).toLocaleDateString("pt-BR")} às{" "}
                            {new Date(mov.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium pt-1">
                          {mov.motivo}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          Registrado por: {mov.registradoPor}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Coluna 3: Responsável Atual */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200/80 dark:border-indigo-950/70 bg-white dark:bg-[#0f142b] p-6 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Responsável Atual
              </h2>

              {equipamento.responsavel ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-sm flex items-center justify-center border border-indigo-100 dark:border-indigo-900/60">
                      {equipamento.responsavel.nome
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">
                        {equipamento.responsavel.nome}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{equipamento.responsavel.cargo}</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-indigo-950/70 text-xs">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{equipamento.responsavel.departamento}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <span className="font-medium text-slate-800 dark:text-slate-200 break-all">{equipamento.responsavel.email}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Disponível no Estoque
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px] mx-auto">
                    {equipamento.tipo === "periferico" && equipamento.quantidadeDisponivel !== undefined
                      ? `${equipamento.quantidadeDisponivel} unidades prontas para distribuição.`
                      : "Este equipamento não possui colaborador vinculado no momento."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
