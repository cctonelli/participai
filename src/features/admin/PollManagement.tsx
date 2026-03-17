import React, { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/lib/auth-context';
import { 
  Plus, 
  Search, 
  Loader2, 
  Calendar, 
  BarChart2, 
  Trash2, 
  Edit,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { CardParticipa, CardContent } from '@/src/components/ui/CardParticipa';

interface Poll {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  status: string;
  data_fim: string | null;
  created_at: string;
}

export const PollManagement = () => {
  const { user } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Urbanismo');
  const [dataFim, setDataFim] = useState('');
  const [opcoes, setOpcoes] = useState<string[]>(['Sim', 'Não']);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('enquetes')
        .select('*, votos_enquetes(count)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPolls(data || []);
    } catch (error) {
      console.error('Erro ao buscar enquetes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOpcao = () => {
    setOpcoes([...opcoes, '']);
  };

  const handleOpcaoChange = (index: number, value: string) => {
    const newOpcoes = [...opcoes];
    newOpcoes[index] = value;
    setOpcoes(newOpcoes);
  };

  const handleRemoveOpcao = (index: number) => {
    if (opcoes.length <= 2) return;
    setOpcoes(opcoes.filter((_, i) => i !== index));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const validOpcoes = opcoes.filter(o => o.trim() !== '');
    if (validOpcoes.length < 2) {
      alert('A enquete deve ter pelo menos 2 opções.');
      return;
    }

    try {
      const { error } = await supabase
        .from('enquetes')
        .insert({
          titulo,
          descricao,
          categoria,
          criador_id: user.id,
          status: 'aberta',
          data_fim: dataFim ? new Date(dataFim).toISOString() : null,
          opcoes: validOpcoes.map((texto, index) => ({ id: String(index + 1), texto }))
        });

      if (error) throw error;
      
      setIsCreating(false);
      setTitulo('');
      setDescricao('');
      setOpcoes(['Sim', 'Não']);
      fetchPolls();
    } catch (error) {
      console.error('Erro ao criar enquete:', error);
    }
  };

  const deletePoll = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta enquete?')) return;
    
    try {
      const { error } = await supabase
        .from('enquetes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPolls(polls.filter(p => p.id !== id));
    } catch (error) {
      console.error('Erro ao excluir enquete:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold">Gestão de Enquetes</h2>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
        >
          <Plus size={18} /> Nova Enquete
        </button>
      </div>

      {isCreating && (
        <CardParticipa className="border-blue-200 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-900/10">
          <CardContent className="p-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-zinc-500">Título da Enquete</label>
                  <input 
                    type="text" 
                    required
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: Reforma da Praça Central"
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-zinc-500">Categoria</label>
                  <select 
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option>Urbanismo</option>
                    <option>Mobilidade</option>
                    <option>Saúde</option>
                    <option>Educação</option>
                    <option>Segurança</option>
                    <option>Cultura</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-zinc-500">Descrição / Contexto</label>
                <textarea 
                  required
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Explique o objetivo da consulta pública..."
                  rows={3}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-zinc-500">Opções de Voto</label>
                <div className="space-y-2">
                  {opcoes.map((opcao, index) => (
                    <div key={index} className="flex gap-2">
                      <input 
                        type="text" 
                        required
                        value={opcao}
                        onChange={(e) => handleOpcaoChange(index, e.target.value)}
                        placeholder={`Opção ${index + 1}`}
                        className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                      {opcoes.length > 2 && (
                        <button 
                          type="button"
                          onClick={() => handleRemoveOpcao(index)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={handleAddOpcao}
                    className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"
                  >
                    <Plus size={14} /> Adicionar Opção
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-zinc-500">Data de Encerramento (Opcional)</label>
                  <input 
                    type="datetime-local" 
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-700"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
                >
                  Publicar Enquete
                </button>
              </div>
            </form>
          </CardContent>
        </CardParticipa>
      )}

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="text-sm font-medium">Carregando enquetes...</p>
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <BarChart2 size={48} className="mx-auto mb-4 opacity-10" />
            <p className="font-medium">Nenhuma enquete criada</p>
            <p className="text-sm">Clique em "Nova Enquete" para começar.</p>
          </div>
        ) : (
          polls.map((poll) => (
            <div key={poll.id}>
              <CardParticipa className="hover:border-blue-200 dark:hover:border-blue-900/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-zinc-500">
                      <BarChart2 size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-2 py-0.5 rounded">
                          {poll.categoria}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          poll.status === 'aberta' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-zinc-100 text-zinc-500'
                        }`}>
                          {poll.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg">{poll.titulo}</h3>
                      <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                        <span className="flex items-center gap-1"><Calendar size={14} /> Criada em {new Date(poll.created_at).toLocaleDateString()}</span>
                        {poll.data_fim && (
                          <span className="flex items-center gap-1"><Clock size={14} /> Encerra em {new Date(poll.data_fim).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => deletePoll(poll.id)}
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </CardParticipa>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
