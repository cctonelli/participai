import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Lock, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  BarChart2
} from 'lucide-react';
import { CardParticipa, CardContent } from '@/src/components/ui/CardParticipa';
import { cn } from '@/src/lib/utils';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/lib/auth-context';

interface PollOption {
  id: string;
  texto: string;
}

interface Poll {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  status: 'aberta' | 'fechada' | 'arquivada';
  opcoes: PollOption[];
  votos_totais?: number;
  user_voted?: boolean;
  voto_usuario?: string;
}

export const EnquetesList = () => {
  const { user, profile } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [voting, setVoting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPolls();
  }, [user]);

  const fetchPolls = async () => {
    setLoading(true);
    try {
      // Fetch polls
      const { data: pollsData, error: pollsError } = await supabase
        .from('enquetes')
        .select(`
          *,
          votos_enquetes (
            id,
            usuario_id,
            opcao
          )
        `)
        .eq('status', 'aberta')
        .order('created_at', { ascending: false });

      if (pollsError) throw pollsError;

      const processedPolls = (pollsData || []).map(poll => {
        const userVote = poll.votos_enquetes?.find((v: any) => v.usuario_id === user?.id);
        return {
          ...poll,
          votos_totais: poll.votos_enquetes?.length || 0,
          user_voted: !!userVote,
          voto_usuario: userVote?.opcao
        };
      });

      setPolls(processedPolls);
    } catch (error) {
      console.error('Erro ao buscar enquetes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    if (!user) return;
    setVoting(true);
    try {
      const { error } = await supabase
        .from('votos_enquetes')
        .insert({
          enquete_id: pollId,
          usuario_id: user.id,
          opcao: optionId
        });

      if (error) throw error;
      
      setSelectedPoll(null);
      fetchPolls();
    } catch (error) {
      console.error('Erro ao votar:', error);
      alert('Erro ao registrar voto. Verifique se você já votou nesta enquete.');
    } finally {
      setVoting(false);
    }
  };

  const filteredPolls = polls.filter(p => 
    p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Enquetes e Consultas</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Participe ativamente das decisões da sua cidade.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Filtrar enquetes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="font-medium">Carregando consultas públicas...</p>
        </div>
      ) : filteredPolls.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
          <BarChart2 size={64} className="mx-auto mb-4 opacity-10" />
          <p className="text-xl font-bold">Nenhuma enquete encontrada</p>
          <p className="text-zinc-500">Tente ajustar seus filtros ou volte mais tarde.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPolls.map((poll) => (
            <div key={poll.id}>
              <CardParticipa className="group overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="p-6 flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-2 py-0.5 rounded">
                      {poll.categoria}
                    </span>
                    {poll.user_voted && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 size={10} /> Votado
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">{poll.titulo}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-2xl line-clamp-2">
                    {poll.descricao}
                  </p>
                </div>
                
                <div className="p-6 md:border-l border-zinc-100 dark:border-zinc-800 flex flex-col justify-center items-center md:w-48 gap-2 bg-zinc-50/50 dark:bg-zinc-900/20">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{poll.votos_totais?.toLocaleString()}</p>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Votos Totais</p>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedPoll(poll)}
                    className={cn(
                      "mt-2 w-full py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                      poll.user_voted 
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200" 
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                    )}
                  >
                    {poll.user_voted ? 'Ver Detalhes' : 'Votar Agora'} <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </CardParticipa>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Votação */}
      <AnimatePresence>
        {selectedPoll && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800"
            >
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-2 py-0.5 rounded">
                    {selectedPoll.categoria}
                  </span>
                  <h2 className="text-2xl font-bold mt-2">{selectedPoll.titulo}</h2>
                </div>
                <button 
                  onClick={() => setSelectedPoll(null)}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                  {selectedPoll.descricao}
                </p>

                {selectedPoll.user_voted ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-center gap-3">
                      <div className="p-2 bg-emerald-500 text-white rounded-full">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">Seu voto foi registrado!</p>
                        <p className="text-xs text-emerald-600/80 dark:text-emerald-400/60">Obrigado por participar desta consulta pública.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase text-zinc-500">Resultado Parcial</p>
                      {selectedPoll.opcoes.map((opcao) => (
                        <div key={opcao.id} className="relative h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-between px-4 z-10">
                            <span className="font-bold text-sm">{opcao.texto}</span>
                            {selectedPoll.voto_usuario === opcao.id && (
                              <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded backdrop-blur-md">Seu Voto</span>
                            )}
                          </div>
                          {/* Placeholder for results bar - would need actual counts from DB */}
                          <div className="h-full bg-blue-500/20" style={{ width: '45%' }}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase text-zinc-500">Escolha uma opção:</p>
                    {selectedPoll.opcoes.map((opcao) => (
                      <button
                        key={opcao.id}
                        disabled={voting}
                        onClick={() => handleVote(selectedPoll.id, opcao.id)}
                        className="w-full p-4 text-left bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex justify-between items-center group"
                      >
                        {opcao.texto}
                        <ChevronRight size={18} className="text-zinc-300 group-hover:text-blue-500 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                <AlertCircle size={16} className="text-zinc-400" />
                <p className="text-[10px] text-zinc-500 leading-tight">
                  Seu voto é único e intransferível. Ao votar, você concorda com os termos de participação cidadã do ParticipaAI.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
