import React from 'react';
import { Download, X, Smartphone, ShieldCheck, Zap, Scissors } from 'lucide-react';
import { usePwa } from '../context/PwaContext';

export const PwaInstallPrompt: React.FC = () => {
  const { isInstalled, isBannerDismissed, dismissBanner, triggerInstall, isIOS } = usePwa();

  if (isInstalled || isBannerDismissed) {
    return null;
  }

  return (
    <aside
      aria-label="Aviso de instalação do aplicativo"
      className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 bg-[#111111]/95 border border-[#DAA520]/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-white animate-slideUp"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#000000] border border-[#DAA520]/50 p-0.5 shrink-0 relative overflow-hidden flex items-center justify-center shadow-md shadow-[#DAA520]/15">
            <img
              src="/icon-192.png"
              alt="JADSON BARBER"
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <Scissors className="w-5 h-5 text-[#DAA520] absolute" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#DAA520] bg-[#DAA520]/15 px-1.5 py-0.2 rounded">
                App Oficial
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-white font-sans">
              Instale o App JADSON BARBER
            </h4>
            <p className="text-[11px] text-gray-300 flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#DAA520] shrink-0" />
              <span>Agendamento em 1-toque e alertas de horário</span>
            </p>
          </div>
        </div>

        <button
          onClick={dismissBanner}
          className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Fechar aviso de instalação"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3.5 flex items-center gap-2">
        <button
          onClick={triggerInstall}
          className="flex-1 py-2.5 px-3 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#DAA520]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          {isIOS ? (
            <>
              <Smartphone className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Como Instalar no iPhone</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Instalar Aplicativo</span>
            </>
          )}
        </button>

        <button
          onClick={dismissBanner}
          className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          Depois
        </button>
      </div>
    </aside>
  );
};
