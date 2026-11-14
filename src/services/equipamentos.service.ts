import { Equipamento, Responsavel, Movimentacao, StatusEquipamento, TipoEquipamento, TipoMovimentacao } from "@/types";
import { MOCK_EQUIPAMENTOS, MOCK_RESPONSAVEIS, MOCK_MOVIMENTACOES } from "./mock-data";
import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

const STORAGE_KEY_EQ = "inventario_ti_equipamentos";
const STORAGE_KEY_RESP = "inventario_ti_responsaveis";
const STORAGE_KEY_MOV = "inventario_ti_movimentacoes";

// Recupera dados salvos localmente com fallback garantido
function getMemoria(): { eq: Equipamento[]; resp: Responsavel[]; mov: Movimentacao[] } {
  if (typeof window !== "undefined") {
    try {
      const salvoEq = localStorage.getItem(STORAGE_KEY_EQ);
      const salvoResp = localStorage.getItem(STORAGE_KEY_RESP);
      const salvoMov = localStorage.getItem(STORAGE_KEY_MOV);

      // Limpa movimentações legadas de ilustração (mov-1 a mov-7) que possam ter ficado no browser
      const MOCK_IDS_LEGADOS = new Set(["mov-1", "mov-2", "mov-3", "mov-4", "mov-5", "mov-6", "mov-7"]);
      let listaMov: Movimentacao[] = salvoMov ? JSON.parse(salvoMov) : [...MOCK_MOVIMENTACOES];
      if (Array.isArray(listaMov)) {
        const filtrada = listaMov.filter((m) => !MOCK_IDS_LEGADOS.has(m.id));
        if (filtrada.length !== listaMov.length) {
          localStorage.setItem(STORAGE_KEY_MOV, JSON.stringify(filtrada));
        }
        listaMov = filtrada;
      } else {
        listaMov = [];
      }

      return {
        eq: salvoEq ? JSON.parse(salvoEq) : [...MOCK_EQUIPAMENTOS],
        resp: salvoResp ? JSON.parse(salvoResp) : [...MOCK_RESPONSAVEIS],
        mov: listaMov,
      };
    } catch {
      return { eq: [...MOCK_EQUIPAMENTOS], resp: [...MOCK_RESPONSAVEIS], mov: [...MOCK_MOVIMENTACOES] };
    }
  }
  return { eq: [...MOCK_EQUIPAMENTOS], resp: [...MOCK_RESPONSAVEIS], mov: [...MOCK_MOVIMENTACOES] };
}

function salvarMemoria(eq: Equipamento[], resp?: Responsavel[], mov?: Movimentacao[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_EQ, JSON.stringify(eq));
      if (resp) localStorage.setItem(STORAGE_KEY_RESP, JSON.stringify(resp));
      if (mov) localStorage.setItem(STORAGE_KEY_MOV, JSON.stringify(mov));
      window.dispatchEvent(new Event("inventario_alterado"));
    } catch (e) {
      console.error("Erro ao salvar dados localmente:", e);
    }
  }
}

const isUUID = (str?: string) =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

async function sincronizarMovimentacaoSupabase(mov: {
  equipamentoId?: string;
  tipo: TipoMovimentacao;
  responsavelOrigemId?: string;
  responsavelDestinoId?: string;
  motivo: string;
  registradoPor: string;
  data?: string;
}) {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    const payload: any = {
      tipo: mov.tipo,
      motivo: mov.motivo,
      registrado_por: mov.registradoPor || getAdminNome(),
      data: mov.data || new Date().toISOString(),
    };
    if (isUUID(mov.equipamentoId)) payload.equipamento_id = mov.equipamentoId;
    if (isUUID(mov.responsavelOrigemId)) payload.responsavel_origem_id = mov.responsavelOrigemId;
    if (isUUID(mov.responsavelDestinoId)) payload.responsavel_destino_id = mov.responsavelDestinoId;

    await supabase.from("movimentacoes").insert(payload);
  } catch (err) {
    console.warn("Aviso ao persistir movimentação no Supabase:", err);
  }
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("seu-projeto")) {
    return null;
  }
  if (typeof window !== "undefined") {
    return createBrowserClient(url, key);
  }
  return createSupabaseJsClient(url, key);
}

function getAdminNome(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("user_perfil_nome") || "Gabriela Chagas";
  }
  return "Gabriela Chagas";
}

/**
 * Formata a identificação legível do equipamento sem expor IDs técnicos ou parênteses vazios.
 */
function formatarIdentificacaoEquipamento(eq?: { marca?: string; modelo?: string; numeroSerie?: string; subtipo?: string } | null): string {
  if (!eq) return "Equipamento de TI";
  const base = `${eq.marca || ""} ${eq.modelo || ""}`.trim() || (eq.subtipo || "Equipamento");
  if (eq.numeroSerie && eq.numeroSerie !== "N/A" && eq.numeroSerie.trim()) {
    return `${base} (S/N: ${eq.numeroSerie})`;
  }
  return base;
}

/**
 * Remove resíduos de IDs de banco, parênteses vazios ou '(undefined)' de textos antigos.
 */
function limparTextoResidual(texto?: string): string {
  if (!texto) return "";
  return texto
    .replace(/\s*\(\s*\)/g, "")
    .replace(/\s*\(undefined\)/gi, "")
    .replace(/\s*\(null\)/gi, "")
    .replace(/\([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\)/gi, "")
    .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, "Equipamento")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export interface EquipamentoComResponsavel extends Equipamento {
  responsavel?: Responsavel;
}

export const equipamentosService = {
  /**
   * Retorna todos os equipamentos, com suporte a filtros por tipo, status e termo de busca.
   * Integração fluida entre o armazenamento local e o Supabase.
   */
  async listar(filtros?: { 
    busca?: string; 
    status?: StatusEquipamento | "todos";
    tipo?: TipoEquipamento | "todos";
  }): Promise<EquipamentoComResponsavel[]> {
    let baseEquipamentos: Equipamento[] = [];
    const memoria = getMemoria();

    // No navegador, a memória local (localStorage) é a fonte de verdade imediata da sessão do usuário
    if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY_EQ)) {
      baseEquipamentos = memoria.eq;
    } else {
      // Primeira inicialização ou SSR: busca do Supabase
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { data, error } = await supabase.from("equipamentos").select("*, responsaveis(*)");
          if (!error && data && data.length > 0) {
            const listaSupabase: Equipamento[] = data.map((item: any) => ({
              id: item.id,
              patrimonio: item.patrimonio,
              tipo: (item.tipo as TipoEquipamento) || "notebook",
              subtipo: item.subtipo,
              marca: item.marca,
              modelo: item.modelo,
              numeroSerie: item.numero_serie,
              status: item.status,
              processador: item.processador,
              memoriaRam: item.memoria_ram,
              armazenamento: item.armazenamento,
              especificacoes: item.especificacoes,
              responsavelId: item.responsavel_id,
              dataAquisicao: item.data_aquisicao,
              valorAquisicao: Number(item.valor_aquisicao) || 0,
              observacoes: item.observacoes,
              criadoEm: item.criado_em,
              atualizadoEm: item.atualizado_em,
            }));

            // Complementa com o inventário diversificado se o Supabase tiver apenas notebooks iniciais
            const patrimoniosExistentes = new Set(listaSupabase.map((e) => e.patrimonio));
            const complementares = MOCK_EQUIPAMENTOS.filter((e) => !patrimoniosExistentes.has(e.patrimonio));
            baseEquipamentos = [...listaSupabase, ...complementares];

            if (typeof window !== "undefined") {
              salvarMemoria(baseEquipamentos);
            }
          }
        } catch (err) {
          console.error("Erro ao listar do Supabase:", err);
        }
      }

      if (baseEquipamentos.length === 0) {
        baseEquipamentos = memoria.eq;
      }
    }

    let resultado: EquipamentoComResponsavel[] = baseEquipamentos.map((item) => ({
      ...item,
      responsavel: memoria.resp.find((r) => r.id === item.responsavelId),
    }));

    if (filtros?.tipo && filtros.tipo !== "todos") {
      resultado = resultado.filter((eq) => eq.tipo === filtros.tipo);
    }

    if (filtros?.status && filtros.status !== "todos") {
      resultado = resultado.filter((eq) => eq.status === filtros.status);
    }

    if (filtros?.busca) {
      const termo = filtros.busca.toLowerCase();
      resultado = resultado.filter(
        (eq) =>
          (eq.patrimonio && eq.patrimonio.toLowerCase().includes(termo)) ||
          eq.modelo.toLowerCase().includes(termo) ||
          eq.marca.toLowerCase().includes(termo) ||
          eq.numeroSerie.toLowerCase().includes(termo) ||
          (eq.subtipo && eq.subtipo.toLowerCase().includes(termo)) ||
          (eq.responsavel?.nome.toLowerCase().includes(termo) ?? false)
      );
    }

    return resultado;
  },

  /**
   * Busca um único equipamento pelo seu ID.
   * Consulta a memória local da sessão primeiro para resposta instantânea e garantida.
   */
  async buscarPorId(id: string): Promise<EquipamentoComResponsavel | null> {
    const memoria = getMemoria();
    const equipamentoLocal = memoria.eq.find((e) => e.id === id);
    if (equipamentoLocal) {
      const responsavel = memoria.resp.find((r) => r.id === equipamentoLocal.responsavelId);
      return {
        ...equipamentoLocal,
        responsavel,
      };
    }

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("equipamentos")
          .select("*, responsaveis(*)")
          .eq("id", id)
          .single();

        if (!error && data) {
          return {
            id: data.id,
            patrimonio: data.patrimonio,
            tipo: data.tipo as TipoEquipamento,
            subtipo: data.subtipo,
            marca: data.marca,
            modelo: data.modelo,
            numeroSerie: data.numero_serie,
            status: data.status,
            processador: data.processador,
            memoriaRam: data.memoria_ram,
            armazenamento: data.armazenamento,
            especificacoes: data.especificacoes,
            responsavelId: data.responsavel_id,
            dataAquisicao: data.data_aquisicao,
            valorAquisicao: Number(data.valor_aquisicao) || 0,
            observacoes: data.observacoes,
            criadoEm: data.criado_em,
            atualizadoEm: data.atualizado_em,
            responsavel: data.responsaveis
              ? {
                  id: data.responsaveis.id,
                  nome: data.responsaveis.nome,
                  email: data.responsaveis.email,
                  departamento: data.responsaveis.departamento,
                  cargo: data.responsaveis.cargo,
                  avatarUrl: data.responsaveis.avatar_url,
                }
              : undefined,
          };
        }
      } catch (err) {
        console.error("Erro ao buscar equipamento no Supabase:", err);
      }
    }

    return null;
  },

  /**
   * Cadastra um novo equipamento no inventário e registra na auditoria.
   */
  async criar(dados: Omit<Equipamento, "id" | "criadoEm" | "atualizadoEm">): Promise<Equipamento> {
    const memoria = getMemoria();

    // 1. Validação de Unicidade do Número de Série
    if (dados.numeroSerie && dados.numeroSerie.trim()) {
      const serialLimpo = dados.numeroSerie.trim().toLowerCase();
      // Ignora rótulos genéricos de lotes sem serial individual
      if (!serialLimpo.startsWith("lote estoque") && serialLimpo !== "s/n" && serialLimpo !== "n/a") {
        const duplicado = memoria.eq.find(
          (e) => e.numeroSerie && e.numeroSerie.trim().toLowerCase() === serialLimpo
        );
        if (duplicado) {
          throw new Error(
            `Já existe um equipamento cadastrado com o número de série '${dados.numeroSerie.trim()}'. Cada dispositivo deve possuir um serial number exclusivo.`
          );
        }
      }
    }

    const supabase = getSupabase();
    let novoEquipamento: Equipamento | null = null;

    if (supabase) {
      try {
        const payloadBase: any = {
          patrimonio: dados.patrimonio || ("ATV-" + Date.now().toString().slice(-6)),
          tipo: dados.tipo || "notebook",
          marca: dados.marca,
          modelo: dados.modelo,
          numero_serie: dados.numeroSerie,
          status: dados.status,
          processador: dados.processador || "N/A",
          memoria_ram: dados.memoriaRam || "N/A",
          armazenamento: dados.armazenamento || "N/A",
          responsavel_id: dados.responsavelId || null,
          data_aquisicao: dados.dataAquisicao,
          valor_aquisicao: dados.valorAquisicao,
          observacoes: dados.observacoes || (dados.subtipo ? `Subtipo: ${dados.subtipo}` : null),
        };

        // Tenta salvar com as novas colunas
        let res = await supabase
          .from("equipamentos")
          .insert({
            ...payloadBase,
            subtipo: dados.subtipo,
            especificacoes: dados.especificacoes,
          })
          .select()
          .single();

        // Se falhou por colunas inexistentes na tabela do Supabase, tenta com payload compatível
        if (res.error) {
          res = await supabase
            .from("equipamentos")
            .insert(payloadBase)
            .select()
            .single();
        }

        if (!res.error && res.data) {
          novoEquipamento = {
            ...dados,
            id: res.data.id,
            criadoEm: res.data.criado_em,
            atualizadoEm: res.data.atualizado_em,
          };
        }
      } catch (err) {
        console.error("Erro ao criar equipamento no Supabase:", err);
      }
    }

    if (!novoEquipamento) {
      novoEquipamento = {
        ...dados,
        id: `eq-${Date.now()}`,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      };
    }

    const memoriaAtualizada = getMemoria();
    const novaListaEq = [novoEquipamento, ...memoriaAtualizada.eq];
    
    // Registra entrada de equipamento na auditoria
    const tipoLegivel = {
      notebook: "Notebook",
      monitor: "Monitor",
      smartphone: "Smartphone Corporativo",
      periferico: dados.subtipo ? `Periférico (${dados.subtipo})` : "Periférico",
      outro: "Equipamento",
    }[dados.tipo] || "Equipamento";

    const identificacao = formatarIdentificacaoEquipamento(novoEquipamento);
    const novaMovimentacao: Movimentacao = {
      id: `mov-${Date.now()}`,
      tipo: "entrada",
      equipamentoId: novoEquipamento.id,
      equipamentoNome: identificacao,
      motivo: `Novo ${tipoLegivel} adicionado ao estoque corporativo: ${identificacao}.`,
      data: new Date().toISOString(),
      registradoPor: getAdminNome(),
    };

    salvarMemoria(novaListaEq, memoriaAtualizada.resp, [novaMovimentacao, ...memoriaAtualizada.mov]);
    sincronizarMovimentacaoSupabase({
      equipamentoId: novoEquipamento.id,
      tipo: "entrada",
      motivo: novaMovimentacao.motivo,
      registradoPor: novaMovimentacao.registradoPor,
      data: novaMovimentacao.data,
    });
    return novoEquipamento;
  },

  /**
   * Atribui um equipamento da empresa a um colaborador responsável.
   * Suporta alocação unitária a partir de lotes de periféricos com decremento do estoque.
   */
  async atribuirEquipamento(
    equipamentoId: string, 
    responsavelId: string, 
    motivoCustomizado?: string,
    numeroSerieUnidade?: string
  ): Promise<boolean> {
    const memoria = getMemoria();
    const equipamento = memoria.eq.find((e) => e.id === equipamentoId);
    const colaborador = memoria.resp.find((r) => r.id === responsavelId);

    if (!equipamento || !colaborador) return false;

    // Se for periférico em lote com mais de 1 unidade disponível no estoque
    if (equipamento.tipo === "periferico" && (equipamento.quantidadeDisponivel ?? 1) > 1) {
      const serialUnidade = numeroSerieUnidade?.trim() || `SN-${(equipamento.subtipo || "PER").toUpperCase()}-${Date.now().toString().slice(-6)}`;
      const qtdRestante = (equipamento.quantidadeDisponivel ?? 1) - 1;

      // Unidade individual entregue sob custódia do colaborador
      const unidadeEntregue: Equipamento = {
        id: `eq-unit-${Date.now()}`,
        tipo: "periferico",
        subtipo: equipamento.subtipo,
        marca: equipamento.marca,
        modelo: equipamento.modelo,
        numeroSerie: serialUnidade,
        status: "em_uso",
        responsavelId: colaborador.id,
        dataAquisicao: equipamento.dataAquisicao,
        valorAquisicao: equipamento.valorAquisicao,
        especificacoes: equipamento.especificacoes,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      };

      // Atualiza a quantidade disponível do lote remanescente
      const novaListaEq = [
        unidadeEntregue,
        ...memoria.eq.map((e) =>
          e.id === equipamentoId
            ? {
                ...e,
                quantidadeDisponivel: qtdRestante,
                status: (qtdRestante > 0 ? "disponivel" : "em_uso") as StatusEquipamento,
                atualizadoEm: new Date().toISOString(),
              }
            : e
        ),
      ];

      const motivo = motivoCustomizado || `Atribuição de 1 unidade de ${equipamento.marca} ${equipamento.modelo} (Serial: ${serialUnidade}) para ${colaborador.nome}. Restam ${qtdRestante} unidades em estoque.`;

      const novaMov: Movimentacao = {
        id: `mov-${Date.now()}`,
        tipo: "atribuicao",
        equipamentoId: unidadeEntregue.id,
        equipamentoNome: `${equipamento.marca} ${equipamento.modelo}`,
        responsavelDestinoId: responsavelId,
        responsavelNome: colaborador.nome,
        data: new Date().toISOString(),
        motivo,
        registradoPor: getAdminNome(),
      };

      salvarMemoria(novaListaEq, memoria.resp, [novaMov, ...memoria.mov]);
      sincronizarMovimentacaoSupabase({
        equipamentoId: unidadeEntregue.id,
        tipo: "atribuicao",
        responsavelDestinoId: responsavelId,
        motivo: novaMov.motivo,
        registradoPor: novaMov.registradoPor,
        data: novaMov.data,
      });
      return true;
    }

    // Equipamento individual (notebook, monitor, celular ou última unidade de periférico)
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from("equipamentos")
          .update({
            responsavel_id: responsavelId,
            status: "em_uso",
            atualizado_em: new Date().toISOString(),
          })
          .eq("id", equipamentoId);
      } catch (err) {
        console.error("Erro ao atualizar atribuição no Supabase:", err);
      }
    }

    const novaListaEq = memoria.eq.map((e) =>
      e.id === equipamentoId
        ? { 
            ...e, 
            responsavelId, 
            status: "em_uso" as StatusEquipamento,
            quantidadeDisponivel: 0,
            numeroSerie: numeroSerieUnidade?.trim() || e.numeroSerie,
            atualizadoEm: new Date().toISOString() 
          }
        : e
    );

    const motivo = motivoCustomizado || `Equipamento atribuído para ${colaborador.nome} (${colaborador.departamento}).`;

    const identificacaoAtribuicao = formatarIdentificacaoEquipamento(equipamento);
    const novaMov: Movimentacao = {
      id: `mov-${Date.now()}`,
      tipo: "atribuicao",
      equipamentoId,
      equipamentoNome: identificacaoAtribuicao,
      responsavelDestinoId: responsavelId,
      responsavelNome: colaborador.nome,
      data: new Date().toISOString(),
      motivo,
      registradoPor: getAdminNome(),
    };

    salvarMemoria(novaListaEq, memoria.resp, [novaMov, ...memoria.mov]);
    sincronizarMovimentacaoSupabase({
      equipamentoId,
      tipo: "atribuicao",
      responsavelDestinoId: responsavelId,
      motivo: novaMov.motivo,
      registradoPor: novaMov.registradoPor,
      data: novaMov.data,
    });
    return true;
  },

  /**
   * Devolve um equipamento sob custódia de volta para o estoque disponível.
   */
  async devolverEquipamento(equipamentoId: string, motivoCustomizado?: string): Promise<boolean> {
    const memoria = getMemoria();
    const equipamento = memoria.eq.find((e) => e.id === equipamentoId);
    if (!equipamento) return false;

    const colaboradorOrigem = memoria.resp.find((r) => r.id === equipamento.responsavelId);

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from("equipamentos")
          .update({
            responsavel_id: null,
            status: "disponivel",
            atualizado_em: new Date().toISOString(),
          })
          .eq("id", equipamentoId);
      } catch (err) {
        console.error("Erro ao devolver equipamento no Supabase:", err);
      }
    }

    const novaListaEq = memoria.eq.map((e) =>
      e.id === equipamentoId
        ? { ...e, responsavelId: undefined, status: "disponivel" as StatusEquipamento, atualizadoEm: new Date().toISOString() }
        : e
    );

    const motivo =
      motivoCustomizado ||
      (colaboradorOrigem
        ? `Equipamento devolvido ao estoque de TI por ${colaboradorOrigem.nome}.`
        : "Equipamento devolvido ao estoque de TI.");

    const identificacaoDevolucao = formatarIdentificacaoEquipamento(equipamento);
    const novaMov: Movimentacao = {
      id: `mov-${Date.now()}`,
      tipo: "devolucao",
      equipamentoId,
      equipamentoNome: identificacaoDevolucao,
      responsavelOrigemId: colaboradorOrigem?.id,
      responsavelNome: colaboradorOrigem?.nome,
      data: new Date().toISOString(),
      motivo,
      registradoPor: getAdminNome(),
    };

    salvarMemoria(novaListaEq, memoria.resp, [novaMov, ...memoria.mov]);
    sincronizarMovimentacaoSupabase({
      equipamentoId,
      tipo: "devolucao",
      responsavelOrigemId: colaboradorOrigem?.id,
      motivo: novaMov.motivo,
      registradoPor: novaMov.registradoPor,
      data: novaMov.data,
    });
    return true;
  },

  /**
   * Encaminha um equipamento para assistência técnica / manutenção.
   * Altera status para 'manutencao', desassocia a custódia caso estivesse alocado e registra auditoria.
   */
  async enviarParaManutencao(
    equipamentoId: string,
    dados: {
      motivo: string;
      prestador: string;
      previsaoRetorno?: string;
      observacoes?: string;
    }
  ): Promise<boolean> {
    const memoria = getMemoria();
    const equipamento = memoria.eq.find((e) => e.id === equipamentoId);
    if (!equipamento) return false;

    const colaboradorOrigem = memoria.resp.find((r) => r.id === equipamento.responsavelId);

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from("equipamentos")
          .update({
            responsavel_id: null,
            status: "manutencao",
            observacoes: dados.observacoes
              ? `${dados.motivo} (Assistência: ${dados.prestador})`
              : equipamento.observacoes,
            atualizado_em: new Date().toISOString(),
          })
          .eq("id", equipamentoId);
      } catch (err) {
        console.error("Erro ao registrar manutenção no Supabase:", err);
      }
    }

    const novaListaEq = memoria.eq.map((e) =>
      e.id === equipamentoId
        ? {
            ...e,
            responsavelId: undefined,
            status: "manutencao" as StatusEquipamento,
            atualizadoEm: new Date().toISOString(),
          }
        : e
    );

    const identificacao = formatarIdentificacaoEquipamento(equipamento);
    const detalheColab = colaboradorOrigem ? ` (recolhido de ${colaboradorOrigem.nome})` : "";
    const detalhePrevisao = dados.previsaoRetorno ? ` • Previsão retorno: ${dados.previsaoRetorno}` : "";
    const detalheObs = dados.observacoes ? ` • Obs: ${dados.observacoes}` : "";

    const motivoAuditoria = `Encaminhado para manutenção técnica${detalheColab}. Defeito: ${dados.motivo} • Prestador/Assistência: ${dados.prestador}${detalhePrevisao}${detalheObs}`;

    const novaMov: Movimentacao = {
      id: `mov-${Date.now()}`,
      tipo: "manutencao",
      equipamentoId,
      equipamentoNome: identificacao,
      responsavelOrigemId: colaboradorOrigem?.id,
      responsavelNome: colaboradorOrigem?.nome,
      motivo: motivoAuditoria,
      data: new Date().toISOString(),
      registradoPor: getAdminNome(),
    };

    salvarMemoria(novaListaEq, memoria.resp, [novaMov, ...memoria.mov]);
    sincronizarMovimentacaoSupabase({
      equipamentoId,
      tipo: "manutencao",
      responsavelOrigemId: colaboradorOrigem?.id,
      motivo: novaMov.motivo,
      registradoPor: novaMov.registradoPor,
      data: novaMov.data,
    });
    return true;
  },

  /**
   * Conclui a manutenção técnica de um equipamento e o retorna ao estoque disponível.
   */
  async concluirManutencao(
    equipamentoId: string,
    dados?: {
      observacoesRetorno?: string;
    }
  ): Promise<boolean> {
    const memoria = getMemoria();
    const equipamento = memoria.eq.find((e) => e.id === equipamentoId);
    if (!equipamento) return false;

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from("equipamentos")
          .update({
            responsavel_id: null,
            status: "disponivel",
            atualizado_em: new Date().toISOString(),
          })
          .eq("id", equipamentoId);
      } catch (err) {
        console.error("Erro ao concluir manutenção no Supabase:", err);
      }
    }

    const novaListaEq = memoria.eq.map((e) =>
      e.id === equipamentoId
        ? {
            ...e,
            responsavelId: undefined,
            status: "disponivel" as StatusEquipamento,
            atualizadoEm: new Date().toISOString(),
          }
        : e
    );

    const identificacao = formatarIdentificacaoEquipamento(equipamento);
    const detalheNota = dados?.observacoesRetorno
      ? ` Observações do laudo/reparo: ${dados.observacoesRetorno}.`
      : "";

    const novaMov: Movimentacao = {
      id: `mov-${Date.now()}`,
      tipo: "devolucao",
      equipamentoId,
      equipamentoNome: identificacao,
      motivo: `Manutenção técnica concluída. Equipamento revisado, testado e reintegrado ao estoque disponível.${detalheNota}`,
      data: new Date().toISOString(),
      registradoPor: getAdminNome(),
    };

    salvarMemoria(novaListaEq, memoria.resp, [novaMov, ...memoria.mov]);
    sincronizarMovimentacaoSupabase({
      equipamentoId,
      tipo: "devolucao",
      motivo: novaMov.motivo,
      registradoPor: novaMov.registradoPor,
      data: novaMov.data,
    });
    return true;
  },

  /**
   * Exclui um equipamento com segurança (Supabase + Persistência local).
   */
  async excluirEquipamento(id: string): Promise<boolean> {
    const memoria = getMemoria();
    const equipamento = memoria.eq.find((e) => e.id === id);

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from("equipamentos").delete().eq("id", id);
      } catch (err) {
        console.error("Erro ao excluir equipamento do Supabase:", err);
      }
    }

    const novaListaEq = memoria.eq.filter((e) => e.id !== id);

    const identificacaoExclusao = formatarIdentificacaoEquipamento(equipamento);
    const novaMov: Movimentacao = {
      id: `mov-${Date.now()}`,
      tipo: "exclusao",
      equipamentoId: id,
      equipamentoNome: identificacaoExclusao,
      motivo: `Baixa patrimonial do equipamento ${identificacaoExclusao} registrada no inventário.`,
      data: new Date().toISOString(),
      registradoPor: getAdminNome(),
    };

    salvarMemoria(novaListaEq, memoria.resp, [novaMov, ...memoria.mov]);
    sincronizarMovimentacaoSupabase({
      tipo: "exclusao",
      motivo: novaMov.motivo,
      registradoPor: novaMov.registradoPor,
      data: novaMov.data,
    });
    return true;
  },

  /**
   * Lista todos os responsáveis cadastrados.
   */
  async listarResponsaveis(): Promise<Responsavel[]> {
    const memoria = getMemoria();
    if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY_RESP)) {
      return memoria.resp;
    }

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from("responsaveis").select("*");
        if (!error && data && data.length > 0) {
          const resps: Responsavel[] = data.map((item: any) => ({
            id: item.id,
            nome: item.nome,
            email: item.email,
            departamento: item.departamento,
            cargo: item.cargo,
            avatarUrl: item.avatar_url,
          }));

          const emailsExistentes = new Set(resps.map((r) => r.email));
          const complementares = MOCK_RESPONSAVEIS.filter((r) => !emailsExistentes.has(r.email));
          const listaFinal = [...resps, ...complementares];

          if (typeof window !== "undefined") {
            salvarMemoria(memoria.eq, listaFinal, memoria.mov);
          }
          return listaFinal;
        }
      } catch (err) {
        console.error("Erro ao listar responsáveis do Supabase:", err);
      }
    }

    return memoria.resp;
  },

  /**
   * Cadastra um novo colaborador no inventário e registra na auditoria.
   */
  async criarResponsavel(dados: Omit<Responsavel, "id">): Promise<Responsavel> {
    const supabase = getSupabase();
    let novoResp: Responsavel | null = null;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("responsaveis")
          .insert({
            nome: dados.nome,
            email: dados.email,
            departamento: dados.departamento,
            cargo: dados.cargo,
          })
          .select()
          .single();

        if (!error && data) {
          novoResp = {
            id: data.id,
            nome: data.nome,
            email: data.email,
            departamento: data.departamento,
            cargo: data.cargo,
          };
        }
      } catch (err) {
        console.error("Erro ao criar responsável no Supabase:", err);
      }
    }

    if (!novoResp) {
      novoResp = {
        ...dados,
        id: `resp-${Date.now()}`,
      };
    }

    const memoria = getMemoria();
    const novaListaResp = [novoResp, ...memoria.resp];

    const novaMov: Movimentacao = {
      id: `mov-${Date.now()}`,
      tipo: "colaborador",
      responsavelDestinoId: novoResp.id,
      responsavelNome: novoResp.nome,
      motivo: `Novo colaborador cadastrado: ${novoResp.nome} (${novoResp.cargo} • ${novoResp.departamento}).`,
      data: new Date().toISOString(),
      registradoPor: getAdminNome(),
    };

    salvarMemoria(memoria.eq, novaListaResp, [novaMov, ...memoria.mov]);
    sincronizarMovimentacaoSupabase({
      tipo: "colaborador",
      responsavelDestinoId: novoResp.id,
      motivo: novaMov.motivo,
      registradoPor: novaMov.registradoPor,
      data: novaMov.data,
    });
    return novoResp;
  },

  /**
   * Exclui um colaborador responsável, devolvendo seus ativos ao estoque.
   */
  async excluirResponsavel(id: string): Promise<boolean> {
    const memoria = getMemoria();
    const colaborador = memoria.resp.find((r) => r.id === id);

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from("equipamentos")
          .update({ responsavel_id: null, status: "disponivel" })
          .eq("responsavel_id", id);

        await supabase.from("responsaveis").delete().eq("id", id);
      } catch (err) {
        console.error("Erro ao excluir responsável do Supabase:", err);
      }
    }

    const novaListaResp = memoria.resp.filter((r) => r.id !== id);
    const novaListaEq = memoria.eq.map((e) =>
      e.responsavelId === id ? { ...e, responsavelId: undefined, status: "disponivel" as StatusEquipamento } : e
    );

    const nomeColaborador = colaborador?.nome || "Colaborador";
    const novaMov: Movimentacao = {
      id: `mov-${Date.now()}`,
      tipo: "exclusao",
      responsavelNome: nomeColaborador,
      motivo: `Desligamento do colaborador ${nomeColaborador}. Seus ativos retornaram ao estoque de TI.`,
      data: new Date().toISOString(),
      registradoPor: getAdminNome(),
    };

    salvarMemoria(novaListaEq, novaListaResp, [novaMov, ...memoria.mov]);
    sincronizarMovimentacaoSupabase({
      tipo: "exclusao",
      responsavelOrigemId: id,
      motivo: novaMov.motivo,
      registradoPor: novaMov.registradoPor,
      data: novaMov.data,
    });
    return true;
  },

  /**
   * Retorna a lista completa de movimentações de auditoria em ordem cronológica decrescente.
   * Busca no Supabase com sincronização e fallback no armazenamento local.
   * Aplica sanitização automática para eliminar resíduos de IDs de banco ou parênteses vazios.
   */
  async listarMovimentacoes(filtros?: { tipo?: TipoMovimentacao | "todos"; busca?: string }): Promise<Movimentacao[]> {
    let lista: Movimentacao[] = [];

    // 1. Consulta o histórico oficial gravado no Supabase
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("movimentacoes")
          .select("*, equipamentos(id, marca, modelo, subtipo, numero_serie, patrimonio), responsavel_destino:responsaveis!movimentacoes_responsavel_destino_id_fkey(nome), responsavel_origem:responsaveis!movimentacoes_responsavel_origem_id_fkey(nome)")
          .order("data", { ascending: false });

        if (!error && data && data.length > 0) {
          lista = data.map((item: any) => ({
            id: item.id,
            equipamentoId: item.equipamento_id,
            equipamentoNome: item.equipamentos ? formatarIdentificacaoEquipamento(item.equipamentos) : undefined,
            tipo: item.tipo as TipoMovimentacao,
            responsavelDestinoId: item.responsavel_destino_id,
            responsavelOrigemId: item.responsavel_origem_id,
            responsavelNome: item.responsavel_destino?.nome || item.responsavel_origem?.nome || undefined,
            data: item.data || item.criado_em,
            motivo: limparTextoResidual(item.motivo),
            registradoPor: item.registrado_por || "Administrador",
          }));

          // Atualiza o cache local para resposta offline/imediata
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY_MOV, JSON.stringify(lista));
          }
        }
      } catch (err) {
        console.warn("Aviso ao buscar movimentações do Supabase, utilizando fallback local:", err);
      }
    }

    // 2. Se o Supabase estiver sem dados ou inacessível, recupera do cache local
    if (lista.length === 0) {
      const memoria = getMemoria();
      lista = [...memoria.mov];
    }

    // Ordenação garantida por data decrescente
    lista.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    // Sanitiza qualquer texto legado para exibição impecável
    lista = lista.map((m) => ({
      ...m,
      equipamentoNome: m.equipamentoNome ? limparTextoResidual(m.equipamentoNome) : undefined,
      motivo: limparTextoResidual(m.motivo),
    }));

    if (filtros?.tipo && filtros.tipo !== "todos") {
      lista = lista.filter((m) => m.tipo === filtros.tipo);
    }

    if (filtros?.busca) {
      const termo = filtros.busca.toLowerCase();
      lista = lista.filter(
        (m) =>
          m.motivo.toLowerCase().includes(termo) ||
          (m.equipamentoNome?.toLowerCase().includes(termo) ?? false) ||
          (m.responsavelNome?.toLowerCase().includes(termo) ?? false) ||
          m.registradoPor.toLowerCase().includes(termo)
      );
    }

    return lista;
  },

  /**
   * Limpa o histórico de movimentações para iniciar novos testes do zero.
   */
  async limparMovimentacoes(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_MOV, JSON.stringify([]));
      window.dispatchEvent(new Event("inventario_alterado"));
    }
  },

  /**
   * Retorna os números consolidados para o Dashboard e para os badges da barra lateral.
   */
  async obterMetricas() {
    const lista = await this.listar();
    const resps = await this.listarResponsaveis();
    const movs = await this.listarMovimentacoes();

    const total = lista.length;
    const emUso = lista.filter((e) => e.status === "em_uso").length;
    const disponiveis = lista.filter((e) => e.status === "disponivel").length;
    const emManutencao = lista.filter((e) => e.status === "manutencao").length;
    const valorTotalParque = lista.reduce((soma, e) => soma + (e.valorAquisicao || 0), 0);

    const porTipo = {
      notebook: lista.filter((e) => e.tipo === "notebook").length,
      monitor: lista.filter((e) => e.tipo === "monitor").length,
      smartphone: lista.filter((e) => e.tipo === "smartphone").length,
      periferico: lista.filter((e) => e.tipo === "periferico").length,
    };

    const porTipoDetalhado = {
      notebook: {
        total: lista.filter((e) => e.tipo === "notebook").length,
        disponivel: lista.filter((e) => e.tipo === "notebook" && e.status === "disponivel").length,
        emUso: lista.filter((e) => e.tipo === "notebook" && e.status === "em_uso").length,
        manutencao: lista.filter((e) => e.tipo === "notebook" && e.status === "manutencao").length,
      },
      monitor: {
        total: lista.filter((e) => e.tipo === "monitor").length,
        disponivel: lista.filter((e) => e.tipo === "monitor" && e.status === "disponivel").length,
        emUso: lista.filter((e) => e.tipo === "monitor" && e.status === "em_uso").length,
        manutencao: lista.filter((e) => e.tipo === "monitor" && e.status === "manutencao").length,
      },
      smartphone: {
        total: lista.filter((e) => e.tipo === "smartphone").length,
        disponivel: lista.filter((e) => e.tipo === "smartphone" && e.status === "disponivel").length,
        emUso: lista.filter((e) => e.tipo === "smartphone" && e.status === "em_uso").length,
        manutencao: lista.filter((e) => e.tipo === "smartphone" && e.status === "manutencao").length,
      },
      periferico: {
        total: lista.filter((e) => e.tipo === "periferico").length,
        disponivel: lista.filter((e) => e.tipo === "periferico" && e.status === "disponivel").length,
        emUso: lista.filter((e) => e.tipo === "periferico" && e.status === "em_uso").length,
        manutencao: lista.filter((e) => e.tipo === "periferico" && e.status === "manutencao").length,
      },
    };

    return {
      total,
      emUso,
      disponiveis,
      emManutencao,
      valorTotalParque,
      porTipo,
      porTipoDetalhado,
      totalColaboradores: resps.length,
      totalMovimentacoes: movs.length,
    };
  },

  /**
   * Retorna o histórico de movimentações de um equipamento específico.
   */
  async listarHistorico(equipamentoId: string): Promise<Movimentacao[]> {
    const todas = await this.listarMovimentacoes();
    return todas.filter((m) => m.equipamentoId === equipamentoId);
  },
};
