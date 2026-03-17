-- Migração: Expansão da estrutura global e regional
-- Data: 2026-03-16

-- 1. Atualização da tabela de municípios com dados regionais e estatísticos
ALTER TABLE public.municipios 
ADD COLUMN IF NOT EXISTS macro_regiao TEXT,
ADD COLUMN IF NOT EXISTS id_siafi TEXT,
ADD COLUMN IF NOT EXISTS capital BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC,
ADD COLUMN IF NOT EXISTS fuso_horario TEXT,
ADD COLUMN IF NOT EXISTS populacao INTEGER,
ADD COLUMN IF NOT EXISTS outros_dados JSONB DEFAULT '{}'::jsonb;

-- 2. Expansão da tabela de entidades governamentais para suportar Poderes e níveis regionais
ALTER TABLE public.entidades_governamentais 
ADD COLUMN IF NOT EXISTS poder TEXT, -- 'executivo', 'legislativo'
ADD COLUMN IF NOT EXISTS nivel TEXT, -- 'estadual', 'regional_intermediaria', 'regional_imediata', 'municipal'
ADD COLUMN IF NOT EXISTS id_regional TEXT; -- ID da região (interm ou imed) para filtros

-- 3. Comentários para documentação
COMMENT ON COLUMN public.municipios.macro_regiao IS 'Grande região do Brasil (Norte, Nordeste, etc.)';
COMMENT ON COLUMN public.municipios.id_siafi IS 'Código SIAFI do município';
COMMENT ON COLUMN public.municipios.outros_dados IS 'Dados econômicos, geográficos e sociais dinâmicos em formato JSON.';
COMMENT ON COLUMN public.entidades_governamentais.poder IS 'Define se a entidade pertence ao Poder Executivo ou Legislativo.';
COMMENT ON COLUMN public.entidades_governamentais.nivel IS 'Nível de abrangência da entidade (Estadual, Regional ou Municipal).';

-- 4. Atualização das políticas RLS para refletir a nova estrutura (se necessário)
-- As políticas existentes baseadas em 'is_system_admin()' continuam válidas.
-- Adicionaremos políticas específicas para admins regionais no futuro conforme a necessidade.
