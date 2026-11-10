import { Equipamento, Responsavel, Movimentacao, StatusEquipamento } from "@/types";
import { MOCK_EQUIPAMENTOS, MOCK_RESPONSAVEIS, MOCK_MOVIMENTACOES } from "./mock-data";

// Simulação de banco de dados em memória para o MVP
let equipamentosMemoria: Equipamento[] = [...MOCK_EQUIPAMENTOS];
let movimentacoesMemoria: Movimentacao[] = [...MOCK_MOVIMENTACOES];
let responsaveisMemoria: Responsavel[] = [...MOCK_RESPONSAVEIS];

/**
 * Tipo que une o Equipamento com os dados do Responsável atual,
 * facilitando a exibição em tabelas sem precisar cruzar IDs na tela.
 */
export interface EquipamentoComResponsavel extends Equipamento {
  responsavel?: Responsavel;
}

/**
 * Serviço responsável por todas as operações de Equipamentos.
 * Todas as funções são assíncronas (Promise) para simular o comportamento
 * exato que teremos ao conectar com o Supabase no futuro!
 */
export const equipamentosService = {
  /**
   * Retorna todos os equipamentos, com filtro opcional por busca (texto) ou status.
   */
  async listar(filtros?: { busca?: string; status?: StatusEquipamento }): Promise<EquipamentoComResponsavel[]> {
    let resultado = equipamentosMemoria.map((item) => ({
      ...item,
      responsavel: responsaveisMemoria.find((r) => r.id === item.responsavelId),
    }));

    if (filtros?.busca) {
      const termo = filtros.busca.toLowerCase();
      resultado = resultado.filter(
        (eq) =>
          eq.patrimonio.toLowerCase().includes(termo) ||
          eq.modelo.toLowerCase().includes(termo) ||
          eq.marca.toLowerCase().includes(termo) ||
          eq.numeroSerie.toLowerCase().includes(termo) ||
          eq.responsavel?.nome.toLowerCase().includes(termo)
      );
    }

    if (filtros?.status) {
      resultado = resultado.filter((eq) => eq.status === filtros.status);
    }

    return resultado;
  },

  /**
   * Busca um único equipamento pelo seu ID.
   */
  async buscarPorId(id: string): Promise<EquipamentoComResponsavel | null> {
    const item = equipamentosMemoria.find((eq) => eq.id === id);
    if (!item) return null;

    return {
      ...item,
      responsavel: responsaveisMemoria.find((r) => r.id === item.responsavelId),
    };
  },

  /**
   * Cadastra um novo equipamento (Notebook).
   */
  async criar(dados: Omit<Equipamento, "id" | "criadoEm" | "atualizadoEm">): Promise<Equipamento> {
    const novoEquipamento: Equipamento = {
      ...dados,
      id: `eq-${Date.now()}`,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    equipamentosMemoria.unshift(novoEquipamento);
    return novoEquipamento;
  },

  /**
   * Retorna os números consolidados para o Dashboard.
   */
  async obterMetricas() {
    const total = equipamentosMemoria.length;
    const emUso = equipamentosMemoria.filter((e) => e.status === "em_uso").length;
    const disponiveis = equipamentosMemoria.filter((e) => e.status === "disponivel").length;
    const emManutencao = equipamentosMemoria.filter((e) => e.status === "manutencao").length;
    const valorTotalParque = equipamentosMemoria.reduce((soma, e) => soma + (e.valorAquisicao || 0), 0);

    return {
      total,
      emUso,
      disponiveis,
      emManutencao,
      valorTotalParque,
    };
  },

  /**
   * Lista todos os responsáveis cadastrados (colaboradores).
   */
  async listarResponsaveis(): Promise<Responsavel[]> {
    return [...responsaveisMemoria];
  },

  /**
   * Retorna o histórico de movimentações de um equipamento específico.
   */
  async listarHistorico(equipamentoId: string): Promise<Movimentacao[]> {
    return movimentacoesMemoria.filter((m) => m.equipamentoId === equipamentoId);
  },
};
