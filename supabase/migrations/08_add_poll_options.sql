-- Adicionar campo de opções na tabela de enquetes
ALTER TABLE public.enquetes ADD COLUMN IF NOT EXISTS opcoes JSONB DEFAULT '[]'::jsonb;

-- Comentário para documentação
COMMENT ON COLUMN public.enquetes.opcoes IS 'Lista de opções de voto para a enquete (ex: [{"id": "1", "texto": "Sim"}, {"id": "2", "texto": "Não"}])';
