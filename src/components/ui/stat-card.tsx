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
    bg: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50",
    badge: "text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60",
  },
  blue: {
    bg: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50",
    badge: "text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50",
    badge: "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50",
    badge: "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60",
  },
  slate: {
    bg: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    badge: "text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800",
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
        "rounded-xl border border-slate-200/80 dark:border-indigo-950/70 bg-white dark:bg-[#0f142b] p-5 shadow-xs transition-all hover:shadow-sm hover:border-slate-300 dark:hover:border-indigo-900",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={cn("rounded-lg p-2.5 border", scheme.bg)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </p>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
