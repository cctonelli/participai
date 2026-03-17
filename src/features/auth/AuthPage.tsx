import React, { useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { motion } from 'motion/react';
import { ShieldCheck, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { CardParticipa, CardContent } from '@/src/components/ui/CardParticipa';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (signUpError) throw signUpError;

        if (data.user) {
          // Create profile in 'perfis' table
          const { error: profileError } = await supabase
            .from('perfis')
            .insert({
              id: data.user.id,
              nome_completo: fullName,
              nivel: 'cadastrado'
            });
          if (profileError) throw profileError;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-xl shadow-blue-600/20">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">particip<span className="text-blue-600">.ai</span></h1>
          <p className="text-zinc-500 mt-2">Plataforma de Democracia Digital</p>
        </div>

        <CardParticipa className="border-zinc-200 dark:border-zinc-800 shadow-2xl">
          <CardContent className="pt-6">
            <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl mb-6">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'text-zinc-500'}`}
              >
                Entrar
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'text-zinc-500'}`}
              >
                Cadastrar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-zinc-500 ml-1">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-zinc-500 ml-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-zinc-500 ml-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium rounded-lg border border-red-100 dark:border-red-900/30"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    {isLogin ? 'Entrar' : 'Criar Conta'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </CardContent>
        </CardParticipa>

        <p className="text-center mt-8 text-zinc-500 text-sm">
          {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-blue-600 font-bold hover:underline"
          >
            {isLogin ? 'Cadastre-se agora' : 'Faça login'}
          </button>
        </p>
      </div>
    </div>
  );
};
