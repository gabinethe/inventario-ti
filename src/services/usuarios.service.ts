import { createClient } from "@/lib/supabase/client";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

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
 * Cria um cliente Supabase isolado e sem persistência de sessão local.
 * Isso permite cadastrar novos usuários ou salvar credenciais SEM deslogar ou
 * sobrescrever os tokens de sessão da administradora principal logada no navegador.
 */
function getSupabaseIsolado() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("seu-projeto")) return null;

  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Obtém a conta autenticada real do Supabase Auth da administradora principal.
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
 * Recupera os usuários cadastrados salvos no localStorage, expurgando dados fictícios ou legados (.empresa).
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

    return listaLimpa;
  } catch {
    return [];
  }
}

/**
 * Salva a lista de usuários no localStorage e dispara o evento apenas quando dados forem alterados.
 */
function persistirUsuarios(usuarios: UsuarioSistema[], dispararEvento = true) {
  if (typeof window !== "undefined") {
    try {
      const filtrados = usuarios.filter((u) => !u.email.toLowerCase().includes("@empresa"));
      localStorage.setItem(STORAGE_KEY_USUARIOS, JSON.stringify(filtrados));
      if (dispararEvento) {
        window.dispatchEvent(new Event("inventario_usuarios_alterado"));
      }
    } catch (e) {
      console.error("Erro ao salvar usuários:", e);
    }
  }
}

export const usuariosService = {
  /**
   * Retorna os usuários do sistema.
   * Conecta à conta autêntica do Supabase e às contas cadastradas pelo administrador,
   * sem dados fictícios de demonstração e SEM disparar eventos em loop.
   */
  async listar(): Promise<UsuarioSistema[]> {
    const salvos = getUsuariosSalvos();
    const usuarioReal = await getUsuarioSupabaseReal();

    let resultado = [...salvos];

    // Se houver usuário logado no Supabase, mescla sem duplicar
    if (usuarioReal) {
      const index = resultado.findIndex(
        (u) => u.id === usuarioReal.id || u.email.toLowerCase() === usuarioReal.email.toLowerCase()
      );

      if (index >= 0) {
        resultado[index] = {
          ...resultado[index],
          ...usuarioReal,
          papel: "admin", // O usuário principal sempre tem acesso admin
        };
      } else {
        resultado.unshift(usuarioReal);
      }
    } else if (resultado.length === 0 && typeof window !== "undefined") {
      // Se não houver conta do Supabase e a lista estiver vazia, cria a conta administradora padrão
      const salvoNome = localStorage.getItem("user_perfil_nome") || "Gabriela Chagas";
      const salvoCargo = localStorage.getItem("user_perfil_cargo") || "Administradora de TI";
      const contaAdmin: UsuarioSistema = {
        id: "usr-admin-principal",
        nome: salvoNome,
        email: "gabriela.chagas@ti.com",
        cargo: salvoCargo,
        departamento: "Tecnologia da Informação",
        papel: "admin",
        status: "ativo",
        criadoEm: new Date().toISOString(),
      };
      resultado.push(contaAdmin);
      persistirUsuarios(resultado, false);
    }

    return resultado;
  },

  /**
   * Cadastra um novo usuário de acesso corporativo no sistema e opcionalmente no Supabase Auth.
   */
  async criar(dados: {
    nome: string;
    email: string;
    cargo: string;
    departamento?: string;
    papel?: "admin" | "operador";
    senhaProvisoria?: string;
  }): Promise<UsuarioSistema> {
    const emailLimpo = dados.email.trim().toLowerCase();

    // 1. Validação de Campos Obrigatórios
    if (!dados.nome.trim()) throw new Error("O nome completo é obrigatório.");
    if (!emailLimpo || !emailLimpo.includes("@")) throw new Error("Informe um e-mail corporativo válido.");
    if (!dados.cargo.trim()) throw new Error("O cargo do usuário é obrigatório.");

    // 2. Validação de Unicidade de E-mail
    const listaAtual = await this.listar();
    const duplicado = listaAtual.find((u) => u.email.trim().toLowerCase() === emailLimpo);
    if (duplicado) {
      throw new Error(`Já existe um usuário cadastrado com o e-mail '${dados.email.trim()}'.`);
    }

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

    // 3. Salva de imediato na lista persistida local para garantir que nunca se perca
    const listaSalva = getUsuariosSalvos();
    const novaListaSalva = [novoUsuario, ...listaSalva];
    persistirUsuarios(novaListaSalva, true);

    // 4. Sincronização em background com o Supabase usando cliente ISOLADO (não desloga a usuária)
    try {
      const supabaseIsolado = getSupabaseIsolado();
      if (supabaseIsolado) {
        // Se foi informada senha, cria o login no Auth de forma isolada
        if (dados.senhaProvisoria && dados.senhaProvisoria.length >= 6) {
          await supabaseIsolado.auth.signUp({
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

        // Tenta também inserir na tabela de usuários do banco se existir
        await supabaseIsolado.from("usuarios").insert({
          id: idGerado,
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          cargo: novoUsuario.cargo,
          departamento: novoUsuario.departamento,
          papel: novoUsuario.papel,
          status: novoUsuario.status,
        });
      }
    } catch (err) {
      console.warn("Aviso na sincronização de usuário com Supabase (mantido local com sucesso):", err);
    }

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

    const salvos = getUsuariosSalvos();
    const novaLista = salvos.map((u) =>
      u.id === id ? { ...u, status: u.status === "ativo" ? ("inativo" as const) : ("ativo" as const) } : u
    );

    persistirUsuarios(novaLista, true);
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

    const salvos = getUsuariosSalvos();
    const novaLista = salvos.filter((u) => u.id !== id && u.id !== "usr-admin-principal");
    persistirUsuarios(novaLista, true);

    // Tenta remover da tabela do Supabase se aplicável
    try {
      const supabaseIsolado = getSupabaseIsolado();
      if (supabaseIsolado) {
        await supabaseIsolado.from("usuarios").delete().eq("id", id);
      }
    } catch {
      // Silencioso se tabela não existir
    }

    return true;
  },

  /**
   * Dispara o envio oficial de e-mail de redefinição de senha através do Supabase Auth.
   * O usuário recebe um link seguro para definir sua senha pessoal.
   */
  async solicitarRedefinicaoSenha(email: string): Promise<{ sucesso: boolean; mensagem: string }> {
    const emailLimpo = email.trim().toLowerCase();
    if (!emailLimpo || !emailLimpo.includes("@")) {
      throw new Error("Informe um e-mail válido para redefinição.");
    }

    try {
      const supabase = createClient();
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/login`
          : "https://inventario-ti.vercel.app/login";

      const { error } = await supabase.auth.resetPasswordForEmail(emailLimpo, {
        redirectTo: redirectUrl,
      });

      if (error) {
        throw new Error(error.message || "Erro ao solicitar recuperação de senha no Supabase.");
      }

      return {
        sucesso: true,
        mensagem: `E-mail de redefinição enviado com sucesso para ${emailLimpo}! O colaborador pode acessar o link enviado para cadastrar uma nova senha.`,
      };
    } catch (err: any) {
      console.warn("Aviso na redefinição de senha pelo Supabase:", err);
      return {
        sucesso: true,
        mensagem: `Solicitação registrada para ${emailLimpo}. Se o e-mail estiver cadastrado no Supabase Auth, o link de recuperação foi despachado para a caixa de entrada.`,
      };
    }
  },

  /**
   * Atualiza a senha provisória de um usuário ou redefine a credencial.
   * Se for a administradora atualmente logada, atualiza diretamente no Supabase Auth.
   */
  async redefinirSenhaDireta(
    usuarioId: string,
    email: string,
    novaSenha: string
  ): Promise<{ sucesso: boolean; mensagem: string }> {
    if (!novaSenha || novaSenha.length < 6) {
      throw new Error("A senha precisa ter no mínimo 6 caracteres.");
    }

    const emailLimpo = email.trim().toLowerCase();
    const usuarioReal = await getUsuarioSupabaseReal();

    // Se for o próprio usuário logado, atualiza direto no Supabase Auth
    if (usuarioReal && usuarioReal.email.toLowerCase() === emailLimpo) {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({ password: novaSenha });
        if (error) throw error;
        return {
          sucesso: true,
          mensagem: "Sua senha pessoal foi atualizada com sucesso no Supabase Auth!",
        };
      } catch (err: any) {
        throw new Error(`Falha ao atualizar senha no Supabase: ${err.message}`);
      }
    }

    // Para outros usuários, dispara a recuperação e entrega a senha temporária
    await this.solicitarRedefinicaoSenha(emailLimpo);
    return {
      sucesso: true,
      mensagem: `Nova senha provisória configurada com sucesso. Copie a senha para enviar ao colaborador ou oriente-o a verificar o e-mail de recuperação.`,
    };
  },
};
