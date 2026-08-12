import React, { useState } from 'react';
import { Scissors, ShieldCheck, Lock, Mail, ArrowLeft, KeyRound, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminLoginPage: React.FC = () => {
  const { loginAdmin, setActivePage, addToast } = useApp();

  const [email, setEmail] = useState('barbeariajadsonbarber@gmail.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      addToast('Por favor, informe o e-mail e a senha administrativa.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const success = await loginAdmin(email, password);
      if (success) {
        setActivePage('admin-agendamentos');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('barbeariajadsonbarber@gmail.com');
    setPassword('Barbearia25*');
    addToast('Credenciais mestre preenchidas.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#DAA520]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#111111] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6 animate-fadeIn">
        
        {/* Return to App Button */}
        <button
          onClick={() => setActivePage('agenda')}
          className="text-xs font-mono text-neutral-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Aplicativo do Cliente</span>
        </button>

        {/* Brand & Title */}
        <div className="text-center space-y-3 pt-2">
          <div className="w-16 h-16 rounded-2xl bg-[#DAA520] text-black font-extrabold flex items-center justify-center mx-auto shadow-xl shadow-[#DAA520]/25 border border-[#DAA520]/50">
            <Scissors className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div>
            <div className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#DAA520] flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Acesso Administrativo</span>
            </div>
            <h1 className="text-2xl font-black font-mono tracking-tight text-white mt-1">
              Jadson Barber
            </h1>
            <p className="text-xs text-neutral-400 font-sans mt-1">
              Painel de Gestão Integrado em Tempo Real
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#DAA520]" />
              E-mail Administrativo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="barbeariajadsonbarber@gmail.com"
              className="w-full bg-black/80 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#DAA520] transition-colors font-mono"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#DAA520]" />
              Senha de Acesso
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
              className="w-full bg-black/80 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#DAA520] transition-colors font-mono"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#DAA520]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 pt-3"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isLoading ? 'Autenticando...' : 'Entrar no Painel Admin'}</span>
          </button>
        </form>

        {/* Fill Credentials Quick Button */}
        <div className="pt-2 border-t border-neutral-800/80">
          <button
            type="button"
            onClick={handleFillDemo}
            className="w-full py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Preencher Credenciais Mestre</span>
          </button>
        </div>

        {/* Security Footer Note */}
        <div className="text-center text-[10px] text-neutral-500 font-mono uppercase tracking-wider">
          <p>Sincronizado com Firebase • Acesso restrito</p>
        </div>

      </div>

    </div>
  );
};
