/**
 * Entidade Responsável (Colaborador que utiliza os equipamentos de TI).
 */
export interface Responsavel {
  id: string;               // Identificador único
  nome: string;             // Nome completo do colaborador
  email: string;            // E-mail corporativo
  departamento: string;     // Ex: Engenharia, Recursos Humanos, Vendas, Financeiro
  cargo: string;            // Ex: Desenvolvedora Frontend, Analista de RH
  avatarUrl?: string;       // Foto ou iniciais para visualização
}
