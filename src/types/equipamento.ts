/**
 * Status possíveis para um equipamento no inventário.
 */
export type StatusEquipamento = "disponivel" | "em_uso" | "manutencao" | "descartado";

/**
 * Categoria do ativo de TI.
 */
export type TipoEquipamento = "notebook" | "monitor" | "smartphone" | "periferico" | "outro";

/**
 * Subtipos específicos para periféricos e acessórios.
 */
export type SubtipoPeriferico = 
  | "headset" 
  | "mouse" 
  | "teclado" 
  | "webcam" 
  | "hub_usb" 
  | "carregador" 
  | "outro";

/**
 * Entidade Equipamento corporativo.
 */
export interface Equipamento {
  id: string;                      // Identificador único (UUID ou código interno)
  patrimonio: string;              // Número da etiqueta de patrimônio da empresa (ex: PAT-00101)
  tipo: TipoEquipamento;           // Tipo de ativo (notebook, monitor, smartphone, periferico)
  subtipo?: string;                // Subcategoria (ex: Headset, Mouse, Teclado para periféricos)
  marca: string;                   // Ex: Dell, Apple, Logitech, LG, Samsung
  modelo: string;                  // Ex: Latitude 3420, MX Master 3S, UltraWide 29"
  numeroSerie: string;             // Número de série fornecido pelo fabricante
  status: StatusEquipamento;       // Estado atual do equipamento
  
  // Especificações técnicas flexíveis
  processador?: string;            // Ex: Intel Core i7, Apple M2
  memoriaRam?: string;             // Ex: 16 GB DDR4
  armazenamento?: string;          // Ex: SSD 512 GB NVMe, 128 GB
  especificacoes?: string;         // Detalhes extras (ex: 27 polegadas 4K, Sem Fio Bluetooth)

  // Gestão e rastreabilidade de custódia
  responsavelId?: string;          // ID do colaborador com quem está o ativo (quando em_uso)
  dataAquisicao: string;           // Data da compra (formato ISO: YYYY-MM-DD)
  valorAquisicao?: number;         // Valor de compra em reais (R$)
  observacoes?: string;            // Anotações gerais sobre avarias ou detalhes adicionais
  
  criadoEm: string;                // Timestamp de cadastro
  atualizadoEm: string;            // Timestamp da última atualização
}
