import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type PlatformType = 'ios' | 'android' | 'desktop';

interface PwaContextType {
  isInstalled: boolean;
  canInstall: boolean;
  hasNativePrompt: boolean;
  platform: PlatformType;
  isIOS: boolean;
  isAndroid: boolean;
  isModalOpen: boolean;
  isBannerDismissed: boolean;
  openInstallModal: () => void;
  closeInstallModal: () => void;
  triggerInstall: () => Promise<void>;
  dismissBanner: () => void;
}

const PwaContext = createContext<PwaContextType | undefined>(undefined);

const BANNER_DISMISS_KEY = 'jadson_pwa_banner_dismissed_at';
const BANNER_COOLDOWN_DAYS = 2;

export const PwaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(true);
  const [platform, setPlatform] = useState<PlatformType>('desktop');

  // Register service worker if supported
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((reg) => {
            console.log('PWA ServiceWorker registered with scope: ', reg.scope);
          })
          .catch((err) => {
            console.warn('PWA ServiceWorker registration failed: ', err);
          });
      });
    }
  }, []);

  // Detect platform and standalone mode
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect device platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroidDevice = /android/.test(userAgent);

    if (isIOSDevice) {
      setPlatform('ios');
    } else if (isAndroidDevice) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // Check banner dismiss cooldown
    try {
      const dismissedTimestamp = localStorage.getItem(BANNER_DISMISS_KEY);
      if (dismissedTimestamp) {
        const daysPassed = (Date.now() - parseInt(dismissedTimestamp, 10)) / (1000 * 60 * 60 * 24);
        if (daysPassed < BANNER_COOLDOWN_DAYS) {
          setIsBannerDismissed(true);
        } else {
          setIsBannerDismissed(false);
        }
      } else {
        // Show banner after brief initial delay for smoother UX
        const timer = setTimeout(() => {
          setIsBannerDismissed(false);
        }, 2000);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsBannerDismissed(false);
    }

    // Capture beforeinstallprompt event globally
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Store in window for global accessibility
      (window as any).__pwa_deferred_prompt = e;
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      (window as any).__pwa_deferred_prompt = null;
      setIsModalOpen(false);
      setIsBannerDismissed(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const openInstallModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeInstallModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const dismissBanner = useCallback(() => {
    setIsBannerDismissed(true);
    try {
      localStorage.setItem(BANNER_DISMISS_KEY, Date.now().toString());
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  const triggerInstall = useCallback(async () => {
    const promptEvent = deferredPrompt || (typeof window !== 'undefined' ? (window as any).__pwa_deferred_prompt : null);

    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult && choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
          setIsModalOpen(false);
          setIsBannerDismissed(true);
        }
        setDeferredPrompt(null);
        (window as any).__pwa_deferred_prompt = null;
      } catch (err) {
        console.warn('Error executing native install prompt:', err);
        setIsModalOpen(true);
      }
    } else {
      // If native prompt is not available (iOS Safari, or already prompted), open the guide modal
      setIsModalOpen(true);
    }
  }, [deferredPrompt]);

  const hasNativePrompt = Boolean(deferredPrompt);
  const canInstall = !isInstalled && (hasNativePrompt || platform === 'ios' || platform === 'android');

  return (
    <PwaContext.Provider
      value={{
        isInstalled,
        canInstall,
        hasNativePrompt,
        platform,
        isIOS: platform === 'ios',
        isAndroid: platform === 'android',
        isModalOpen,
        isBannerDismissed,
        openInstallModal,
        closeInstallModal,
        triggerInstall,
        dismissBanner,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
};

export const usePwa = () => {
  const context = useContext(PwaContext);
  if (!context) {
    throw new Error('usePwa must be used within a PwaProvider');
  }
  return context;
};
