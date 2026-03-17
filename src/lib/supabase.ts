import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'As chaves do Supabase não foram encontradas. Verifique o arquivo .env ou as configurações de segredos.'
  );
}

// Cliente para uso no Frontend (respeita RLS)
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/**
 * Helper para verificar a conexão inicial (conforme diretrizes)
 */
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('perfis').select('id').limit(1);
    if (error && error.message.includes('client is offline')) {
      console.error('Erro de conexão com Supabase: O cliente está offline ou a URL é inválida.');
      return false;
    }
    return true;
  } catch (err) {
    console.error('Falha ao testar conexão com Supabase:', err);
    return false;
  }
}
