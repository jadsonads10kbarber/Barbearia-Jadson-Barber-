import React from 'react';
import {
  X,
  Smartphone,
  Download,
  Share2,
  PlusSquare,
  CheckCircle2,
  Zap,
  Bell,
  ShieldCheck,
  Layers,
  Scissors,
  Check,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Laptop,
} from 'lucide-react';
import { usePwa } from '../context/PwaContext';

export const PwaInstallModal: React.FC = () => {
  const {
    isModalOpen,
    closeInstallModal,
    isInstalled,
    isIOS,
    isAndroid,
    hasNativePrompt,
    triggerInstall,
  } = usePwa();

  if (!isModalOpen || isInstalled) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Backdrop Click to Close */}
      <div 
        className="fixed inset-0"
        onClick={closeInstallModal}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className="w-full max-w-lg bg-[#111111] border border-[#DAA520]/40 rounded-3xl p-6 sm:p-7 space-y-5 relative shadow-2xl max-h-[90vh] overflow-y-auto text-white z-10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-install-title"
      >
        {/* Close Button */}
        <button
          onClick={closeInstallModal}
          className="absolute right-4 top-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with App Logo */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-black border-2 border-[#DAA520] p-1 shadow-lg shadow-[#DAA520]/20 shrink-0 flex items-center justify-center relative overflow-hidden">
            <img
              src="/icon-192.png"
              alt="JADSON BARBER"
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <Scissors className="w-6 h-6 text-[#DAA520] absolute" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#DAA520] bg-[#DAA520]/15 border border-[#DAA520]/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#DAA520]" />
                App Oficial Web
              </span>
            </div>
            <h2 id="pwa-install-title" className="text-lg sm:text-xl font-bold font-sans tracking-tight text-white">
              Instalar JADSON BARBER
            </h2>
            <p className="text-xs text-gray-400 font-sans">
              Acesso exclusivo e instantâneo na tela inicial do seu celular
            </p>
          </div>
        </div>

        {/* Value Proposition Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-black/60 border border-white/5 rounded-2xl p-3 space-y-1">
            <div className="w-7 h-7 rounded-lg bg-[#DAA520]/10 border border-[#DAA520]/30 flex items-center justify-center text-[#DAA520]">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-gray-200">1 Toque para Agendar</h3>
            <p className="text-[11px] text-gray-400 leading-tight">
              Acesse sua barbearia sem digitar URL.
            </p>
          </div>

          <div className="bg-black/60 border border-white/5 rounded-2xl p-3 space-y-1">
            <div className="w-7 h-7 rounded-lg bg-[#DAA520]/10 border border-[#DAA520]/30 flex items-center justify-center text-[#DAA520]">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-gray-200">Alertas & Lembretes</h3>
            <p className="text-[11px] text-gray-400 leading-tight">
              Avisos pontuais do horário do seu corte.
            </p>
          </div>

          <div className="bg-black/60 border border-white/5 rounded-2xl p-3 space-y-1">
            <div className="w-7 h-7 rounded-lg bg-[#DAA520]/10 border border-[#DAA520]/30 flex items-center justify-center text-[#DAA520]">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-gray-200">Tela Cheia Imersiva</h3>
            <p className="text-[11px] text-gray-400 leading-tight">
              Interface limpa sem barras do navegador.
            </p>
          </div>

          <div className="bg-black/60 border border-white/5 rounded-2xl p-3 space-y-1">
            <div className="w-7 h-7 rounded-lg bg-[#DAA520]/10 border border-[#DAA520]/30 flex items-center justify-center text-[#DAA520]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-gray-200">Seus Cupons & Dados</h3>
            <p className="text-[11px] text-gray-400 leading-tight">
              Acesso seguro e rápido aos seus benefícios.
            </p>
          </div>
        </div>

        {/* Platform Specific Step-by-Step Instructions */}
        {isIOS ? (
          /* iOS / iPhone / Safari */
          <div className="bg-black/80 border border-[#DAA520]/30 rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#DAA520]">
              <Smartphone className="w-4 h-4" />
              <span>Instalação no iPhone (Safari)</span>
            </div>

            <div className="space-y-2.5">
              {/* Step 1 */}
              <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="w-6 h-6 rounded-lg bg-[#DAA520] text-black font-black flex items-center justify-center shrink-0 text-xs shadow-md">
                  1
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <span>Toque no botão Compartilhar</span>
                    <Share2 className="w-3.5 h-3.5 text-[#DAA520]" />
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    Na barra inferior do Safari (o ícone de quadrado com a seta para cima).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="w-6 h-6 rounded-lg bg-[#DAA520] text-black font-black flex items-center justify-center shrink-0 text-xs shadow-md">
                  2
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <span>Toque em "Adicionar à Tela de Início"</span>
                    <PlusSquare className="w-3.5 h-3.5 text-[#DAA520]" />
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    Role as opções para baixo até encontrar esta ação.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="w-6 h-6 rounded-lg bg-[#DAA520] text-black font-black flex items-center justify-center shrink-0 text-xs shadow-md">
                  3
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <span>Confirme em "Adicionar"</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    No canto superior direito para fixar o app oficial na tela de início.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={closeInstallModal}
              className="w-full py-3 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#DAA520]/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Entendido, vou adicionar agora</span>
            </button>
          </div>
        ) : isAndroid ? (
          /* Android / Chrome Flow */
          <div className="space-y-3">
            <button
              onClick={() => triggerInstall()}
              className="w-full py-3.5 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xl shadow-[#DAA520]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Instalar Aplicativo Agora</span>
            </button>

            <div className="bg-black/50 border border-white/5 rounded-xl p-3 text-left space-y-1">
              <p className="text-[11px] text-gray-300 font-bold flex items-center gap-1 text-[#DAA520]">
                <Sparkles className="w-3 h-3" />
                Dica Rápida:
              </p>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Se a janela de instalação automática não surgir, toque nos <strong>3 pontinhos (Menu)</strong> do navegador Chrome e selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
              </p>
            </div>
          </div>
        ) : (
          /* Desktop / Laptop */
          <div className="space-y-3">
            <button
              onClick={() => triggerInstall()}
              className="w-full py-3.5 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xl shadow-[#DAA520]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Laptop className="w-4 h-4 stroke-[2.5]" />
              <span>Instalar no Computador / Navegador</span>
            </button>
            <p className="text-[11px] text-gray-400 text-center leading-relaxed">
              Você também pode instalar clicando no ícone de download/instalação na barra de endereços do seu navegador Chrome, Edge ou Brave.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
