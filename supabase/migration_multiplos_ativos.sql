-- ========================================================
-- ATUALIZAÇÃO DO ESQUEMA: SUPORTE A MÚLTIPLOS ATIVOS DE TI
-- (Notebooks, Monitores, Celulares e Periféricos)
-- Execute este script no SQL Editor do seu projeto Supabase
-- ========================================================

-- 1. Permite valores nulos para especificações exclusivas de notebooks/computadores
ALTER TABLE public.equipamentos ALTER COLUMN processador DROP NOT NULL;
ALTER TABLE public.equipamentos ALTER COLUMN memoria_ram DROP NOT NULL;
ALTER TABLE public.equipamentos ALTER COLUMN armazenamento DROP NOT NULL;

-- 2. Adiciona suporte a subtipos de periféricos (mouse, teclado, headset) e especificações livres
ALTER TABLE public.equipamentos ADD COLUMN IF NOT EXISTS subtipo TEXT;
ALTER TABLE public.equipamentos ADD COLUMN IF NOT EXISTS especificacoes TEXT;

-- 3. Permite que o histórico de auditoria registre ações de colaboradores sem vincular obrigatoriamente a um equipamento
ALTER TABLE public.movimentacoes ALTER COLUMN equipamento_id DROP NOT NULL;
