"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // Se as chaves do Supabase ainda não foram configuradas, simula login local para testes
    if (!supabaseUrl || supabaseUrl.includes("seu-projeto")) {
      setTimeout(() => {
        setCarregando(false);
        router.push("/");
      }, 600);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErro("Credenciais inválidas. Verifique seu e-mail e senha de administrador.");
        setCarregando(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setErro("Falha ao comunicar com o servidor de autenticação.");
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-[#070913] transition-colors">
      <div className="w-full max-w-md space-y-6">
        {/* Logotipo e Cabeçalho */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <div className="relative w-48 sm:w-56 h-28 flex items-center justify-center p-2 rounded-2xl bg-white/50 dark:bg-indigo-950/20 backdrop-blur-xs border border-slate-200/60 dark:border-indigo-900/40 shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="TI Inventory Logo"
              className="w-full h-full object-contain filter drop-shadow-sm"
            />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              TI Inventory
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Painel Corporativo • Gestão e Governança de Hardware
            </p>
          </div>
        </div>

        {/* Card do Formulário */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-indigo-950/70 bg-white dark:bg-[#0f142b] p-8 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Acesso ao Sistema
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Entre com suas credenciais de administrador para continuar.
            </p>
          </div>

          {erro && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                E-mail de Administrador
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu-email@dominio.com"
                  className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-[#0b0f19] border border-slate-300 dark:border-indigo-950/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 shadow-2xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-[#0b0f19] border border-slate-300 dark:border-indigo-950/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 shadow-2xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" disabled={carregando}>
              {carregando ? (
                "Verificando..."
              ) : (
                <>
                  Entrar no Sistema
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-100 dark:border-indigo-950/70 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Autenticação Segura (Supabase)</span>
            </div>
            <span>v0.2 MVP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
