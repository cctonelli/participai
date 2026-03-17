-- Habilitar RLS em todas as tabelas sensíveis
-- Nota: Estas migrações devem ser executadas no console do Supabase

-- Perfis de cidadão (extensão de auth.users)
CREATE TABLE IF NOT EXISTS public.perfis (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo TEXT NOT NULL,
  cpf         TEXT UNIQUE,                -- validado depois (nível 2)
  nivel       TEXT NOT NULL DEFAULT 'cadastrado', -- visitante | cadastrado | verificado_prata | premium_ouro
  endereco    JSONB,                      -- geolocalização futura
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

-- Auditoria básica
CREATE TABLE IF NOT EXISTS public.auditoria (
  id          BIGSERIAL PRIMARY KEY,
  usuario_id  UUID REFERENCES auth.users(id),
  acao        TEXT NOT NULL,
  entidade    TEXT NOT NULL,
  dados       JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Enquetes
CREATE TABLE IF NOT EXISTS public.enquetes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo          TEXT NOT NULL,
  descricao       TEXT,
  categoria       TEXT NOT NULL,
  criador_id      UUID REFERENCES auth.users(id),
  status          TEXT DEFAULT 'aberta', -- aberta | fechada | arquivada
  data_fim        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

-- Votos das Enquetes
CREATE TABLE IF NOT EXISTS public.votos_enquetes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquete_id      UUID REFERENCES public.enquetes(id) ON DELETE CASCADE,
  usuario_id      UUID REFERENCES auth.users(id),
  opcao           TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(enquete_id, usuario_id)
);

-- Políticas RLS
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquetes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votos_enquetes ENABLE ROW LEVEL SECURITY;

-- Perfis: Usuário vê todos, mas edita só o seu
CREATE POLICY "Perfis visíveis para todos autenticados" ON public.perfis
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuário edita próprio perfil" ON public.perfis
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Enquetes: Todos veem abertas
CREATE POLICY "Enquetes abertas são públicas" ON public.enquetes
  FOR SELECT USING (status = 'aberta' AND deleted_at IS NULL);

-- Votos: Usuário vê seus votos e pode votar se autenticado
CREATE POLICY "Usuário vê próprios votos" ON public.votos_enquetes
  FOR SELECT TO authenticated USING (auth.uid() = usuario_id);

CREATE POLICY "Usuário pode votar" ON public.votos_enquetes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);
