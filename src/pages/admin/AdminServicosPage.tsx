import React, { useState } from 'react';
import { Scissors, Plus, Edit2, Trash2, Tag, Clock, DollarSign, X, Check, Flame } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ServiceItem } from '../../types';

export const AdminServicosPage: React.FC = () => {
  const { services, addService, updateService, deleteService, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'individual' | 'combo'>('individual');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
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
    const durationNum = parseInt(durationMinutes, 10);

    if (!name.trim() || isNaN(priceNum) || priceNum <= 0 || isNaN(durationNum) || durationNum <= 0) {
      addToast('Informe um nome, preço e duração válidos.', 'error');
      return;
    }

    const payload = {
      name: name.trim(),
      price: priceNum,
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
        {filteredServices.map((s) => (
          <div
            key={s.id}
            className="bg-[#111111] border border-neutral-800 rounded-2xl p-5 space-y-3 hover:border-neutral-700 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white font-sans">{s.name}</h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                      <span>{s.durationMinutes} minutos</span>
                      {s.popular && (
                        <span className="text-amber-400 font-bold flex items-center gap-0.5">
                          <Flame className="w-3 h-3 fill-amber-400" />
                          Mais Pedido
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed font-sans">{s.description}</p>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
              <div className="text-lg font-black font-mono text-amber-400">
                R$ {s.price.toFixed(2)}
              </div>

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
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#111111] border border-neutral-800 rounded-3xl p-6 space-y-4 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
                <Scissors className="w-4 h-4 text-[#DAA520]" />
                {editingService ? 'Editar Item' : 'Novo Item'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-neutral-400 hover:text-white bg-neutral-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">Nome do Serviço / Combo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Combo VIP Completo"
                  className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="50.00"
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">Duração (minutos)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    placeholder="30"
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">Descrição Detalhada</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="O que está incluso neste atendimento..."
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
