/**
 * Status possíveis para um equipamento no inventário.
 */
export type StatusEquipamento = "disponivel" | "em_uso" | "manutencao" | "descartado";

/**
 * Categoria do ativo. Inicialmente focamos em 'notebook', mas a estrutura
 * já está pronta para expandir para 'monitor', 'periferico', 'servidor', etc.
 */
export type TipoEquipamento = "notebook" | "monitor" | "periferico" | "outro";

/**
 * Entidade Equipamento (com foco no objeto Notebook).
 */
export interface Equipamento {
  id: string;                      // Identificador único (UUID ou código interno)
  patrimonio: string;              // Número da etiqueta de patrimônio da empresa (ex: PAT-0012)
  tipo: TipoEquipamento;           // Tipo de ativo (default: 'notebook')
  marca: string;                   // Ex: Dell, Apple, Lenovo, HP
  modelo: string;                  // Ex: Latitude 3420, MacBook Pro M2, ThinkPad T14
  numeroSerie: string;             // Número de série fornecido pelo fabricante
  status: StatusEquipamento;       // Estado atual do equipamento
  
  // Especificações técnicas (focadas em Notebook)
  processador: string;             // Ex: Intel Core i7 11ª Geração, Apple M2
  memoriaRam: string;              // Ex: 16 GB DDR4, 32 GB Unificada
  armazenamento: string;           // Ex: SSD 512 GB NVMe

  // Gestão e rastreabilidade
  responsavelId?: string;          // ID do colaborador com quem está o notebook (quando em_uso)
  dataAquisicao: string;           // Data da compra (formato ISO: YYYY-MM-DD)
  valorAquisicao?: number;         // Valor de compra em reais (R$)
  observacoes?: string;            // Anotações gerais sobre avarias ou detalhes adicionais
  
  criadoEm: string;                // Timestamp de cadastro
  atualizadoEm: string;            // Timestamp da última atualização
}
