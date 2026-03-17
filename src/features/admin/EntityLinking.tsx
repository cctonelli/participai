import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Building2, 
  Landmark, 
  Plus, 
  ChevronRight, 
  Check,
  Loader2,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { CardParticipa, CardHeader, CardContent } from '@/src/components/ui/CardParticipa';
import { supabase } from '@/src/lib/supabase';
import { cn } from '@/src/lib/utils';

interface Municipio {
  id: string;
  nome_municipio: string;
  sigla_uf: string;
  id_munic_comp: string;
}

interface Entity {
  id: string;
  nome: string;
  tipo: string;
}

export const EntityLinking = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipio | null>(null);
  const [linkedEntities, setLinkedEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLinking, setIsLinking] = useState(false);

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchMunicipios();
    }
  }, [searchTerm]);

  const searchMunicipios = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('municipios')
      .select('id, nome_municipio, sigla_uf, id_munic_comp')
      .ilike('nome_municipio', `%${searchTerm}%`)
      .limit(5);
    
    if (data) setMunicipios(data);
    setIsLoading(false);
  };

  const loadEntities = async (municId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('entidades_governamentais')
      .select('id, nome, tipo')
      .eq('municipio_id', municId);
    
    if (data) setLinkedEntities(data);
    setIsLoading(false);
  };

  const handleSelectMunicipality = (munic: Municipio) => {
    setSelectedMunicipality(munic);
    loadEntities(munic.id);
    setMunicipios([]);
    setSearchTerm('');
  };

  const linkEntity = async (tipo: 'prefeitura' | 'camara') => {
    if (!selectedMunicipality) return;
    
    setIsLinking(true);
    const nome = tipo === 'prefeitura' 
      ? `Prefeitura Municipal de ${selectedMunicipality.nome_municipio}`
      : `Câmara Municipal de ${selectedMunicipality.nome_municipio}`;

    const { error } = await supabase
      .from('entidades_governamentais')
      .insert({
        tipo,
        nome,
        municipio_id: selectedMunicipality.id,
        estado_sigla: selectedMunicipality.sigla_uf,
        codigo_ibge: selectedMunicipality.id_munic_comp
      });

    if (!error) {
      loadEntities(selectedMunicipality.id);
    }
    setIsLinking(false);
  };

  return (
    <div className="space-y-6">
      <CardParticipa>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="text-blue-600" size={20} />
            <h3 className="font-bold">Vincular Entidades a Municípios</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Buscar município por nome (ex: Londrina)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            {isLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-blue-600" size={18} />}
          </div>

          {municipios.length > 0 && (
            <div className="mt-2 border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden shadow-lg bg-white dark:bg-zinc-950 z-10 relative">
              {municipios.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectMunicipality(m)}
                  className="w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center justify-between border-b last:border-0 border-zinc-100 dark:border-zinc-800 transition-colors"
                >
                  <div>
                    <span className="font-bold">{m.nome_municipio}</span>
                    <span className="ml-2 text-xs text-zinc-500">{m.sigla_uf}</span>
                  </div>
                  <ChevronRight size={16} className="text-zinc-300" />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </CardParticipa>

      {selectedMunicipality && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
          <CardParticipa>
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Landmark className="text-blue-600" size={20} />
                  <h3 className="font-bold">{selectedMunicipality.nome_municipio}</h3>
                </div>
                <button 
                  onClick={() => setSelectedMunicipality(null)}
                  className="text-xs text-zinc-500 hover:text-zinc-800"
                >
                  Trocar
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Ações Rápidas</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => linkEntity('prefeitura')}
                    disabled={isLinking || linkedEntities.some(e => e.tipo === 'prefeitura')}
                    className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group disabled:opacity-50 disabled:hover:border-zinc-200"
                  >
                    <Building2 className="text-zinc-400 group-hover:text-blue-600" size={20} />
                    <div className="text-left">
                      <p className="text-xs font-bold">Prefeitura</p>
                      <p className="text-[10px] text-zinc-500">Vincular</p>
                    </div>
                  </button>
                  <button
                    onClick={() => linkEntity('camara')}
                    disabled={isLinking || linkedEntities.some(e => e.tipo === 'camara')}
                    className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group disabled:opacity-50 disabled:hover:border-zinc-200"
                  >
                    <Landmark className="text-zinc-400 group-hover:text-blue-600" size={20} />
                    <div className="text-left">
                      <p className="text-xs font-bold">Câmara</p>
                      <p className="text-[10px] text-zinc-500">Vincular</p>
                    </div>
                  </button>
                </div>
              </div>
            </CardContent>
          </CardParticipa>

          <CardParticipa>
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Check className="text-emerald-500" size={20} />
                <h3 className="font-bold">Entidades Vinculadas</h3>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {linkedEntities.length === 0 ? (
                <div className="text-center py-8 text-zinc-400">
                  <p className="text-sm">Nenhuma entidade vinculada ainda.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {linkedEntities.map((e) => (
                    <div 
                      key={e.id}
                      className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800"
                    >
                      <div className="flex items-center gap-3">
                        {e.tipo === 'prefeitura' ? <Building2 size={18} className="text-blue-600" /> : <Landmark size={18} className="text-emerald-600" />}
                        <div>
                          <p className="text-sm font-bold">{e.nome}</p>
                          <p className="text-[10px] uppercase text-zinc-500">{e.tipo}</p>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-zinc-300" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </CardParticipa>
        </div>
      )}
    </div>
  );
};
