"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Laptop, 
  Monitor, 
  Smartphone, 
  Headphones, 
  Info 
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusEquipamento, TipoEquipamento, Responsavel, Equipamento } from "@/types";
import { equipamentosService } from "@/services/equipamentos.service";

const MARCAS_POR_TIPO: Record<TipoEquipamento, string[]> = {
  notebook: ["Dell", "Apple", "Lenovo", "HP", "Samsung", "Asus", "Acer", "Positivo", "Outra"],
  monitor: ["Dell", "LG", "Samsung", "AOC", "Philips", "BenQ", "Asus", "Outra"],
  smartphone: ["Apple", "Samsung", "Motorola", "Xiaomi", "Google", "Outra"],
  periferico: ["Logitech", "Dell", "Redragon", "HyperX", "Razer", "Microsoft", "JBL", "Outra"],
  outro: ["Dell", "HP", "Outra"],
};

function NovoEquipamentoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tipoParam = searchParams?.get("tipo") as TipoEquipamento | null;

  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [erroSerial, setErroSerial] = useState<string | null>(null);

  const [colaboradores, setColaboradores] = useState<Responsavel[]>([]);
  const [equipamentosExistentes, setEquipamentosExistentes] = useState<Equipamento[]>([]);

  // Inicializa a categoria de acordo com a rota de onde o usuário veio
  const categoriaInicial: TipoEquipamento = 
    tipoParam && MARCAS_POR_TIPO[tipoParam] ? tipoParam : "notebook";

  const [tipo, setTipo] = useState<TipoEquipamento>(categoriaInicial);
  const [subtipo, setSubtipo] = useState("mouse");
  const [quantidadeEstoque, setQuantidadeEstoque] = useState(1);

  const [form, setForm] = useState({
    patrimonio: "",
    marca: MARCAS_POR_TIPO[categoriaInicial][0] || "Dell",
    modelo: "",
    numeroSerie: "",
    status: "disponivel" as StatusEquipamento,
    processador: "",
    memoriaRam: "",
    armazenamento: "",
    especificacoes: "",
    responsavelId: "",
    dataAquisicao: new Date().toISOString().split("T")[0],
    valorAquisicao: "",
    observacoes: "",
  });

  // Sincroniza com parâmetros de URL caso mude
  useEffect(() => {
    if (tipoParam && MARCAS_POR_TIPO[tipoParam]) {
      handleTipoChange(tipoParam);
    }
  }, [tipoParam]);

  // Carrega lista de responsáveis e equipamentos para validação de unicidade
  useEffect(() => {
    Promise.all([
      equipamentosService.listarResponsaveis(),
      equipamentosService.listar(),
    ]).then(([resps, eqs]) => {
      setColaboradores(resps);
      setEquipamentosExistentes(eqs);
    });
  }, []);

  // Ao alterar a categoria
  const handleTipoChange = (novoTipo: TipoEquipamento) => {
    setTipo(novoTipo);
    setErro(null);
    setErroSerial(null);
    const primeiraMarca = MARCAS_POR_TIPO[novoTipo][0];
    setForm((prev) => ({
      ...prev,
      marca: primeiraMarca,
      modelo: "",
      numeroSerie: "",
      especificacoes: "",
      processador: "",
      memoriaRam: "",
      armazenamento: "",
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Validação de unicidade em tempo real ao digitar o número de série
    if (name === "numeroSerie") {
      validarSerialEmTempoReal(value);
    }
  };

  const validarSerialEmTempoReal = (serialDigitado: string) => {
    const serialLimpo = serialDigitado.trim().toLowerCase();
    if (!serialLimpo || serialLimpo === "s/n" || serialLimpo === "n/a" || serialLimpo.startsWith("lote estoque")) {
      setErroSerial(null);
      return;
    }

    const duplicado = equipamentosExistentes.find(
      (eq) => eq.numeroSerie && eq.numeroSerie.trim().toLowerCase() === serialLimpo
    );

    if (duplicado) {
      setErroSerial(
        `Este número de série já está cadastrado no sistema para o equipamento: ${duplicado.marca} ${duplicado.modelo}. Cada ativo deve possuir um serial number exclusivo.`
      );
    } else {
      setErroSerial(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    // 1. Validação de Unicidade de Número de Série
    const serialLimpo = form.numeroSerie.trim().toLowerCase();
    if (serialLimpo && serialLimpo !== "s/n" && serialLimpo !== "n/a" && !serialLimpo.startsWith("lote estoque")) {
      const duplicado = equipamentosExistentes.find(
        (eq) => eq.numeroSerie && eq.numeroSerie.trim().toLowerCase() === serialLimpo
      );
      if (duplicado) {
        setErro(
          `Impossível cadastrar: Já existe um equipamento cadastrado com o número de série '${form.numeroSerie.trim()}' (${duplicado.marca} ${duplicado.modelo}). Cada ativo deve ter um identificador exclusivo.`
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    // 2. Validação Estrita de Campos Obrigatórios
    const pendencias: string[] = [];

    if (!form.marca.trim()) pendencias.push("Marca / Fabricante");
    if (!form.modelo.trim()) pendencias.push("Modelo do Ativo");

    if (tipo === "notebook") {
      if (!form.numeroSerie.trim()) pendencias.push("Número de Série (S/N)");
      if (!form.processador.trim()) pendencias.push("Processador");
      if (!form.memoriaRam.trim()) pendencias.push("Memória RAM");
      if (!form.armazenamento.trim()) pendencias.push("Armazenamento (SSD)");
    } else if (tipo === "monitor") {
      if (!form.numeroSerie.trim()) pendencias.push("Número de Série (S/N)");
      if (!form.especificacoes.trim()) pendencias.push("Tamanho, Resolução e Entradas");
    } else if (tipo === "smartphone") {
      if (!form.numeroSerie.trim()) pendencias.push("Número de Série (S/N ou IMEI)");
      if (!form.armazenamento.trim()) pendencias.push("Armazenamento Interno");
    } else if (tipo === "periferico") {
      if (!subtipo.trim()) pendencias.push("Tipo de Periférico / Acessório");
      if (!quantidadeEstoque || quantidadeEstoque < 1) pendencias.push("Quantidade em Estoque (mínimo 1)");
      if (!form.especificacoes.trim()) pendencias.push("Detalhes de Conexão / Especificações");
    }

    if (!form.dataAquisicao) pendencias.push("Data de Compra / Aquisição");

    if (pendencias.length > 0) {
      setErro(
        `Preenchimento obrigatório incompleto. Por favor, informe: ${pendencias.join(", ")}.`
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSalvando(true);

    try {
      const statusFinal: StatusEquipamento = form.responsavelId ? "em_uso" : form.status;

      await equipamentosService.criar({
        tipo,
        subtipo: tipo === "periferico" ? subtipo : undefined,
        marca: form.marca.trim(),
        modelo: form.modelo.trim(),
        numeroSerie: form.numeroSerie.trim() || (tipo === "periferico" ? `Lote Estoque (${quantidadeEstoque} un)` : "S/N"),
        status: statusFinal,
        quantidadeTotal: tipo === "periferico" ? quantidadeEstoque : 1,
        quantidadeDisponivel: tipo === "periferico" ? (form.responsavelId ? quantidadeEstoque - 1 : quantidadeEstoque) : 1,
        processador: tipo === "notebook" ? form.processador.trim() : undefined,
        memoriaRam: tipo === "notebook" ? form.memoriaRam.trim() : undefined,
        armazenamento: tipo === "notebook" || tipo === "smartphone" ? form.armazenamento.trim() : undefined,
        especificacoes: form.especificacoes.trim() || undefined,
        responsavelId: form.responsavelId || undefined,
        dataAquisicao: form.dataAquisicao,
        valorAquisicao: form.valorAquisicao ? Number(form.valorAquisicao) : undefined,
        observacoes: form.observacoes?.trim() || undefined,
      });

      setSalvando(false);
      setSucesso(true);
      setTimeout(() => {
        router.push(`/equipamentos?tipo=${tipo}`);
        router.refresh();
      }, 400);
    } catch (err: any) {
      setSalvando(false);
      setErro(err.message || "Erro ao salvar equipamento no inventário.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getTituloCategoria = () => {
    switch (tipo) {
      case "monitor":
        return "Cadastrar Monitor";
      case "smartphone":
        return "Cadastrar Celular Corporativo";
      case "periferico":
        return "Cadastrar Periférico / Acessório";
      case "notebook":
      default:
        return "Cadastrar Notebook";
    }
  };

  return (
    <>
      <Header
        title={getTituloCategoria()}
        subtitle={`Cadastro no inventário corporativo com validação de dados e unicidade de serial`}
      />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <div>
          <Link
            href={`/equipamentos?tipo=${tipo}`}
            prefetch={true}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para lista de {tipo}s
          </Link>
        </div>

        {/* Alerta de Sucesso */}
        {sucesso && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 flex items-center gap-3 shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="font-bold text-sm">Equipamento cadastrado com sucesso!</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">Atualizando o inventário e retornando à lista de {tipo}s...</p>
            </div>
          </div>
        )}

        {/* Alerta de Erro de Validação */}
        {erro && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 flex items-start gap-3 shadow-xs animate-in fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Não foi possível salvar o cadastro</p>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">{erro}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/80 dark:border-indigo-950/70 bg-white dark:bg-[#0f142b] p-6 shadow-xs space-y-6">
          {/* 1. Seleção Visual da Categoria */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                1. Categoria do Ativo <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                Campos com <span className="text-rose-500 font-bold">*</span> são obrigatórios
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => handleTipoChange("notebook")}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                  tipo === "notebook"
                    ? "bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-600/15"
                    : "border-slate-200 dark:border-indigo-950/60 hover:bg-slate-50 dark:hover:bg-indigo-950/30 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Laptop className={`w-5 h-5 ${tipo === "notebook" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                <span className="text-xs font-bold">Notebook</span>
              </button>

              <button
                type="button"
                onClick={() => handleTipoChange("monitor")}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                  tipo === "monitor"
                    ? "bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-600/15"
                    : "border-slate-200 dark:border-indigo-950/60 hover:bg-slate-50 dark:hover:bg-indigo-950/30 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Monitor className={`w-5 h-5 ${tipo === "monitor" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                <span className="text-xs font-bold">Monitor</span>
              </button>

              <button
                type="button"
                onClick={() => handleTipoChange("smartphone")}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                  tipo === "smartphone"
                    ? "bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-600/15"
                    : "border-slate-200 dark:border-indigo-950/60 hover:bg-slate-50 dark:hover:bg-indigo-950/30 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Smartphone className={`w-5 h-5 ${tipo === "smartphone" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                <span className="text-xs font-bold">Celular</span>
              </button>

              <button
                type="button"
                onClick={() => handleTipoChange("periferico")}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                  tipo === "periferico"
                    ? "bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-600/15"
                    : "border-slate-200 dark:border-indigo-950/60 hover:bg-slate-50 dark:hover:bg-indigo-950/30 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Headphones className={`w-5 h-5 ${tipo === "periferico" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                <span className="text-xs font-bold">Periférico</span>
              </button>
            </div>
          </div>

          {/* Subtipo de Periférico se aplicável */}
          {tipo === "periferico" && (
            <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-1.5 animate-in fade-in duration-150">
              <label htmlFor="subtipo" className="block text-xs font-semibold text-indigo-950 dark:text-indigo-200">
                Tipo de Periférico / Acessório <span className="text-rose-500">*</span>
              </label>
              <select
                id="subtipo"
                value={subtipo}
                onChange={(e) => setSubtipo(e.target.value)}
                className="w-full rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-[#0b0f19] px-3.5 py-2 text-sm text-slate-900 dark:text-white shadow-2xs focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
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
          <div className="pt-4 border-t border-slate-200 dark:border-indigo-950/70 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              2. Identificação do Fabricante e Modelo
            </h3>

            <div className={`grid grid-cols-1 ${tipo === "periferico" ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4`}>
              <div className="w-full space-y-1.5">
                <label htmlFor="marca" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Marca / Fabricante <span className="text-rose-500">*</span>
                </label>
                <select
                  id="marca"
                  name="marca"
                  value={form.marca}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 dark:border-indigo-950/70 bg-white dark:bg-[#0b0f19] px-3.5 py-2 text-sm text-slate-900 dark:text-white shadow-2xs focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
                >
                  {MARCAS_POR_TIPO[tipo].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Input
                  id="modelo"
                  name="modelo"
                  label="Modelo do Ativo *"
                  placeholder={
                    tipo === "notebook"
                      ? "Ex: Latitude 3420 / MacBook Pro"
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

              {tipo === "periferico" && (
                <div className="w-full space-y-1.5">
                  <label htmlFor="quantidadeEstoque" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Quantidade em Estoque (Unidades) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="quantidadeEstoque"
                    type="number"
                    min="1"
                    max="999"
                    value={quantidadeEstoque}
                    onChange={(e) => setQuantidadeEstoque(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full rounded-xl border border-slate-300 dark:border-indigo-950/70 bg-white dark:bg-[#0b0f19] px-3.5 py-2 text-sm text-slate-900 dark:text-white shadow-2xs focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
                    required
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Input
                  id="numeroSerie"
                  name="numeroSerie"
                  label={
                    tipo === "periferico"
                      ? "Número de Série (Opcional - pode ser informado na entrega)"
                      : "Número de Série (S/N) ou IMEI *"
                  }
                  placeholder={
                    tipo === "periferico"
                      ? "Ex: Opcional para lotes volumétricos"
                      : "Ex: CN0897X12 / S/N do fabricante"
                  }
                  required={tipo !== "periferico"}
                  value={form.numeroSerie}
                  onChange={handleChange}
                  className={erroSerial ? "border-rose-500 focus:border-rose-600 focus:ring-rose-500/20" : ""}
                />
                {erroSerial && (
                  <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {erroSerial}
                  </p>
                )}
              </div>

              <div className="w-full space-y-1.5">
                <label htmlFor="responsavelId" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Atribuir a um Colaborador Imediatamente? (Opcional)
                </label>
                <select
                  id="responsavelId"
                  name="responsavelId"
                  value={form.responsavelId}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 dark:border-indigo-950/70 bg-white dark:bg-[#0b0f19] px-3.5 py-2 text-sm text-slate-900 dark:text-white shadow-2xs focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
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
          <div className="pt-4 border-t border-slate-200 dark:border-indigo-950/70 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
                  label="Armazenamento (SSD) *"
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
          <div className="pt-4 border-t border-slate-200 dark:border-indigo-950/70">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
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
              <label htmlFor="observacoes" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Observações Adicionais de TI
              </label>
              <textarea
                id="observacoes"
                name="observacoes"
                rows={3}
                placeholder="Detalhes adicionais, nota fiscal, número do pedido ou acessórios inclusos..."
                value={form.observacoes}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 dark:border-indigo-950/70 bg-white dark:bg-[#0b0f19] px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/15 shadow-2xs"
              />
            </div>
          </div>

          {/* Rodapé do Formulário com Ações */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-indigo-950/70">
            <Link href={`/equipamentos?tipo=${tipo}`}>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={salvando || Boolean(erroSerial)}>
              <Save className="w-4 h-4" />
              {salvando ? "Validando e Salvando..." : `Salvar ${tipo}`}
            </Button>
          </div>
        </form>
      </main>
    </>
  );
}

export default function NovoEquipamentoPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Carregando formulário...</div>}>
      <NovoEquipamentoForm />
    </Suspense>
  );
}
