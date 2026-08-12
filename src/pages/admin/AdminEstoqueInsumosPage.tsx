import React, { useState } from 'react';
import { Package, Plus, AlertTriangle, Edit2, Trash2, X, Search, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { InsumoItem } from '../../types';

export const AdminEstoqueInsumosPage: React.FC = () => {
  const { insumos, addInsumo, updateInsumo, deleteInsumo, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InsumoItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Navalha e Corte');
  const [quantity, setQuantity] = useState('50');
  const [unit, setUnit] = useState('un');
  const [minStock, setMinStock] = useState('20');
  const [unitCost, setUnitCost] = useState('10.00');
  const [supplier, setSupplier] = useState('Distribuidora Barber Pro');

  const filteredInsumos = insumos.filter((item) => {
    if (!searchQuery.trim()) return true;
    return item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const lowStockItems = insumos.filter((item) => item.quantity <= item.minStock);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setName('');
    setCategory('Navalha e Corte');
    setQuantity('50');
    setUnit('un');
    setMinStock('20');
    setUnitCost('10.00');
    setSupplier('Distribuidora Barber Pro');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: InsumoItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setQuantity(item.quantity.toString());
    setUnit(item.unit);
    setMinStock(item.minStock.toString());
    setUnitCost(item.unitCost.toString());
    setSupplier(item.supplier);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = parseInt(quantity, 10);
    const minNum = parseInt(minStock, 10);
    const costNum = parseFloat(unitCost);

    if (!name.trim() || isNaN(qtyNum) || isNaN(costNum)) {
      addToast('Preencha os campos com valores válidos.', 'error');
      return;
    }

    const payload = {
      name: name.trim(),
      category,
      quantity: qtyNum,
      unit,
      minStock: minNum,
      unitCost: costNum,
      supplier: supplier.trim(),
      entryDate: new Date().toISOString().split('T')[0],
    };

    if (editingItem) {
      await updateInsumo(editingItem.id, payload);
    } else {
      await addInsumo(payload);
    }

    setIsModalOpen(false);
  };

  return (
    <AdminLayout
      title="Estoque de Insumos da Barbearia"
      subtitle="Controle interno de lâminas, luvas, golas, toalhas e tintas para uso nos atendimentos"
    >
      {/* Top Banner & Low Stock Warning */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-500/50 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-mono font-bold text-amber-400 uppercase">
                Alerta de Reposição urgente ({lowStockItems.length} insumos baixos)
              </div>
              <div className="text-xs text-neutral-300 font-sans">
                {lowStockItems.map((i) => `${i.name} (${i.quantity} ${i.unit})`).join(', ')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111111] p-4 rounded-2xl border border-neutral-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar insumo por nome..."
            className="w-full bg-black/80 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
          />
        </div>

        <button
          onClick={handleOpenCreate}
          className="py-2.5 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Insumo</span>
        </button>
      </div>

      {/* Insumos List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInsumos.map((item) => {
          const isLow = item.quantity <= item.minStock;
          return (
            <div
              key={item.id}
              className={`bg-[#111111] border rounded-2xl p-5 space-y-3 transition-colors flex flex-col justify-between ${
                isLow ? 'border-amber-500/60 bg-amber-950/10' : 'border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-sm text-white font-sans pt-1">{item.name}</h3>
                  </div>

                  {isLow ? (
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-mono font-bold uppercase flex items-center gap-1 border border-red-500/30">
                      <AlertTriangle className="w-3 h-3" />
                      Repor
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase">
                      OK
                    </span>
                  )}
                </div>

                <div className="p-3 bg-black/60 rounded-xl border border-neutral-800 text-xs font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Estoque Atual:</span>
                    <span className={`font-bold ${isLow ? 'text-red-400' : 'text-white'}`}>
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Mínimo Seguro:</span>
                    <span>{item.minStock} {item.unit}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Custo Unitário:</span>
                    <span className="text-amber-400">R$ {item.unitCost.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-500 font-mono">
                  Fornecedor: {item.supplier}
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                <span className="text-[10px] text-neutral-500 font-mono">Entrada: {item.entryDate}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg bg-neutral-900 text-amber-400 hover:bg-neutral-800 border border-neutral-800"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteInsumo(item.id)}
                    className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 border border-neutral-800"
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
                <Package className="w-4 h-4 text-[#DAA520]" />
                {editingItem ? 'Editar Insumo' : 'Novo Insumo'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-neutral-400 hover:text-white bg-neutral-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">Nome do Insumo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Lâminas Wilkinson / Luvas Nitrílicas"
                  className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                  >
                    <option value="Navalha e Corte">Navalha e Corte</option>
                    <option value="Higiene e Proteção">Higiene e Proteção</option>
                    <option value="Barboterapia">Barboterapia</option>
                    <option value="Pigmentação">Pigmentação</option>
                    <option value="Limpeza">Limpeza</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">Unidade Medida</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                  >
                    <option value="un">Unidade (un)</option>
                    <option value="caixa">Caixa</option>
                    <option value="pacote">Pacote</option>
                    <option value="rolo">Rolo</option>
                    <option value="tubo">Tubo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold uppercase text-neutral-300">Qtd Atual</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold uppercase text-neutral-300">Qtd Mínima</label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold uppercase text-neutral-300">Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">Fornecedor</label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Distribuidora Barber Pro"
                  className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                {editingItem ? 'Salvar Alterações' : 'Cadastrar Insumo'}
              </button>
            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  );
};
