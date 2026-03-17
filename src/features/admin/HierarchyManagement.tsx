import React, { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { 
  ChevronRight, 
  ChevronDown, 
  Building2, 
  Globe, 
  Landmark, 
  Search,
  Plus,
  Loader2,
  MoreVertical
} from 'lucide-react';
import { CardParticipa, CardContent } from '@/src/components/ui/CardParticipa';
import { motion, AnimatePresence } from 'motion/react';

interface EntityNode {
  id: string;
  nome: string;
  tipo: string;
  poder?: string;
  nivel?: string;
  estado_sigla?: string;
  children?: EntityNode[];
  isOpen?: boolean;
}

export const HierarchyManagement = () => {
  const [entities, setEntities] = useState<EntityNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHierarchy();
  }, []);

  const fetchHierarchy = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('entidades_governamentais')
        .select('*')
        .order('nivel', { ascending: false }) // Prioriza Estadual
        .order('nome');

      if (error) throw error;

      // Build tree structure
      const entityMap: { [key: string]: EntityNode } = {};
      const roots: EntityNode[] = [];

      data.forEach(item => {
        entityMap[item.id] = { ...item, children: [] };
      });

      data.forEach(item => {
        if (item.pai_id && entityMap[item.pai_id]) {
          entityMap[item.pai_id].children?.push(entityMap[item.id]);
        } else {
          roots.push(entityMap[item.id]);
        }
      });

      setEntities(roots);
    } catch (error) {
      console.error('Erro ao buscar hierarquia:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (id: string) => {
    const updateNodes = (nodes: EntityNode[]): EntityNode[] => {
      return nodes.map(node => {
        if (node.id === id) {
          return { ...node, isOpen: !node.isOpen };
        }
        if (node.children) {
          return { ...node, children: updateNodes(node.children) };
        }
        return node;
      });
    };
    setEntities(updateNodes(entities));
  };

  const renderNode = (node: EntityNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    
    // Icon selection based on power and type
    let Icon = Building2;
    if (node.tipo === 'estado') Icon = Globe;
    else if (node.poder === 'legislativo') Icon = Landmark;
    else if (node.tipo === 'cidade') Icon = Building2;

    const powerColor = node.poder === 'legislativo' ? 'text-amber-600 bg-amber-100' : 
                      node.poder === 'executivo' ? 'text-blue-600 bg-blue-100' : 
                      'text-zinc-600 bg-zinc-100';

    return (
      <div key={node.id} className="select-none">
        <div 
          className={`flex items-center justify-between p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer group`}
          style={{ paddingLeft: `${level * 24 + 8}px` }}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          <div className="flex items-center gap-3">
            {hasChildren ? (
              node.isOpen ? <ChevronDown size={16} className="text-zinc-400" /> : <ChevronRight size={16} className="text-zinc-400" />
            ) : (
              <div className="w-4" />
            )}
            <div className={`p-1.5 rounded-md ${powerColor} dark:bg-zinc-800`}>
              <Icon size={14} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{node.nome}</span>
                {node.nivel && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 font-bold uppercase tracking-tighter">
                    {node.nivel}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">{node.tipo}</span>
                {node.poder && (
                  <span className={`text-[9px] font-bold uppercase ${node.poder === 'legislativo' ? 'text-amber-500' : 'text-blue-500'}`}>
                    • {node.poder}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded">
              <MoreVertical size={14} className="text-zinc-400" />
            </button>
          </div>
        </div>
        
        <AnimatePresence>
          {node.isOpen && hasChildren && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {node.children?.map(child => renderNode(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar na hierarquia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Plus size={18} /> Nova Unidade
        </button>
      </div>

      <CardParticipa>
        <CardContent className="p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p className="text-sm font-medium">Carregando hierarquia...</p>
            </div>
          ) : entities.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <Globe size={48} className="mx-auto mb-4 opacity-10" />
              <p className="font-medium">Nenhuma entidade cadastrada</p>
              <p className="text-sm">Comece vinculando municípios ou criando estados.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {entities.map(node => renderNode(node))}
            </div>
          )}
        </CardContent>
      </CardParticipa>
    </div>
  );
};
