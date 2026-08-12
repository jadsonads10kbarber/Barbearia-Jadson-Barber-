import React, { useState, useRef } from 'react';
import { LogIn, UserPlus, Phone, Mail, Lock, User, Scissors, KeyRound, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginPage: React.FC = () => {
  const { login, registerUser, setActivePage, addToast, isAdminLoggedIn } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  // 5 Taps gesture state
  const [tapCount, setTapCount] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleScissorsTap = () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const nextCount = tapCount + 1;
    setTapCount(nextCount);

    if (nextCount === 5) {
      setTapCount(0);
      addToast('Acesso Administrativo Solicitado.', 'info');
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmailOrPhone.trim()) {
      addToast('Por favor, informe seu e-mail ou telefone.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await login(loginEmailOrPhone, loginPassword);
      setActivePage('agenda');
    } catch (err) {
      addToast('Falha ao realizar login. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName.trim()) {
      addToast('Por favor, informe seu nome completo.', 'error');
      return;
    }
    if (!registerPhone.trim()) {
      addToast('Por favor, informe seu telefone.', 'error');
      return;
    }
    if (!registerEmail.trim()) {
      addToast('Por favor, informe seu e-mail.', 'error');
      return;
    }
    if (registerPassword && registerPassword !== registerConfirmPassword) {
      addToast('As senhas não coincidem.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await registerUser(registerName, registerPhone, registerEmail, registerPassword);
      setActivePage('agenda');
    } catch (err) {
      addToast('Falha ao criar conta. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    try {
      await login('cliente.vip@jadsonbarber.com.br', '123456');
      setActivePage('agenda');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-6 animate-fadeIn">
      
      {/* Brand Header */}
      <div className="text-center space-y-2 pt-2">
        <button
          type="button"
          onClick={handleScissorsTap}
          title="Acesso Administrativo Secreto (5 toques)"
          className={`w-14 h-14 rounded-2xl bg-[#DAA520] text-black font-extrabold flex items-center justify-center mx-auto shadow-xl shadow-[#DAA520]/20 border border-[#DAA520]/40 transition-all cursor-pointer ${
            tapCount > 0 ? 'scale-110 ring-2 ring-amber-300 animate-pulse' : ''
          }`}
        >
          <Scissors className={`w-7 h-7 stroke-[2.2] transition-transform ${tapCount > 0 ? 'rotate-45' : ''}`} />
        </button>

        <h1 className="text-2xl font-black font-mono tracking-tight flex items-center justify-center gap-1.5">
          <span className="text-[#DAA520]">JADSON</span>
          <span className="text-white">BARBER</span>
        </h1>
        <p className="text-xs text-gray-400 font-sans max-w-xs mx-auto">
          Faça login ou cadastre-se para confirmar seus agendamentos e acessar vantagens exclusivas
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="bg-[#111111] p-1 rounded-2xl border border-white/10 flex gap-1">
        <button
          onClick={() => setMode('login')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mode === 'login'
              ? 'bg-[#DAA520] text-black shadow-md shadow-[#DAA520]/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>Entrar</span>
        </button>

        <button
          onClick={() => setMode('register')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mode === 'register'
              ? 'bg-[#DAA520] text-black shadow-md shadow-[#DAA520]/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Criar Conta</span>
        </button>
      </div>

      {/* Form Container */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
        
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300 font-sans flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#DAA520]" />
                E-mail ou Telefone
              </label>
              <input
                type="text"
                value={loginEmailOrPhone}
                onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                placeholder="Ex: cliente@email.com ou (11) 99999-8888"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-[#DAA520] transition-colors"
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 font-sans flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#DAA520]" />
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => addToast('Instruções de redefinição enviadas para seu contato.', 'info')}
                  className="text-[11px] text-[#DAA520] hover:underline"
                >
                  Esqueceu?
                </button>
              </div>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Sua senha secreta"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-[#DAA520] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#DAA520]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Entrando...' : 'Entrar na Conta'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300 font-sans flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#DAA520]" />
                Nome Completo
              </label>
              <input
                type="text"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                placeholder="Ex: Carlos Oliveira"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#DAA520] transition-colors"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300 font-sans flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#DAA520]" />
                Telefone / WhatsApp
              </label>
              <input
                type="tel"
                value={registerPhone}
                onChange={(e) => setRegisterPhone(e.target.value)}
                placeholder="(11) 99999-8888"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#DAA520] transition-colors"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300 font-sans flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#DAA520]" />
                E-mail
              </label>
              <input
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                placeholder="carlos@exemplo.com"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#DAA520] transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-300 font-sans flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#DAA520]" />
                  Senha
                </label>
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="******"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DAA520]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-300 font-sans flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-[#DAA520]" />
                  Confirmar
                </label>
                <input
                  type="password"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  placeholder="******"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DAA520]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-[#DAA520]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 pt-3"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isLoading ? 'Cadastrando...' : 'Cadastrar e Entrar'}</span>
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-3 text-[10px] uppercase font-mono text-gray-500">ou acesso rápido</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {/* Quick Demo Login */}
        <button
          type="button"
          onClick={handleQuickDemoLogin}
          className="w-full py-3 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Entrar como Cliente VIP (Teste)</span>
        </button>

      </div>

      {/* Security Footer Note */}
      <div className="text-center text-[10px] text-gray-500 font-mono uppercase tracking-wider">
        <p>Barbearia Jadson Barber • Seus dados estão protegidos</p>
      </div>

    </div>
  );
};
