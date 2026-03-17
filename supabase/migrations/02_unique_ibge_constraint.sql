-- Adicionar restrição de unicidade para permitir UPSERT seguro por código IBGE e Tipo
ALTER TABLE public.entidades_governamentais 
ADD CONSTRAINT unique_tipo_codigo_ibge UNIQUE (tipo, codigo_ibge);

-- Comentário para documentação
COMMENT ON CONSTRAINT unique_tipo_codigo_ibge ON public.entidades_governamentais 
IS 'Garante que não existam duplicatas de cidades ou estados com o mesmo código IBGE.';
