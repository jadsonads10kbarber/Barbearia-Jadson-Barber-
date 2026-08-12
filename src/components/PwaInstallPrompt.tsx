import React, { useState, useEffect } from 'react';
import { Download, X, CircleCheck } from 'lucide-react';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is already running in standalone mode (installed)
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || dismissed || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-40 bg-neutral-900/95 border border-amber-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-white animate-slideUp">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src="/icon-192.png"
            alt="JADSON BARBER"
            className="w-11 h-11 rounded-xl object-cover shrink-0 border border-amber-500/30 shadow-md"
          />
          <div>
            <h4 className="text-sm font-bold text-amber-400">Instalar o app JADSON BARBER</h4>
            <p className="text-xs text-gray-300 mt-0.5">
              Adicione à tela inicial para agendar com 1 clique.
            </p>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-gray-400 hover:text-white p-1"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={handleInstall}
          className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
        >
          <CircleCheck className="w-4 h-4" />
          Instalar Agora
        </button>
      </div>
    </div>
  );
};
