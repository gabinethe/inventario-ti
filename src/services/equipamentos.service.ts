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

export interface EquipamentoComResponsavel extends Equipamento {
  responsavel?: Responsavel;
}

export const equipamentosService = {
  /**
   * Retorna todos os equipamentos, com suporte a filtros por tipo, status e termo de busca.
   */
  async listar(filtros?: { 
    busca?: string; 
    status?: StatusEquipamento;
    tipo?: TipoEquipamento | "todos";
  }): Promise<EquipamentoComResponsavel[]> {
    const supabase = getSupabase();

    if (supabase) {
      try {
        let query = supabase.from("equipamentos").select("*, responsaveis(*)");
        if (filtros?.tipo && filtros.tipo !== "todos") {
          query = query.eq("tipo", filtros.tipo);
        }

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          let resultado: EquipamentoComResponsavel[] = data.map((item: any) => ({
            id: item.id,
            patrimonio: item.patrimonio,
            tipo: item.tipo as TipoEquipamento,
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
            responsavel: item.responsaveis
              ? {
                  id: item.responsaveis.id,
                  nome: item.responsaveis.nome,
                  email: item.responsaveis.email,
                  departamento: item.responsaveis.departamento,
                  cargo: item.responsaveis.cargo,
                  avatarUrl: item.responsaveis.avatar_url,
                }
              : undefined,
          }));

          if (filtros?.busca) {
            const termo = filtros.busca.toLowerCase();
            resultado = resultado.filter(
              (eq) =>
                eq.patrimonio.toLowerCase().includes(termo) ||
                eq.modelo.toLowerCase().includes(termo) ||
                eq.marca.toLowerCase().includes(termo) ||
                eq.numeroSerie.toLowerCase().includes(termo) ||
                (eq.responsavel?.nome.toLowerCase().includes(termo) ?? false)
            );
          }

          if (filtros?.status) {
            resultado = resultado.filter((eq) => eq.status === filtros.status);
          }

          return resultado;
        }
      } catch (err) {
        console.error("Erro ao listar do Supabase:", err);
      }
    }

    // Fallback com persistência local
    const memoria = getMemoria();
    let resultado = memoria.eq.map((item) => ({
      ...item,
      responsavel: memoria.resp.find((r) => r.id === item.responsavelId),
    }));

    if (filtros?.tipo && filtros.tipo !== "todos") {
      resultado = resultado.filter((eq) => eq.tipo === filtros.tipo);
    }

    if (filtros?.busca) {
      const termo = filtros.busca.toLowerCase();
      resultado = resultado.filter(
        (eq) =>
          eq.patrimonio.toLowerCase().includes(termo) ||
          eq.modelo.toLowerCase().includes(termo) ||
          eq.marca.toLowerCase().includes(termo) ||
          eq.numeroSerie.toLowerCase().includes(termo) ||
          (eq.responsavel?.nome.toLowerCase().includes(termo) ?? false)
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

    const memoria = getMemoria();
    const equipamento = memoria.eq.find((e) => e.id === id);
    if (!equipamento) return null;

    const responsavel = memoria.resp.find((r) => r.id === equipamento.responsavelId);
    return {
      ...equipamento,
      responsavel,
    };
  },

  /**
   * Cadastra um novo equipamento no inventário e registra na auditoria.
   */
  async criar(dados: Omit<Equipamento, "id" | "criadoEm" | "atualizadoEm">): Promise<Equipamento> {
    const supabase = getSupabase();
    let novoEquipamento: Equipamento | null = null;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("equipamentos")
          .insert({
            patrimonio: dados.patrimonio,
            tipo: dados.tipo || "notebook",
            subtipo: dados.subtipo,
            marca: dados.marca,
            modelo: dados.modelo,
            numero_serie: dados.numeroSerie,
            status: dados.status,
            processador: dados.processador,
            memoria_ram: dados.memoriaRam,
            armazenamento: dados.armazenamento,
            especificacoes: dados.especificacoes,
            responsavel_id: dados.responsavelId || null,
            data_aquisicao: dados.dataAquisicao,
            valor_aquisicao: dados.valorAquisicao,
            observacoes: dados.observacoes,
          })
          .select()
          .single();

        if (!error && data) {
          novoEquipamento = {
            ...dados,
            id: data.id,
            criadoEm: data.criado_em,
            atualizadoEm: data.atualizado_em,
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

    const memoria = getMemoria();
    const novaListaEq = [novoEquipamento, ...memoria.eq];
    
    // Registra entrada de equipamento na auditoria
    const tipoLegivel = {
      notebook: "Notebook",
      monitor: "Monitor",
      smartphone: "Smartphone Corporativo",
      periferico: dados.subtipo ? `Periférico (${dados.subtipo})` : "Periférico",
      outro: "Equipamento",
    }[dados.tipo] || "Equipamento";

    const novaMovimentacao: Movimentacao = {
      id: `mov-${Date.now()}`,
      tipo: "entrada",
      equipamentoId: novoEquipamento.id,
      equipamentoNome: `${novoEquipamento.marca} ${novoEquipamento.modelo} (${novoEquipamento.patrimonio})`,
      motivo: `Novo ${tipoLegivel} adicionado ao estoque corporativo.`,
      data: new Date().toISOString(),
      registradoPor: getAdminNome(),
    };

    salvarMemoria(novaListaEq, memoria.resp, [novaMovimentacao, ...memoria.mov]);
    return novoEquipamento;
  },

  /**
   * Atribui um equipamento da empresa a um colaborador responsável.
   */
  async atribuirEquipamento(equipamentoId: string, responsavelId: string, motivoCustomizado?: string): Promise<boolean> {
    const memoria = getMemoria();
    const equipamento = memoria.eq.find((e) => e.id === equipamentoId);
    const colaborador = memoria.resp.find((r) => r.id === responsavelId);

    if (!equipamento || !colaborador) return false;

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

    // Atualiza estado local
    const novaListaEq = memoria.eq.map((e) =>
      e.id === equipamentoId
        ? { ...e, responsavelId, status: "em_uso" as StatusEquipamento, atualizadoEm: new Date().toISOString() }
        : e
    );

    const motivo = motivoCustomizado || `Equipamento atribuído para ${colaborador.nome} (${colaborador.departamento}).`;

    const novaMov: Movimentacao = {
      id: `mov-${Date.now()}`,
      tipo: "atribuicao",
      equipamentoId,
      equipamentoNome: `${equipamento.marca} ${equipamento.modelo} (${equipamento.patrimonio})`,
      responsavelDestinoId: responsavelId,
      responsavelNome: colaborador.nome,
      data: new Date().toISOString(),
      motivo,
      registradoPor: getAdminNome(),
    };

    salvarMemoria(novaListaEq, memoria.resp, [novaMov, ...memoria.mov]);
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

    const novaMov: Movimentacao = {
      id: `mov-${Date.now()}`,
      tipo: "devolucao",
      equipamentoId,
      equipamentoNome: `${equipamento.marca} ${equipamento.modelo} (${equipamento.patrimonio})`,
      responsavelOrigemId: colaboradorOrigem?.id,
      responsavelNome: colaboradorOrigem?.nome,
      data: new Date().toISOString(),
      motivo,
      registradoPor: getAdminNome(),
    };

    salvarMemoria(novaListaEq, memoria.resp, [novaMov, ...memoria.mov]);
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

    const novaMov: Movimentacao = {
      id: `mov-${Date.now()}`,
      tipo: "exclusao",
      equipamentoId: id,
      equipamentoNome: equipamento ? `${equipamento.marca} ${equipamento.modelo} (${equipamento.patrimonio})` : "Equipamento",
      motivo: `Baixa patrimonial do equipamento ${equipamento?.patrimonio || id} registrada no inventário.`,
      data: new Date().toISOString(),
      registradoPor: getAdminNome(),
    };

    salvarMemoria(novaListaEq, memoria.resp, [novaMov, ...memoria.mov]);
    return true;
  },

  /**
   * Lista todos os responsáveis cadastrados.
   */
  async listarResponsaveis(): Promise<Responsavel[]> {
    const supabase = getSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase.from("responsaveis").select("*");
        if (!error && data && data.length > 0) {
          return data.map((item: any) => ({
            id: item.id,
            nome: item.nome,
            email: item.email,
            departamento: item.departamento,
            cargo: item.cargo,
            avatarUrl: item.avatar_url,
          }));
        }
      } catch (err) {
        console.error("Erro ao listar responsáveis do Supabase:", err);
      }
    }

    return getMemoria().resp;
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

    const novaMov: Movimentacao = {
      id: `mov-${Date.now()}`,
      tipo: "exclusao",
      responsavelNome: colaborador?.nome,
      motivo: `Desligamento/Exclusão do colaborador ${colaborador?.nome || id}. Seus ativos retornaram ao estoque de TI.`,
      data: new Date().toISOString(),
      registradoPor: getAdminNome(),
    };

    salvarMemoria(novaListaEq, novaListaResp, [novaMov, ...memoria.mov]);
    return true;
  },

  /**
   * Retorna a lista completa de movimentações de auditoria em ordem cronológica decrescente.
   */
  async listarMovimentacoes(filtros?: { tipo?: TipoMovimentacao | "todos"; busca?: string }): Promise<Movimentacao[]> {
    const memoria = getMemoria();
    let lista = [...memoria.mov].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

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

    return {
      total,
      emUso,
      disponiveis,
      emManutencao,
      valorTotalParque,
      porTipo,
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
