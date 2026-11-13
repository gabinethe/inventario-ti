"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, Save, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { equipamentosService } from "@/services/equipamentos.service";

export default function NovoResponsavelPage() {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    departamento: "Engenharia de Software",
    cargo: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    try {
      await equipamentosService.criarResponsavel({
        nome: form.nome,
        email: form.email,
        departamento: form.departamento,
        cargo: form.cargo,
      });

      setSalvando(false);
      setSucesso(true);
      setTimeout(() => {
        router.push("/responsaveis");
        router.refresh();
      }, 300);
    } catch (err) {
      setSalvando(false);
      console.error(err);
    }
  };

  return (
    <>
      <Header
        title="Cadastrar Colaborador"
        subtitle="Adicionar novo profissional ao quadro de responsáveis por ativos"
      />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <div>
          <Link
            href="/responsaveis"
            prefetch={true}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para lista de usuários
          </Link>
        </div>

        {sucesso && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 shadow-xs">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <div>
              <p className="font-bold text-sm">Colaborador cadastrado com sucesso!</p>
              <p className="text-xs text-emerald-700">Redirecionando para a lista de usuários...</p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Informações do Colaborador
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Insira os dados profissionais para associação de equipamentos.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="nome"
              name="nome"
              label="Nome Completo *"
              placeholder="Ex: Carlos Eduardo de Oliveira"
              required
              value={form.nome}
              onChange={handleChange}
            />

            <Input
              id="email"
              name="email"
              type="email"
              label="E-mail Corporativo *"
              placeholder="Ex: carlos.oliveira@empresa.com.br"
              required
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="w-full space-y-1.5">
              <label
                htmlFor="departamento"
                className="block text-xs font-semibold text-slate-700"
              >
                Departamento / Setor *
              </label>
              <select
                id="departamento"
                name="departamento"
                value={form.departamento}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
              >
                <option value="Engenharia de Software">Engenharia de Software</option>
                <option value="Design de Produto">Design de Produto</option>
                <option value="Recursos Humanos">Recursos Humanos</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Vendas & Comercial">Vendas & Comercial</option>
                <option value="Marketing">Marketing</option>
                <option value="Tecnologia da Informação">Tecnologia da Informação (TI)</option>
                <option value="Operações & Jurídico">Operações & Jurídico</option>
              </select>
            </div>

            <Input
              id="cargo"
              name="cargo"
              label="Cargo / Função *"
              placeholder="Ex: Engenheiro de Dados Pleno"
              required
              value={form.cargo}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Link href="/responsaveis">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={salvando}>
              <Save className="w-4 h-4" />
              {salvando ? "Salvando..." : "Salvar Colaborador"}
            </Button>
          </div>
        </form>
      </main>
    </>
  );
}
