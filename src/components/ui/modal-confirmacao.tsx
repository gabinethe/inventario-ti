"use client";

import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "./button";

interface ModalConfirmacaoProps {
  aberto: boolean;
  titulo: string;
  descricao: string;
  itemIdentificador?: string;
  onFechar: () => void;
  onConfirmar: () => Promise<void> | void;
  processando?: boolean;
}

export function ModalConfirmacao({
  aberto,
  titulo,
  descricao,
  itemIdentificador,
  onFechar,
  onConfirmar,
  processando = false,
}: ModalConfirmacaoProps) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0f142b] border border-slate-200/80 dark:border-indigo-950 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-rose-100/80 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-900/50">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {titulo}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Confirmação de Segurança
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onFechar}
            disabled={processando}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-indigo-950/60 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p>{descricao}</p>
          {itemIdentificador && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0a0e20] border border-slate-200 dark:border-indigo-950/70 font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 break-all">
              {itemIdentificador}
            </div>
          )}
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
            ⚠️ Esta ação é permanente e removerá o registro do sistema.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-indigo-950/70">
          <Button
            type="button"
            variant="outline"
            onClick={onFechar}
            disabled={processando}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirmar}
            disabled={processando}
            className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {processando ? "Excluindo..." : "Sim, excluir"}
          </Button>
        </div>
      </div>
    </div>
  );
}
