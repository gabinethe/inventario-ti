"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, User, LogOut, Check, X, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter();
  const [modalAberto, setModalAberto] = useState(false);
  const [nome, setNome] = useState("Gabriela Chagas");
  const [cargo, setCargo] = useState("Administradora de TI");
  const [email, setEmail] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Carrega os dados reais do usuário logado no Supabase
  useEffect(() => {
    async function carregarPerfil() {
      try {
        // Tenta ler do localStorage primeiro para carregamento instantâneo
        const salvoNome = localStorage.getItem("user_perfil_nome");
        const salvoCargo = localStorage.getItem("user_perfil_cargo");
        if (salvoNome) setNome(salvoNome);
        if (salvoCargo) setCargo(salvoCargo);

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setEmail(user.email || "");
          const metadataNome = user.user_metadata?.nome || user.user_metadata?.full_name;
          const metadataCargo = user.user_metadata?.cargo;

          if (metadataNome && !salvoNome) {
            setNome(metadataNome);
            localStorage.setItem("user_perfil_nome", metadataNome);
          } else if (!metadataNome && !salvoNome && user.email) {
            const prefixo = user.email.split("@")[0].replace(".", " ");
            const capitalizado = prefixo
              .split(" ")
              .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
              .join(" ");
            setNome(capitalizado);
          }

          if (metadataCargo && !salvoCargo) {
            setCargo(metadataCargo);
            localStorage.setItem("user_perfil_cargo", metadataCargo);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados do usuário:", err);
      }
    }

    carregarPerfil();
  }, []);

  // Iniciais do nome para o avatar
  const iniciais = nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("") || "AD";

  const handleSalvarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setSucesso(false);

    try {
      localStorage.setItem("user_perfil_nome", nome);
      localStorage.setItem("user_perfil_cargo", cargo);

      const supabase = createClient();
      await supabase.auth.updateUser({
        data: {
          nome: nome,
          cargo: cargo,
        },
      });

      setSucesso(true);
      setTimeout(() => {
        setSalvando(false);
        setSucesso(false);
        setModalAberto(false);
      }, 700);
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      setSalvando(false);
    }
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Erro ao deslogar:", err);
      router.push("/login");
    }
  };

  return (
    <>
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
            className="relative rounded-xl p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/80 transition-colors cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white" />
          </button>

          <div className="h-6 w-px bg-slate-200" />

          {/* Perfil do Usuário Interativo */}
          <button
            type="button"
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100/80 transition-colors text-left cursor-pointer group"
            title="Clique para editar seu perfil"
          >
            <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              {iniciais}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                {nome}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                {cargo}
              </p>
            </div>
          </button>
        </div>
      </header>

      {/* Modal de Edição de Perfil */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                  {iniciais}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Meu Perfil de Administrador
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Personalize suas informações de exibição
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarPerfil} className="space-y-4">
              {email && (
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-500">
                    E-mail da Conta (Supabase)
                  </label>
                  <p className="text-xs font-mono bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-700">
                    {email}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Nome Completo
                </label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Gabriela Chagas"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Cargo / Função
                </label>
                <Input
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  placeholder="Ex: Administradora de TI"
                  required
                />
              </div>

              {sucesso && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Perfil atualizado com sucesso!</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 p-2 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sair do Sistema
                </button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalAberto(false)}
                  >
                    Fechar
                  </Button>
                  <Button type="submit" disabled={salvando}>
                    {salvando ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
