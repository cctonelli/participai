# Documentação do Projeto - ParticipaAI

## 📝 Informações Gerais
- **Nome:** ParticipaAI
- **Descrição:** Plataforma de democracia digital e governança colaborativa.
- **Stack:** React (Vite), Tailwind CSS, Supabase (PostgreSQL + Auth + RLS).

## 🛡️ Regras de Segurança e RLS
### Administrador do Sistema (Bootstrap)
- **E-mail Master:** `bigdatagard2025@gmail.com`
- **Mecanismo:** O sistema utiliza uma função `public.is_system_admin()` definida com `SECURITY DEFINER`.
- **Decisão Arquitetural (2026-03-16):** Para evitar recursividade em políticas RLS, a função de verificação de admin prioriza o e-mail contido no JWT do Supabase Auth. Isso permite que o administrador inicial configure o sistema mesmo antes de haver registros na tabela de permissões.

## 🔐 Autenticação e Perfis
- **Supabase Auth:** Implementado fluxo de Login e Cadastro.
- **AuthContext:** Gerenciamento global de sessão e perfil do usuário.
- **Níveis de Acesso:** 
  - `Cidadão`: Acesso padrão às enquetes e fóruns.
  - `System Admin`: Acesso total ao painel administrativo (identificado via e-mail master ou tabela `permissoes_admin`).
- **Confirmação de E-mail:** Temporariamente desativada para facilitar o desenvolvimento do MVP.

## 🏗️ Estrutura de Dados (IBGE)
- **Municípios:** Importados via CSV no painel administrativo.
- **Estrutura Expandida (v1.4):** A tabela `municipios` agora inclui dados de Macro Região, Regiões Intermediárias/Imediatas, SIAFI, Capital, Coordenadas (Lat/Long), População e um campo flexível `outros_dados` (JSONB) para dados econômicos e geográficos.
- **Hierarquia de Poderes:** Suporte explícito para **Poder Executivo** e **Poder Legislativo** em níveis Estadual, Regional e Municipal.
- **Versionamento de Dados:** A tabela `municipios` utiliza `id_munic_comp` (7 dígitos) como chave de conflito para evitar duplicidade.

## 📊 Módulo de Enquetes (Consultas Públicas)
- **Armazenamento:** Opções de voto armazenadas em formato `JSONB` na tabela `enquetes` para flexibilidade.
- **Integridade de Voto:** Garantida via RLS e restrição de unicidade (um voto por usuário por enquete).
- **Visibilidade:** Enquetes com status 'aberta' são públicas para leitura; criação e edição restritas a `System Admin`.
- **Resultados:** Cálculos de engajamento realizados via contagem em tempo real na tabela `votos_enquetes`.

## 🖥️ Painel Administrativo (Admin Dashboard)
- **Gestão de Hierarquia:** Visualização em árvore para gerenciar a relação entre entes federativos.
- **Gestão de Admins:** Controle granular de quem pode administrar quais entidades.
- **Importação IBGE:** Processamento em lote (batch upsert) para alta performance na carga inicial de dados.

## 🚀 Versionamento de Infraestrutura
- **v1 (Atual):** Implementação inicial com RBAC (Role Based Access Control) e RLS.
- **Fix Auditoria (v1.1):** Habilitado RLS na tabela de auditoria e criado helper `is_system_admin`.
- **Fix Bootstrap Admin (v1.2):** Ajustada estrutura de `permissoes_admin` para aceitar admins globais (entidade_id NULL) e corrigida recursividade de RLS.
- **Módulo Enquetes (v1.3):** Adicionado suporte a opções JSONB e políticas de segurança para votação cidadã.
- **Estrutura Global (v1.4):** Expansão da tabela `municipios` para suporte estadual/regional e distinção entre Poder Executivo e Legislativo.
