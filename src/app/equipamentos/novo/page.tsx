"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, CheckCircle2, Boxes, Laptop, Monitor, Smartphone, Headphones } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusEquipamento, TipoEquipamento, Responsavel } from "@/types";
import { equipamentosService } from "@/services/equipamentos.service";

const MARCAS_POR_TIPO = {
  notebook: ["Dell", "Apple", "Lenovo", "HP", "Samsung", "Asus", "Acer", "Positivo", "Outra"],
  monitor: ["Dell", "LG", "Samsung", "AOC", "Philips", "BenQ", "Asus", "Outra"],
  smartphone: ["Apple", "Samsung", "Motorola", "Xiaomi", "Google", "Outra"],
  periferico: ["Logitech", "Dell", "Redragon", "HyperX", "Razer", "Microsoft", "JBL", "Outra"],
  outro: ["Dell", "HP", "Outra"],
};

export default function NovoEquipamentoPage() {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [colaboradores, setColaboradores] = useState<Responsavel[]>([]);

  const [tipo, setTipo] = useState<TipoEquipamento>("notebook");
  const [subtipo, setSubtipo] = useState("mouse");

  const [form, setForm] = useState({
    patrimonio: "",
    marca: "Dell",
    modelo: "",
    numeroSerie: "",
    status: "disponivel" as StatusEquipamento,
    processador: "",
    memoriaRam: "",
    armazenamento: "",
    especificacoes: "",
    responsavelId: "",
    dataAquisicao: "2024-11-01",
    valorAquisicao: "",
    observacoes: "",
  });

  useEffect(() => {
    equipamentosService.listarResponsaveis().then((lista) => {
      setColaboradores(lista);
    });
  }, []);

  // Ao mudar o tipo, ajusta a primeira marca sugerida
  const handleTipoChange = (novoTipo: TipoEquipamento) => {
    setTipo(novoTipo);
    const primeiraMarca = MARCAS_POR_TIPO[novoTipo][0];
    setForm((prev) => ({ ...prev, marca: primeiraMarca }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    try {
      const statusFinal: StatusEquipamento = form.responsavelId ? "em_uso" : form.status;

      await equipamentosService.criar({
        patrimonio: form.patrimonio,
        tipo,
        subtipo: tipo === "periferico" ? subtipo : undefined,
        marca: form.marca,
        modelo: form.modelo,
        numeroSerie: form.numeroSerie,
        status: statusFinal,
        processador: tipo === "notebook" ? form.processador : undefined,
        memoriaRam: tipo === "notebook" ? form.memoriaRam : undefined,
        armazenamento: tipo === "notebook" || tipo === "smartphone" ? form.armazenamento : undefined,
        especificacoes: form.especificacoes || undefined,
        responsavelId: form.responsavelId || undefined,
        dataAquisicao: form.dataAquisicao,
        valorAquisicao: form.valorAquisicao ? Number(form.valorAquisicao) : undefined,
        observacoes: form.observacoes,
      });

      setSalvando(false);
      setSucesso(true);
      setTimeout(() => {
        router.push("/equipamentos");
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
        title="Cadastrar Equipamento"
        subtitle="Entrada de notebook, monitor, smartphone ou periférico no inventário"
      />

      <main className="flex-1 p-8 space-y-6 max-w-4xl">
        <div>
          <Link
            href="/equipamentos"
            prefetch={true}
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
              <p className="font-bold text-sm">Ativo cadastrado com sucesso!</p>
              <p className="text-xs text-emerald-700">Atualizando inventário e redirecionando...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
          {/* 1. Seleção Visual do Tipo de Equipamento */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              1. Selecione a Categoria do Ativo *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => handleTipoChange("notebook")}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                  tipo === "notebook"
                    ? "bg-indigo-50/80 border-indigo-600 text-indigo-900 ring-2 ring-indigo-600/15"
                    : "border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <Laptop className={`w-5 h-5 ${tipo === "notebook" ? "text-indigo-600" : "text-slate-400"}`} />
                <span className="text-xs font-bold">Notebook</span>
              </button>

              <button
                type="button"
                onClick={() => handleTipoChange("monitor")}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                  tipo === "monitor"
                    ? "bg-indigo-50/80 border-indigo-600 text-indigo-900 ring-2 ring-indigo-600/15"
                    : "border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <Monitor className={`w-5 h-5 ${tipo === "monitor" ? "text-indigo-600" : "text-slate-400"}`} />
                <span className="text-xs font-bold">Monitor</span>
              </button>

              <button
                type="button"
                onClick={() => handleTipoChange("smartphone")}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                  tipo === "smartphone"
                    ? "bg-indigo-50/80 border-indigo-600 text-indigo-900 ring-2 ring-indigo-600/15"
                    : "border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <Smartphone className={`w-5 h-5 ${tipo === "smartphone" ? "text-indigo-600" : "text-slate-400"}`} />
                <span className="text-xs font-bold">Celular</span>
              </button>

              <button
                type="button"
                onClick={() => handleTipoChange("periferico")}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                  tipo === "periferico"
                    ? "bg-indigo-50/80 border-indigo-600 text-indigo-900 ring-2 ring-indigo-600/15"
                    : "border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <Headphones className={`w-5 h-5 ${tipo === "periferico" ? "text-indigo-600" : "text-slate-400"}`} />
                <span className="text-xs font-bold">Periférico</span>
              </button>
            </div>
          </div>

          {/* Subtipo de Periférico se aplicável */}
          {tipo === "periferico" && (
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1.5 animate-in fade-in duration-150">
              <label htmlFor="subtipo" className="block text-xs font-semibold text-indigo-950">
                Tipo de Periférico / Acessório *
              </label>
              <select
                id="subtipo"
                value={subtipo}
                onChange={(e) => setSubtipo(e.target.value)}
                className="w-full rounded-xl border border-indigo-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
              >
                <option value="headset">Headset / Fone de Ouvido</option>
                <option value="mouse">Mouse</option>
                <option value="teclado">Teclado</option>
                <option value="webcam">Webcam</option>
                <option value="hub_usb">Hub USB-C / Dock Station</option>
                <option value="carregador">Carregador / Fonte</option>
                <option value="outro">Outro Acessório</option>
              </select>
            </div>
          )}

          {/* 2. Dados de Identificação */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              2. Identificação do Fabricante & Patrimônio
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                id="patrimonio"
                name="patrimonio"
                label="Código de Patrimônio *"
                placeholder="Ex: PAT-00108"
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
                >
                  {MARCAS_POR_TIPO[tipo].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                id="modelo"
                name="modelo"
                label="Modelo do Ativo *"
                placeholder={
                  tipo === "notebook"
                    ? "Ex: Latitude 3420"
                    : tipo === "monitor"
                    ? "Ex: UltraSharp 27 4K"
                    : tipo === "smartphone"
                    ? "Ex: iPhone 14 128GB"
                    : "Ex: MX Master 3S"
                }
                required
                value={form.modelo}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="numeroSerie"
                name="numeroSerie"
                label="Número de Série (S/N) ou IMEI *"
                placeholder="Ex: CN0897X12 / S/N fabricante"
                required
                value={form.numeroSerie}
                onChange={handleChange}
              />

              <div className="w-full space-y-1.5">
                <label htmlFor="responsavelId" className="block text-xs font-semibold text-slate-700">
                  Atribuir a um Colaborador Imediatamente? (Opcional)
                </label>
                <select
                  id="responsavelId"
                  name="responsavelId"
                  value={form.responsavelId}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
                >
                  <option value="">Não (Manter Disponível no Estoque de TI)</option>
                  {colaboradores.map((colab) => (
                    <option key={colab.id} value={colab.id}>
                      {colab.nome} — {colab.departamento} ({colab.cargo})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 3. Especificações Técnicas Dinâmicas */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              3. Especificações Técnicas ({tipo.toUpperCase()})
            </h3>

            {tipo === "notebook" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  id="processador"
                  name="processador"
                  label="Processador *"
                  placeholder="Ex: Intel Core i7 12ª Ger / M2"
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
            ) : tipo === "smartphone" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="armazenamento"
                  name="armazenamento"
                  label="Armazenamento Interno *"
                  placeholder="Ex: 128 GB / 256 GB"
                  required
                  value={form.armazenamento}
                  onChange={handleChange}
                />
                <Input
                  id="especificacoes"
                  name="especificacoes"
                  label="Operadora / Chip Corporativo (Opcional)"
                  placeholder="Ex: Vivo Empresas 5G - Linha (11) 98765-4321"
                  value={form.especificacoes}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <Input
                  id="especificacoes"
                  name="especificacoes"
                  label={tipo === "monitor" ? "Tamanho, Resolução e Entradas *" : "Conexão e Detalhes do Periférico *"}
                  placeholder={
                    tipo === "monitor"
                      ? "Ex: 27 polegadas 4K IPS • HDMI, DisplayPort e USB-C com carregamento 90W"
                      : "Ex: Conexão Sem Fio Bluetooth / 2.4 GHz • Cancelamento de ruído"
                  }
                  required
                  value={form.especificacoes}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          {/* 4. Aquisição e Detalhes Financeiros */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              4. Dados de Aquisição
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
                placeholder="Detalhes adicionais, acessórios inclusos, nota fiscal, etc."
                value={form.observacoes}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/15 shadow-2xs"
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
              {salvando ? "Salvando..." : "Salvar no Inventário"}
            </Button>
          </div>
        </form>
      </main>
    </>
  );
}
