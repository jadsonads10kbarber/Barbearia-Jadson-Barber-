import React from 'react';
import { Calendar, CalendarCheck, Store, User, TicketPercent, Scissors, Star, Newspaper } from 'lucide-react';
import { useApp, ActivePage } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activePage, setActivePage, isLoggedIn, barbershopInfo } = useApp();

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

  const navItems: { id: ActivePage; label: string; icon: any }[] = [];

  if (modules.showAgendamento !== false) {
    navItems.push({ id: 'agenda', label: 'Agenda', icon: Calendar });
  }
  if (modules.showMeusAgendamentos !== false) {
    navItems.push({ id: 'meus-agendamentos', label: 'Histórico', icon: CalendarCheck });
  }
  if (modules.showCupons !== false && (!modules.showAgendamento || !modules.showBarbearia)) {
    navItems.push({ id: 'cupons', label: 'Cupons', icon: TicketPercent });
  }
  if (modules.showBarbearia !== false) {
    navItems.push({ id: 'barbearia', label: 'Barbearia', icon: Store });
  }
  if (isLoggedIn) {
    navItems.push({ id: 'perfil', label: 'Perfil', icon: User });
  }

  // Fallback if somehow all primary are turned off
  if (navItems.length === 0) {
    if (modules.showServicos) navItems.push({ id: 'servicos', label: 'Serviços', icon: Scissors });
    else if (modules.showAvaliacoes) navItems.push({ id: 'avaliacoes', label: 'Avaliações', icon: Star });
    else if (modules.showFeed) navItems.push({ id: 'feed', label: 'Feed', icon: Newspaper });
  }

  if (navItems.length === 0) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#000000]/95 backdrop-blur-md border-t border-white/10 py-1.5 px-2 shadow-2xl">
      <div
        className="max-w-md mx-auto grid gap-1"
        style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-[#DAA520] font-bold bg-[#DAA520]/10 border border-[#DAA520]/20'
                  : 'text-[#8E9299] hover:text-gray-200'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-transform ${
                  isActive ? 'scale-110 text-[#DAA520] stroke-[2.2]' : 'stroke-2'
                }`}
              />
              <span className={`text-[10px] mt-0.5 truncate font-sans font-extrabold uppercase tracking-wider ${isActive ? 'text-[#DAA520]' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};


