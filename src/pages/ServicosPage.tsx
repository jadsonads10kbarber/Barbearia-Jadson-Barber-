import React, { useState, useEffect } from 'react';
import { Scissors, Clock, Sparkles, ArrowRight, Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ServicosPage: React.FC = () => {
  const { services, setActivePage, barbershopInfo } = useApp();
  const [activeTab, setActiveTab] = useState<'individual' | 'combo'>('individual');
  const [searchQuery, setSearchQuery] = useState('');

  const isAgendamentoEnabled = barbershopInfo.clientModules?.showAgendamento !== false;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab]);

  const individualServices = services.filter(
    (s) =>
      s.category === 'individual' &&
      (searchQuery.trim() === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const comboServices = services.filter(
    (s) =>
      s.category === 'combo' &&
      (searchQuery.trim() === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="pb-24 pt-2 px-4 max-w-3xl mx-auto space-y-5">
      
      {/* Title */}
      <div className="border-b border-neutral-800 pb-3">
        <h1 className="text-xl font-extrabold text-white font-sans flex items-center gap-2">
          <Scissors className="w-5 h-5 text-[#DAA520]" />
          Nossos Serviços
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Conheça o catálogo completo de procedimentos oferecidos pela Barbearia JADSON BARBER
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#DAA520]">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar corte, barba ou combo pelo nome..."
          className="w-full bg-[#111111] border border-white/10 focus:border-[#DAA520] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none transition-colors shadow-inner font-sans"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white cursor-pointer"
            title="Limpar busca"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Shortcut Buttons: Serviços Individuais / Combos Exclusivos */}
      <div className="bg-[#111111] p-1.5 rounded-xl border border-white/10 shadow-md">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => setActiveTab('individual')}
            className={`py-2 px-3 rounded-lg font-sans text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'individual'
                ? 'bg-[#DAA520] text-black shadow-md shadow-[#DAA520]/20 font-extrabold'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Scissors className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Serviços Individuais</span>
          </button>

          <button
            onClick={() => setActiveTab('combo')}
            className={`py-2 px-3 rounded-lg font-sans text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'combo'
                ? 'bg-[#DAA520] text-black shadow-md shadow-[#DAA520]/20 font-extrabold'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Scissors className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Combos Promocionais</span>
          </button>
        </div>
      </div>

      {/* INDIVIDUAL SERVICES SECTION */}
      {activeTab === 'individual' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase text-[#DAA520] tracking-wider font-sans flex items-center gap-2">
              <Scissors className="w-4 h-4" />
              Serviços Individuais
            </h2>
            <span className="text-[10px] text-gray-400 font-sans">
              {individualServices.length} {individualServices.length === 1 ? 'opção encontrada' : 'opções encontradas'}
            </span>
          </div>

          {individualServices.length === 0 ? (
            <div className="bg-[#111111]/90 border border-neutral-800 rounded-2xl p-8 text-center space-y-3">
              <Scissors className="w-8 h-8 text-[#DAA520] mx-auto opacity-70" />
              <p className="text-sm text-gray-300 font-sans">
                {searchQuery
                  ? `Nenhum serviço individual encontrado para "${searchQuery}"`
                  : 'Nenhum serviço individual cadastrado no momento.'}
              </p>
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="py-1.5 px-4 rounded-xl bg-[#DAA520]/20 hover:bg-[#DAA520] text-[#DAA520] hover:text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer border border-[#DAA520]/30"
                >
                  Limpar Busca
                </button>
              ) : (
                <p className="text-xs text-gray-500">
                  Os serviços cadastrados no painel administrativo aparecerão aqui automaticamente.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {individualServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-[#111111]/90 border border-neutral-800 rounded-2xl p-4 shadow-md space-y-2 flex flex-col justify-between hover:border-[#DAA520]/40 transition-all duration-200"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-white font-sans">{service.name}</h3>
                      <span className="text-sm font-extrabold text-[#DAA520] font-sans shrink-0">
                        R$ {service.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mt-1">{service.description}</p>
                  </div>

                  <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400 flex items-center gap-1 font-sans">
                      <Clock className="w-3.5 h-3.5 text-[#DAA520]" />
                      {service.durationMinutes} min
                    </span>

                    {isAgendamentoEnabled && (
                      <button
                        onClick={() => setActivePage('agenda')}
                        className="py-1.5 px-3.5 rounded-xl bg-[#DAA520]/15 hover:bg-[#DAA520] text-[#DAA520] hover:text-black font-extrabold text-xs uppercase tracking-wider transition-all border border-[#DAA520]/30 hover:border-[#DAA520] cursor-pointer"
                      >
                        Agendar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* COMBOS SECTION */}
      {activeTab === 'combo' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase text-[#DAA520] tracking-wider font-sans flex items-center gap-2">
              <Scissors className="w-4 h-4" />
              Combos Promocionais (Economia Garantida)
            </h2>
            <span className="text-[10px] text-gray-400 font-sans">
              {comboServices.length} {comboServices.length === 1 ? 'combo encontrado' : 'combos encontrados'}
            </span>
          </div>

          {comboServices.length === 0 ? (
            <div className="bg-[#111111]/90 border border-neutral-800 rounded-2xl p-8 text-center space-y-3">
              <Scissors className="w-8 h-8 text-[#DAA520] mx-auto opacity-70" />
              <p className="text-sm text-gray-300 font-sans">
                {searchQuery
                  ? `Nenhum combo promocional encontrado para "${searchQuery}"`
                  : 'Nenhum combo promocional cadastrado no momento.'}
              </p>
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="py-1.5 px-4 rounded-xl bg-[#DAA520]/20 hover:bg-[#DAA520] text-[#DAA520] hover:text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer border border-[#DAA520]/30"
                >
                  Limpar Busca
                </button>
              ) : (
                <p className="text-xs text-gray-500">
                  Os combos cadastrados no painel administrativo aparecerão aqui automaticamente.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {comboServices.map((combo) => (
                <div
                  key={combo.id}
                  className="bg-[#111111]/90 border border-[#DAA520]/40 rounded-2xl p-5 shadow-xl space-y-3.5 relative overflow-hidden hover:border-[#DAA520]/70 transition-all duration-200"
                >
                  {/* 1. Tag Combo */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-[#DAA520] text-black font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg font-sans shadow-sm">
                      <Scissors className="w-3 h-3 stroke-[2.5]" />
                      <span>Combo</span>
                    </span>

                    {combo.popular && (
                      <span className="text-[10px] bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold px-2 py-0.5 rounded-md uppercase font-sans">
                        Mais Pedido
                      </span>
                    )}
                  </div>

                  {/* 2. Nome do serviço */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white font-sans">{combo.name}</h3>
                  </div>

                  {/* 3. Preço & 4. Duração */}
                  <div className="flex flex-wrap items-baseline justify-between gap-2 bg-black/50 p-3 rounded-xl border border-white/5">
                    <div>
                      <span className="text-[10px] text-gray-400 font-sans uppercase tracking-wider block">Preço</span>
                      <span className="text-xl font-black text-[#DAA520] font-sans">
                        R$ {combo.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 font-sans uppercase tracking-wider block">Duração</span>
                      <span className="text-xs font-bold text-gray-200 flex items-center justify-end gap-1 font-sans">
                        <Clock className="w-3.5 h-3.5 text-[#DAA520]" />
                        {combo.durationMinutes} minutos
                      </span>
                    </div>
                  </div>

                  {/* 5. Descrição */}
                  <div>
                    <span className="text-[10px] text-gray-400 font-sans uppercase tracking-wider block mb-1">Descrição:</span>
                    <p className="text-xs text-gray-300 font-sans leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5">
                      {combo.description || 'Procedimento completo combinado com produtos de alta qualidade.'}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 font-sans">Atendimento exclusivo com horário marcado</span>
                    {isAgendamentoEnabled && (
                      <button
                        onClick={() => setActivePage('agenda')}
                        className="py-2 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-extrabold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-md shadow-[#DAA520]/20 cursor-pointer"
                      >
                        <span>Agendar Este Combo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
