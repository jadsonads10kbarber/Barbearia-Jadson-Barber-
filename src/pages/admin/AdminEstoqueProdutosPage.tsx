import React, { useState } from 'react';
import { ShoppingBag, Plus, DollarSign, Edit2, Trash2, X, Search, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { SaleProduct } from '../../types';

export const AdminEstoqueProdutosPage: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, recordSale, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<SaleProduct | null>(null);

  // Product Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Finalizadores');
  const [sku, setSku] = useState('');
  const [costPrice, setCostPrice] = useState('15.00');
  const [salePrice, setSalePrice] = useState('40.00');
  const [quantity, setQuantity] = useState('20');
  const [minStock, setMinStock] = useState('5');
  const [supplier, setSupplier] = useState('Jadson Barber Cosmetics');

  // Sale Modal Form State
  const [saleCustomerName, setSaleCustomerName] = useState('Cliente Balcão');
  const [saleCustomerPhone, setSaleCustomerPhone] = useState('');
  const [saleProductId, setSaleProductId] = useState(products[0]?.id || '');
  const [saleQuantity, setSaleQuantity] = useState('1');
  const [salePaymentMethod, setSalePaymentMethod] = useState('PIX');

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    return p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedSaleProduct = products.find((p) => p.id === saleProductId);

  const handleOpenCreate = () => {
    setEditingProd(null);
    setName('');
    setCategory('Finalizadores');
    setSku(`PROD-${Date.now().toString().slice(-4)}`);
    setCostPrice('18.00');
    setSalePrice('45.00');
    setQuantity('20');
    setMinStock('5');
    setSupplier('Jadson Barber Cosmetics');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: SaleProduct) => {
    setEditingProd(p);
    setName(p.name);
    setCategory(p.category);
    setSku(p.sku);
    setCostPrice(p.costPrice.toString());
    setSalePrice(p.salePrice.toString());
    setQuantity(p.quantity.toString());
    setMinStock(p.minStock.toString());
    setSupplier(p.supplier);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const costNum = parseFloat(costPrice);
    const saleNum = parseFloat(salePrice);
    const qtyNum = parseInt(quantity, 10);
    const minNum = parseInt(minStock, 10);

    if (!name.trim() || isNaN(costNum) || isNaN(saleNum) || isNaN(qtyNum)) {
      addToast('Informe dados válidos para o produto.', 'error');
      return;
    }

    const payload = {
      name: name.trim(),
      category,
      sku: sku.trim() || `PROD-${Date.now().toString().slice(-4)}`,
      costPrice: costNum,
      salePrice: saleNum,
      quantity: qtyNum,
      minStock: minNum,
      supplier: supplier.trim(),
      status: 'ativo' as const,
    };

    if (editingProd) {
      await updateProduct(editingProd.id, payload);
    } else {
      await addProduct(payload);
    }

    setIsModalOpen(false);
  };

  const handleRecordSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = parseInt(saleQuantity, 10);
    if (!saleProductId || isNaN(qtyNum) || qtyNum <= 0) {
      addToast('Selecione um produto e quantidade válida.', 'error');
      return;
    }

    const success = await recordSale({
      customerName: saleCustomerName.trim(),
      customerPhone: saleCustomerPhone.trim(),
      productId: saleProductId,
      quantity: qtyNum,
      paymentMethod: salePaymentMethod,
    });

    if (success) {
      setIsSaleModalOpen(false);
    }
  };

  return (
    <AdminLayout
      title="Gestão de Produtos para Venda (Balcão)"
      subtitle="Catálogo de pomadas, óleos e balms com controle de margem de lucro e frente de caixa"
    >
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111111] p-4 rounded-2xl border border-neutral-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar produto por nome..."
            className="w-full bg-black/80 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setIsSaleModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <DollarSign className="w-4 h-4" />
            <span>Registrar Venda Balcão</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="py-2.5 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Produto</span>
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((p) => {
          const profit = p.salePrice - p.costPrice;
          const marginPercent = p.costPrice > 0 ? ((profit / p.costPrice) * 100).toFixed(0) : '0';
          const isLow = p.quantity <= p.minStock;

          return (
            <div
              key={p.id}
              className="bg-[#111111] border border-neutral-800 rounded-2xl p-5 space-y-3 hover:border-neutral-700 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      {p.category}
                    </span>
                    <h3 className="font-bold text-sm text-white font-sans pt-1">{p.name}</h3>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${isLow ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {p.quantity} em estoque
                  </span>
                </div>

                <div className="p-3 bg-black/60 rounded-xl border border-neutral-800 text-xs font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Preço de Custo:</span>
                    <span className="text-neutral-300">R$ {p.costPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-neutral-300">Preço de Venda:</span>
                    <span className="text-amber-400 text-sm">R$ {p.salePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] pt-1 border-t border-neutral-800 text-emerald-400 font-bold">
                    <span>Lucro Unitário:</span>
                    <span>R$ {profit.toFixed(2)} (+{marginPercent}%)</span>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-400 font-mono flex justify-between">
                  <span>Vendas Totais: <strong>{p.salesCount} un</strong></span>
                  <span>Acumulado: <strong className="text-white">R$ {p.totalRevenue.toFixed(2)}</strong></span>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-[10px] text-neutral-500 font-mono">SKU: {p.sku}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 rounded-lg bg-neutral-900 text-amber-400 hover:bg-neutral-800 border border-neutral-800"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteProduct(p.id)}
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

      {/* POS Sale Record Modal */}
      {isSaleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#111111] border border-neutral-800 rounded-3xl p-6 space-y-4 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Registrar Venda Balcão (PDV)
              </h3>
              <button onClick={() => setIsSaleModalOpen(false)} className="p-1 rounded-lg text-neutral-400 hover:text-white bg-neutral-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordSaleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">Cliente (Opcional)</label>
                <input
                  type="text"
                  value={saleCustomerName}
                  onChange={(e) => setSaleCustomerName(e.target.value)}
                  placeholder="Nome do cliente ou 'Cliente Balcão'"
                  className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">Selecione o Produto</label>
                <select
                  value={saleProductId}
                  onChange={(e) => setSaleProductId(e.target.value)}
                  className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — R$ {p.salePrice.toFixed(2)} ({p.quantity} un em estoque)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedSaleProduct?.quantity || 1}
                    value={saleQuantity}
                    onChange={(e) => setSaleQuantity(e.target.value)}
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">Forma Pagamento</label>
                  <select
                    value={salePaymentMethod}
                    onChange={(e) => setSalePaymentMethod(e.target.value)}
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  >
                    <option value="PIX">PIX</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                </div>
              </div>

              {/* Total Summary */}
              {selectedSaleProduct && (
                <div className="p-3 bg-black/80 rounded-xl border border-neutral-800 flex justify-between items-center text-xs font-mono font-bold">
                  <span className="text-neutral-400">Total da Venda:</span>
                  <span className="text-emerald-400 text-sm">
                    R$ {(selectedSaleProduct.salePrice * (parseInt(saleQuantity, 10) || 1)).toFixed(2)}
                  </span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Confirmar Venda e Dar Baixa
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#111111] border border-neutral-800 rounded-3xl p-6 space-y-4 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#DAA520]" />
                {editingProd ? 'Editar Produto' : 'Novo Produto para Venda'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-neutral-400 hover:text-white bg-neutral-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">Nome do Produto</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Pomada Efeito Matte 150g"
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
                    <option value="Finalizadores">Finalizadores</option>
                    <option value="Cuidados Barba">Cuidados Barba</option>
                    <option value="Capilar">Capilar</option>
                    <option value="Acessórios">Acessórios</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">Código / SKU</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">Preço de Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">Preço Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">Qtd Estoque</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">Mínimo Alerta</label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                {editingProd ? 'Salvar Alterações' : 'Cadastrar Produto'}
              </button>
            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  );
};
