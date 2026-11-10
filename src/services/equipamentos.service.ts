import { Equipamento, Responsavel, Movimentacao, StatusEquipamento } from "@/types";
import { MOCK_EQUIPAMENTOS, MOCK_RESPONSAVEIS, MOCK_MOVIMENTACOES } from "./mock-data";
import { createClient } from "@supabase/supabase-js";

// Dados em memória para fallback/modo offline
let equipamentosMemoria: Equipamento[] = [...MOCK_EQUIPAMENTOS];
let movimentacoesMemoria: Movimentacao[] = [...MOCK_MOVIMENTACOES];
let responsaveisMemoria: Responsavel[] = [...MOCK_RESPONSAVEIS];

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("seu-projeto")) {
    return null;
  }
  return createClient(url, key);
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

    // Fallback: Modo memória
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
        console.error("Erro ao buscar equipamento do Supabase:", err);
      }
    }

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
    const supabase = getSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("equipamentos")
          .insert({
            patrimonio: dados.patrimonio,
            tipo: dados.tipo,
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
          return {
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

    return [...responsaveisMemoria];
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
          return {
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

    const novoResp: Responsavel = {
      ...dados,
      id: `resp-${Date.now()}`,
    };
    responsaveisMemoria.push(novoResp);
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

    return movimentacoesMemoria.filter((m) => m.equipamentoId === equipamentoId);
  },
};
