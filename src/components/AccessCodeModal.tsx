import React, { useState } from 'react';
import { Sparkles, Copy, Check, ArrowRight, KeyRound, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AccessCodeModal: React.FC = () => {
  const { celebrationAccessCode, setCelebrationAccessCode, setActivePage, addToast } = useApp();
  const [copied, setCopied] = useState(false);

  if (!celebrationAccessCode) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(celebrationAccessCode);
    setCopied(true);
    addToast('Código de Acesso copiado para a área de transferência!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleProceed = () => {
    setCelebrationAccessCode(null);
    setActivePage('agenda');
  };

  const lowerCode = celebrationAccessCode.toLowerCase();

  return (
    <div
      id="modal-access-code-celebration"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
    >
      <div className="bg-[#141414] border-2 border-[#DAA520] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scaleUp p-6 text-center space-y-5">
        
        {/* Animated Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-[#DAA520]/40 text-[#DAA520] flex items-center justify-center mx-auto shadow-xl shadow-[#DAA520]/20">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-xl font-black font-mono text-white">
            🎉 Cadastro Realizado com Sucesso!
          </h2>
          <p className="text-xs text-neutral-300">
            Guarde seu <strong>Código de Acesso Exclusivo</strong> para seus próximos agendamentos:
          </p>
        </div>

        {/* Access Code Highlight Box */}
        <div className="bg-black/90 border-2 border-dashed border-[#DAA520] rounded-2xl p-5 space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 bg-[#DAA520] text-black font-mono font-bold text-[9px] uppercase tracking-wider rounded-bl-xl">
            Exclusivo
          </div>

          <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">
            Seu Código de Acesso
          </span>

          <div className="text-4xl font-black font-mono tracking-[0.25em] text-[#DAA520] py-1">
            {celebrationAccessCode}
          </div>

          <p className="text-[11px] text-neutral-300 font-sans leading-relaxed">
            Aceita <strong>maiúsculo ou minúsculo</strong>: você pode digitar <span className="text-amber-300 font-mono font-bold">{lowerCode}</span> ou <span className="text-amber-300 font-mono font-bold">{celebrationAccessCode}</span>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            id="btn-copy-access-code"
            type="button"
            onClick={handleCopy}
            className="w-full py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer border border-neutral-700 active:scale-[0.99]"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#DAA520]" />}
            <span>{copied ? 'Código Copiado com Sucesso!' : 'Copiar Código de Acesso'}</span>
          </button>

          <div className="bg-neutral-900/80 p-3.5 rounded-xl text-left text-xs text-neutral-300 space-y-1.5 border border-neutral-800">
            <p className="font-bold text-white flex items-center gap-1.5 text-[11px] font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Como acessar sua conta no futuro:
            </p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400 text-[11px] pl-1 font-sans">
              <li>Digite seu Código (<strong className="text-amber-300 font-mono">{celebrationAccessCode}</strong>) + sua senha.</li>
              <li>Ou acesse com seu WhatsApp cadastrado + sua senha.</li>
              <li>Ou acesse com seu E-mail cadastrado + sua senha.</li>
            </ul>
          </div>

          <button
            id="btn-confirm-and-enter-app"
            type="button"
            onClick={handleProceed}
            className="w-full py-3.5 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-[#DAA520]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <span>Acessar o Aplicativo Agora</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
