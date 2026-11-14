"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, X, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Modal de Recuperação de Senha
  const [modalRecuperacaoAberto, setModalRecuperacaoAberto] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState("");
  const [enviandoRecuperacao, setEnviandoRecuperacao] = useState(false);
  const [msgRecuperacaoSucesso, setMsgRecuperacaoSucesso] = useState<string | null>(null);
  const [msgRecuperacaoErro, setMsgRecuperacaoErro] = useState<string | null>(null);

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
        if (error.message?.toLowerCase().includes("email not confirmed")) {
          setErro("Este e-mail ainda não foi confirmado no Supabase. Verifique sua caixa postal ou solicite a recuperação de senha abaixo.");
        } else {
          setErro("Credenciais inválidas. Verifique seu e-mail e senha de acesso.");
        }
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

  const handleSolicitarRecuperacao = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviandoRecuperacao(true);
    setMsgRecuperacaoSucesso(null);
    setMsgRecuperacaoErro(null);

    try {
      const supabase = createClient();
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/login`
          : "https://inventario-ti.vercel.app/login";

      const { error } = await supabase.auth.resetPasswordForEmail(emailRecuperacao.trim().toLowerCase(), {
        redirectTo: redirectUrl,
      });

      if (error) {
        setMsgRecuperacaoErro(error.message || "Erro ao solicitar recuperação de senha.");
      } else {
        setMsgRecuperacaoSucesso(
          `E-mail de recuperação enviado para ${emailRecuperacao.trim()}! Verifique sua caixa de entrada e pasta de spam.`
        );
      }
    } catch {
      setMsgRecuperacaoErro("Falha ao processar solicitação de recuperação.");
    } finally {
      setEnviandoRecuperacao(false);
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

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setEmailRecuperacao(email);
                  setMsgRecuperacaoSucesso(null);
                  setMsgRecuperacaoErro(null);
                  setModalRecuperacaoAberto(true);
                }}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Esqueceu a senha?
              </button>
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

      {/* Modal de Recuperação de Senha */}
      {modalRecuperacaoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#0f142b] rounded-3xl border border-slate-200 dark:border-indigo-950 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-indigo-950/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Recuperação de Senha
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Redefina sua credencial corporativa
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalRecuperacaoAberto(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {msgRecuperacaoErro && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{msgRecuperacaoErro}</span>
              </div>
            )}

            {msgRecuperacaoSucesso ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  <span>{msgRecuperacaoSucesso}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setModalRecuperacaoAberto(false)}
                >
                  Fechar e Voltar ao Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSolicitarRecuperacao} className="space-y-3.5">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Informe o seu e-mail cadastrado. Enviaremos um link seguro do Supabase para você redefinir sua senha.
                </p>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    E-mail Cadastrado
                  </label>
                  <input
                    type="email"
                    required
                    value={emailRecuperacao}
                    onChange={(e) => setEmailRecuperacao(e.target.value)}
                    placeholder="seu-email@dominio.com"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-[#0b0f19] border border-slate-300 dark:border-indigo-950/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-indigo-950/70">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setModalRecuperacaoAberto(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={enviandoRecuperacao || !emailRecuperacao.includes("@")}
                  >
                    {enviandoRecuperacao ? "Enviando..." : "Enviar Link de Recuperação"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
