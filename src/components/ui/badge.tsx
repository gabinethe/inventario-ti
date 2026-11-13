import React from "react";
import { StatusEquipamento } from "@/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, UserCheck, Wrench, AlertCircle } from "lucide-react";

interface StatusBadgeProps {
  status: StatusEquipamento;
  className?: string;
}

const statusConfig: Record<
  StatusEquipamento,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  disponivel: {
    label: "Disponível",
    bg: "bg-emerald-100/90 dark:bg-emerald-950/80",
    text: "text-emerald-900 dark:text-emerald-300",
    border: "border-emerald-300 dark:border-emerald-700/80",
    icon: CheckCircle2,
  },
  em_uso: {
    label: "Em Uso",
    bg: "bg-indigo-100 dark:bg-indigo-950/80",
    text: "text-indigo-950 dark:text-indigo-200",
    border: "border-indigo-300 dark:border-indigo-700/80",
    icon: UserCheck,
  },
  manutencao: {
    label: "Em Manutenção",
    bg: "bg-amber-100 dark:bg-amber-950/80",
    text: "text-amber-950 dark:text-amber-300",
    border: "border-amber-300 dark:border-amber-700/80",
    icon: Wrench,
  },
  descartado: {
    label: "Baixa / Descartado",
    bg: "bg-slate-200 dark:bg-slate-800/80",
    text: "text-slate-800 dark:text-slate-200",
    border: "border-slate-300 dark:border-slate-700",
    icon: AlertCircle,
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.disponivel;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-2xs",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      {config.label}
    </span>
  );
}
