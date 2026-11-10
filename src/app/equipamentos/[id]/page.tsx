import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, 
  Laptop, 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Calendar, 
  Barcode, 
  DollarSign, 
  User, 
  Clock, 
  ArrowLeftRight,
  CheckCircle,
  Building2,
  Mail
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { equipamentosService } from "@/services/equipamentos.service";

interface DetalhesPageProps {
  params: Promise<{ id: string }>;
}

export default async function DetalhesEquipamentoPage({ params }: DetalhesPageProps) {
  const { id } = await params;
  const notebook = await equipamentosService.buscarPorId(id);

  if (!notebook) {
    notFound();
  }

  const historico = await equipamentosService.listarHistorico(notebook.id);

  const valorFormatado = notebook.valorAquisicao
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
        notebook.valorAquisicao
      )
    : "Não informado";

  return (
    <>
      <Header
        title={`Equipamento ${notebook.patrimonio}`}
        subtitle={`${notebook.marca} ${notebook.modelo}`}
      />

      <main className="flex-1 p-8 space-y-6 max-w-6xl">
        {/* Link para voltar */}
        <div>
          <Link
            href="/equipamentos"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para lista de equipamentos
          </Link>
        </div>

        {/* Banner do Equipamento */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Laptop className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {notebook.marca} {notebook.modelo}
                </h1>
                <StatusBadge status={notebook.status} />
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Patrimônio: <span className="font-bold text-slate-800">{notebook.patrimonio}</span> • Serial: {notebook.numeroSerie}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <ArrowLeftRight className="w-4 h-4" />
              Transferir Responsável
            </Button>
          </div>
        </div>

        {/* Grade de 2 Colunas: Especificações + Responsável */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1 e 2: Especificações Técnicas */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Especificações Técnicas
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                  <Cpu className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Processador</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {notebook.processador}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                  <MemoryStick className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Memória RAM</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {notebook.memoriaRam}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                  <HardDrive className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Armazenamento</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {notebook.armazenamento}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Data de Compra</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {new Date(notebook.dataAquisicao).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                  <DollarSign className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Valor de Aquisição</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {valorFormatado}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                  <Barcode className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Número de Série</p>
                    <p className="text-sm font-semibold text-slate-800 font-mono">
                      {notebook.numeroSerie}
                    </p>
                  </div>
                </div>
              </div>

              {notebook.observacoes && (
                <div className="mt-4 p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                  <p className="text-xs font-bold text-slate-600">Observações de TI:</p>
                  <p className="text-xs text-slate-600 mt-1">{notebook.observacoes}</p>
                </div>
              )}
            </div>

            {/* Linha do Tempo / Histórico de Auditoria */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Histórico de Movimentações (Auditoria)
              </h2>

              {historico.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  Nenhuma movimentação registrada para este equipamento ainda.
                </p>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {historico.map((mov) => (
                    <div key={mov.id} className="relative">
                      <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-600" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                            {mov.tipo}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {new Date(mov.data).toLocaleDateString("pt-BR")} às{" "}
                            {new Date(mov.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 mt-1.5 font-medium">
                          {mov.motivo}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
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
            <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Responsável Atual
              </h2>

              {notebook.responsavel ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-700 font-bold text-sm flex items-center justify-center border border-blue-100">
                      {notebook.responsavel.nome
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900">
                        {notebook.responsavel.nome}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">{notebook.responsavel.cargo}</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-800">{notebook.responsavel.departamento}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-800 break-all">{notebook.responsavel.email}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-bold text-slate-800">
                    Disponível no Estoque
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">
                    Este equipamento não possui responsável vinculado no momento.
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
