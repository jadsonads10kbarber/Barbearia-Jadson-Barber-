import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type PlatformType = 'ios' | 'android' | 'desktop';

interface PwaContextType {
  isInstalled: boolean;
  canInstall: boolean;
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
const BANNER_COOLDOWN_DAYS = 3;

export const PwaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(true); // start true, calculate in effect
  const [platform, setPlatform] = useState<PlatformType>('desktop');

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
        }, 3000);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsBannerDismissed(false);
    }

    // Listen for Chrome/Android native prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
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
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setIsModalOpen(false);
          setIsBannerDismissed(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn('Error during native install prompt:', err);
        setIsModalOpen(true);
      }
    } else {
      // If no deferred prompt (iOS, Firefox, or unsupported browser), open the guidance modal
      setIsModalOpen(true);
    }
  }, [deferredPrompt]);

  const canInstall = !isInstalled && (Boolean(deferredPrompt) || platform === 'ios' || platform === 'android');

  return (
    <PwaContext.Provider
      value={{
        isInstalled,
        canInstall,
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
