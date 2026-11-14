"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  UserPlus, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Shield, 
  User, 
  Lock, 
  KeyRound, 
  X,
  Power,
  Sparkles,
  Copy,
  Check,
  Mail
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usuariosService, UsuarioSistema } from "@/services/usuarios.service";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  // Modal de Cadastro
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  // Formulário de novo usuário
  const [form, setForm] = useState({
    nome: "",
    email: "",
    cargo: "",
    departamento: "Tecnologia da Informação",
    papel: "operador" as "admin" | "operador",
    senhaProvisoria: "Mudar@123",
  });

  // Modal de Redefinição de Senha
  const [modalResetAberto, setModalResetAberto] = useState(false);
  const [usuarioReset, setUsuarioReset] = useState<UsuarioSistema | null>(null);
  const [novaSenhaReset, setNovaSenhaReset] = useState("Mudar@123");
  const [enviandoReset, setEnviandoReset] = useState(false);
  const [msgResetSucesso, setMsgResetSucesso] = useState<string | null>(null);
  const [msgResetErro, setMsgResetErro] = useState<string | null>(null);
  const [senhaCopiada, setSenhaCopiada] = useState(false);

  const handleAbrirReset = (usuario: UsuarioSistema) => {
    setUsuarioReset(usuario);
    setNovaSenhaReset("Mudar@123");
    setMsgResetSucesso(null);
    setMsgResetErro(null);
    setSenhaCopiada(false);
    setModalResetAberto(true);
  };

  const handleDispararEmailReset = async () => {
    if (!usuarioReset) return;
    setEnviandoReset(true);
    setMsgResetSucesso(null);
    setMsgResetErro(null);

    try {
      const res = await usuariosService.solicitarRedefinicaoSenha(usuarioReset.email);
      setMsgResetSucesso(res.mensagem);
    } catch (err: any) {
      setMsgResetErro(err.message || "Erro ao solicitar redefinição de senha.");
    } finally {
      setEnviandoReset(false);
    }
  };

  const handleConfirmarNovaSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioReset) return;
    setEnviandoReset(true);
    setMsgResetSucesso(null);
    setMsgResetErro(null);

    try {
      const res = await usuariosService.redefinirSenhaDireta(usuarioReset.id, usuarioReset.email, novaSenhaReset);
      setMsgResetSucesso(res.mensagem);
    } catch (err: any) {
      setMsgResetErro(err.message || "Erro ao atualizar senha.");
    } finally {
      setEnviandoReset(false);
    }
  };

  const handleCopiarSenha = () => {
    navigator.clipboard.writeText(novaSenhaReset);
    setSenhaCopiada(true);
    setTimeout(() => setSenhaCopiada(false), 2000);
  };

  const carregarUsuarios = async (mostrarCarregamento = false) => {
    if (mostrarCarregamento || usuarios.length === 0) {
      setCarregando(true);
    }
    try {
      const lista = await usuariosService.listar();
      setUsuarios(lista);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarUsuarios(true);

    const handleAtualizacao = () => carregarUsuarios(false);
    window.addEventListener("inventario_usuarios_alterado", handleAtualizacao);
    return () => window.removeEventListener("inventario_usuarios_alterado", handleAtualizacao);
  }, []);

  // Métricas de usuários
  const metricas = useMemo(() => {
    return {
      total: usuarios.length,
      admins: usuarios.filter((u) => u.papel === "admin").length,
      operadores: usuarios.filter((u) => u.papel === "operador").length,
      ativos: usuarios.filter((u) => u.status === "ativo").length,
    };
  }, [usuarios]);

  // Filtragem
  const usuariosFiltrados = useMemo(() => {
    const t = busca.toLowerCase();
    return usuarios.filter(
      (u) =>
        !busca ||
        u.nome.toLowerCase().includes(t) ||
        u.email.toLowerCase().includes(t) ||
        u.cargo.toLowerCase().includes(t) ||
        u.departamento.toLowerCase().includes(t)
    );
  }, [usuarios, busca]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmitCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!form.nome.trim()) {
      setErro("Informe o nome completo do novo usuário.");
      return;
    }
    if (!form.email.trim() || !form.email.includes("@")) {
      setErro("Informe um e-mail corporativo válido.");
      return;
    }
    if (!form.cargo.trim()) {
      setErro("Informe o cargo corporativo do usuário.");
      return;
    }

    setSalvando(true);
    try {
      await usuariosService.criar({
        nome: form.nome.trim(),
        email: form.email.trim(),
        cargo: form.cargo.trim(),
        departamento: form.departamento.trim(),
        papel: form.papel,
        senhaProvisoria: form.senhaProvisoria,
      });

      setSucesso(true);
      setTimeout(() => {
        setSalvando(false);
        setSucesso(false);
        setModalCadastroAberto(false);
        setForm({
          nome: "",
          email: "",
          cargo: "",
          departamento: "Tecnologia da Informação",
          papel: "operador",
          senhaProvisoria: "Mudar@123",
        });
        carregarUsuarios();
      }, 500);
    } catch (err: any) {
      setSalvando(false);
      setErro(err.message || "Erro ao cadastrar usuário.");
    }
  };

  const handleAlternarStatus = async (usuario: UsuarioSistema) => {
    try {
      await usuariosService.alternarStatus(usuario.id);
      carregarUsuarios();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleExcluir = async (usuario: UsuarioSistema) => {
    if (confirm(`Tem certeza que deseja excluir o acesso de ${usuario.nome}?`)) {
      try {
        await usuariosService.excluir(usuario.id);
        carregarUsuarios();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <>
      <Header
        title="Usuários e Permissões"
        subtitle="Gerenciamento de contas com acesso administrativo à plataforma TI Inventory"
      />

      <main className="flex-1 w-full max-w-[1600px] 2xl:max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Topo da Página */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <ShieldCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              Gestão de Usuários do Sistema
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Controle quem pode acessar, visualizar e operar os registros de ativos de TI.
            </p>
          </div>

          <Button onClick={() => setModalCadastroAberto(true)} size="sm">
            <UserPlus className="w-4 h-4" />
            Cadastrar Novo Usuário
          </Button>
        </div>

        {/* Cards de Métricas de Contas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f142b] border border-slate-200/80 dark:border-indigo-950/70 shadow-xs">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total de Contas</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{metricas.total}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">usuários cadastrados</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f142b] border border-slate-200/80 dark:border-indigo-950/70 shadow-xs">
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Administradores</p>
            <p className="text-2xl font-black text-indigo-900 dark:text-indigo-200 mt-1">{metricas.admins}</p>
            <p className="text-[11px] text-indigo-400 dark:text-indigo-500 mt-0.5">acesso irrestrito</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f142b] border border-slate-200/80 dark:border-indigo-950/70 shadow-xs">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Operadores de TI</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{metricas.operadores}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">atribuição e consulta</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f142b] border border-slate-200/80 dark:border-indigo-950/70 shadow-xs">
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Contas Ativas</p>
            <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-1">{metricas.ativos}</p>
            <p className="text-[11px] text-emerald-500 dark:text-emerald-600 mt-0.5">habilitadas para login</p>
          </div>
        </div>

        {/* Tabela de Usuários */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-indigo-950/70 bg-white dark:bg-[#0f142b] shadow-xs overflow-hidden">
          {/* Barra de Pesquisa */}
          <div className="p-4 border-b border-slate-200/80 dark:border-indigo-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar por nome, e-mail ou cargo..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-indigo-950/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 focus:bg-white dark:focus:bg-[#0b0f19] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
              />
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Mostrando {usuariosFiltrados.length} usuário(s)
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-[#0b0f19]/80 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-indigo-950/70">
                <tr>
                  <th className="px-6 py-3.5">Usuário / Identificação</th>
                  <th className="px-6 py-3.5">Cargo e Departamento</th>
                  <th className="px-6 py-3.5">Papel / Acesso</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-indigo-950/50">
                {carregando ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                      Carregando usuários...
                    </td>
                  </tr>
                ) : usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((u) => {
                    const isPrincipal = u.id === "usr-admin-principal";

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-indigo-950/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
                              {u.nome
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{u.nome}</span>
                                {isPrincipal && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                    Titular
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{u.cargo}</p>
                          <p className="text-slate-400 dark:text-slate-500">{u.departamento}</p>
                        </td>

                        <td className="px-6 py-4">
                          {u.papel === "admin" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                              <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                              Administrador
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                              Operador de TI
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {u.status === "ativo" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/80 shadow-2xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 shadow-2xs">
                              Inativo
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleAbrirReset(u)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer"
                              title={isPrincipal ? "Alterar minha senha no Supabase" : "Redefinir senha de acesso"}
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>

                            {!isPrincipal ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleAlternarStatus(u)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                  title={u.status === "ativo" ? "Desativar conta" : "Ativar conta"}
                                >
                                  <Power className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleExcluir(u)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                                  title="Excluir usuário"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <span className="text-[11px] text-slate-400 dark:text-slate-500 italic ml-1">Titular</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal de Cadastro de Novo Usuário */}
      {modalCadastroAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-[#0f142b] rounded-3xl border border-slate-200 dark:border-indigo-950 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-indigo-950/70">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Cadastrar Usuário do Sistema
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Crie uma credencial de acesso para outro membro da equipe de TI
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalCadastroAberto(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {erro && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{erro}</span>
              </div>
            )}

            {sucesso && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Usuário cadastrado com sucesso!</span>
              </div>
            )}

            <form onSubmit={handleSubmitCadastro} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Nome Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  placeholder="Ex: Carlos Eduardo Mendes"
                  required
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-indigo-950/70 rounded-xl focus:bg-white dark:focus:bg-[#0b0f19] focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  E-mail Corporativo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Ex: carlos.mendes@empresa.com"
                  required
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-indigo-950/70 rounded-xl focus:bg-white dark:focus:bg-[#0b0f19] focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    Cargo Corporativo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="cargo"
                    value={form.cargo}
                    onChange={handleChange}
                    placeholder="Ex: Analista de TI Jr"
                    required
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-indigo-950/70 rounded-xl focus:bg-white dark:focus:bg-[#0b0f19] focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    Departamento <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="departamento"
                    value={form.departamento}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-indigo-950/70 rounded-xl focus:bg-white dark:focus:bg-[#0b0f19] focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Nível de Permissão e Acesso <span className="text-rose-500">*</span>
                </label>
                <select
                  name="papel"
                  value={form.papel}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-indigo-950/70 rounded-xl focus:bg-white dark:focus:bg-[#0b0f19] focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 text-slate-900 dark:text-white"
                >
                  <option value="operador">Operador de TI (Consulta e Atribuição de Ativos)</option>
                  <option value="admin">Administrador Geral (Acesso Total e Configurações)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-indigo-950/70 text-slate-600 dark:text-slate-300 space-y-1">
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Credencial de Primeiro Acesso
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Senha temporária inicial: <code className="font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-1 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">Mudar@123</code>. O usuário poderá alterá-la no primeiro acesso.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-indigo-950/70">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalCadastroAberto(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={salvando}>
                  {salvando ? "Criando usuário..." : "Salvar Usuário"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal de Redefinição de Senha */}
      {modalResetAberto && usuarioReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-[#0f142b] rounded-3xl border border-slate-200 dark:border-indigo-950 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-indigo-950/70">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/60">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Redefinir Senha de Acesso
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {usuarioReset.nome} • <span className="font-mono">{usuarioReset.email}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalResetAberto(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {msgResetErro && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{msgResetErro}</span>
              </div>
            )}

            {msgResetSucesso && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <span>{msgResetSucesso}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              {/* Opção 1: Envio por E-mail Oficial Supabase */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <p className="font-bold text-slate-900 dark:text-white text-xs">
                    Opção 1: Enviar link oficial de recuperação por e-mail
                  </p>
                </div>
                <p className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  O Supabase enviará um link seguro para <strong className="text-indigo-700 dark:text-indigo-300">{usuarioReset.email}</strong>, permitindo que o próprio usuário crie sua senha pessoal com validação imediata.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDispararEmailReset}
                  disabled={enviandoReset}
                  className="w-full mt-1 bg-white dark:bg-[#0b0f19] border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {enviandoReset ? "Enviando e-mail..." : "Disparar E-mail de Redefinição"}
                </Button>
              </div>

              {/* Opção 2: Nova Senha Provisória */}
              <form onSubmit={handleConfirmarNovaSenha} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-indigo-950/70 space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  <p className="font-bold text-slate-900 dark:text-white text-xs">
                    Opção 2: Definir nova senha provisória
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Nova Senha Provisória (mínimo 6 caracteres):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={novaSenhaReset}
                      onChange={(e) => setNovaSenhaReset(e.target.value)}
                      required
                      minLength={6}
                      className="flex-1 px-3 py-1.5 font-mono text-sm bg-white dark:bg-[#0f142b] border border-slate-200 dark:border-indigo-950/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 text-slate-900 dark:text-white"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopiarSenha}
                      className="flex-shrink-0"
                    >
                      {senhaCopiada ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                  💡 <strong>Importante sobre o Supabase:</strong> Se a conta não conseguir logar com a senha provisória, certifique-se no painel do Supabase (em <em>Authentication → Providers → Email</em>) de <strong>desmarcar</strong> a opção <em>&quot;Confirm email&quot;</em>. Dessa forma, as senhas provisórias funcionam imediatamente sem exigir clique prévio no e-mail.
                </div>

                <Button
                  type="submit"
                  size="sm"
                  disabled={enviandoReset || novaSenhaReset.length < 6}
                  className="w-full"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  {enviandoReset ? "Atualizando..." : "Aplicar Nova Senha"}
                </Button>
              </form>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-indigo-950/70">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalResetAberto(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
