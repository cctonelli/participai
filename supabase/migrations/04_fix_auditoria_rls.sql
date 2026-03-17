-- Habilitar RLS na tabela de auditoria
ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para Auditoria

-- 1. System Admin pode ver todos os logs
CREATE POLICY "System Admin vê toda auditoria" ON public.auditoria
  FOR SELECT TO authenticated
  USING (public.is_system_admin());

-- 2. Usuários podem ver seus próprios logs de auditoria
CREATE POLICY "Usuário vê própria auditoria" ON public.auditoria
  FOR SELECT TO authenticated
  USING (usuario_id = auth.uid());

-- 3. Usuários autenticados podem inserir logs (o sistema registra ações do usuário)
CREATE POLICY "Usuário pode inserir auditoria" ON public.auditoria
  FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid());

-- Comentário para documentação
COMMENT ON TABLE public.auditoria IS 'Logs de auditoria do sistema com RLS habilitado.';
