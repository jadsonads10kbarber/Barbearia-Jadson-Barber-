import React, { useState } from 'react';
import { Scissors, Plus, Edit2, Trash2, Tag, Clock, DollarSign, X, Check, Flame, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ServiceItem } from '../../types';
import { getComboDiscountDetails } from '../../utils/comboMatcher';

export const AdminServicosPage: React.FC = () => {
  const { services, addService, updateService, deleteService, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'individual' | 'combo'>('individual');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'individual' | 'combo'>('individual');
  const [popular, setPopular] = useState(false);
  const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo');

  const filteredServices = services.filter((s) => s.category === activeTab);

  const handleOpenCreate = (type: 'individual' | 'combo') => {
    setEditingService(null);
    setName(type === 'combo' ? 'Combo Promocional ' : '');
    setPrice(type === 'combo' ? '50.00' : '35.00');
    setOriginalPrice(type === 'combo' ? '65.00' : '');
    setDurationMinutes(type === 'combo' ? '50' : '30');
    setDescription('');
    setCategory(type);
    setPopular(type === 'combo');
    setStatus('ativo');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: ServiceItem) => {
    setEditingService(s);
    setName(s.name);
    setPrice(s.price.toString());
    setOriginalPrice(s.originalPrice ? s.originalPrice.toString() : '');
    setDurationMinutes(s.durationMinutes.toString());
    setDescription(s.description);
    setCategory(s.category);
    setPopular(s.popular || false);
    setStatus(s.status || 'ativo');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(price);
    const originalPriceNum = originalPrice ? parseFloat(originalPrice) : undefined;
    const durationNum = parseInt(durationMinutes, 10);

    if (!name.trim() || isNaN(priceNum) || priceNum <= 0 || isNaN(durationNum) || durationNum <= 0) {
      addToast('Informe um nome, preço e duração válidos.', 'error');
      return;
    }

    const payload = {
      name: name.trim(),
      price: priceNum,
      originalPrice: originalPriceNum && originalPriceNum > priceNum ? originalPriceNum : undefined,
      durationMinutes: durationNum,
      description: description.trim(),
      category,
      popular,
      status,
    };

    if (editingService) {
      await updateService(editingService.id, payload);
    } else {
      await addService(payload);
    }

    setIsModalOpen(false);
  };

  return (
    <AdminLayout
      title="Gestão de Serviços & Combos Promocionais"
      subtitle="Cadastre cortes individuais e ofertas promocionais combinadas"
    >
      {/* Category Tabs & Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111111] p-4 rounded-2xl border border-neutral-800">
        <div className="flex gap-2 bg-black/60 p-1 rounded-xl border border-neutral-800">
          <button
            onClick={() => setActiveTab('individual')}
            className={`py-2 px-4 rounded-lg font-mono text-xs font-bold uppercase transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'individual' ? 'bg-[#DAA520] text-black shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>Serviços Individuais ({services.filter((s) => s.category === 'individual').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('combo')}
            className={`py-2 px-4 rounded-lg font-mono text-xs font-bold uppercase transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'combo' ? 'bg-[#DAA520] text-black shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Combos Promocionais ({services.filter((s) => s.category === 'combo').length})</span>
          </button>
        </div>

        <button
          onClick={() => handleOpenCreate(activeTab)}
          className="py-2.5 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar {activeTab === 'combo' ? 'Combo Promocional' : 'Serviço'}</span>
        </button>
      </div>

      {/* Services List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((s) => {
          const discount = s.category === 'combo' ? getComboDiscountDetails(s, services) : null;

          return (
            <div
              key={s.id}
              className={`bg-[#111111] border rounded-2xl p-5 space-y-3 transition-colors flex flex-col justify-between ${
                s.category === 'combo' ? 'border-[#DAA520]/40 shadow-lg shadow-[#DAA520]/5' : 'border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="space-y-2.5">
                {/* 1. Combo / Individual */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-extrabold uppercase tracking-wider ${
                      s.category === 'combo'
                        ? 'bg-[#DAA520] text-black shadow-sm'
                        : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                    }`}>
                      {s.category === 'combo' ? <Flame className="w-3 h-3 fill-black" /> : <Scissors className="w-3 h-3" />}
                      <span>{s.category === 'combo' ? 'Combo' : 'Individual'}</span>
                    </span>

                    {discount?.hasDiscount && (
                      <span className="inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-[10px] px-2 py-0.5 rounded">
                        <Flame className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400/40" />
                        <span>{discount.discountPercentage}% OFF</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {s.popular && (
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-amber-400" />
                        Mais Pedido
                      </span>
                    )}
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                      s.status === 'inativo' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {s.status || 'ativo'}
                    </span>
                  </div>
                </div>

                {/* 2. Nome do serviço */}
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Nome do Serviço:</p>
                  <h3 className="font-bold text-base text-white font-sans mt-0.5">{s.name}</h3>
                </div>

                {/* 3. Preço & 4. Duração */}
                <div className="grid grid-cols-2 gap-2 bg-black/60 p-2.5 rounded-xl border border-neutral-800/80">
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-wider text-neutral-400">Preço:</p>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-base font-black font-mono text-[#DAA520]">
                        R$ {s.price.toFixed(2).replace('.', ',')}
                      </span>
                      {discount?.hasDiscount && (
                        <span className="text-[10px] text-neutral-500 line-through font-mono">
                          R$ {discount.originalPrice.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </div>
                    {discount?.hasDiscount && (
                      <span className="text-[9px] text-emerald-400 font-mono block mt-0.5">
                        Economia: R$ {discount.savingsAmount.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-wider text-neutral-400">Duração:</p>
                    <p className="text-xs font-bold font-mono text-neutral-200 flex items-center gap-1 mt-1">
                      <Clock className="w-3.5 h-3.5 text-[#DAA520]" />
                      {s.durationMinutes} minutos
                    </p>
                  </div>
                </div>

                {/* 5. Descrição */}
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-wider text-neutral-400">Descrição:</p>
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans mt-0.5 bg-neutral-900/40 p-2 rounded-lg border border-white/5">
                    {s.description || 'Sem descrição cadastrada.'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-neutral-400">ID: {s.id.slice(0, 8)}...</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="p-2 rounded-xl bg-neutral-900 text-amber-400 hover:bg-neutral-800 border border-neutral-800 cursor-pointer"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteService(s.id)}
                    className="p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 border border-neutral-800 cursor-pointer"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#111111] border border-neutral-800 rounded-3xl p-6 space-y-4 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
                <Scissors className="w-4 h-4 text-[#DAA520]" />
                {editingService ? `Editar ${category === 'combo' ? 'Combo' : 'Serviço'}` : `Novo ${category === 'combo' ? 'Combo' : 'Serviço'}`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-neutral-400 hover:text-white bg-neutral-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* 1. Categoria (Combo) */}
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">
                  1. Categoria
                </label>
                <div className="grid grid-cols-2 gap-2 bg-black/60 p-1 rounded-xl border border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setCategory('combo')}
                    className={`py-2 px-3 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      category === 'combo'
                        ? 'bg-[#DAA520] text-black shadow-sm font-extrabold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Categoria (Combo)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('individual')}
                    className={`py-2 px-3 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      category === 'individual'
                        ? 'bg-[#DAA520] text-black shadow-sm font-extrabold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Individual</span>
                  </button>
                </div>
              </div>

              {/* 2. Nome do serviço */}
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">
                  2. Nome do serviço {category === 'combo' ? '(Combo)' : ''}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={category === 'combo' ? 'Ex: Combo Completo (Cabelo + Barba + Sobrancelha)' : 'Ex: Corte Degradê Navalhado'}
                  className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
                  required
                />
              </div>

              {/* 3. Preço & 4. Duração */}
              <div className={`grid ${category === 'combo' ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'} gap-3`}>
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">
                    {category === 'combo' ? 'Preço Combo (R$)' : '3. Preço (R$)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="75.00"
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                    required
                  />
                </div>

                {category === 'combo' && (
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold uppercase text-neutral-300">
                      Preço Avulso (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="100.00"
                      className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">
                    {category === 'combo' ? 'Duração (min)' : '4. Duração (minutos)'}
                  </label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    placeholder="50"
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                    required
                  />
                </div>
              </div>

              {/* Live Combo Discount Preview in Modal */}
              {category === 'combo' && parseFloat(price) > 0 && (() => {
                const p = parseFloat(price);
                const orig = parseFloat(originalPrice) || 0;
                let calcOrig = orig;
                if (!calcOrig || calcOrig <= p) {
                  // Fallback estimate or sum
                  calcOrig = Math.round((p / 0.8) / 5) * 5;
                }
                const savings = calcOrig > p ? calcOrig - p : 0;
                const pct = calcOrig > p ? Math.round((savings / calcOrig) * 100) : 0;

                return (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-emerald-400 fill-emerald-400/40 shrink-0" />
                      <div>
                        <span className="text-xs font-mono font-bold text-emerald-300 block">
                          {pct}% de Desconto para o cliente
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          De R$ {calcOrig.toFixed(2).replace('.', ',')} por R$ {p.toFixed(2).replace('.', ',')} (Economia de R$ {savings.toFixed(2).replace('.', ',')})
                        </span>
                      </div>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-300 text-xs font-mono font-black px-2 py-1 rounded-lg">
                      {pct}% OFF
                    </span>
                  </div>
                );
              })()}

              {/* 5. Descrição */}
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">
                  5. Descrição
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={category === 'combo' ? 'Descreva detalhadamente o que inclui este combo promocional...' : 'O que está incluso neste atendimento...'}
                  className="w-full bg-black/80 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#DAA520]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                  <input
                    type="checkbox"
                    checked={popular}
                    onChange={(e) => setPopular(e.target.checked)}
                    className="accent-amber-500 rounded"
                  />
                  <span>Destaque / Mais Pedido</span>
                </label>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="bg-black border border-neutral-800 rounded-lg px-2 py-1 text-xs font-mono text-white"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                {editingService ? 'Salvar Alterações' : 'Cadastrar Item'}
              </button>
            </form>

          </div>
        </div>
      )}

    </AdminLayout>
  );
};
