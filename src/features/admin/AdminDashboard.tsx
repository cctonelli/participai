import React, { useState } from 'react';
import { 
  Plus, 
  Building2, 
  Map, 
  Users, 
  Settings, 
  ChevronRight,
  Search,
  Globe,
  Landmark,
  ShieldAlert,
  Database
} from 'lucide-react';
import { CardParticipa, CardHeader, CardContent } from '@/src/components/ui/CardParticipa';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { EntityRegistration } from './EntityRegistration';
import { EntityLinking } from './EntityLinking';
import { HierarchyManagement } from './HierarchyManagement';
import { AdminManagement } from './AdminManagement';
import { PollManagement } from './PollManagement';

interface Entity {
  id: string;
  nome: string;
  tipo: 'estado' | 'cidade' | 'prefeitura' | 'camara' | 'secretaria';
  estado_sigla?: string;
  subEntitiesCount: number;
}

export const AdminDashboard = () => {
  const [activeView, setActiveView] = useState<'overview' | 'entities' | 'users' | 'ibge' | 'linking' | 'polls'>('overview');

  const entities: Entity[] = [
    { id: '1', nome: 'Paraná', tipo: 'estado', estado_sigla: 'PR', subEntitiesCount: 399 },
    { id: '2', nome: 'Cianorte', tipo: 'cidade', estado_sigla: 'PR', subEntitiesCount: 2 },
    { id: '3', nome: 'Prefeitura de Cianorte', tipo: 'prefeitura', estado_sigla: 'PR', subEntitiesCount: 12 },
    { id: '4', nome: 'Câmara Municipal de Cianorte', tipo: 'camara', estado_sigla: 'PR', subEntitiesCount: 0 },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardParticipa className="bg-blue-600 text-white border-none">
          <CardContent className="pt-6">
            <Globe className="mb-2 opacity-60" size={24} />
            <p className="text-blue-100 text-sm font-medium">Estados Cadastrados</p>
            <h3 className="text-3xl font-bold">27</h3>
          </CardContent>
        </CardParticipa>
        <CardParticipa className="bg-indigo-600 text-white border-none">
          <CardContent className="pt-6">
            <Map className="mb-2 opacity-60" size={24} />
            <p className="text-indigo-100 text-sm font-medium">Cidades Ativas</p>
            <h3 className="text-3xl font-bold">1,240</h3>
          </CardContent>
        </CardParticipa>
        <CardParticipa className="bg-emerald-600 text-white border-none">
          <CardContent className="pt-6">
            <Landmark className="mb-2 opacity-60" size={24} />
            <p className="text-emerald-100 text-sm font-medium">Entidades Gov.</p>
            <h3 className="text-3xl font-bold">3,450</h3>
          </CardContent>
        </CardParticipa>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Entidades Recentes</h2>
          <button className="text-sm text-blue-600 font-bold hover:underline">Ver todas</button>
        </div>
        <div className="space-y-2">
          {entities.map((entity) => (
            <div key={entity.id}>
              <CardParticipa className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                      {entity.tipo === 'estado' ? <Globe size={20} /> : <Building2 size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{entity.nome}</h4>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">
                        {entity.tipo} {entity.estado_sigla && `• ${entity.estado_sigla}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-medium text-zinc-400">
                      {entity.subEntitiesCount} sub-entidades
                    </span>
                    <ChevronRight size={16} className="text-zinc-300" />
                  </div>
                </div>
              </CardParticipa>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert size={20} className="text-red-500" />
            <h1 className="text-3xl font-bold">Painel de Administração</h1>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400">Gestão global de hierarquias e entidades governamentais.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors">
            <Plus size={18} /> Nova Entidade
          </button>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl w-fit overflow-x-auto max-w-full">
        <button 
          onClick={() => setActiveView('overview')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
            activeView === 'overview' ? "bg-white dark:bg-zinc-800 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
          )}
        >
          Visão Geral
        </button>
        <button 
          onClick={() => setActiveView('ibge')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
            activeView === 'ibge' ? "bg-white dark:bg-zinc-800 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
          )}
        >
          Cadastro IBGE
        </button>
        <button 
          onClick={() => setActiveView('linking')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
            activeView === 'linking' ? "bg-white dark:bg-zinc-800 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
          )}
        >
          Vincular Entidades
        </button>
        <button 
          onClick={() => setActiveView('polls')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
            activeView === 'polls' ? "bg-white dark:bg-zinc-800 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
          )}
        >
          Enquetes
        </button>
        <button 
          onClick={() => setActiveView('entities')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
            activeView === 'entities' ? "bg-white dark:bg-zinc-800 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
          )}
        >
          Hierarquias
        </button>
        <button 
          onClick={() => setActiveView('users')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
            activeView === 'users' ? "bg-white dark:bg-zinc-800 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
          )}
        >
          Administradores
        </button>
      </div>

      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeView === 'overview' ? renderOverview() : 
         activeView === 'ibge' ? <EntityRegistration /> : 
         activeView === 'linking' ? <EntityLinking /> : 
         activeView === 'polls' ? <PollManagement /> :
         activeView === 'entities' ? <HierarchyManagement /> :
         activeView === 'users' ? <AdminManagement /> : (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
            <Settings size={48} className="mb-4 opacity-20 animate-spin-slow" />
            <p className="font-medium">Configurações avançadas de {activeView}</p>
            <p className="text-sm">Módulo em fase de implementação.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
