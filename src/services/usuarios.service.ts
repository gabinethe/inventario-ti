import { createClient } from "@/lib/supabase/client";

export interface UsuarioSistema {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  papel: "admin" | "operador";
  status: "ativo" | "inativo";
  criadoEm: string;
  ultimoAcesso?: string;
}

const STORAGE_KEY_USUARIOS = "inventario_ti_usuarios_sistema";

/**
 * Obtém a conta autenticada real do Supabase Auth.
 */
async function getUsuarioSupabaseReal(): Promise<UsuarioSistema | null> {
  if (typeof window === "undefined") return null;

  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user || !user.email) return null;

    const salvoNome = localStorage.getItem("user_perfil_nome");
    const salvoCargo = localStorage.getItem("user_perfil_cargo");

    const metadataNome = user.user_metadata?.nome || user.user_metadata?.full_name;
    const metadataCargo = user.user_metadata?.cargo;

    const nomeFormatado =
      salvoNome ||
      metadataNome ||
      user.email
        .split("@")[0]
        .replace(".", " ")
        .split(" ")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");

    const cargoFormatado = salvoCargo || metadataCargo || "Administradora de TI";

    return {
      id: user.id || "usr-admin-principal",
      nome: nomeFormatado,
      email: user.email,
      cargo: cargoFormatado,
      departamento: user.user_metadata?.departamento || "Tecnologia da Informação",
      papel: "admin",
      status: "ativo",
      criadoEm: user.created_at || new Date().toISOString(),
      ultimoAcesso: user.last_sign_in_at || new Date().toISOString(),
    };
  } catch (err) {
    console.warn("Aviso ao consultar usuário autenticado do Supabase:", err);
    return null;
  }
}

/**
 * Recupera os usuários cadastrados, expurgando dados fictícios ou ilustrativos (.empresa).
 */
function getUsuariosSalvos(): UsuarioSistema[] {
  if (typeof window === "undefined") return [];

  try {
    const salvo = localStorage.getItem(STORAGE_KEY_USUARIOS);
    if (!salvo) return [];

    const lista = JSON.parse(salvo);
    if (!Array.isArray(lista)) return [];

    // Limpa estritamente contas de ilustração antigas que contenham .empresa
    const listaLimpa: UsuarioSistema[] = lista.filter(
      (u) =>
        u &&
        typeof u.email === "string" &&
        !u.email.toLowerCase().includes("@empresa") &&
        u.id !== "usr-operador-ti"
    );

    // Se houve limpeza de dados fakes, atualiza o localStorage
    if (listaLimpa.length !== lista.length) {
      localStorage.setItem(STORAGE_KEY_USUARIOS, JSON.stringify(listaLimpa));
    }

    return listaLimpa;
  } catch {
    return [];
  }
}

function salvarUsuariosMemoria(usuarios: UsuarioSistema[]) {
  if (typeof window !== "undefined") {
    try {
      // Garante que nenhum e-mail de teste fake seja persistido
      const filtrados = usuarios.filter((u) => !u.email.toLowerCase().includes("@empresa"));
      localStorage.setItem(STORAGE_KEY_USUARIOS, JSON.stringify(filtrados));
      window.dispatchEvent(new Event("inventario_usuarios_alterado"));
    } catch (e) {
      console.error("Erro ao salvar usuários:", e);
    }
  }
}

export const usuariosService = {
  /**
   * Retorna os usuários do sistema.
   * Conecta à conta autêntica do Supabase e às contas cadastradas pelo administrador,
   * sem dados fictícios de demonstração.
   */
  async listar(): Promise<UsuarioSistema[]> {
    const salvos = getUsuariosSalvos();
    const usuarioReal = await getUsuarioSupabaseReal();

    // Se houver usuário logado no Supabase
    if (usuarioReal) {
      // Verifica se a conta do usuário real já está na lista salva
      const index = salvos.findIndex(
        (u) => u.id === usuarioReal.id || u.email.toLowerCase() === usuarioReal.email.toLowerCase()
      );

      if (index >= 0) {
        // Atualiza a conta com os dados mais recentes do Supabase/perfil
        salvos[index] = {
          ...salvos[index],
          ...usuarioReal,
        };
      } else {
        // Insere a conta autêntica no início da lista
        salvos.unshift(usuarioReal);
      }

      salvarUsuariosMemoria(salvos);
      return salvos;
    }

    return salvos;
  },

  /**
   * Cadastra um novo usuário de acesso corporativo no Supabase e na plataforma.
   */
  async criar(dados: {
    nome: string;
    email: string;
    cargo: string;
    departamento?: string;
    papel?: "admin" | "operador";
    senhaProvisoria?: string;
  }): Promise<UsuarioSistema> {
    const listaAtual = await this.listar();

    // 1. Validação de Unicidade de E-mail
    const emailLimpo = dados.email.trim().toLowerCase();
    const duplicado = listaAtual.find((u) => u.email.trim().toLowerCase() === emailLimpo);
    if (duplicado) {
      throw new Error(`Já existe um usuário cadastrado com o e-mail '${dados.email.trim()}'.`);
    }

    // 2. Validação de Campos Obrigatórios
    if (!dados.nome.trim()) throw new Error("O nome completo é obrigatório.");
    if (!dados.email.trim() || !dados.email.includes("@")) throw new Error("Informe um e-mail corporativo válido.");
    if (!dados.cargo.trim()) throw new Error("O cargo do usuário é obrigatório.");

    const idGerado = `usr-${Date.now()}`;
    const novoUsuario: UsuarioSistema = {
      id: idGerado,
      nome: dados.nome.trim(),
      email: emailLimpo,
      cargo: dados.cargo.trim(),
      departamento: dados.departamento?.trim() || "Tecnologia da Informação",
      papel: dados.papel || "operador",
      status: "ativo",
      criadoEm: new Date().toISOString(),
      ultimoAcesso: undefined,
    };

    // Sincronização direta com o Supabase
    try {
      const supabase = createClient();

      // Se senha provisória informada, registra credencial de acesso no Supabase Auth
      if (dados.senhaProvisoria && dados.senhaProvisoria.length >= 6) {
        await supabase.auth.signUp({
          email: emailLimpo,
          password: dados.senhaProvisoria,
          options: {
            data: {
              nome: dados.nome.trim(),
              cargo: dados.cargo.trim(),
              departamento: novoUsuario.departamento,
              papel: novoUsuario.papel,
            },
          },
        });
      }

      // Tenta gravar na tabela usuarios do Supabase (caso a tabela exista no schema)
      await supabase.from("usuarios").insert({
        id: idGerado,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        cargo: novoUsuario.cargo,
        departamento: novoUsuario.departamento,
        papel: novoUsuario.papel,
        status: novoUsuario.status,
      });
    } catch (err) {
      console.warn("Sincronização com Supabase concluída localmente:", err);
    }

    const novaLista = [novoUsuario, ...listaAtual];
    salvarUsuariosMemoria(novaLista);

    return novoUsuario;
  },

  /**
   * Alterna o status do usuário (Ativo / Inativo).
   * Impede a desativação da própria conta administradora principal em uso.
   */
  async alternarStatus(id: string): Promise<boolean> {
    const usuarioReal = await getUsuarioSupabaseReal();
    if (usuarioReal && (id === usuarioReal.id || id === "usr-admin-principal")) {
      throw new Error("A sua conta de Administradora Principal não pode ser desativada.");
    }

    const lista = await this.listar();
    const novaLista = lista.map((u) =>
      u.id === id ? { ...u, status: u.status === "ativo" ? ("inativo" as const) : ("ativo" as const) } : u
    );

    salvarUsuariosMemoria(novaLista);
    return true;
  },

  /**
   * Exclui um usuário do sistema.
   * Impede a auto-exclusão da administradora principal logada.
   */
  async excluir(id: string): Promise<boolean> {
    const usuarioReal = await getUsuarioSupabaseReal();
    if (usuarioReal && (id === usuarioReal.id || id === "usr-admin-principal")) {
      throw new Error("A sua conta de Administradora Principal não pode ser excluída.");
    }

    const lista = await this.listar();
    const novaLista = lista.filter((u) => u.id !== id);
    salvarUsuariosMemoria(novaLista);

    // Tenta remover da tabela do Supabase se aplicável
    try {
      const supabase = createClient();
      await supabase.from("usuarios").delete().eq("id", id);
    } catch {
      // Silencioso se tabela não existir
    }

    return true;
  },
};
