-- Tabela específica para o cadastro de municípios (base IBGE)
CREATE TABLE IF NOT EXISTS public.municipios (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_uf                INTEGER NOT NULL,
  nome_uf              TEXT NOT NULL,
  sigla_uf             TEXT NOT NULL,
  id_regiao_interm     INTEGER,
  nome_regiao_interm   TEXT,
  id_regiao_imed       INTEGER,
  nome_regiao_imed     TEXT,
  id_munic             TEXT NOT NULL, -- Código do município (5 dígitos)
  id_munic_comp        TEXT NOT NULL UNIQUE, -- Código completo (7 dígitos)
  nome_municipio       TEXT NOT NULL,
  ativo                BOOLEAN DEFAULT TRUE,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar coluna de referência na tabela de entidades governamentais
ALTER TABLE public.entidades_governamentais 
ADD COLUMN IF NOT EXISTS municipio_id UUID REFERENCES public.municipios(id);

-- Habilitar RLS na nova tabela
ALTER TABLE public.municipios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para Municípios
CREATE POLICY "Municípios visíveis para todos" ON public.municipios
  FOR SELECT USING (true);

CREATE POLICY "System Admin gerencia municípios" ON public.municipios
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.permissoes_admin 
      WHERE usuario_id = auth.uid() AND role = 'system_admin'
    )
  );

-- Comentários para documentação
COMMENT ON TABLE public.municipios IS 'Base de dados oficial de municípios baseada no IBGE.';
COMMENT ON COLUMN public.municipios.id_munic_comp IS 'Código IBGE de 7 dígitos, usado como chave única de integração.';
