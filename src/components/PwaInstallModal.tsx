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
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { usePwa } from '../context/PwaContext';

export const PwaInstallModal: React.FC = () => {
  const {
    isModalOpen,
    closeInstallModal,
    isInstalled,
    isIOS,
    isAndroid,
    triggerInstall,
  } = usePwa();

  if (!isModalOpen || isInstalled) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Modal Card */}
      <div
        className="w-full max-w-lg bg-[#111111] border border-[#DAA520]/40 rounded-3xl p-6 sm:p-7 space-y-6 relative shadow-2xl max-h-[90vh] overflow-y-auto text-white"
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
        <div className="flex items-center gap-4 border-b border-white/10 pb-5">
          <div className="w-14 h-14 rounded-2xl bg-[#000000] border-2 border-[#DAA520] p-1 shadow-lg shadow-[#DAA520]/20 shrink-0 flex items-center justify-center relative overflow-hidden">
            <img
              src="/icon-192.png"
              alt="JADSON BARBER Logo"
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                // Fallback icon if image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <Scissors className="w-6 h-6 text-[#DAA520] absolute" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#DAA520] bg-[#DAA520]/15 border border-[#DAA520]/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#DAA520]" />
                App Oficial
              </span>
            </div>
            <h2 id="pwa-install-title" className="text-lg sm:text-xl font-bold font-sans tracking-tight text-white">
              Instalar JADSON BARBER
            </h2>
            <p className="text-xs text-gray-400 font-sans">
              Acesso rápido e exclusivo direto na tela inicial do seu aparelho
            </p>
          </div>
        </div>

        {/* Value Proposition Grid (Using Lucide Icons - No Emojis) */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-black/60 border border-white/5 rounded-2xl p-3 space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-[#DAA520]/10 border border-[#DAA520]/30 flex items-center justify-center text-[#DAA520]">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-gray-200">1-Toque para Agendar</h3>
            <p className="text-[11px] text-gray-400 leading-tight">
              Abra o app sem digitar endereço no navegador.
            </p>
          </div>

          <div className="bg-black/60 border border-white/5 rounded-2xl p-3 space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-[#DAA520]/10 border border-[#DAA520]/30 flex items-center justify-center text-[#DAA520]">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-gray-200">Alertas de Horário</h3>
            <p className="text-[11px] text-gray-400 leading-tight">
              Acompanhe o status e lembretes do seu atendimento.
            </p>
          </div>

          <div className="bg-black/60 border border-white/5 rounded-2xl p-3 space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-[#DAA520]/10 border border-[#DAA520]/30 flex items-center justify-center text-[#DAA520]">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-gray-200">Tela Cheia Imersiva</h3>
            <p className="text-[11px] text-gray-400 leading-tight">
              Navegação limpa e fluida sem barras do navegador.
            </p>
          </div>

          <div className="bg-black/60 border border-white/5 rounded-2xl p-3 space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-[#DAA520]/10 border border-[#DAA520]/30 flex items-center justify-center text-[#DAA520]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-gray-200">Seus Cupons & Pontos</h3>
            <p className="text-[11px] text-gray-400 leading-tight">
              Histórico seguro e cupons VIP salvos na sua conta.
            </p>
          </div>
        </div>

        {/* Platform Specific Step-by-Step Instructions */}
        {isIOS ? (
          /* iOS / iPhone / iPad Safari Instructions */
          <div className="bg-black/80 border border-[#DAA520]/30 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#DAA520]">
              <Smartphone className="w-4 h-4" />
              <span>Como Instalar no seu iPhone / Safari</span>
            </div>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="w-7 h-7 rounded-lg bg-[#DAA520] text-black font-extrabold flex items-center justify-center shrink-0 text-xs shadow-md">
                  1
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <span>Toque no botão Compartilhar</span>
                    <Share2 className="w-3.5 h-3.5 text-[#DAA520]" />
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    Localizado na barra inferior do Safari (o ícone de quadrado com uma seta para cima).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="w-7 h-7 rounded-lg bg-[#DAA520] text-black font-extrabold flex items-center justify-center shrink-0 text-xs shadow-md">
                  2
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <span>Selecione "Adicionar à Tela de Início"</span>
                    <PlusSquare className="w-3.5 h-3.5 text-[#DAA520]" />
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    Role a lista de ações do compartilhamento para baixo até encontrar a opção.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="w-7 h-7 rounded-lg bg-[#DAA520] text-black font-extrabold flex items-center justify-center shrink-0 text-xs shadow-md">
                  3
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <span>Confirme em "Adicionar"</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    Toque em <strong>Adicionar</strong> no canto superior direito para fixar o ícone oficial na sua tela inicial.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={closeInstallModal}
              className="w-full py-3 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#DAA520]/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Entendi, vou adicionar</span>
            </button>
          </div>
        ) : isAndroid ? (
          /* Android / Chrome Flow */
          <div className="space-y-3">
            <button
              onClick={() => {
                triggerInstall();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xl shadow-[#DAA520]/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Instalar Aplicativo Agora</span>
            </button>

            <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-left">
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Caso a janela de instalação automática não abra, toque nos <strong>três pontinhos (Menu)</strong> do Chrome ou navegador e selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
              </p>
            </div>
          </div>
        ) : (
          /* Desktop / General Browser */
          <div className="space-y-3">
            <button
              onClick={() => {
                triggerInstall();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xl shadow-[#DAA520]/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Instalar no Computador / Navegador</span>
            </button>
            <p className="text-[11px] text-gray-400 text-center">
              Você também pode instalar clicando no ícone de instalação na barra de endereços do seu navegador.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
