import React, { useState, useMemo } from 'react';
import {
  TicketPercent,
  Plus,
  Edit2,
  Trash2,
  X,
  Users,
  User,
  CheckCircle2,
  Calendar,
  Sparkles,
  Search,
  Filter,
  Repeat,
  Check,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  Phone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Coupon, Customer } from '../../types';

export const AdminCuponsPage: React.FC = () => {
  const { coupons, customers, addCoupon, updateCoupon, deleteCoupon, addToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [activeTab, setActiveTab] = useState<'todos' | 'coletivo' | 'individual'>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [code, setCode] = useState('');
  const [type, setType] = useState<'coletivo' | 'individual'>('coletivo');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customCustomerName, setCustomCustomerName] = useState<string>('');
  const [customCustomerPhone, setCustomCustomerPhone] = useState<string>('');
  
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('10');
  const [minOrderValue, setMinOrderValue] = useState('30.00');
  const [usageLimit, setUsageLimit] = useState('100'); // Limite Global
  const [usageLimitPerClient, setUsageLimitPerClient] = useState('1'); // Limite por Cliente
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('2026-12-31');
  const [status, setStatus] = useState<'ativo' | 'inativo' | 'arquivado'>('ativo');

  // Filtered coupons
  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      const matchesSearch =
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.targetCustomerName && c.targetCustomerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.targetCustomerPhone && c.targetCustomerPhone.includes(searchQuery));

      const cType = c.type || 'coletivo';
      if (activeTab === 'coletivo') return matchesSearch && cType === 'coletivo';
      if (activeTab === 'individual') return matchesSearch && cType === 'individual';
      return matchesSearch;
    });
  }, [coupons, searchQuery, activeTab]);

  // Statistics
  const stats = useMemo(() => {
    const total = coupons.length;
    const coletivos = coupons.filter((c) => (c.type || 'coletivo') === 'coletivo').length;
    const individuais = coupons.filter((c) => c.type === 'individual').length;
    const totalUses = coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0);
    return { total, coletivos, individuais, totalUses };
  }, [coupons]);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setCode(`PROMO${Math.floor(1000 + Math.random() * 9000)}`);
    setType('coletivo');
    setSelectedCustomerId('');
    setCustomCustomerName('');
    setCustomCustomerPhone('');
    setDiscountType('percentage');
    setDiscountValue('10');
    setMinOrderValue('30.00');
    setUsageLimit('100');
    setUsageLimitPerClient('1');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('2026-12-31');
    setStatus('ativo');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Coupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setType(c.type || 'coletivo');
    setSelectedCustomerId(c.targetCustomerId || '');
    setCustomCustomerName(c.targetCustomerName || '');
    setCustomCustomerPhone(c.targetCustomerPhone || '');
    setDiscountType(c.discountType);
    setDiscountValue(c.discountValue.toString());
    setMinOrderValue(c.minOrderValue.toString());
    setUsageLimit(c.usageLimit.toString());
    setUsageLimitPerClient((c.usageLimitPerClient ?? 1).toString());
    setStartDate(c.startDate);
    setEndDate(c.endDate);
    setStatus(c.status);
    setIsModalOpen(true);
  };

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const custId = e.target.value;
    setSelectedCustomerId(custId);
    if (custId) {
      const found = customers.find((cust) => cust.id === custId);
      if (found) {
        setCustomCustomerName(found.name);
        setCustomCustomerPhone(found.phone);
      }
    } else {
      setCustomCustomerName('');
      setCustomCustomerPhone('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valNum = parseFloat(discountValue);
    const minNum = parseFloat(minOrderValue) || 0;
    const limitNum = parseInt(usageLimit, 10) || 100;
    const limitPerClientNum = parseInt(usageLimitPerClient, 10) || 1;

    if (!code.trim() || isNaN(valNum) || valNum <= 0) {
      addToast('Informe um código de cupom e valor de desconto válido.', 'error');
      return;
    }

    if (type === 'individual' && !customCustomerName.trim()) {
      addToast('Para cupom individual, selecione ou informe o cliente.', 'error');
      return;
    }

    const payload = {
      code: code.trim().toUpperCase(),
      type,
      targetCustomerId: type === 'individual' ? selectedCustomerId || undefined : undefined,
      targetCustomerName: type === 'individual' ? customCustomerName.trim() : undefined,
      targetCustomerPhone: type === 'individual' ? customCustomerPhone.trim() : undefined,
      discountType,
      discountValue: valNum,
      minOrderValue: minNum,
      startDate,
      endDate,
      usageLimit: limitNum,
      usageLimitPerClient: limitPerClientNum,
      allowedServiceIds: [],
      status,
    };

    if (editingCoupon) {
      await updateCoupon(editingCoupon.id, payload);
    } else {
      await addCoupon(payload);
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = async (c: Coupon) => {
    const nextStatus = c.status === 'ativo' ? 'inativo' : 'ativo';
    await updateCoupon(c.id, { status: nextStatus });
  };

  return (
    <AdminLayout
      title="Gestão de Cupons e Ofertas Promocionais"
      subtitle="Crie cupons coletivos para todos os clientes ou individuais exclusivos por cliente"
    >
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-neutral-400 uppercase">Total de Cupons</span>
            <div className="text-2xl font-black font-mono text-white mt-1">{stats.total}</div>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[#DAA520]">
            <TicketPercent className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-neutral-400 uppercase">Cupons Coletivos</span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">{stats.coletivos}</div>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-neutral-400 uppercase">Cupons Individuais</span>
            <div className="text-2xl font-black font-mono text-purple-400 mt-1">{stats.individuais}</div>
          </div>
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
            <User className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-neutral-400 uppercase">Usos Realizados</span>
            <div className="text-2xl font-black font-mono text-blue-400 mt-1">{stats.totalUses}</div>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <Repeat className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Toolbar & Filter Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#111111] p-4 rounded-2xl border border-neutral-800">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-black p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => setActiveTab('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                activeTab === 'todos' ? 'bg-[#DAA520] text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Todos ({coupons.length})
            </button>
            <button
              onClick={() => setActiveTab('coletivo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'coletivo' ? 'bg-[#DAA520] text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Coletivos
            </button>
            <button
              onClick={() => setActiveTab('individual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'individual' ? 'bg-[#DAA520] text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Individuais
            </button>
          </div>

          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por código ou cliente..."
              className="w-full bg-black/80 border border-neutral-800 rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-[#DAA520]"
            />
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="py-2.5 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Novo Cupom</span>
        </button>
      </div>

      {/* Coupons List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCoupons.map((c) => {
          const isIndividual = c.type === 'individual';
          const isActive = c.status === 'ativo';

          return (
            <div
              key={c.id}
              className={`bg-[#111111] border rounded-2xl p-5 space-y-4 hover:border-neutral-700 transition-colors flex flex-col justify-between relative overflow-hidden ${
                isActive ? 'border-neutral-800' : 'border-neutral-800/60 opacity-75'
              }`}
            >
              <div className="space-y-3">
                {/* Header: Code + Type Badge + Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-base font-black font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl inline-block shadow-sm">
                      {c.code}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Badge Coletivo / Individual */}
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 border ${
                        isIndividual
                          ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                          : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      }`}
                    >
                      {isIndividual ? (
                        <>
                          <User className="w-3 h-3" />
                          Individual
                        </>
                      ) : (
                        <>
                          <Users className="w-3 h-3" />
                          Coletivo
                        </>
                      )}
                    </span>

                    {/* Badge Status */}
                    <button
                      onClick={() => handleToggleStatus(c)}
                      title="Clique para alterar status"
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-1 rounded-full border cursor-pointer transition-all ${
                        isActive
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700'
                      }`}
                    >
                      {c.status}
                    </button>
                  </div>
                </div>

                {/* Individual Customer Target Banner if applicable */}
                {isIndividual && (
                  <div className="p-2.5 bg-purple-950/30 border border-purple-800/40 rounded-xl text-xs font-mono space-y-0.5">
                    <div className="text-[10px] text-purple-400 font-bold uppercase flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Cliente Exclusivo
                    </div>
                    <div className="text-white font-bold">{c.targetCustomerName || 'Cliente Selecionado'}</div>
                    {c.targetCustomerPhone && (
                      <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-purple-400" />
                        {c.targetCustomerPhone}
                      </div>
                    )}
                  </div>
                )}

                {/* Offer Details */}
                <div className="p-3 bg-black/60 rounded-xl border border-neutral-800/80 text-xs font-mono space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-800/60">
                    <span className="text-neutral-400">Valor do Desconto:</span>
                    <span className="font-bold text-amber-400 text-sm">
                      {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `R$ ${c.discountValue.toFixed(2)} OFF`}
                    </span>
                  </div>

                  <div className="flex justify-between text-neutral-300">
                    <span>Pedido Mínimo:</span>
                    <span className="font-semibold text-white">R$ {c.minOrderValue.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-neutral-300">
                    <span>Limite p/ Cliente:</span>
                    <span className="font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      {c.usageLimitPerClient && c.usageLimitPerClient > 0
                        ? `${c.usageLimitPerClient} uso(s) por cliente`
                        : 'Sem limite por cliente'}
                    </span>
                  </div>

                  <div className="flex justify-between text-neutral-300">
                    <span>Uso Global Acumulado:</span>
                    <span className="font-semibold text-white">
                      {c.usedCount} / {c.usageLimit} utilizações
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-neutral-400 font-mono flex items-center justify-between pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    Validade: {c.startDate} até {c.endDate}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                <button
                  onClick={() => handleToggleStatus(c)}
                  className="text-[11px] font-mono text-neutral-400 hover:text-amber-400 flex items-center gap-1.5 cursor-pointer"
                >
                  {isActive ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-emerald-400" />
                      <span>Ativo</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-neutral-500" />
                      <span>Inativo</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-2 rounded-xl bg-neutral-900 text-amber-400 hover:bg-neutral-800 border border-neutral-800 transition-colors cursor-pointer"
                    title="Editar cupom"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteCoupon(c.id)}
                    className="p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 border border-neutral-800 transition-colors cursor-pointer"
                    title="Excluir cupom"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredCoupons.length === 0 && (
          <div className="col-span-full bg-[#111111] border border-neutral-800 rounded-2xl p-8 text-center space-y-3">
            <TicketPercent className="w-12 h-12 text-neutral-600 mx-auto" />
            <h3 className="text-sm font-mono font-bold text-white">Nenhum cupom encontrado</h3>
            <p className="text-xs text-neutral-400 font-sans max-w-sm mx-auto">
              Crie cupons de desconto para impulsionar suas vendas e fidelizar clientes da barbearia.
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-2 py-2 px-4 rounded-xl bg-[#DAA520] text-black font-mono text-xs font-bold uppercase cursor-pointer"
            >
              Criar Primeiro Cupom
            </button>
          </div>
        )}
      </div>

      {/* Modal Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#111111] border border-neutral-800 rounded-3xl p-6 space-y-4 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
                <TicketPercent className="w-4 h-4 text-[#DAA520]" />
                {editingCoupon ? 'Editar Cupom Promocional' : 'Criar Novo Cupom Promocional'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selector: Coletivo vs Individual */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#DAA520]" />
                  Modalidade do Cupom
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-black rounded-xl border border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setType('coletivo')}
                    className={`py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      type === 'coletivo'
                        ? 'bg-[#DAA520] text-black shadow-md'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Coletivo (Geral)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('individual')}
                    className={`py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      type === 'individual'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Individual (Cliente)</span>
                  </button>
                </div>
                <p className="text-[11px] font-sans text-neutral-400 px-1">
                  {type === 'coletivo'
                    ? '👥 O cupom coletivo pode ser utilizado por qualquer cliente da barbearia.'
                    : '👤 O cupom individual é exclusivo e direcionado apenas para 1 cliente específico.'}
                </p>
              </div>

              {/* Customer Selection if Individual */}
              {type === 'individual' && (
                <div className="p-3.5 bg-purple-950/20 border border-purple-800/40 rounded-2xl space-y-3">
                  <div className="text-xs font-mono font-bold text-purple-300 uppercase flex items-center gap-1.5">
                    <User className="w-4 h-4 text-purple-400" />
                    Selecionar Cliente Destinatário
                  </div>

                  {customers.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-neutral-400">Escolher da lista de clientes:</label>
                      <select
                        value={selectedCustomerId}
                        onChange={handleCustomerSelect}
                        className="w-full bg-black border border-purple-800/50 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                      >
                        <option value="">-- Selecione um cliente cadastrado --</option>
                        {customers.map((cust) => (
                          <option key={cust.id} value={cust.id}>
                            {cust.name} ({cust.phone})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-neutral-300">Nome do Cliente *</label>
                      <input
                        type="text"
                        value={customCustomerName}
                        onChange={(e) => setCustomCustomerName(e.target.value)}
                        placeholder="Ex: Carlos Eduardo"
                        className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                        required={type === 'individual'}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-neutral-300">Telefone / WhatsApp</label>
                      <input
                        type="text"
                        value={customCustomerPhone}
                        onChange={(e) => setCustomCustomerPhone(e.target.value)}
                        placeholder="(11) 98765-4321"
                        className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Code */}
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">Código do Cupom</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Ex: JADSON10 ou CLIENTEVIP"
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-[#DAA520]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setCode(`CUPOM${Math.floor(1000 + Math.random() * 9000)}`)}
                    className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-mono text-xs border border-neutral-800 whitespace-nowrap cursor-pointer"
                  >
                    Gerar Código
                  </button>
                </div>
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">Tipo do Desconto</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                  >
                    <option value="percentage">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">Valor do Desconto</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'percentage' ? 'Ex: 10' : 'Ex: 15.00'}
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                    required
                  />
                </div>
              </div>

              {/* Minimum order & Limits */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold uppercase text-neutral-300">Pedido Mín (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold uppercase text-neutral-300" title="Quantidade máxima de vezes que cada cliente pode utilizar este cupom">
                    Uso p/ Cliente *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimitPerClient}
                    onChange={(e) => setUsageLimitPerClient(e.target.value)}
                    placeholder="Ex: 1"
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold uppercase text-neutral-300" title="Quantidade máxima total de vezes que este cupom pode ser usado por todos">
                    Limite Global
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    placeholder="Ex: 100"
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                    required
                  />
                </div>
              </div>

              <div className="p-2.5 bg-neutral-900/80 border border-neutral-800 rounded-xl text-[11px] font-mono text-neutral-400 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  <strong>Uso p/ Cliente:</strong> Quantos agendamentos cada cliente individual pode realizar usando este cupom (Ex: 1 = uso único por cliente).
                </span>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">Data de Início</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">Data de Término</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                    required
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">Status do Cupom</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                >
                  <option value="ativo">Ativo (Permitir utilização)</option>
                  <option value="inativo">Inativo (Pausado temporariamente)</option>
                  <option value="arquivado">Arquivado</option>
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md mt-2"
              >
                {editingCoupon ? 'Salvar Alterações do Cupom' : 'Cadastrar Cupom'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
