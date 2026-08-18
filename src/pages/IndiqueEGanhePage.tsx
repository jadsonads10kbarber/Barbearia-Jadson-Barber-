import React, { useState, useMemo } from 'react';
import {
  Gift,
  Copy,
  Check,
  Share2,
  Users,
  Wallet,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  TrendingUp,
  Award,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const IndiqueEGanhePage: React.FC = () => {
  const {
    referralProgram,
    currentUserReferralCode,
    currentUser,
    customerPhone,
    customers,
    referrals,
    setActivePage,
    addToast,
    barbershopInfo,
  } = useApp();

  const [copied, setCopied] = useState(false);

  // Determine current customer data
  const currentCustomer = useMemo(() => {
    return customers.find(
      (c) =>
        (currentUser?.id && c.id === currentUser.id) ||
        (currentUser?.phone && c.phone === currentUser.phone) ||
        (customerPhone && c.phone === customerPhone)
    );
  }, [customers, currentUser, customerPhone]);

  const walletBalance = currentCustomer?.referralWalletBalance || currentUser?.referralWalletBalance || 0;
  const totalReferralsCount = currentCustomer?.totalReferrals || 0;
  const totalEarned = currentCustomer?.totalEarnedFromReferrals || 0;

  // Filter referrals made by this user
  const myReferrals = useMemo(() => {
    const code = (currentUserReferralCode || '').trim().toUpperCase();
    const phoneClean = (customerPhone || currentUser?.phone || '').replace(/\D/g, '');
    const userId = currentUser?.id;

    return referrals.filter((r) => {
      if (code && r.referrerCode.trim().toUpperCase() === code) return true;
      if (userId && r.referrerCustomerId === userId) return true;
      if (phoneClean && r.referrerPhone.replace(/\D/g, '') === phoneClean) return true;
      return false;
    });
  }, [referrals, currentUserReferralCode, currentUser, customerPhone]);

  const codeToShare = currentUserReferralCode || '8111443';
  const rewardVal = referralProgram.referrerReward || 5.0;
  const isRefereeDiscountActive = referralProgram.giveRefereeDiscount !== false;
  const discountVal = isRefereeDiscountActive ? (referralProgram.refereeDiscount || 5.0) : 0;

  const appUrl = window.location.origin;

  const shareText = isRefereeDiscountActive
    ? `✂️ Olá! Ganhe R$ ${discountVal.toFixed(2).replace('.', ',')} de desconto no seu 1º agendamento na Barbearia ${barbershopInfo.name} usando meu código de indicação: *${codeToShare}*\n\nAgende seu horário agora pelo aplicativo ou web: ${appUrl}`
    : `✂️ Olá! Venha cortar o cabelo na Barbearia ${barbershopInfo.name}! Use o meu código de indicação *${codeToShare}* ao agendar seu horário pelo aplicativo ou web: ${appUrl}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeToShare);
    setCopied(true);
    addToast(`Código ${codeToShare} copiado com sucesso!`, 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Indicação Barbearia ${barbershopInfo.name}`,
          text: shareText,
          url: appUrl,
        });
      } catch (err) {
        handleCopyCode();
      }
    } else {
      handleCopyCode();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 pb-28 space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Hero Banner / Referral Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a160d] via-[#111111] to-[#1a1408] border border-[#DAA520]/40 p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Glow decorative blur */}
        <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 w-60 h-60 bg-[#DAA520]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -translate-x-8 translate-y-8 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DAA520]/15 border border-[#DAA520]/40 text-[#DAA520] text-xs font-mono font-bold uppercase tracking-wider shadow-inner">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Programa Indique e Ganhe</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-sans">
              Ganhe <span className="text-[#DAA520]">R$ {rewardVal.toFixed(2).replace('.', ',')}</span>
            </h1>
            <p className="text-sm sm:text-base font-bold text-amber-200/90 uppercase tracking-widest font-mono">
              para cada indicação
            </p>
          </div>

          <p className="text-xs sm:text-sm text-neutral-300 max-w-lg leading-relaxed font-sans pt-1">
            Compartilhe o seu código com amigos que ainda não pediram no App ou web{' '}
            <strong className="text-white font-semibold">{barbershopInfo.name}</strong>.
            Quanto mais você indicar, mais você ganha!
          </p>
        </div>

        {/* Highlight Referral Code Box */}
        <div className="relative z-10 bg-black/80 backdrop-blur-md rounded-2xl border border-[#DAA520]/50 p-5 sm:p-6 space-y-4 max-w-md mx-auto shadow-2xl">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Seu Código Exclusivo de Indicação
            </span>
            <div className="py-2.5 px-4 bg-neutral-900/90 rounded-xl border border-[#DAA520]/40 flex items-center justify-center gap-3">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-[#DAA520] select-all">
                {codeToShare}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={handleCopyCode}
              className="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-[#DAA520]/40 hover:border-[#DAA520] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-md"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#DAA520]" />
                  <span>Copiar código</span>
                </>
              )}
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-lg shadow-[#25D366]/20"
            >
              <MessageCircle className="w-4 h-4 fill-black text-[#25D366]" />
              <span>WhatsApp</span>
            </button>
          </div>

          <button
            onClick={handleNativeShare}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#DAA520] to-[#b8860b] hover:from-[#e5b32e] hover:to-[#c9951b] text-black font-mono font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-lg shadow-[#DAA520]/20"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartilhar com Amigos</span>
          </button>
        </div>
      </div>

      {/* Wallet Balance & Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Wallet Balance */}
        <div className="bg-[#111111] border border-[#DAA520]/30 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Saldo da Carteira
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#DAA520]/15 border border-[#DAA520]/30 text-[#DAA520] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              R$ {walletBalance.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-[11px] text-[#DAA520] font-sans mt-0.5">
              Disponível para abater em agendamentos
            </p>
          </div>
        </div>

        {/* Total Referrals */}
        <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Amigos Indicados
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {myReferrals.length > 0 ? myReferrals.length : totalReferralsCount}
            </div>
            <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
              Cadastrados com seu código
            </p>
          </div>
        </div>

        {/* Total Earned */}
        <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Total em Bônus
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              R$ {Math.max(totalEarned, myReferrals.filter((r) => r.status === 'concluido').reduce((acc, r) => acc + r.rewardAmount, 0)).toFixed(2).replace('.', ',')}
            </div>
            <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
              Acumulados no programa
            </p>
          </div>
        </div>
      </div>

      {/* How it works (3 Steps Infographic) */}
      <div className="bg-[#111111] border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#DAA520]" />
          <h2 className="text-base sm:text-lg font-bold text-white font-sans uppercase tracking-tight">
            Como Funciona o Indique e Ganhe
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-black/60 border border-neutral-800/80 space-y-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#DAA520]/20 text-[#DAA520] font-mono font-black text-sm flex items-center justify-center border border-[#DAA520]/30">
              1
            </div>
            <h3 className="text-sm font-bold text-white font-sans">1. Envie seu código</h3>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              Compartilhe seu código exclusivo <strong className="text-amber-300">{codeToShare}</strong> com amigos, familiares e colegas de trabalho.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-black/60 border border-neutral-800/80 space-y-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#DAA520]/20 text-[#DAA520] font-mono font-black text-sm flex items-center justify-center border border-[#DAA520]/30">
              2
            </div>
            <h3 className="text-sm font-bold text-white font-sans">
              {isRefereeDiscountActive ? '2. Seu amigo ganha desconto' : '2. Seu amigo agenda'}
            </h3>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              {isRefereeDiscountActive ? (
                <>
                  Ao agendar o 1º serviço no App, seu amigo insere seu código e ganha <strong className="text-emerald-400">R$ {discountVal.toFixed(2).replace('.', ',')} de desconto</strong> na hora!
                </>
              ) : (
                <>
                  Ao agendar o 1º serviço no App, seu amigo insere o seu código de indicação <strong className="text-[#DAA520]">{codeToShare}</strong> para vincular o atendimento a você.
                </>
              )}
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-black/60 border border-neutral-800/80 space-y-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#DAA520]/20 text-[#DAA520] font-mono font-black text-sm flex items-center justify-center border border-[#DAA520]/30">
              3
            </div>
            <h3 className="text-sm font-bold text-white font-sans">3. Você recebe o bônus</h3>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              Assim que seu amigo realizar o atendimento, você recebe <strong className="text-[#DAA520]">R$ {rewardVal.toFixed(2).replace('.', ',')}</strong> na sua carteira para usar nos seus cortes!
            </p>
          </div>
        </div>
      </div>

      {/* Referral History */}
      <div className="bg-[#111111] border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#DAA520]" />
            <h2 className="text-base sm:text-lg font-bold text-white font-sans uppercase tracking-tight">
              Minhas Indicações ({myReferrals.length})
            </h2>
          </div>

          <button
            onClick={() => setActivePage('agenda')}
            className="text-xs text-[#DAA520] hover:text-amber-300 font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Usar Saldo no Agendamento</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {myReferrals.length === 0 ? (
          <div className="p-8 text-center bg-black/40 rounded-2xl border border-neutral-800/60 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
              <Gift className="w-6 h-6 text-[#DAA520]" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-white font-sans">Você ainda não possui indicações</p>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto font-sans">
                Copie seu código <span className="text-[#DAA520] font-mono font-bold">{codeToShare}</span> e envie para seus amigos no WhatsApp para começar a acumular créditos!
              </p>
            </div>
            <button
              onClick={handleShareWhatsApp}
              className="py-2.5 px-5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-mono font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95 shadow-md shadow-[#25D366]/20 mt-2"
            >
              <MessageCircle className="w-4 h-4 fill-black text-[#25D366]" />
              <span>Convidar no WhatsApp</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {myReferrals.map((ref) => {
              const isApproved = ref.status === 'concluido';
              const isCancelled = ref.status === 'cancelado';

              return (
                <div
                  key={ref.id}
                  className="p-4 rounded-2xl bg-black/60 border border-neutral-800 flex flex-wrap items-center justify-between gap-3 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-xs border ${
                        isApproved
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                          : isCancelled
                          ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                          : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                      }`}
                    >
                      {isApproved ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isCancelled ? (
                        <Clock className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white font-sans">
                        {ref.refereeName || 'Amigo Indicado'}
                      </h4>
                      <p className="text-[11px] text-neutral-400 font-mono">
                        {ref.refereePhone ? ref.refereePhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-****') : 'Novo cliente'} •{' '}
                        {new Date(ref.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-auto">
                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-black font-mono text-[#DAA520] block">
                        + R$ {ref.rewardAmount.toFixed(2).replace('.', ',')}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase ${
                          isApproved
                            ? 'text-emerald-400'
                            : isCancelled
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {isApproved ? 'Bônus Liberado' : isCancelled ? 'Cancelado' : 'Aguardando 1º Corte'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rules / Terms accordion summary */}
      <div className="bg-[#111111] border border-neutral-800 rounded-3xl p-5 space-y-2 text-neutral-400 text-xs font-sans">
        <div className="flex items-center gap-2 text-white font-bold">
          <HelpCircle className="w-4 h-4 text-[#DAA520]" />
          <span>Regras do Programa Indique e Ganhe</span>
        </div>
        {isRefereeDiscountActive ? (
          <p className="leading-relaxed">
            • O desconto de R$ {discountVal.toFixed(2).replace('.', ',')} é concedido exclusivamente para novos clientes no primeiro agendamento.
          </p>
        ) : (
          <p className="leading-relaxed">
            • O código de indicação vincula o agendamento ao amigo indicador para gerar bônus na carteira dele.
          </p>
        )}
        <p className="leading-relaxed">
          • O bônus de R$ {rewardVal.toFixed(2).replace('.', ',')} é creditado para o indicador {referralProgram.rewardTrigger === 'first_completed' ? 'após a realização e conclusão do 1º atendimento' : 'assim que o agendamento for confirmado'}.
        </p>
        <p className="leading-relaxed">
          • O saldo acumulado na carteira não expira e pode ser utilizado diretamente para abater o valor de qualquer serviço agendado no App.
        </p>
      </div>
    </div>
  );
};
