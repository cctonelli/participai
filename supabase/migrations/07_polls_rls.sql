-- Políticas RLS para Enquetes (Admin)
DROP POLICY IF EXISTS "System Admin gerencia enquetes" ON public.enquetes;
CREATE POLICY "System Admin gerencia enquetes" ON public.enquetes
  FOR ALL TO authenticated
  USING (public.is_system_admin())
  WITH CHECK (public.is_system_admin());

-- Permitir que usuários vejam enquetes abertas (já existe, mas garantindo)
DROP POLICY IF EXISTS "Enquetes abertas são públicas" ON public.enquetes;
CREATE POLICY "Enquetes abertas são públicas" ON public.enquetes
  FOR SELECT TO public
  USING (status = 'aberta' AND deleted_at IS NULL);

-- Habilitar RLS na tabela de votos (caso não esteja)
ALTER TABLE public.votos_enquetes ENABLE ROW LEVEL SECURITY;

-- Votos: Usuário vê seus votos
DROP POLICY IF EXISTS "Usuário vê próprios votos" ON public.votos_enquetes;
CREATE POLICY "Usuário vê próprios votos" ON public.votos_enquetes
  FOR SELECT TO authenticated
  USING (auth.uid() = usuario_id);

-- Votos: Usuário pode votar
DROP POLICY IF EXISTS "Usuário pode votar" ON public.votos_enquetes;
CREATE POLICY "Usuário pode votar" ON public.votos_enquetes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = usuario_id);

-- Votos: Admin pode ver todos os votos para estatísticas
DROP POLICY IF EXISTS "Admin vê todos os votos" ON public.votos_enquetes;
CREATE POLICY "Admin vê todos os votos" ON public.votos_enquetes
  FOR SELECT TO authenticated
  USING (public.is_system_admin());
