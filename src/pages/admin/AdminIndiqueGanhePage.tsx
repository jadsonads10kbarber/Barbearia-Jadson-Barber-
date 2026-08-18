import React, { useState, useMemo } from 'react';
import {
  Gift,
  Search,
  Filter,
  Check,
  CheckCircle2,
  Clock,
  XCircle,
  Trash2,
  Wallet,
  Users,
  DollarSign,
  TrendingUp,
  Settings,
  Edit2,
  Save,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Share2,
  Sparkles,
  Award,
  CircleCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Referral, ReferralStatus, Customer } from '../../types';

export const AdminIndiqueGanhePage: React.FC = () => {
  const {
    referrals,
    referralProgram,
    updateReferralProgramConfig,
    approveReferral,
    cancelReferral,
    deleteReferral,
    customers,
    adjustCustomerWallet,
    addToast,
  } = useApp();

  // Active Tab: 'indicacoes' | 'parametros' | 'carteiras'
  const [activeTab, setActiveTab] = useState<'indicacoes' | 'parametros' | 'carteiras'>('indicacoes');

  // Filters for Referrals Table
  const [statusFilter, setStatusFilter] = useState<'todos' | ReferralStatus>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Referral Program Config Form State
  const [configActive, setConfigActive] = useState(referralProgram.active ?? true);
  const [referrerReward, setReferrerReward] = useState(referralProgram.referrerReward?.toString() || '5');
  const [giveRefereeDiscount, setGiveRefereeDiscount] = useState(referralProgram.giveRefereeDiscount ?? true);
  const [refereeDiscount, setRefereeDiscount] = useState(referralProgram.refereeDiscount?.toString() || '5');
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>(referralProgram.refereeDiscountType || 'fixed');
  const [rewardTrigger, setRewardTrigger] = useState<'first_completed' | 'on_booking'>(
    referralProgram.rewardTrigger || 'first_completed'
  );
  const [title, setTitle] = useState(referralProgram.title || 'Ganhe R$ 5,00 para cada indicação');
  const [description, setDescription] = useState(
    referralProgram.description ||
      'Compartilhe o seu código com amigos que ainda não pediram no App ou web Barbearia Jadson Barber. Quanto mais você indicar, mais você ganha!'
  );
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Manual Wallet Adjustment Modal State
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [selectedCustomerForWallet, setSelectedCustomerForWallet] = useState<Customer | null>(null);
  const [walletAdjustAmount, setWalletAdjustAmount] = useState('');
  const [walletAdjustType, setWalletAdjustType] = useState<'add' | 'remove'>('add');
  const [walletAdjustReason, setWalletAdjustReason] = useState('');

  // Confirmation Modals
  const [cancelModalReferral, setCancelModalReferral] = useState<Referral | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState('');

  // Computed Metrics
  const totalReferrals = referrals.length;
  const completedReferrals = referrals.filter((r) => r.status === 'concluido').length;
  const pendingReferrals = referrals.filter((r) => r.status === 'pendente').length;
  const cancelledReferrals = referrals.filter((r) => r.status === 'cancelado').length;

  const totalBonusesDistributed = referrals
    .filter((r) => r.status === 'concluido')
    .reduce((sum, r) => sum + r.rewardAmount, 0);

  const totalDiscountGiven = referrals.reduce((sum, r) => sum + (r.discountGiven || 0), 0);

  // Filtered referrals
  const filteredReferrals = useMemo(() => {
    return referrals.filter((r) => {
      if (statusFilter !== 'todos' && r.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = (r.referrerCode || '').toLowerCase().includes(q);
        const matchReferrer = (r.referrerName || '').toLowerCase().includes(q);
        const matchReferee = (r.refereeName || '').toLowerCase().includes(q);
        const matchPhone = (r.refereePhone || '').includes(q) || (r.referrerPhone || '').includes(q);
        if (!matchCode && !matchReferrer && !matchReferee && !matchPhone) return false;
      }
      return true;
    });
  }, [referrals, statusFilter, searchQuery]);

  // Customers with wallet credits or referrals
  const walletCustomers = useMemo(() => {
    return customers
      .filter((c) => (c.referralWalletBalance || 0) > 0 || (c.totalReferrals || 0) > 0)
      .sort((a, b) => (b.referralWalletBalance || 0) - (a.referralWalletBalance || 0));
  }, [customers]);

  const handleSaveProgramConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    const parsedReward = parseFloat(referrerReward) || 5;
    const parsedDiscount = parseFloat(refereeDiscount) || 5;

    await updateReferralProgramConfig({
      active: configActive,
      referrerReward: parsedReward,
      giveRefereeDiscount,
      refereeDiscount: parsedDiscount,
      refereeDiscountType: discountType,
      rewardTrigger,
      title: title.trim(),
      description: description.trim(),
    });

    setIsSavingConfig(false);
  };

  const handleOpenWalletModal = (customer: Customer) => {
    setSelectedCustomerForWallet(customer);
    setWalletAdjustAmount('');
    setWalletAdjustType('add');
    setWalletAdjustReason('Ajuste de bônus manual pelo administrador');
    setIsWalletModalOpen(true);
  };

  const handleConfirmWalletAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerForWallet) return;

    const val = parseFloat(walletAdjustAmount);
    if (!val || val <= 0) {
      addToast('Informe um valor válido maior que zero.', 'error');
      return;
    }

    const finalAmount = walletAdjustType === 'add' ? val : -val;
    await adjustCustomerWallet(
      selectedCustomerForWallet.id,
      finalAmount,
      walletAdjustReason.trim() || 'Ajuste manual administrativo'
    );

    addToast(`Saldo de ${selectedCustomerForWallet.name} atualizado com sucesso!`, 'success');
    setIsWalletModalOpen(false);
    setSelectedCustomerForWallet(null);
  };

  const handleConfirmCancelReferral = async () => {
    if (!cancelModalReferral) return;
    await cancelReferral(cancelModalReferral.id, cancelReasonInput.trim());
    setCancelModalReferral(null);
    setCancelReasonInput('');
  };

  return (
    <AdminLayout
      title="Programa Indique e Ganhe"
      subtitle="Controle total das indicações, recompensas, regras e carteiras de clientes"
    >
      <div className="space-y-6">
        {/* Top Summary Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#111111] border border-[#DAA520]/40 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                Total de Indicações
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#DAA520]/15 border border-[#DAA520]/30 text-[#DAA520] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">{totalReferrals}</div>
              <div className="flex items-center gap-2 mt-1 text-[11px] font-mono">
                <span className="text-emerald-400 font-bold">{completedReferrals} concluídas</span>
                <span className="text-neutral-500">•</span>
                <span className="text-amber-400 font-bold">{pendingReferrals} pendentes</span>
              </div>
            </div>
          </div>

          <div className="bg-[#111111] border border-emerald-500/30 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                Bônus Distribuídos
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                R$ {totalBonusesDistributed.toFixed(2).replace('.', ',')}
              </div>
              <p className="text-[11px] text-neutral-400 font-sans mt-1">
                Creditados nas carteiras
              </p>
            </div>
          </div>

          <div className="bg-[#111111] border border-blue-500/30 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                Descontos Aplicados
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">
                R$ {totalDiscountGiven.toFixed(2).replace('.', ',')}
              </div>
              <p className="text-[11px] text-neutral-400 font-sans mt-1">
                Concedidos no 1º agendamento
              </p>
            </div>
          </div>

          <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                Status do Programa
              </span>
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                  referralProgram.active
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                }`}
              >
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div
                className={`text-lg sm:text-xl font-bold font-mono ${
                  referralProgram.active ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {referralProgram.active ? 'Ativo & Disponível' : 'Pausado'}
              </div>
              <p className="text-[11px] text-neutral-400 font-sans mt-1">
                R$ {referralProgram.referrerReward?.toFixed(2)} por amigo
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 pb-3">
          <button
            onClick={() => setActiveTab('indicacoes')}
            className={`py-2.5 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'indicacoes'
                ? 'bg-[#DAA520] text-black shadow-md shadow-[#DAA520]/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Indicações ({referrals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('carteiras')}
            className={`py-2.5 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'carteiras'
                ? 'bg-[#DAA520] text-black shadow-md shadow-[#DAA520]/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Carteiras & Saldos ({walletCustomers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('parametros')}
            className={`py-2.5 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'parametros'
                ? 'bg-[#DAA520] text-black shadow-md shadow-[#DAA520]/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configurações do Programa</span>
          </button>
        </div>

        {/* TAB 1: INDICAÇÕES REGISTRADAS */}
        {activeTab === 'indicacoes' && (
          <div className="space-y-4">
            {/* Search & Status Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111111] p-4 rounded-2xl border border-neutral-800">
              <div className="flex items-center gap-2 flex-1 min-w-[240px] bg-black/60 px-3.5 py-2.5 rounded-xl border border-neutral-800">
                <Search className="w-4 h-4 text-[#DAA520]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por cliente, indicado, código ou telefone..."
                  className="bg-transparent text-xs text-white placeholder-neutral-500 w-full focus:outline-none font-sans"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-neutral-500 hover:text-white">
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['todos', 'pendente', 'concluido', 'cancelado'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`py-2 px-3 rounded-xl font-mono text-[11px] font-bold uppercase transition-colors cursor-pointer border ${
                      statusFilter === st
                        ? 'bg-[#DAA520] text-black border-[#DAA520]'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {st === 'todos'
                      ? 'Todos'
                      : st === 'pendente'
                      ? 'Pendentes'
                      : st === 'concluido'
                      ? 'Concluídos'
                      : 'Cancelados'}
                  </button>
                ))}
              </div>
            </div>

            {/* Referrals List / Table */}
            {filteredReferrals.length === 0 ? (
              <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 text-[#DAA520] flex items-center justify-center mx-auto">
                  <Gift className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white font-sans">Nenhuma indicação encontrada</h3>
                <p className="text-xs text-neutral-400 font-sans max-w-sm mx-auto">
                  Quando clientes compartilharem seus códigos e novos amigos agendarem, as indicações aparecerão aqui com controle de aprovação e bônus.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReferrals.map((ref) => {
                  const isApproved = ref.status === 'concluido';
                  const isCancelled = ref.status === 'cancelado';
                  const isPending = ref.status === 'pendente';

                  return (
                    <div
                      key={ref.id}
                      className="bg-[#111111] border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all shadow-md"
                    >
                      {/* Left: Indicador & Indicado Info */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-[#DAA520]/15 border border-[#DAA520]/40 text-[#DAA520] text-xs font-mono font-black">
                            CÓDIGO: {ref.referrerCode}
                          </span>

                          <span
                            className={`text-[11px] font-bold font-mono px-2.5 py-1 rounded-lg flex items-center gap-1 border ${
                              isApproved
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : isCancelled
                                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {isApproved && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {isPending && <Clock className="w-3.5 h-3.5" />}
                            {isCancelled && <XCircle className="w-3.5 h-3.5" />}
                            {isApproved ? 'Bônus Creditado' : isPending ? 'Pendente' : 'Cancelado'}
                          </span>

                          <span className="text-[11px] text-neutral-500 font-mono">
                            {new Date(ref.createdAt).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(ref.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          <div className="bg-black/60 p-2.5 rounded-xl border border-neutral-800/80">
                            <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 block">
                              Cliente Indicador (Quem ganha bônus):
                            </span>
                            <div className="font-bold text-xs text-white font-sans mt-0.5">
                              {ref.referrerName}
                            </div>
                            <div className="text-[11px] text-neutral-400 font-mono">
                              {ref.referrerPhone || 'Sem telefone'}
                            </div>
                          </div>

                          <div className="bg-black/60 p-2.5 rounded-xl border border-neutral-800/80">
                            <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 block">
                              Novo Cliente Indicado (Ganhou desconto):
                            </span>
                            <div className="font-bold text-xs text-white font-sans mt-0.5">
                              {ref.refereeName}
                            </div>
                            <div className="text-[11px] text-neutral-400 font-mono">
                              {ref.refereePhone || 'Sem telefone'}
                            </div>
                          </div>
                        </div>

                        {ref.notes && (
                          <div className="text-[11px] text-neutral-400 font-mono bg-neutral-900/60 px-3 py-1.5 rounded-lg border border-neutral-800">
                            Nota: {ref.notes}
                          </div>
                        )}
                      </div>

                      {/* Right: Values & Actions */}
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 border-t md:border-t-0 border-neutral-800 pt-3 md:pt-0">
                        <div className="text-left md:text-right">
                          <div className="text-[10px] font-mono font-bold uppercase text-neutral-400">
                            Recompensa
                          </div>
                          <div className="text-base sm:text-lg font-black text-[#DAA520] font-mono">
                            R$ {ref.rewardAmount.toFixed(2).replace('.', ',')}
                          </div>
                          <div className="text-[10px] text-emerald-400 font-mono">
                            Desconto dado: R$ {(ref.discountGiven || 5).toFixed(2).replace('.', ',')}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {isPending && (
                            <>
                              <button
                                onClick={() => approveReferral(ref.id)}
                                className="py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95"
                                title="Aprovar indicação e creditar bônus"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Aprovar</span>
                              </button>

                              <button
                                onClick={() => {
                                  setCancelModalReferral(ref);
                                  setCancelReasonInput('');
                                }}
                                className="py-2 px-3 rounded-xl bg-neutral-900 hover:bg-rose-500/20 border border-neutral-800 hover:border-rose-500/40 text-rose-400 font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                                title="Cancelar indicação"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Cancelar</span>
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => deleteReferral(ref.id)}
                            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Remover do histórico"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CARTEIRAS & SALDOS */}
        {activeTab === 'carteiras' && (
          <div className="space-y-4">
            <div className="bg-[#111111] p-4 rounded-2xl border border-neutral-800 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-sm font-bold text-white font-sans uppercase">
                  Carteiras de Indicação dos Clientes
                </h3>
                <p className="text-xs text-neutral-400 font-sans">
                  Saldos acumulados que os clientes podem usar como crédito nos seus agendamentos.
                </p>
              </div>
            </div>

            {walletCustomers.length === 0 ? (
              <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 text-[#DAA520] flex items-center justify-center mx-auto">
                  <Wallet className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white font-sans">Nenhum saldo acumulado ainda</h3>
                <p className="text-xs text-neutral-400 font-sans max-w-sm mx-auto">
                  Os clientes acumulam saldo automaticamente quando as indicações que eles fizeram são concluídas.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {walletCustomers.map((cust) => {
                  const bal = cust.referralWalletBalance || 0;
                  const totalEarn = cust.totalEarnedFromReferrals || 0;

                  return (
                    <div
                      key={cust.id}
                      className="bg-[#111111] border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#DAA520]/15 border border-[#DAA520]/30 text-[#DAA520] font-mono font-bold flex items-center justify-center text-sm">
                          {cust.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-white font-sans flex items-center gap-2">
                            <span>{cust.name}</span>
                            {cust.referralCode && (
                              <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[#DAA520] text-[10px] font-mono">
                                {cust.referralCode}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-400 font-mono">
                            {cust.phone} • {cust.totalReferrals || 0} amigo(s) indicado(s)
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 ml-auto">
                        <div className="text-right">
                          <div className="text-[10px] font-mono font-bold uppercase text-neutral-400">
                            Saldo Atual
                          </div>
                          <div className="text-base sm:text-lg font-black text-[#DAA520] font-mono">
                            R$ {bal.toFixed(2).replace('.', ',')}
                          </div>
                          <div className="text-[10px] text-neutral-500 font-mono">
                            Total já ganho: R$ {totalEarn.toFixed(2).replace('.', ',')}
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenWalletModal(cust)}
                          className="py-2 px-3 rounded-xl bg-neutral-900 hover:bg-[#DAA520] hover:text-black border border-[#DAA520]/40 text-[#DAA520] font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-md"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Ajustar Saldo</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CONFIGURAÇÕES DO PROGRAMA */}
        {activeTab === 'parametros' && (
          <form onSubmit={handleSaveProgramConfig} className="bg-[#111111] border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white font-sans uppercase">
                  Parâmetros Gerais do Programa
                </h3>
                <p className="text-xs text-neutral-400 font-sans mt-0.5">
                  Configure o valor das recompensas, gatilhos de liberação e textos exibidos no App.
                </p>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 bg-black/60 px-3.5 py-2 rounded-xl border border-neutral-800">
                <span className="text-xs font-mono font-bold uppercase text-neutral-300">
                  {configActive ? 'Programa Ativo' : 'Programa Desativado'}
                </span>
                <input
                  type="checkbox"
                  checked={configActive}
                  onChange={(e) => setConfigActive(e.target.checked)}
                  className="w-5 h-5 accent-[#DAA520] cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Referrer Reward */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#DAA520]" />
                  <span>Bônus do Indicador (R$)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    value={referrerReward}
                    onChange={(e) => setReferrerReward(e.target.value)}
                    required
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#DAA520]"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-neutral-500 font-mono">BRL</span>
                </div>
                <p className="text-[11px] text-neutral-400 font-sans">
                  Valor creditado na carteira do cliente que compartilhou o código.
                </p>
              </div>

              {/* Referee Discount */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-black/60 border border-neutral-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Desconto do Convidado / Indicado</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[10px] font-mono uppercase font-bold text-neutral-400">
                      {giveRefereeDiscount ? 'Ativo' : 'Desativado'}
                    </span>
                    <input
                      type="checkbox"
                      checked={giveRefereeDiscount}
                      onChange={(e) => setGiveRefereeDiscount(e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 cursor-pointer"
                    />
                  </label>
                </div>

                {giveRefereeDiscount ? (
                  <>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.50"
                        min="0"
                        value={refereeDiscount}
                        onChange={(e) => setRefereeDiscount(e.target.value)}
                        required={giveRefereeDiscount}
                        className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#DAA520]"
                      />
                      <span className="absolute right-3.5 top-2 text-xs text-neutral-500 font-mono">BRL</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 font-sans">
                      Desconto concedido no 1º agendamento do amigo convidado ao inserir o código.
                    </p>
                  </>
                ) : (
                  <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-[11px] text-neutral-400 font-sans">
                    <span className="text-amber-400 font-bold">Desconto desativado:</span> O amigo não receberá desconto de boas-vindas, mas o cliente indicador continuará acumulando bônus na carteira normalmente.
                  </div>
                )}
              </div>
            </div>

            {/* Reward Trigger */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase text-neutral-300">
                Gatilho de Liberação do Bônus para o Indicador
              </label>
              <select
                value={rewardTrigger}
                onChange={(e) => setRewardTrigger(e.target.value as 'first_completed' | 'on_booking')}
                className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
              >
                <option value="first_completed">
                  Ao concluir o 1º corte / atendimento (Recomendado — Evita agendamentos falsos)
                </option>
                <option value="on_booking">
                  Imediatamente ao realizar o agendamento
                </option>
              </select>
            </div>

            {/* Custom Titles and Marketing Copy */}
            <div className="space-y-3 pt-2 border-t border-neutral-800">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">
                  Título Principal do Banner (App do Cliente)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">
                  Texto Explicativo
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black/80 border border-neutral-800 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingConfig}
              className="w-full py-3.5 px-6 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#DAA520]/20 active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingConfig ? 'Salvando...' : 'Salvar Alterações do Programa'}</span>
            </button>
          </form>
        )}
      </div>

      {/* Manual Wallet Adjustment Modal */}
      {isWalletModalOpen && selectedCustomerForWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#111111] border border-[#DAA520]/40 rounded-3xl p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#DAA520]" />
                <h3 className="text-sm font-mono font-bold text-white uppercase">Ajustar Saldo de Indicação</h3>
              </div>
              <button
                onClick={() => setIsWalletModalOpen(false)}
                className="text-neutral-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <div className="bg-black/60 p-3 rounded-xl border border-neutral-800 space-y-1">
              <div className="text-xs font-bold text-white font-sans">{selectedCustomerForWallet.name}</div>
              <div className="text-[11px] text-neutral-400 font-mono">
                Saldo Atual: R$ {(selectedCustomerForWallet.referralWalletBalance || 0).toFixed(2).replace('.', ',')}
              </div>
            </div>

            <form onSubmit={handleConfirmWalletAdjust} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">Tipo de Ajuste</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWalletAdjustType('add')}
                    className={`py-2 px-3 rounded-xl font-mono text-xs font-bold uppercase border cursor-pointer ${
                      walletAdjustType === 'add'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                    }`}
                  >
                    + Adicionar Crédito
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalletAdjustType('remove')}
                    className={`py-2 px-3 rounded-xl font-mono text-xs font-bold uppercase border cursor-pointer ${
                      walletAdjustType === 'remove'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                    }`}
                  >
                    - Deduzir Saldo
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">Valor (R$)</label>
                <input
                  type="number"
                  step="0.50"
                  min="0.50"
                  required
                  value={walletAdjustAmount}
                  onChange={(e) => setWalletAdjustAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">Motivo / Justificativa</label>
                <input
                  type="text"
                  required
                  value={walletAdjustReason}
                  onChange={(e) => setWalletAdjustReason(e.target.value)}
                  placeholder="Ex: Bônus promocional manual, correção, etc."
                  className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWalletModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-mono font-bold text-xs uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono font-bold text-xs uppercase shadow-md"
                >
                  Salvar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Referral Modal */}
      {cancelModalReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-[#111111] border border-rose-500/40 rounded-3xl p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white font-sans uppercase">Cancelar Indicação?</h3>
              <p className="text-xs text-neutral-400 font-sans">
                A indicação de {cancelModalReferral.referrerName} para {cancelModalReferral.refereeName} será marcada como cancelada e nenhum bônus será creditado.
              </p>
            </div>

            <input
              type="text"
              value={cancelReasonInput}
              onChange={(e) => setCancelReasonInput(e.target.value)}
              placeholder="Motivo do cancelamento (opcional)..."
              className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 text-left"
            />

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setCancelModalReferral(null)}
                className="py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-mono font-bold text-xs uppercase"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmCancelReferral}
                className="py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-mono font-bold text-xs uppercase shadow-md shadow-rose-500/20"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
