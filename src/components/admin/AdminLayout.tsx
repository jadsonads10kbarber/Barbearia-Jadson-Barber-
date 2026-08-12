import React, { useState } from 'react';
import {
  LayoutDashboard,
  WalletCards,
  CalendarDays,
  Newspaper,
  Users,
  ContactRound,
  Scissors,
  Package,
  ShoppingBag,
  TicketPercent,
  Clock,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  ChevronRight,
  ShieldCheck,
  Check,
  Trash2,
} from 'lucide-react';
import { useApp, ActivePage } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, subtitle }) => {
  const {
    activePage,
    setActivePage,
    adminUser,
    logoutAdmin,
    notifications,
    markNotificationRead,
    clearNotifications,
  } = useApp();
  const { theme, toggleTheme } = useTheme();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const menuItems: { id: ActivePage; label: string; icon: React.ReactNode }[] = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'admin-financeiro', label: 'Financeiro', icon: <WalletCards className="w-4 h-4" /> },
    { id: 'admin-agendamentos', label: 'Agendamentos', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'admin-feed', label: 'Feed', icon: <Newspaper className="w-4 h-4" /> },
    { id: 'admin-equipe', label: 'Equipe', icon: <Users className="w-4 h-4" /> },
    { id: 'admin-clientes', label: 'Clientes', icon: <ContactRound className="w-4 h-4" /> },
    { id: 'admin-servicos', label: 'Serviços & Combos', icon: <Scissors className="w-4 h-4" /> },
    { id: 'admin-estoque', label: 'Estoque Insumos', icon: <Package className="w-4 h-4" /> },
    { id: 'admin-produtos', label: 'Produtos Venda', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'admin-cupons', label: 'Cupons', icon: <TicketPercent className="w-4 h-4" /> },
    { id: 'admin-horarios', label: 'Horários & Bloqueios', icon: <Clock className="w-4 h-4" /> },
    { id: 'admin-avaliacoes', label: 'Avaliações', icon: <Star className="w-4 h-4" /> },
    { id: 'admin-configuracoes', label: 'Configurações', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleNavigate = (page: ActivePage) => {
    setActivePage(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col lg:flex-row font-sans">
      
      {/* Mobile Header Bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-black/95 border-b border-neutral-800 px-4 h-16 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-amber-400 hover:bg-neutral-800 transition-colors"
            aria-label="Abrir Menu Admin"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="text-[9px] uppercase font-mono tracking-widest text-amber-500 font-bold">Painel Admin</div>
            <div className="text-sm font-black font-mono tracking-tight text-white">Jadson Barber</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications button */}
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black font-mono font-bold text-[9px] flex items-center justify-center">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNavigate('agenda')}
            className="py-1.5 px-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-amber-400 font-mono text-[11px] font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#111111] border-r border-neutral-800 shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
        
        {/* Sidebar Header */}
        <div className="p-5 border-b border-neutral-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#DAA520] text-black font-bold flex items-center justify-center shadow-lg shadow-[#DAA520]/20 shrink-0">
            <Scissors className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-[#DAA520]">
              Barbearia
            </div>
            <div className="text-sm font-black font-mono tracking-tight text-white">
              Jadson Barber
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1">
          <div className="px-3 pt-2 pb-1 text-[10px] uppercase font-mono tracking-widest text-neutral-500 font-bold">
            Módulos do Sistema
          </div>
          {menuItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full py-2.5 px-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  isActive
                    ? 'bg-[#DAA520] text-black shadow-md shadow-[#DAA520]/20 font-black'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-neutral-800/80 bg-neutral-950/50 space-y-3">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">
                {adminUser?.name || 'Administrador'}
              </div>
              <div className="text-[10px] text-neutral-400 truncate font-mono">
                {adminUser?.email || 'barbeariajadsonbarber@gmail.com'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => handleNavigate('agenda')}
              className="py-2 px-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-mono text-[10px] font-bold uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Ir para Área do Cliente"
            >
              <span>Ver App</span>
            </button>

            <button
              onClick={logoutAdmin}
              className="py-2 px-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-800/50 text-red-400 font-mono text-[10px] font-bold uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Sair</span>
            </button>
          </div>
        </div>

      </aside>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-[#111111] border-r border-neutral-800 flex flex-col h-full z-10 shadow-2xl">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#DAA520] text-black font-bold flex items-center justify-center">
                  <Scissors className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <div className="text-[9px] uppercase font-mono tracking-widest text-[#DAA520] font-bold">Menu Painel</div>
                  <div className="text-xs font-black font-mono text-white">Jadson Barber</div>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 p-3 overflow-y-auto space-y-1">
              {menuItems.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full py-2.5 px-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-[#DAA520] text-black font-black'
                        : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-neutral-800 bg-black/60 space-y-2">
              <button
                onClick={() => handleNavigate('agenda')}
                className="w-full py-2.5 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-amber-400 font-mono text-xs font-bold uppercase flex items-center justify-center gap-2"
              >
                <span>Ir para App do Cliente</span>
              </button>
              <button
                onClick={logoutAdmin}
                className="w-full py-2.5 px-3 rounded-xl bg-red-950/50 border border-red-800/40 text-red-400 font-mono text-xs font-bold uppercase flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair do Painel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Desktop Top Header Bar */}
        <header className="hidden lg:flex sticky top-0 z-30 bg-[#0d0d0d]/90 backdrop-blur-md border-b border-neutral-800/80 px-8 h-16 items-center justify-between">
          <div>
            <h1 className="text-base font-black font-mono tracking-tight text-white flex items-center gap-2">
              <span className="text-[#DAA520]">{title}</span>
            </h1>
            {subtitle && <p className="text-xs text-neutral-400 font-sans">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors relative cursor-pointer"
                title="Notificações Administrativas"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#DAA520] text-black font-mono font-bold text-[9px] flex items-center justify-center shadow-md">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Drawer */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#111111] border border-neutral-800 rounded-2xl shadow-2xl p-4 z-50 animate-fadeIn space-y-3">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#DAA520]" />
                      <span className="text-xs font-mono font-bold uppercase text-white">
                        Notificações ({notifications.length})
                      </span>
                    </div>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-[10px] text-neutral-400 hover:text-red-400 font-mono uppercase flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Limpar
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-neutral-500 text-center py-6 font-mono">
                        Nenhuma notificação recente.
                      </p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationRead(notif.id)}
                          className={`p-3 rounded-xl border transition-colors cursor-pointer space-y-1 ${
                            notif.read
                              ? 'bg-neutral-900/40 border-neutral-800/60 text-neutral-400'
                              : 'bg-amber-950/20 border-amber-500/30 text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-amber-400 font-mono text-[11px]">{notif.title}</span>
                            <span className="text-[10px] text-neutral-500">{notif.date}</span>
                          </div>
                          <p className="text-xs leading-relaxed text-neutral-300">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Alternar Tema"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            {/* Admin Badge */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-bold text-neutral-300">
                Barbearia Jadson Barber Admin
              </span>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </div>

      </main>

    </div>
  );
};
