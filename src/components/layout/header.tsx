import React from "react";
import { Bell, Sparkles, Search } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-200/80 bg-white px-8 flex items-center justify-between sticky top-0 z-10 shadow-xs">
      <div>
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-slate-500 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Notificações */}
        <button
          type="button"
          aria-label="Notificações"
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* Perfil do Usuário */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            GC
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-slate-800">
              Gabriela Chagas
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              Administradora de TI
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
