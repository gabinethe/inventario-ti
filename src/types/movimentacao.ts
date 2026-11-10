/**
 * Tipos de movimentação possíveis de um ativo ou entidade no inventário.
 */
export type TipoMovimentacao = 
  | "atribuicao"      // Equipamento entregue a um colaborador
  | "devolucao"       // Equipamento devolvido ao estoque pelo colaborador
  | "entrada"         // Novo equipamento ou lote recebido no estoque
  | "manutencao"      // Equipamento enviado para reparo/assistência técnica
  | "retorno"         // Equipamento retornou do conserto para o estoque
  | "descarte"        // Equipamento sucateado ou doado (fim de vida útil)
  | "colaborador"     // Novo colaborador cadastrado na empresa
  | "exclusao";       // Baixa/exclusão definitiva de registro

/**
 * Registro de histórico de movimentação e trilha de auditoria.
 * IMPORTANTE: Esses registros garantem compliance e histórico cronológico corporativo.
 */
export interface Movimentacao {
  id: string;                      // Identificador do evento
  equipamentoId?: string;          // ID do equipamento movimentado (quando aplicável)
  equipamentoNome?: string;        // Nome resumido para visualização rápida (ex: Dell Latitude 3420)
  tipo: TipoMovimentacao;          // Tipo do evento
  responsavelOrigemId?: string;    // De quem saiu (se aplicável)
  responsavelDestinoId?: string;   // Para quem foi (se aplicável)
  responsavelNome?: string;        // Nome do colaborador envolvido
  data: string;                    // Data e hora do evento (ISO)
  motivo: string;                  // Justificativa ou detalhamento (ex: "Entregue no kit de onboarding")
  registradoPor: string;           // Nome ou perfil da administradora que operou o sistema
}
