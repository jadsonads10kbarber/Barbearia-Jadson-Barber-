import React from 'react';
import {
  Calendar,
  CalendarCheck,
  Store,
  Scissors,
  Users,
  Sun,
  Moon,
  X,
  ChevronRight,
  Phone,
  MapPin,
  User,
  LogOut,
  TicketPercent,
  Star,
  Newspaper,
  Smartphone,
  Download,
  Sparkles,
} from 'lucide-react';
import { useApp, ActivePage } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { usePwa } from '../context/PwaContext';

export const Sidebar: React.FC = () => {
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    activePage,
    setActivePage,
    barbershopInfo,
    isLoggedIn,
    currentUser,
    logout,
  } = useApp();
  const { theme, toggleTheme } = useTheme();
  const { isInstalled, openInstallModal, triggerInstall, isIOS } = usePwa();

  const navigateTo = (page: ActivePage) => {
    setActivePage(page);
    setIsSidebarOpen(false);
  };

  const modules = barbershopInfo.clientModules || {
    showAgendamento: true,
    showMeusAgendamentos: true,
    showCupons: true,
    showBarbearia: true,
    showServicos: true,
    showEquipe: true,
    showAvaliacoes: true,
    showFeed: true,
  };

  const rawMenuItems = [
    { id: 'agenda' as ActivePage, label: 'Agendar', icon: Calendar, visible: modules.showAgendamento !== false },
    { id: 'meus-agendamentos' as ActivePage, label: 'Agendamentos', icon: CalendarCheck, visible: modules.showMeusAgendamentos !== false },
    { id: 'cupons' as ActivePage, label: 'Cupons de Desconto', icon: TicketPercent, visible: modules.showCupons !== false },
    { id: 'barbearia' as ActivePage, label: 'A Barbearia', icon: Store, visible: modules.showBarbearia !== false },
    ...(isLoggedIn ? [{ id: 'perfil' as ActivePage, label: 'Meu Perfil', icon: User, visible: true }] : []),
    { id: 'servicos' as ActivePage, label: 'Serviços & Combos', icon: Scissors, visible: modules.showServicos !== false },
    { id: 'barbeiros' as ActivePage, label: 'Nossa Equipe', icon: Users, visible: modules.showEquipe !== false },
    { id: 'avaliacoes' as ActivePage, label: 'Avaliações', icon: Star, visible: modules.showAvaliacoes !== false },
    { id: 'feed' as ActivePage, label: 'Feed & Novidades', icon: Newspaper, visible: modules.showFeed !== false },
  ];

  const menuItems = rawMenuItems.filter((item) => item.visible);

  return (
    <div
      className={`fixed top-[72px] inset-x-0 bottom-0 z-45 flex transition-all duration-300 ${
        isSidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Backdrop Overlay */}
      <div
        className={`fixed top-[72px] inset-x-0 bottom-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar Panel - Opens from Left to Right with smooth transition */}
      <div
        className={`relative w-80 max-w-[85vw] bg-[#111111] border-r border-[#DAA520]/20 text-white flex flex-col h-full z-10 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#111111]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#DAA520] font-sans">
              Menu de Navegação
            </span>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#8E9299] hover:text-white transition-colors cursor-pointer"
            aria-label="Fechar menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User profile widget if logged in */}
        {isLoggedIn && currentUser && (
          <div className="mx-3 mt-3 p-3 bg-neutral-900/90 border border-amber-500/20 rounded-xl flex items-center justify-between gap-3">
            <div 
              onClick={() => navigateTo('perfil')}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer"
            >
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-9 h-9 rounded-lg object-cover border border-[#DAA520]/40 shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-[#DAA520] text-black font-extrabold flex items-center justify-center shrink-0">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">{currentUser.name}</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] text-amber-400 font-mono">VIP</span>
                  {currentUser.accessCode && (
                    <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.2 rounded inline-flex items-center gap-1">
                      Código: {currentUser.accessCode}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                setIsSidebarOpen(false);
              }}
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
              title="Sair da Conta"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg font-medium text-xs transition-all ${
                  isActive
                    ? 'bg-[#DAA520] text-black font-bold shadow-sm'
                    : 'text-[#8E9299] hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-[#DAA520]'}`} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isActive ? 'text-black' : ''}`} />
              </button>
            );
          })}

          {/* Install PWA App Button */}
          {!isInstalled && (
            <div className="pt-2">
              <button
                onClick={async () => {
                  setIsSidebarOpen(false);
                  if (isIOS) {
                    openInstallModal();
                  } else {
                    const ok = await triggerInstall();
                    if (!ok) {
                      openInstallModal();
                    }
                  }
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#DAA520]/15 border border-[#DAA520]/50 text-[#DAA520] hover:bg-[#DAA520]/25 transition-all text-xs font-bold shadow-sm cursor-pointer group active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-[#DAA520] shrink-0 stroke-[2.2]" />
                  <span className="font-sans font-bold">Instalar Aplicativo</span>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase bg-[#DAA520] text-black px-2 py-0.5 rounded-md">
                  Instalar
                </span>
              </button>
            </div>
          )}

          {/* Theme Switcher Row */}
          <div className="pt-4 border-t border-white/5 mt-4">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-3 rounded-xl text-[#8E9299] hover:bg-white/5 hover:text-white transition-all text-sm font-medium border border-white/10 cursor-pointer group"
              title={`Mudar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
            >
              <div className="flex items-center gap-2.5">
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-[#DAA520]" />
                ) : (
                  <Moon className="w-4 h-4 text-[#DAA520]" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider text-white">Modo de Apparência</span>
              </div>

              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all ${theme === 'dark' ? 'bg-[#DAA520] text-black shadow-sm font-extrabold' : 'text-[#8E9299]'}`}>
                  Escuro
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all ${theme === 'light' ? 'bg-[#DAA520] text-black shadow-sm font-extrabold' : 'text-[#8E9299]'}`}>
                  Claro
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-5 border-t border-white/5 bg-[#000000]/40 text-xs text-[#8E9299] space-y-2">
          <div className="flex items-center gap-2 text-[#8E9299]">
            <MapPin className="w-3.5 h-3.5 text-[#DAA520] shrink-0" />
            <span className="truncate">{barbershopInfo.address}</span>
          </div>
          <div className="flex items-center gap-2 text-[#8E9299]">
            <Phone className="w-3.5 h-3.5 text-[#DAA520] shrink-0" />
            <span>{barbershopInfo.phone}</span>
          </div>
          <p className="text-[10px] text-[#8E9299]/80 pt-1 text-center font-mono uppercase tracking-wider">
            {barbershopInfo.slogan}
          </p>
        </div>

      </div>
    </div>
  );
};
