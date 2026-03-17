import React, { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  Plus, 
  Search, 
  Loader2, 
  Trash2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { CardParticipa, CardContent } from '@/src/components/ui/CardParticipa';

interface AdminUser {
  id: string;
  usuario_id: string;
  role: string;
  ativo: boolean;
  perfil: {
    nome_completo: string;
    avatar_url: string | null;
  };
  entidade?: {
    nome: string;
    tipo: string;
  };
}

export const AdminManagement = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      // Fetch permissions with profiles and entities
      const { data, error } = await supabase
        .from('permissoes_admin')
        .select(`
          id,
          usuario_id,
          role,
          ativo,
          entidade:entidades_governamentais(nome, tipo)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately for each admin
      const adminsWithProfiles = await Promise.all(data.map(async (admin: any) => {
        const { data: profileData } = await supabase
          .from('perfis')
          .select('nome_completo, avatar_url')
          .eq('id', admin.usuario_id)
          .single();
        
        return {
          ...admin,
          perfil: profileData || { nome_completo: 'Usuário Desconhecido', avatar_url: null }
        };
      }));

      setAdmins(adminsWithProfiles);
    } catch (error) {
      console.error('Erro ao buscar administradores:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('permissoes_admin')
        .update({ ativo: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      setAdmins(admins.map(a => a.id === id ? { ...a, ativo: !currentStatus } : a));
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles: { [key: string]: string } = {
      system_admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      estado_admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      executivo_admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      legislativo_admin: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      regional_admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      prefeitura_admin: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      camara_admin: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    };
    return styles[role] || 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar administradores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
          <Plus size={18} /> Novo Administrador
        </button>
      </div>

      <CardParticipa>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-400 tracking-widest">Usuário</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-400 tracking-widest">Nível / Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-400 tracking-widest">Entidade / Poder</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-400 tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-400 tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto mb-2 text-blue-600" size={32} />
                    <p className="text-sm text-zinc-500">Carregando administradores...</p>
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    <ShieldAlert size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="font-medium">Nenhum administrador encontrado</p>
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="border-b border-zinc-50 dark:border-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs">
                          {admin.perfil.nome_completo.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold">{admin.perfil.nome_completo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getRoleBadge(admin.role)}`}>
                        {admin.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-zinc-500">
                          {admin.entidade ? admin.entidade.nome : 'Global'}
                        </span>
                        {admin.entidade && (
                          <span className="text-[10px] uppercase font-bold text-zinc-400">
                            {admin.entidade.tipo} {admin.entidade.poder ? `• ${admin.entidade.poder}` : ''}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleStatus(admin.id, admin.ativo)}
                        className={`flex items-center gap-1.5 text-xs font-bold ${admin.ativo ? 'text-emerald-600' : 'text-zinc-400'}`}
                      >
                        {admin.ativo ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {admin.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardParticipa>
    </div>
  );
};
