-- ========================================================
-- ESQUEMA DO BANCO DE DADOS: INVENTÁRIO DE TI (POSTGRESQL)
-- Execute este script no SQL Editor do seu projeto Supabase
-- ========================================================

-- 1. Habilitar extensão para geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Responsáveis (Colaboradores)
CREATE TABLE IF NOT EXISTS public.responsaveis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    departamento TEXT NOT NULL,
    cargo TEXT NOT NULL,
    avatar_url TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Equipamentos (Notebooks e outros ativos)
CREATE TABLE IF NOT EXISTS public.equipamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patrimonio TEXT UNIQUE NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'notebook',
    marca TEXT NOT NULL,
    modelo TEXT NOT NULL,
    numero_serie TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'disponivel', -- 'disponivel', 'em_uso', 'manutencao', 'descartado'
    processador TEXT NOT NULL,
    memoria_ram TEXT NOT NULL,
    armazenamento TEXT NOT NULL,
    responsavel_id UUID REFERENCES public.responsaveis(id) ON DELETE SET NULL,
    data_aquisicao DATE NOT NULL DEFAULT CURRENT_DATE,
    valor_aquisicao NUMERIC(10, 2),
    observacoes TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Movimentações (Histórico de Auditoria Imutável)
CREATE TABLE IF NOT EXISTS public.movimentacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipamento_id UUID NOT NULL REFERENCES public.equipamentos(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL, -- 'atribuicao', 'devolucao', 'manutencao', 'retorno', 'descarte'
    responsavel_origem_id UUID REFERENCES public.responsaveis(id) ON DELETE SET NULL,
    responsavel_destino_id UUID REFERENCES public.responsaveis(id) ON DELETE SET NULL,
    data TIMESTAMPTZ DEFAULT NOW(),
    motivo TEXT NOT NULL,
    registrado_por TEXT NOT NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- CAMADA DE SEGURANÇA: ROW LEVEL SECURITY (RLS)
-- Garante que regras de acesso sejam aplicadas direto no banco
-- ========================================================

ALTER TABLE public.responsaveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacoes ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura: Usuários autenticados podem consultar os registros
CREATE POLICY "Permitir leitura para usuários autenticados" ON public.responsaveis
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir leitura para usuários autenticados" ON public.equipamentos
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir leitura para usuários autenticados" ON public.movimentacoes
    FOR SELECT TO authenticated USING (true);

-- Políticas de Modificação: Apenas administradores autenticados podem inserir/alterar
CREATE POLICY "Permitir inserção e edição para autenticados" ON public.responsaveis
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir inserção e edição para autenticados" ON public.equipamentos
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir inserção e edição para autenticados" ON public.movimentacoes
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Política de Auditoria: Movimentações NUNCA podem ser excluídas (imutabilidade)
CREATE POLICY "Impedir exclusão de histórico de movimentação" ON public.movimentacoes
    FOR DELETE TO authenticated USING (false);

-- ========================================================
-- DADOS INICIAIS DE EXEMPLO (SEED DATA)
-- ========================================================

INSERT INTO public.responsaveis (id, nome, email, departamento, cargo)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Ana Carolina Silveira', 'ana.silveira@empresa.com.br', 'Engenharia de Software', 'Desenvolvedora Frontend Sênior'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Lucas Ferreira Lima', 'lucas.lima@empresa.com.br', 'Design de Produto', 'Product Designer Pleno'),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Mariana Souza Rocha', 'mariana.rocha@empresa.com.br', 'Recursos Humanos', 'Business Partner'),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Rodrigo Mendes Castro', 'rodrigo.castro@empresa.com.br', 'Financeiro', 'Analista Financeiro')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.equipamentos (id, patrimonio, tipo, marca, modelo, numero_serie, status, processador, memoria_ram, armazenamento, responsavel_id, data_aquisicao, valor_aquisicao, observacoes)
VALUES 
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'PAT-00101', 'notebook', 'Dell', 'Latitude 3420', 'DL3420X9812', 'em_uso', 'Intel Core i5 11ª Geração', '16 GB DDR4', 'SSD 512 GB NVMe', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-02-15', 4890.00, 'Entregue com bolsa e carregador original.'),
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'PAT-00102', 'notebook', 'Apple', 'MacBook Pro 14 M2 Pro', 'C02G9981MD6R', 'em_uso', 'Apple M2 Pro (10 núcleos)', '32 GB Memória Unificada', 'SSD 1 TB', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '2024-01-10', 14500.00, 'Máquina para trabalho gráfico pesado.'),
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'PAT-00103', 'notebook', 'Lenovo', 'ThinkPad T14 Gen 3', 'PF29XKL001', 'disponivel', 'AMD Ryzen 7 PRO 6850U', '16 GB LPDDR5', 'SSD 512 GB NVMe', NULL, '2024-06-20', 5900.00, 'Formatado e pronto para entrega a novos contratados.'),
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'PAT-00104', 'notebook', 'Dell', 'Inspiron 15 3000', 'DL15309992', 'manutencao', 'Intel Core i7 12ª Geração', '16 GB DDR4', 'SSD 256 GB', NULL, '2023-11-05', 3800.00, 'Enviado para a assistência: falha na porta USB-C de carregamento.'),
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'PAT-00105', 'notebook', 'Samsung', 'Galaxy Book3 360', 'SMGB301293', 'disponivel', 'Intel Core i7 13ª Geração', '16 GB LPDDR4x', 'SSD 512 GB NVMe', NULL, '2024-08-01', 5200.00, 'Aparelho reserva do estoque TI.')
ON CONFLICT (patrimonio) DO NOTHING;

INSERT INTO public.movimentacoes (equipamento_id, tipo, responsavel_destino_id, data, motivo, registrado_por)
VALUES 
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'atribuicao', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-03-01 14:30:00+00', 'Notebook de trabalho para nova contratação na Engenharia.', 'Admin TI'),
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'atribuicao', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '2024-01-15 11:00:00+00', 'Upgrade de máquina para designer de produto.', 'Admin TI'),
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'manutencao', NULL, '2024-10-10 17:15:00+00', 'Conector USB-C com mau contato, enviado para garantia Dell.', 'Admin TI');
