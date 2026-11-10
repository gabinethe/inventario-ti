/**
 * Tipos de movimentação possíveis de um ativo no inventário.
 */
export type TipoMovimentacao = 
  | "atribuicao"   // Equipamento entregue a um colaborador
  | "devolucao"    // Equipamento devolvido ao estoque pelo colaborador
  | "manutencao"   // Equipamento enviado para reparo/assistência técnica
  | "retorno"      // Equipamento retornou do conserto para o estoque
  | "descarte";    // Equipamento sucateado ou doado (fim de vida útil)

/**
 * Registro de histórico de movimentação.
 * IMPORTANTE: Esses registros são de auditoria e devem ser imutáveis (nunca deletados).
 */
export interface Movimentacao {
  id: string;                      // Identificador do evento
  equipamentoId: string;           // ID do equipamento movimentado
  tipo: TipoMovimentacao;          // Tipo do evento
  responsavelOrigemId?: string;    // De quem saiu (se aplicável)
  responsavelDestinoId?: string;   // Para quem foi (se aplicável)
  data: string;                    // Data e hora do evento
  motivo: string;                  // Justificativa ou detalhamento (ex: "Novo colaborador contratado")
  registradoPor: string;           // Nome ou ID do técnico que operou o sistema
}
