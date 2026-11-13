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
  Sparkles
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

  const carregarUsuarios = async () => {
    setCarregando(true);
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
    carregarUsuarios();

    const handleAtualizacao = () => carregarUsuarios();
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
        title="Usuários & Permissões"
        subtitle="Gerenciamento de contas com acesso administrativo à plataforma Inventário TI"
      />

      <main className="flex-1 p-8 space-y-6 max-w-6xl">
        {/* Topo da Página */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <ShieldCheck className="h-6 w-6 text-indigo-600" />
              Gestão de Usuários do Sistema
            </h1>
            <p className="text-sm text-slate-500 font-medium">
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
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <p className="text-xs font-semibold text-slate-500">Total de Contas</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{metricas.total}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">usuários cadastrados</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <p className="text-xs font-semibold text-indigo-600">Administradores</p>
            <p className="text-2xl font-black text-indigo-900 mt-1">{metricas.admins}</p>
            <p className="text-[11px] text-indigo-400 mt-0.5">acesso irrestrito</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <p className="text-xs font-semibold text-slate-600">Operadores de TI</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{metricas.operadores}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">atribuição e consulta</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <p className="text-xs font-semibold text-emerald-600">Contas Ativas</p>
            <p className="text-2xl font-black text-emerald-900 mt-1">{metricas.ativos}</p>
            <p className="text-[11px] text-emerald-500 mt-0.5">habilitadas para login</p>
          </div>
        </div>

        {/* Tabela de Usuários */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          {/* Barra de Pesquisa */}
          <div className="p-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar por nome, e-mail ou cargo..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 focus:bg-white text-slate-900 placeholder:text-slate-400 transition-all"
              />
            </div>
            <div className="text-xs font-semibold text-slate-500">
              Mostrando {usuariosFiltrados.length} usuário(s)
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Usuário / Identificação</th>
                  <th className="px-6 py-3.5">Cargo & Departamento</th>
                  <th className="px-6 py-3.5">Papel / Acesso</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {carregando ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      Carregando usuários...
                    </td>
                  </tr>
                ) : usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((u) => {
                    const isPrincipal = u.id === "usr-admin-principal";

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
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
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{u.nome}</span>
                                {isPrincipal && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                    Titular
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 font-mono mt-0.5">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-600">
                          <p className="font-semibold text-slate-800">{u.cargo}</p>
                          <p className="text-slate-400">{u.departamento}</p>
                        </td>

                        <td className="px-6 py-4">
                          {u.papel === "admin" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <Shield className="w-3.5 h-3.5 text-indigo-600" />
                              Administrador
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              <User className="w-3.5 h-3.5 text-slate-500" />
                              Operador de TI
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {u.status === "ativo" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                              Inativo
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          {!isPrincipal ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleAlternarStatus(u)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title={u.status === "ativo" ? "Desativar conta" : "Ativar conta"}
                              >
                                <Power className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleExcluir(u)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Excluir usuário"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Conta Mestre</span>
                          )}
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
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Cadastrar Usuário do Sistema
                  </h3>
                  <p className="text-xs text-slate-400">
                    Crie uma credencial de acesso para outro membro da equipe de TI
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalCadastroAberto(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {erro && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{erro}</span>
              </div>
            )}

            {sucesso && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>Usuário cadastrado com sucesso!</span>
              </div>
            )}

            <form onSubmit={handleSubmitCadastro} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  Nome Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  placeholder="Ex: Carlos Eduardo Mendes"
                  required
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  E-mail Corporativo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Ex: carlos.mendes@empresa.com"
                  required
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700">
                    Cargo Corporativo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="cargo"
                    value={form.cargo}
                    onChange={handleChange}
                    placeholder="Ex: Analista de TI Jr"
                    required
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700">
                    Departamento <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="departamento"
                    value={form.departamento}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  Nível de Permissão & Acesso <span className="text-rose-500">*</span>
                </label>
                <select
                  name="papel"
                  value={form.papel}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 text-slate-900"
                >
                  <option value="operador">Operador de TI (Consulta e Atribuição de Ativos)</option>
                  <option value="admin">Administrador Geral (Acesso Total e Configurações)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                  Credencial de Primeiro Acesso
                </p>
                <p className="text-[11px] text-slate-500">
                  Senha temporária inicial: <code className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-200">Mudar@123</code>. O usuário poderá alterá-la no primeiro acesso.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
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
    </>
  );
}
