"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Laptop, Save, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusEquipamento } from "@/types";

export default function NovoNotebookPage() {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const [form, setForm] = useState({
    patrimonio: "",
    marca: "Dell",
    modelo: "",
    numeroSerie: "",
    status: "disponivel" as StatusEquipamento,
    processador: "",
    memoriaRam: "16 GB DDR4",
    armazenamento: "SSD 512 GB NVMe",
    dataAquisicao: "2024-11-01",
    valorAquisicao: "",
    observacoes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    // Simulação de salvamento
    setTimeout(() => {
      setSalvando(false);
      setSucesso(true);
      setTimeout(() => {
        router.push("/equipamentos");
      }, 1200);
    }, 600);
  };

  return (
    <>
      <Header
        title="Cadastrar Equipamento"
        subtitle="Entrada de novo ativo no inventário da empresa"
      />

      <main className="flex-1 p-8 space-y-6 max-w-4xl">
        <div>
          <Link
            href="/equipamentos"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para lista de equipamentos
          </Link>
        </div>

        {sucesso && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 shadow-xs">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <div>
              <p className="font-bold text-sm">Equipamento cadastrado com sucesso!</p>
              <p className="text-xs text-emerald-700">Redirecionando para a lista de equipamentos...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Identificação do Equipamento
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Insira as informações de patrimônio e modelo do fabricante.
              </p>
            </div>
          </div>

          {/* Dados Principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              id="patrimonio"
              name="patrimonio"
              label="Código de Patrimônio *"
              placeholder="Ex: PAT-00106"
              required
              value={form.patrimonio}
              onChange={handleChange}
            />

            <div className="w-full space-y-1.5">
              <label htmlFor="marca" className="block text-xs font-semibold text-slate-700">
                Marca / Fabricante *
              </label>
              <select
                id="marca"
                name="marca"
                value={form.marca}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
              >
                <option value="Dell">Dell</option>
                <option value="Apple">Apple</option>
                <option value="Lenovo">Lenovo</option>
                <option value="HP">HP</option>
                <option value="Samsung">Samsung</option>
                <option value="Asus">Asus</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <Input
              id="modelo"
              name="modelo"
              label="Modelo do Equipamento *"
              placeholder="Ex: Latitude 3420 / MacBook Pro"
              required
              value={form.modelo}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="numeroSerie"
              name="numeroSerie"
              label="Número de Série (S/N) *"
              placeholder="Ex: CN0897X12"
              required
              value={form.numeroSerie}
              onChange={handleChange}
            />

            <div className="w-full space-y-1.5">
              <label htmlFor="status" className="block text-xs font-semibold text-slate-700">
                Status Inicial *
              </label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
              >
                <option value="disponivel">Disponível no Estoque</option>
                <option value="em_uso">Em Uso com Colaborador</option>
                <option value="manutencao">Em Manutenção Técnica</option>
              </select>
            </div>
          </div>

          {/* Especificações de Hardware */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Especificações de Hardware (Notebook)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                id="processador"
                name="processador"
                label="Processador *"
                placeholder="Ex: Intel Core i5 12ª Ger / Apple M2"
                required
                value={form.processador}
                onChange={handleChange}
              />
              <Input
                id="memoriaRam"
                name="memoriaRam"
                label="Memória RAM *"
                placeholder="Ex: 16 GB DDR4"
                required
                value={form.memoriaRam}
                onChange={handleChange}
              />
              <Input
                id="armazenamento"
                name="armazenamento"
                label="Armazenamento *"
                placeholder="Ex: SSD 512 GB NVMe"
                required
                value={form.armazenamento}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Dados Financeiros e Compra */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Aquisição e Informações Adicionais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="dataAquisicao"
                name="dataAquisicao"
                type="date"
                label="Data de Compra *"
                required
                value={form.dataAquisicao}
                onChange={handleChange}
              />
              <Input
                id="valorAquisicao"
                name="valorAquisicao"
                type="number"
                step="0.01"
                label="Valor de Aquisição (R$)"
                placeholder="Ex: 4500.00"
                value={form.valorAquisicao}
                onChange={handleChange}
              />
            </div>

            <div className="mt-4 space-y-1.5">
              <label htmlFor="observacoes" className="block text-xs font-semibold text-slate-700">
                Observações de TI
              </label>
              <textarea
                id="observacoes"
                name="observacoes"
                rows={3}
                placeholder="Detalhes adicionais, acessórios inclusos, estado físico, etc."
                value={form.observacoes}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 shadow-2xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Link href="/equipamentos">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={salvando}>
              <Save className="w-4 h-4" />
              {salvando ? "Salvando..." : "Salvar Equipamento"}
            </Button>
          </div>
        </form>
      </main>
    </>
  );
}
