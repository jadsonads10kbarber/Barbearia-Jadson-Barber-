import React from 'react';
import { Calendar, CalendarCheck, Newspaper, Store, User } from 'lucide-react';
import { useApp, ActivePage } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activePage, setActivePage, isLoggedIn } = useApp();

  const navItems = [
    { id: 'agenda' as ActivePage, label: 'Agenda', icon: Calendar },
    { id: 'meus-agendamentos' as ActivePage, label: 'Histórico', icon: CalendarCheck },
    { id: 'feed' as ActivePage, label: 'Feed', icon: Newspaper },
    { id: 'barbearia' as ActivePage, label: 'Barbearia', icon: Store },
    ...(isLoggedIn ? [{ id: 'perfil' as ActivePage, label: 'Perfil', icon: User }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#000000]/95 backdrop-blur-md border-t border-white/10 py-1.5 px-2 shadow-2xl">
      <div className={`max-w-md mx-auto grid ${isLoggedIn ? 'grid-cols-5' : 'grid-cols-4'} gap-1`}>
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

