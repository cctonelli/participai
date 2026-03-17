-- Tabela de entidades administráveis (estados, cidades, câmaras, prefeituras, secretarias...)
CREATE TABLE IF NOT EXISTS public.entidades_governamentais (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo             TEXT NOT NULL,          -- 'estado', 'cidade', 'prefeitura', 'camara', 'secretaria', 'assembleia'
  nome             TEXT NOT NULL,
  codigo_ibge      TEXT,                    -- para cidades/estados
  pai_id           UUID REFERENCES public.entidades_governamentais(id), -- hierarquia (ex: secretaria → prefeitura)
  regiao_imediata  TEXT,
  regiao_intermediaria TEXT,
  estado_sigla     TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

-- Relacionamento usuário × entidade × role
CREATE TABLE IF NOT EXISTS public.permissoes_admin (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entidade_id          UUID NOT NULL REFERENCES public.entidades_governamentais(id) ON DELETE CASCADE,
  role                 TEXT NOT NULL,          -- 'system_admin', 'estado_admin', 'prefeitura_admin', etc.
  ativo                BOOLEAN DEFAULT TRUE,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW(),
  created_by           UUID REFERENCES auth.users(id),
  UNIQUE(usuario_id, entidade_id, role)
);

-- Extensão da tabela perfis para incluir nível cidadão e badges
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS nivel_cidadao TEXT DEFAULT 'visitante';
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::JSONB;

-- Habilitar RLS
ALTER TABLE public.entidades_governamentais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissoes_admin ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para Entidades
CREATE POLICY "Entidades visíveis para todos" ON public.entidades_governamentais
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "System Admin gerencia entidades" ON public.entidades_governamentais
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.permissoes_admin 
      WHERE usuario_id = auth.uid() AND role = 'system_admin'
    )
  );

-- Políticas RLS para Permissões
CREATE POLICY "Admins veem permissões da sua entidade" ON public.permissoes_admin
  FOR SELECT TO authenticated
  USING (
    usuario_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.permissoes_admin p2
      WHERE p2.usuario_id = auth.uid() AND p2.role = 'system_admin'
    )
  );
