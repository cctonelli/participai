-- Função auxiliar para verificar se o usuário é System Admin (incluindo bootstrap)
CREATE OR REPLACE FUNCTION public.is_system_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Se não houver UID, não é admin
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN (
    EXISTS (
      SELECT 1 FROM public.permissoes_admin 
      WHERE usuario_id = auth.uid() AND role = 'system_admin' AND ativo = TRUE
    ) OR (
      auth.jwt() ->> 'email' = 'bigdatagard2025@gmail.com'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Atualizar Políticas para Municípios
DROP POLICY IF EXISTS "System Admin gerencia municípios" ON public.municipios;
CREATE POLICY "System Admin gerencia municípios" ON public.municipios
  FOR ALL TO authenticated
  USING (public.is_system_admin())
  WITH CHECK (public.is_system_admin());

-- Atualizar Políticas para Entidades Governamentais
DROP POLICY IF EXISTS "System Admin gerencia entidades" ON public.entidades_governamentais;
CREATE POLICY "System Admin gerencia entidades" ON public.entidades_governamentais
  FOR ALL TO authenticated
  USING (public.is_system_admin())
  WITH CHECK (public.is_system_admin());

-- Atualizar Políticas para Permissões Admin
DROP POLICY IF EXISTS "Admins veem permissões da sua entidade" ON public.permissoes_admin;
CREATE POLICY "Admins veem permissões da sua entidade" ON public.permissoes_admin
  FOR SELECT TO authenticated
  USING (
    usuario_id = auth.uid() OR public.is_system_admin()
  );

DROP POLICY IF EXISTS "System Admin gerencia permissões" ON public.permissoes_admin;
CREATE POLICY "System Admin gerencia permissões" ON public.permissoes_admin
  FOR ALL TO authenticated
  USING (public.is_system_admin())
  WITH CHECK (public.is_system_admin());

-- Comentários
COMMENT ON FUNCTION public.is_system_admin() IS 'Verifica se o usuário logado tem privilégios de administrador global, incluindo o email de bootstrap.';
