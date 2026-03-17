import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  MapPin,
  Loader2
} from 'lucide-react';
import { CardParticipa, CardHeader, CardContent, CardFooter } from '@/src/components/ui/CardParticipa';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/lib/auth-context';

interface FeaturedPoll {
  id: string;
  titulo: string;
  descricao: string;
  votos_totais: number;
  categoria: string;
  created_at: string;
}

const StatCard = ({ icon: Icon, label, value, trend }: { icon: any, label: string, value: string, trend?: string }) => (
  <CardParticipa className="flex-1">
    <CardContent className="pt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-blue-600/10 rounded-lg text-blue-600">
          <Icon size={24} />
        </div>
        {trend && (
          <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">{label}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
    </CardContent>
  </CardParticipa>
);

export const Home = () => {
  const { user } = useAuth();
  const [featuredPolls, setFeaturedPolls] = useState<FeaturedPoll[]>([]);
  const [stats, setStats] = useState({
    citizens: '12.4k',
    polls: '0',
    resolved: '89%',
    engagement: 'High'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      // Fetch featured polls
      const { data: pollsData, error: pollsError } = await supabase
        .from('enquetes')
        .select(`
          *,
          votos_enquetes (count)
        `)
        .eq('status', 'aberta')
        .limit(2)
        .order('created_at', { ascending: false });

      if (pollsError) throw pollsError;

      setFeaturedPolls((pollsData || []).map(p => ({
        id: p.id,
        titulo: p.titulo,
        descricao: p.descricao,
        votos_totais: p.votos_enquetes?.[0]?.count || 0,
        categoria: p.categoria,
        created_at: p.created_at
      })));

      // Fetch total polls count
      const { count: totalPolls } = await supabase
        .from('enquetes')
        .select('*', { count: 'exact', head: true });

      setStats(prev => ({
        ...prev,
        polls: String(totalPolls || 0)
      }));

    } catch (error) {
      console.error('Erro ao buscar dados da home:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentActivities = [
    { id: 1, type: 'vote', text: 'Você votou na enquete "Iluminação Pública"', time: '2h atrás' },
    { id: 2, type: 'status', text: 'Sua denúncia #124 foi marcada como "Em Análise"', time: '5h atrás' },
    { id: 3, type: 'level', text: 'Parabéns! Você atingiu o nível Verificado Prata', time: '1 dia atrás' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 md:p-12 text-white">
        <div className="relative z-10 max-w-2xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold leading-tight"
          >
            Sua voz constrói o futuro da nossa cidade.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-blue-100 text-lg"
          >
            Participe de decisões importantes, acompanhe projetos e ajude a fiscalizar serviços públicos de forma transparente.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center gap-2">
              Começar a Participar <ArrowRight size={18} />
            </button>
            <button className="bg-blue-500/20 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition-colors">
              Ver Projetos Ativos
            </button>
          </motion.div>
        </div>
        
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl"></div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Cidadãos Ativos" value={stats.citizens} trend="+12%" />
        <StatCard icon={BarChart3} label="Enquetes Criadas" value={stats.polls} trend="+5" />
        <StatCard icon={CheckCircle2} label="Demandas Resolvidas" value={stats.resolved} trend="+3%" />
        <StatCard icon={TrendingUp} label="Engajamento" value={stats.engagement} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Featured Polls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Enquetes em Destaque</h2>
            <button className="text-blue-600 font-semibold text-sm hover:underline">Ver todas</button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : featuredPolls.length === 0 ? (
            <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-500">Nenhuma enquete em destaque no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredPolls.map((poll) => (
                <div key={poll.id}>
                  <CardParticipa className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-2 py-0.5 rounded">
                          {poll.categoria}
                        </span>
                        <span className="text-[10px] font-medium text-zinc-500 flex items-center gap-1">
                          <Clock size={12} /> Recente
                        </span>
                      </div>
                      <h3 className="text-lg font-bold leading-snug">{poll.titulo}</h3>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                        {poll.descricao}
                      </p>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500 font-medium">{poll.votos_totais} votos</span>
                      <button className="text-sm font-bold text-blue-600 hover:text-blue-700">
                        Votar agora
                      </button>
                    </CardFooter>
                  </CardParticipa>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* Recent Activity */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold">Atividade Recente</h2>
            <CardParticipa>
              <CardContent className="p-4 space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0 last:pb-0">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-600 shrink-0" />
                    <div>
                      <p className="text-sm font-medium leading-tight">{activity.text}</p>
                      <p className="text-[10px] text-zinc-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </CardParticipa>
          </section>

          {/* Location Widget */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold">Na sua região</h2>
            <CardParticipa className="bg-zinc-900 text-white overflow-hidden relative">
              <div className="absolute inset-0 opacity-20 bg-[url('https://picsum.photos/seed/city/400/400')] bg-cover bg-center"></div>
              <CardContent className="relative z-10 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={18} className="text-blue-400" />
                  <span className="text-sm font-medium">Centro Histórico</span>
                </div>
                <h3 className="text-lg font-bold mb-2">3 novas demandas</h3>
                <p className="text-sm text-zinc-400 mb-4">Existem novas consultas públicas para o seu bairro.</p>
                <button className="w-full py-2 bg-blue-600 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
                  Ver no Mapa
                </button>
              </CardContent>
            </CardParticipa>
          </section>
        </div>
      </div>
    </div>
  );
};
