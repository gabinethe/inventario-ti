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
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: CheckCircle2,
  },
  em_uso: {
    label: "Em Uso",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: UserCheck,
  },
  manutencao: {
    label: "Em Manutenção",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: Wrench,
  },
  descartado: {
    label: "Baixa / Descartado",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    icon: AlertCircle,
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.disponivel;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-2xs",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}
