import React, { useState, useRef } from 'react';
import { Scissors, Menu, LogIn, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { setIsSidebarOpen, isLoggedIn, setActivePage, isAdminLoggedIn, addToast } = useApp();

  const [tapCount, setTapCount] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleScissorsTap = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const nextCount = tapCount + 1;
    setTapCount(nextCount);

    if (nextCount === 5) {
      setTapCount(0);
      addToast('Modo de Acesso Administrativo ativado.', 'info');
      if (isAdminLoggedIn) {
        setActivePage('admin-dashboard');
      } else {
        setActivePage('admin-login');
      }
      return;
    }

    timerRef.current = setTimeout(() => {
      setTapCount(0);
    }, 1500);
  };

  return (
    <header className="sticky top-0 z-50 h-[72px] bg-[#000000]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 shadow-md transition-colors duration-200 relative overflow-hidden flex items-center">
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleScissorsTap}
            title="Barbearia Jadson Barber"
            className={`w-10 h-10 rounded-xl bg-[#DAA520] flex items-center justify-center text-black font-bold shadow-md shadow-[#DAA520]/25 shrink-0 cursor-pointer transition-all active:scale-90 ${
              tapCount > 0 ? 'scale-110 ring-2 ring-amber-300 animate-pulse' : ''
            }`}
          >
            <Scissors className={`w-5 h-5 stroke-[2.2] transition-transform ${tapCount > 0 ? 'rotate-45' : ''}`} />
          </button>

          <div 
            onClick={() => setActivePage('agenda')}
            className="flex flex-col cursor-pointer select-none"
          >
            <div className="flex justify-between w-full text-[9px] sm:text-[10px] text-[#8E9299] uppercase font-bold leading-none mb-0.5">
              <span>B</span><span>A</span><span>R</span><span>B</span><span>E</span><span>A</span><span>R</span><span>I</span><span>A</span>
            </div>
            <span className="text-base sm:text-lg font-black tracking-tight font-mono leading-tight flex items-center gap-1.5">
              <span className="text-[#DAA520]">JADSON</span>
              <span className="text-white">BARBER</span>
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {isAdminLoggedIn && (
            <button
              onClick={() => setActivePage('admin-dashboard')}
              className="py-1.5 px-3 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-400 font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-amber-500/30 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline-block">Painel Admin</span>
            </button>
          )}

          {isLoggedIn ? (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="py-2 px-3.5 rounded-lg bg-[#DAA520] hover:bg-[#c9951b] text-black font-extrabold transition-all active:scale-95 flex items-center gap-2 shadow-md shadow-[#DAA520]/15 text-xs uppercase tracking-wider cursor-pointer"
              aria-label="Abrir menu lateral"
            >
              <Menu className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline-block">Menu</span>
            </button>
          ) : (
            <button
              onClick={() => setActivePage('login')}
              className="py-1.5 px-2.5 rounded-lg bg-[#DAA520] hover:bg-[#c9951b] text-black font-extrabold transition-all active:scale-95 flex items-center gap-1.5 shadow-md shadow-[#DAA520]/15 text-[11px] uppercase tracking-wider cursor-pointer"
              aria-label="Entrar na conta"
            >
              <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Entrar</span>
            </button>
          )}
        </div>

      </div>

      {/* Animated Breathing Yellow Bottom Border */}
      <div 
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#DAA520]/20 via-[#DAA520] to-[#DAA520]/20 animate-header-breath pointer-events-none" 
      />
    </header>
  );
};
