"use client";

import React, { useState, useEffect } from "react";
import { UserCheck, Undo2, X, AlertCircle, ArrowRight, Laptop } from "lucide-react";
import { Button } from "./button";
import { EquipamentoComResponsavel, equipamentosService } from "@/services/equipamentos.service";
import { Responsavel } from "@/types";

interface ModalAtribuicaoProps {
  aberto: boolean;
  equipamento: EquipamentoComResponsavel | null;
  modo: "atribuir" | "devolver";
  onFechar: () => void;
  onSucesso: () => void;
}

export function ModalAtribuicao({
  aberto,
  equipamento,
  modo,
  onFechar,
  onSucesso,
}: ModalAtribuicaoProps) {
  const [colaboradores, setColaboradores] = useState<Responsavel[]>([]);
  const [responsavelId, setResponsavelId] = useState("");
  const [numeroSerieUnidade, setNumeroSerieUnidade] = useState("");
  const [motivo, setMotivo] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (aberto) {
      setErro(null);
      setMotivo("");
      setNumeroSerieUnidade("");
      if (modo === "atribuir") {
        equipamentosService.listarResponsaveis().then((lista) => {
          setColaboradores(lista);
          if (lista.length > 0) setResponsavelId(lista[0].id);
        });
      }
    }
  }, [aberto, modo]);

  if (!aberto || !equipamento) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErro(null);

    try {
      if (modo === "atribuir") {
        if (!responsavelId) {
          setErro("Por favor, selecione um colaborador.");
          setSalvando(false);
          return;
        }
        await equipamentosService.atribuirEquipamento(
          equipamento.id,
          responsavelId,
          motivo || undefined,
          numeroSerieUnidade || undefined
        );
      } else {
        await equipamentosService.devolverEquipamento(
          equipamento.id,
          motivo || undefined
        );
      }

      onSucesso();
      onFechar();
    } catch (err) {
      console.error(err);
      setErro("Falha ao registrar a operação. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0f142b] border border-slate-200/80 dark:border-indigo-950 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center border ${
                modo === "atribuir"
                  ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50"
                  : "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50"
              }`}
            >
              {modo === "atribuir" ? (
                <UserCheck className="h-5 w-5" />
              ) : (
                <Undo2 className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {modo === "atribuir" ? "Atribuir Equipamento" : "Devolver ao Estoque"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {modo === "atribuir"
                  ? "Vincular equipamento sob a posse de um colaborador"
                  : "Retornar ativo sob custódia para disponibilidade de TI"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onFechar}
            disabled={salvando}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-indigo-950/60 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Resumo do Equipamento */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0a0e20] border border-slate-200/80 dark:border-indigo-950/70 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white dark:bg-[#0f142b] border border-slate-200 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400">
            <Laptop className="h-4 w-4" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-slate-900 dark:text-white">
              {equipamento.marca} {equipamento.modelo}
            </p>
            <div className="text-slate-500 dark:text-slate-400 mt-0.5">
              {equipamento.quantidadeDisponivel !== undefined ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  Estoque: {equipamento.quantidadeDisponivel} unid. disponíveis
                </span>
              ) : (
                <span className="font-mono text-xs text-slate-400 dark:text-slate-500">S/N: {equipamento.numeroSerie}</span>
              )}
            </div>
          </div>
        </div>

        {erro && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {modo === "atribuir" ? (
            <>
              <div className="space-y-1.5">
                <label htmlFor="responsavel" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Selecione o Colaborador de Destino *
                </label>
                <select
                  id="responsavel"
                  value={responsavelId}
                  onChange={(e) => setResponsavelId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 dark:border-indigo-900/60 bg-white dark:bg-[#0a0e20] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white shadow-2xs focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
                >
                  {colaboradores.map((colab) => (
                    <option key={colab.id} value={colab.id} className="dark:bg-[#0f142b]">
                      {colab.nome} — {colab.departamento} ({colab.cargo})
                    </option>
                  ))}
                </select>
              </div>

              {equipamento.tipo === "periferico" && (
                <div className="space-y-1.5 p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                  <label htmlFor="numeroSerieUnidade" className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Número de Série da Unidade Entregue (Opcional)
                  </label>
                  <input
                    id="numeroSerieUnidade"
                    type="text"
                    value={numeroSerieUnidade}
                    onChange={(e) => setNumeroSerieUnidade(e.target.value)}
                    placeholder="Ex: SN-82910X (ou deixe em branco para gerar automático)"
                    className="w-full rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-[#0a0e20] px-3.5 py-2 text-xs text-slate-900 dark:text-white shadow-2xs focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ao confirmar, 1 unidade sairá do estoque disponível e será vinculada com este número de série ao colaborador.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200">
              <p className="font-semibold">Responsável atual:</p>
              <p className="text-amber-800 dark:text-amber-300 mt-0.5">
                {equipamento.responsavel?.nome || "Colaborador vinculado"} ({equipamento.responsavel?.departamento})
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-2">
                O equipamento será desvinculado e seu status passará a ser <strong>Disponível no Estoque</strong>.
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="motivo" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Motivo ou Observações da Movimentação (Opcional)
            </label>
            <input
              id="motivo"
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder={
                modo === "atribuir"
                  ? "Ex: Kit de admissão / Onboarding de desenvolvedor"
                  : "Ex: Troca preventiva de equipamento / Desligamento"
              }
              className="w-full rounded-xl border border-slate-300 dark:border-indigo-900/60 bg-white dark:bg-[#0a0e20] px-3.5 py-2 text-sm text-slate-900 dark:text-white shadow-2xs focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/15 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-indigo-950/80">
            <Button type="button" variant="outline" onClick={onFechar} disabled={salvando}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={salvando}
              className={
                modo === "atribuir"
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-amber-600 hover:bg-amber-700 text-white"
              }
            >
              {salvando ? (
                "Salvando..."
              ) : modo === "atribuir" ? (
                <>
                  Confirmar Atribuição
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Confirmar Devolução
                  <Undo2 className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
