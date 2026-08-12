import React, { useState, useMemo } from 'react';
import {
  TicketPercent,
  Copy,
  Check,
  Sparkles,
  Calendar,
  Users,
  User,
  ShoppingBag,
  ArrowRight,
  Gift,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Coupon } from '../types';

export const CuponsClientePage: React.FC = () => {
  const { coupons, currentUser, setActivePage, addToast, customerName, customerPhone } = useApp();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'todos' | 'coletivo' | 'individual'>('todos');

  // Filter coupons valid for client
  const availableCoupons = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    return coupons.filter((c) => {
      // Must be active
      if (c.status !== 'ativo') return false;

      // Date check
      if (c.startDate && today < c.startDate) return false;
      if (c.endDate && today > c.endDate) return false;

      // Usage limit check
      if (c.usageLimit && c.usedCount >= c.usageLimit) return false;

      // Check if individual coupon matches user
      if (c.type === 'individual') {
        const matchesId = currentUser && c.targetCustomerId && currentUser.id === c.targetCustomerId;
        const matchesName =
          c.targetCustomerName &&
          customerName &&
          customerName.trim().toLowerCase().includes(c.targetCustomerName.trim().toLowerCase());
        const matchesPhone =
          c.targetCustomerPhone &&
          customerPhone &&
          customerPhone.replace(/\D/g, '') === c.targetCustomerPhone.replace(/\D/g, '');

        if (!matchesId && !matchesName && !matchesPhone) {
          return false;
        }
      }

      // Filter tabs
      if (filterTab === 'coletivo' && c.type === 'individual') return false;
      if (filterTab === 'individual' && c.type !== 'individual') return false;

      return true;
    });
  }, [coupons, currentUser, customerName, customerPhone, filterTab]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    addToast(`Código "${code}" copiado com sucesso!`, 'success');
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handleUseInBooking = (code: string) => {
    handleCopyCode(code);
    setActivePage('agenda');
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 pb-24 space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/40 via-neutral-900 to-amber-900/20 border border-[#DAA520]/30 p-6 sm:p-8 space-y-3">
        <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-40 h-40 bg-[#DAA520]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#DAA520] tracking-widest">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>Benefícios & Promoções</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white font-sans tracking-tight">
          Cupons de Desconto Exclusivos
        </h1>

        <p className="text-xs sm:text-sm text-neutral-300 max-w-xl font-sans">
          Aproveite nossos cupons promocionais para economizar nos seus próximos agendamentos de corte, barba e tratamentos na JADSON BARBER.
        </p>

        {/* Quick Stats */}
        <div className="pt-2 flex flex-wrap gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono flex items-center gap-2">
            <Gift className="w-4 h-4 text-[#DAA520]" />
            <span className="text-white font-bold">{availableCoupons.length}</span>
            <span className="text-neutral-400">Cupom(ns) Disponível(is)</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 bg-[#111111] p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => setFilterTab('todos')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              filterTab === 'todos'
                ? 'bg-[#DAA520] text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterTab('coletivo')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              filterTab === 'coletivo'
                ? 'bg-[#DAA520] text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Gerais
          </button>
          <button
            onClick={() => setFilterTab('individual')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              filterTab === 'individual'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Exclusivos
          </button>
        </div>
      </div>

      {/* Coupon List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableCoupons.map((coupon) => {
          const isIndividual = coupon.type === 'individual';
          const isCopied = copiedCode === coupon.code;

          return (
            <div
              key={coupon.id}
              className={`relative bg-[#111111] border rounded-3xl p-5 space-y-4 hover:border-[#DAA520]/50 transition-all flex flex-col justify-between overflow-hidden shadow-xl ${
                isIndividual
                  ? 'border-purple-500/40 bg-gradient-to-b from-purple-950/20 to-[#111111]'
                  : 'border-white/10'
              }`}
            >
              {/* Top Row: Coupon Code Ticket + Badge */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[#DAA520]">
                      <TicketPercent className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-lg font-black font-mono text-amber-400 tracking-wider">
                        {coupon.code}
                      </span>
                      <span className="text-[10px] text-neutral-400 block font-mono">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}% de Desconto`
                          : `R$ ${coupon.discountValue.toFixed(2)} OFF`}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border ${
                      isIndividual
                        ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                        : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    }`}
                  >
                    {isIndividual ? 'Exclusivo p/ Você' : 'Cupom Geral'}
                  </span>
                </div>

                {/* Exclusivity Tag if individual */}
                {isIndividual && (
                  <div className="p-2.5 bg-purple-900/30 border border-purple-500/30 rounded-2xl text-xs font-mono text-purple-200 flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>
                      Cupom especial concedido para <strong>{coupon.targetCustomerName || 'Você'}</strong>
                    </span>
                  </div>
                )}

                {/* Details Box */}
                <div className="p-3.5 bg-black/60 rounded-2xl border border-white/5 text-xs font-mono space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Desconto:</span>
                    <span className="font-bold text-amber-400 text-sm">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}% OFF`
                        : `R$ ${coupon.discountValue.toFixed(2)} OFF`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-neutral-300">
                    <span className="text-neutral-400">Pedido Mínimo:</span>
                    <span className="font-semibold text-white">
                      {coupon.minOrderValue > 0 ? `R$ ${coupon.minOrderValue.toFixed(2)}` : 'Sem Mínimo'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-neutral-300">
                    <span className="text-neutral-400">Regra de Uso:</span>
                    <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                      {coupon.usageLimitPerClient && coupon.usageLimitPerClient > 0
                        ? `${coupon.usageLimitPerClient} uso por cliente`
                        : 'Uso ilimitado'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-neutral-400 text-[11px] pt-1 border-t border-white/5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#DAA520]" />
                      Validade:
                    </span>
                    <span className="text-neutral-200 font-semibold">{coupon.endDate}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleCopyCode(coupon.code)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isCopied
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : 'bg-neutral-900 border-white/10 hover:bg-neutral-800 text-white'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-amber-400" />
                      <span>Copiar Código</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleUseInBooking(coupon.code)}
                  className="py-2.5 px-3 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <span>Usar Agora</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {availableCoupons.length === 0 && (
          <div className="col-span-full bg-[#111111] border border-white/10 rounded-3xl p-8 text-center space-y-4">
            <TicketPercent className="w-12 h-12 text-neutral-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-mono font-bold text-white">Nenhum cupom disponível no momento</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto font-sans">
                Fique atento às nossas redes sociais e ao Feed de Novidades para receber novos cupons promocionais!
              </p>
            </div>
            <button
              onClick={() => setActivePage('agenda')}
              className="py-2.5 px-5 rounded-xl bg-[#DAA520] text-black font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Ir para Agendamento
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
