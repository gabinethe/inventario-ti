import { Equipamento, Responsavel, Movimentacao, StatusEquipamento } from "@/types";
import { MOCK_EQUIPAMENTOS, MOCK_RESPONSAVEIS, MOCK_MOVIMENTACOES } from "./mock-data";
import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

const STORAGE_KEY_EQ = "inventario_ti_equipamentos";
const STORAGE_KEY_RESP = "inventario_ti_responsaveis";

// Recupera dados salvos localmente para garantir persistência mesmo em modo offline/fallback
function getMemoria(): { eq: Equipamento[]; resp: Responsavel[]; mov: Movimentacao[] } {
  if (typeof window !== "undefined") {
    try {
      const salvoEq = localStorage.getItem(STORAGE_KEY_EQ);
      const salvoResp = localStorage.getItem(STORAGE_KEY_RESP);
      return {
        eq: salvoEq ? JSON.parse(salvoEq) : [...MOCK_EQUIPAMENTOS],
        resp: salvoResp ? JSON.parse(salvoResp) : [...MOCK_RESPONSAVEIS],
        mov: [...MOCK_MOVIMENTACOES],
      };
    } catch {
      return { eq: [...MOCK_EQUIPAMENTOS], resp: [...MOCK_RESPONSAVEIS], mov: [...MOCK_MOVIMENTACOES] };
    }
  }
  return { eq: [...MOCK_EQUIPAMENTOS], resp: [...MOCK_RESPONSAVEIS], mov: [...MOCK_MOVIMENTACOES] };
}

function salvarMemoria(eq: Equipamento[], resp?: Responsavel[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_EQ, JSON.stringify(eq));
      if (resp) localStorage.setItem(STORAGE_KEY_RESP, JSON.stringify(resp));
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
    // No navegador, usa o cliente SSR que carrega os cookies de sessão de login
    return createBrowserClient(url, key);
  }
  return createSupabaseJsClient(url, key);
}

export interface EquipamentoComResponsavel extends Equipamento {
  responsavel?: Responsavel;
}

export const equipamentosService = {
  /**
   * Retorna todos os equipamentos, priorizando o banco Supabase na nuvem.
   */
  async listar(filtros?: { busca?: string; status?: StatusEquipamento }): Promise<EquipamentoComResponsavel[]> {
    const supabase = getSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("equipamentos")
          .select("*, responsaveis(*)");

        if (!error && data && data.length > 0) {
          let resultado: EquipamentoComResponsavel[] = data.map((item: any) => ({
            id: item.id,
            patrimonio: item.patrimonio,
            tipo: item.tipo,
            marca: item.marca,
            modelo: item.modelo,
            numeroSerie: item.numero_serie,
            status: item.status,
            processador: item.processador,
            memoriaRam: item.memoria_ram,
            armazenamento: item.armazenamento,
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
            tipo: data.tipo,
            marca: data.marca,
            modelo: data.modelo,
            numeroSerie: data.numero_serie,
            status: data.status,
            processador: data.processador,
            memoriaRam: data.memoria_ram,
            armazenamento: data.armazenamento,
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
   * Cadastra um novo equipamento no inventário.
   */
  async criar(dados: Omit<Equipamento, "id" | "criadoEm" | "atualizadoEm">): Promise<Equipamento> {
    const supabase = getSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("equipamentos")
          .insert({
            patrimonio: dados.patrimonio,
            tipo: dados.tipo || "notebook",
            marca: dados.marca,
            modelo: dados.modelo,
            numero_serie: dados.numeroSerie,
            status: dados.status,
            processador: dados.processador,
            memoria_ram: dados.memoriaRam,
            armazenamento: dados.armazenamento,
            responsavel_id: dados.responsavelId || null,
            data_aquisicao: dados.dataAquisicao,
            valor_aquisicao: dados.valorAquisicao,
            observacoes: dados.observacoes,
          })
          .select()
          .single();

        if (!error && data) {
          const novoEq: Equipamento = {
            ...dados,
            id: data.id,
            criadoEm: data.criado_em,
            atualizadoEm: data.atualizado_em,
          };
          const memoria = getMemoria();
          salvarMemoria([novoEq, ...memoria.eq]);
          return novoEq;
        }
      } catch (err) {
        console.error("Erro ao criar equipamento no Supabase:", err);
      }
    }

    const memoria = getMemoria();
    const novoEquipamento: Equipamento = {
      ...dados,
      id: `eq-${Date.now()}`,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    salvarMemoria([novoEquipamento, ...memoria.eq]);
    return novoEquipamento;
  },

  /**
   * Retorna os números consolidados para o Dashboard.
   */
  async obterMetricas() {
    const lista = await this.listar();
    const total = lista.length;
    const emUso = lista.filter((e) => e.status === "em_uso").length;
    const disponiveis = lista.filter((e) => e.status === "disponivel").length;
    const emManutencao = lista.filter((e) => e.status === "manutencao").length;
    const valorTotalParque = lista.reduce((soma, e) => soma + (e.valorAquisicao || 0), 0);

    return {
      total,
      emUso,
      disponiveis,
      emManutencao,
      valorTotalParque,
    };
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
   * Cadastra um novo colaborador no inventário.
   */
  async criarResponsavel(dados: Omit<Responsavel, "id">): Promise<Responsavel> {
    const supabase = getSupabase();

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
          const novoResp: Responsavel = {
            id: data.id,
            nome: data.nome,
            email: data.email,
            departamento: data.departamento,
            cargo: data.cargo,
          };
          const memoria = getMemoria();
          salvarMemoria(memoria.eq, [novoResp, ...memoria.resp]);
          return novoResp;
        }
      } catch (err) {
        console.error("Erro ao criar responsável no Supabase:", err);
      }
    }

    const memoria = getMemoria();
    const novoResp: Responsavel = {
      ...dados,
      id: `resp-${Date.now()}`,
    };
    salvarMemoria(memoria.eq, [novoResp, ...memoria.resp]);
    return novoResp;
  },

  /**
   * Retorna o histórico de movimentações de um equipamento específico.
   */
  async listarHistorico(equipamentoId: string): Promise<Movimentacao[]> {
    const supabase = getSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("movimentacoes")
          .select("*")
          .eq("equipamento_id", equipamentoId)
          .order("data", { ascending: false });

        if (!error && data) {
          return data.map((item: any) => ({
            id: item.id,
            equipamentoId: item.equipamento_id,
            tipo: item.tipo,
            responsavelOrigemId: item.responsavel_origem_id,
            responsavelDestinoId: item.responsavel_destino_id,
            data: item.data,
            motivo: item.motivo,
            registradoPor: item.registrado_por,
          }));
        }
      } catch (err) {
        console.error("Erro ao buscar histórico do Supabase:", err);
      }
    }

    return getMemoria().mov.filter((m) => m.equipamentoId === equipamentoId);
  },

  /**
   * Exclui um equipamento com segurança (Supabase + Persistência local).
   */
  async excluirEquipamento(id: string): Promise<boolean> {
    const supabase = getSupabase();

    if (supabase) {
      try {
        await supabase.from("equipamentos").delete().eq("id", id);
      } catch (err) {
        console.error("Erro ao excluir equipamento do Supabase:", err);
      }
    }

    const memoria = getMemoria();
    const novaLista = memoria.eq.filter((e) => e.id !== id);
    salvarMemoria(novaLista, memoria.resp);
    return true;
  },

  /**
   * Exclui um colaborador responsável, desvinculando ativos sob sua custódia.
   */
  async excluirResponsavel(id: string): Promise<boolean> {
    const supabase = getSupabase();

    if (supabase) {
      try {
        // Desvincula equipamentos atribuídos a este colaborador antes de excluir
        await supabase
          .from("equipamentos")
          .update({ responsavel_id: null, status: "disponivel" })
          .eq("responsavel_id", id);

        await supabase.from("responsaveis").delete().eq("id", id);
      } catch (err) {
        console.error("Erro ao excluir responsável do Supabase:", err);
      }
    }

    const memoria = getMemoria();
    const novaListaResp = memoria.resp.filter((r) => r.id !== id);
    const novaListaEq = memoria.eq.map((e) =>
      e.responsavelId === id ? { ...e, responsavelId: undefined, status: "disponivel" as StatusEquipamento } : e
    );
    salvarMemoria(novaListaEq, novaListaResp);
    return true;
  },
};
