import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color?: "blue" | "indigo" | "emerald" | "amber" | "slate";
  className?: string;
}

const colorMap = {
  indigo: {
    bg: "bg-indigo-50 text-indigo-600 border-indigo-100",
    badge: "text-indigo-700 bg-indigo-50",
  },
  blue: {
    bg: "bg-indigo-50 text-indigo-600 border-indigo-100",
    badge: "text-indigo-700 bg-indigo-50",
  },
  emerald: {
    bg: "bg-emerald-50 text-emerald-600 border-emerald-100",
    badge: "text-emerald-700 bg-emerald-50",
  },
  amber: {
    bg: "bg-amber-50 text-amber-600 border-amber-100",
    badge: "text-amber-700 bg-amber-50",
  },
  slate: {
    bg: "bg-slate-100 text-slate-700 border-slate-200",
    badge: "text-slate-700 bg-slate-100",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
  className,
}: StatCardProps) {
  const scheme = colorMap[color];

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-sm hover:border-slate-300",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={cn("rounded-lg p-2.5 border", scheme.bg)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </p>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-500 font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
