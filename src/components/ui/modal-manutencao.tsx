"use client";

import React, { useState, useEffect } from "react";
import { 
  Wrench, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  Calendar, 
  Building2, 
  FileText, 
  Clock, 
  Laptop, 
  Monitor, 
  Smartphone, 
  Headphones, 
  Box,
  AlertTriangle
} from "lucide-react";
import { Button } from "./button";
import { EquipamentoComResponsavel, equipamentosService } from "@/services/equipamentos.service";

interface ModalManutencaoProps {
  aberto: boolean;
  equipamento: EquipamentoComResponsavel | null;
  modo: "enviar" | "concluir";
  onFechar: () => void;
  onSucesso: () => void;
}

export function ModalManutencao({
  aberto,
  equipamento,
  modo,
  onFechar,
  onSucesso,
}: ModalManutencaoProps) {
  const [motivo, setMotivo] = useState("");
  const [prestador, setPrestador] = useState("Assistência Autorizada");
  const [previsaoRetorno, setPrevisaoRetorno] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [observacoesRetorno, setObservacoesRetorno] = useState("");

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (aberto) {
      setErro(null);
      setMotivo("");
      setPrevisaoRetorno("");
      setObservacoes("");
      setObservacoesRetorno("");

      if (equipamento) {
        // Pré-sugere prestador de acordo com a marca
        const marca = (equipamento.marca || "").toLowerCase();
        if (marca.includes("dell")) {
          setPrestador("Suporte Dell ProSupport");
        } else if (marca.includes("apple")) {
          setPrestador("Assistência Autorizada Apple");
        } else if (marca.includes("lenovo")) {
          setPrestador("Suporte Técnico Lenovo");
        } else if (marca.includes("samsung")) {
          setPrestador("Centro de Reparo Samsung");
        } else {
          setPrestador("Laboratório Interno de TI");
        }
      }
    }
  }, [aberto, equipamento, modo]);

  if (!aberto || !equipamento) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErro(null);

    try {
      if (modo === "enviar") {
        if (!motivo.trim()) {
          setErro("Por favor, descreva o defeito ou motivo da manutenção.");
          setSalvando(false);
          return;
        }
        if (!prestador.trim()) {
          setErro("Informe o prestador ou assistência técnica responsável.");
          setSalvando(false);
          return;
        }

        await equipamentosService.enviarParaManutencao(equipamento.id, {
          motivo: motivo.trim(),
          prestador: prestador.trim(),
          previsaoRetorno: previsaoRetorno ? new Date(previsaoRetorno).toLocaleDateString("pt-BR") : undefined,
          observacoes: observacoes.trim() || undefined,
        });
      } else {
        await equipamentosService.concluirManutencao(equipamento.id, {
          observacoesRetorno: observacoesRetorno.trim() || undefined,
        });
      }

      onSucesso();
      onFechar();
    } catch (err: any) {
      console.error(err);
      setErro(err.message || "Falha ao registrar a operação de manutenção.");
    } finally {
      setSalvando(false);
    }
  };

  const getIconeTipo = (tipo: string) => {
    switch (tipo) {
      case "monitor":
        return <Monitor className="w-4 h-4 text-indigo-500" />;
      case "smartphone":
        return <Smartphone className="w-4 h-4 text-emerald-500" />;
      case "periferico":
        return <Headphones className="w-4 h-4 text-amber-500" />;
      default:
        return <Laptop className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden scale-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              modo === "enviar" 
                ? "bg-amber-50 text-amber-700 border-amber-200" 
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}>
              {modo === "enviar" ? (
                <Wrench className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {modo === "enviar" ? "Encaminhar para Manutenção Técnica" : "Concluir Manutenção Técnica"}
              </h2>
              <p className="text-[11px] text-slate-500">
                {modo === "enviar"
                  ? "Envie o ativo para reparo em garantia ou laboratório de TI"
                  : "Finalize o reparo e reintegre o ativo ao estoque disponível"}
              </p>
            </div>
          </div>
          <button
            onClick={onFechar}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Resumo do Equipamento */}
        <div className="px-6 pt-4 pb-2">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                {getIconeTipo(equipamento.tipo)}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  {equipamento.marca} {equipamento.modelo}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  S/N: {equipamento.numeroSerie || "N/A"}
                </p>
              </div>
            </div>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
              equipamento.status === "manutencao"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : equipamento.status === "em_uso"
                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}>
              {equipamento.status === "manutencao" ? "Em Manutenção" : equipamento.status === "em_uso" ? "Em Uso" : "Disponível"}
            </span>
          </div>

          {/* Aviso se o equipamento estiver em uso com um colaborador */}
          {modo === "enviar" && equipamento.responsavel && (
            <div className="mt-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-bold text-[11px] text-amber-900">
                  Ativo sob custódia de {equipamento.responsavel.nome}
                </p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Ao confirmar o envio para manutenção, o equipamento será recolhido e desvinculado da custódia do colaborador automaticamente.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 pt-2">
          {erro && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {modo === "enviar" ? (
            <>
              {/* Defeito / Motivo */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Defeito ou Problema Apresentado <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ex: Tela com listras verticais, falha no teclado, bateria não carrega..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none shadow-2xs text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* Prestador / Assistência Técnica */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Assistência / Prestador <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={prestador}
                      onChange={(e) => setPrestador(e.target.value)}
                      placeholder="Ex: Dell ProSupport, Reparo Apple..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Previsão de Retorno */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Previsão de Retorno (opcional)
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="date"
                      value={previsaoRetorno}
                      onChange={(e) => setPrevisaoRetorno(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Observações / Chamado OS */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Protocolo / Número da O.S. / Observações
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Ex: Chamado Dell #9847291 • Garantia até Dez/2025"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Concluir Manutenção */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-2 text-xs text-emerald-900">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Reintegração ao Estoque Corporativo
                </p>
                <p className="text-[11px] text-emerald-700">
                  Ao confirmar, o status deste equipamento mudará para <strong>Disponível</strong>, pronto para ser atribuído a qualquer colaborador.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Laudo do Reparo / Observações de Retorno (opcional)
                </label>
                <textarea
                  rows={3}
                  value={observacoesRetorno}
                  onChange={(e) => setObservacoesRetorno(e.target.value)}
                  placeholder="Ex: Tela substituída na garantia oficial. Aparelho formatado, testado e 100% operacional."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none shadow-2xs text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </>
          )}

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onFechar}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={salvando}
              className={
                modo === "enviar"
                  ? "bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              }
            >
              {salvando ? (
                "Processando..."
              ) : modo === "enviar" ? (
                <>
                  <Wrench className="w-3.5 h-3.5 mr-1" />
                  Confirmar Envio para Manutenção
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Concluir & Retornar ao Estoque
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
