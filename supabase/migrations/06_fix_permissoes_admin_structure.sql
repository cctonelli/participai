-- Ajustar a tabela de permissões para permitir administradores globais (sem entidade vinculada)
ALTER TABLE public.permissoes_admin ALTER COLUMN entidade_id DROP NOT NULL;

-- Remover a restrição única antiga e criar uma nova que suporte entidade_id nulo
ALTER TABLE public.permissoes_admin DROP CONSTRAINT IF EXISTS permissoes_admin_usuario_id_entidade_id_role_key;

-- No PostgreSQL, UNIQUE(col) permite múltiplos NULLs. 
-- Para garantir unicidade global de system_admin, usamos um índice parcial ou uma lógica diferente.
CREATE UNIQUE INDEX IF NOT EXISTS idx_permissoes_admin_global_unique 
ON public.permissoes_admin (usuario_id, role) 
WHERE entidade_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_permissoes_admin_entity_unique 
ON public.permissoes_admin (usuario_id, entidade_id, role) 
WHERE entidade_id IS NOT NULL;

-- Agora podemos inserir o administrador de bootstrap com segurança
INSERT INTO public.permissoes_admin (usuario_id, role, ativo)
SELECT id, 'system_admin', true
FROM auth.users
WHERE email = 'bigdatagard2025@gmail.com'
ON CONFLICT (usuario_id, role) WHERE entidade_id IS NULL 
DO UPDATE SET ativo = true;

-- Atualizar a função de verificação para ser mais performática
CREATE OR REPLACE FUNCTION public.is_system_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.permissoes_admin 
    WHERE usuario_id = auth.uid() 
    AND role = 'system_admin' 
    AND ativo = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
