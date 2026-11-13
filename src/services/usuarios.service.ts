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

// Usuários padrão iniciais do sistema
const USUARIOS_INICIAIS: UsuarioSistema[] = [
  {
    id: "usr-admin-principal",
    nome: "Gabriela Chagas",
    email: "gabriela.chagas@empresa.com",
    cargo: "Administradora de TI",
    departamento: "Tecnologia da Informação",
    papel: "admin",
    status: "ativo",
    criadoEm: "2024-10-15T09:00:00Z",
    ultimoAcesso: new Date().toISOString(),
  },
  {
    id: "usr-operador-ti",
    nome: "Suporte Técnico TI",
    email: "suporte.ti@empresa.com",
    cargo: "Analista de Suporte",
    departamento: "Tecnologia da Informação",
    papel: "operador",
    status: "ativo",
    criadoEm: "2024-11-01T14:30:00Z",
    ultimoAcesso: "2024-11-12T16:20:00Z",
  },
];

function getUsuariosMemoria(): UsuarioSistema[] {
  if (typeof window !== "undefined") {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY_USUARIOS);
      if (salvo) {
        const lista = JSON.parse(salvo);
        if (Array.isArray(lista) && lista.length > 0) {
          // Garante que a Gabriela Chagas esteja sempre presente com dados atualizados do perfil
          const nomePerfil = localStorage.getItem("user_perfil_nome") || "Gabriela Chagas";
          const cargoPerfil = localStorage.getItem("user_perfil_cargo") || "Administradora de TI";
          
          return lista.map((u) =>
            u.id === "usr-admin-principal"
              ? { ...u, nome: nomePerfil, cargo: cargoPerfil }
              : u
          );
        }
      }
      localStorage.setItem(STORAGE_KEY_USUARIOS, JSON.stringify(USUARIOS_INICIAIS));
      return USUARIOS_INICIAIS;
    } catch {
      return USUARIOS_INICIAIS;
    }
  }
  return USUARIOS_INICIAIS;
}

function salvarUsuariosMemoria(usuarios: UsuarioSistema[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_USUARIOS, JSON.stringify(usuarios));
      window.dispatchEvent(new Event("inventario_usuarios_alterado"));
    } catch (e) {
      console.error("Erro ao salvar usuários:", e);
    }
  }
}

export const usuariosService = {
  /**
   * Lista todos os usuários cadastrados na plataforma.
   */
  async listar(): Promise<UsuarioSistema[]> {
    return getUsuariosMemoria();
  },

  /**
   * Cadastra um novo usuário de acesso administrativo ou operador.
   */
  async criar(dados: Omit<UsuarioSistema, "id" | "criadoEm" | "status">): Promise<UsuarioSistema> {
    const listaAtual = getUsuariosMemoria();

    // 1. Validação de Unicidade de E-mail
    const emailLimpo = dados.email.trim().toLowerCase();
    const duplicado = listaAtual.find((u) => u.email.trim().toLowerCase() === emailLimpo);
    if (duplicado) {
      throw new Error(`Já existe um usuário cadastrado com o e-mail '${dados.email.trim()}'.`);
    }

    // 2. Validação de Campos Obrigatórios
    if (!dados.nome.trim()) throw new Error("O nome completo é obrigatório.");
    if (!dados.email.trim()) throw new Error("O e-mail corporativo é obrigatório.");
    if (!dados.cargo.trim()) throw new Error("O cargo do usuário é obrigatório.");

    const novoUsuario: UsuarioSistema = {
      id: `usr-${Date.now()}`,
      nome: dados.nome.trim(),
      email: emailLimpo,
      cargo: dados.cargo.trim(),
      departamento: dados.departamento.trim() || "Tecnologia da Informação",
      papel: dados.papel || "operador",
      status: "ativo",
      criadoEm: new Date().toISOString(),
      ultimoAcesso: undefined,
    };

    const novaLista = [novoUsuario, ...listaAtual];
    salvarUsuariosMemoria(novaLista);

    return novoUsuario;
  },

  /**
   * Alterna o status do usuário (Ativo / Inativo).
   * Impede a desativação da administradora principal.
   */
  async alternarStatus(id: string): Promise<boolean> {
    if (id === "usr-admin-principal") {
      throw new Error("A conta da Administradora Principal não pode ser desativada.");
    }

    const lista = getUsuariosMemoria();
    const novaLista = lista.map((u) =>
      u.id === id ? { ...u, status: u.status === "ativo" ? ("inativo" as const) : ("ativo" as const) } : u
    );

    salvarUsuariosMemoria(novaLista);
    return true;
  },

  /**
   * Exclui um usuário do sistema.
   * Impede a exclusão da administradora principal.
   */
  async excluir(id: string): Promise<boolean> {
    if (id === "usr-admin-principal") {
      throw new Error("A conta da Administradora Principal não pode ser excluída.");
    }

    const lista = getUsuariosMemoria();
    const novaLista = lista.filter((u) => u.id !== id);
    salvarUsuariosMemoria(novaLista);
    return true;
  },
};
