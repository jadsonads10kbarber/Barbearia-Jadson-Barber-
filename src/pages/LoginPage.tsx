import React, { useState, useRef, useEffect } from 'react';
import {
  LogIn,
  UserPlus,
  Phone,
  Mail,
  Lock,
  User,
  Scissors,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  X,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginPage: React.FC = () => {
  const {
    login,
    registerUser,
    setActivePage,
    addToast,
    isAdminLoggedIn,
    requestPasswordReset,
    completePasswordReset,
    getActivePasswordReset,
    passwordResetRequests,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  // Password Reset Modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<'request' | 'complete'>('request');
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetCustomerName, setResetCustomerName] = useState('');
  const [resetTempCode, setResetTempCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetRequestedSuccess, setResetRequestedSuccess] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // 5 Taps gesture state
  const [tapCount, setTapCount] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if identifier has a generated temporary code
  useEffect(() => {
    if (loginEmailOrPhone.trim().length >= 4 && mode === 'login') {
      const active = getActivePasswordReset(loginEmailOrPhone);
      if (active && active.status === 'temp_code_generated') {
        setResetIdentifier(loginEmailOrPhone);
      }
    }
  }, [loginEmailOrPhone, mode, passwordResetRequests]);

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

    // Check if there is an active temporary code waiting for this user
    const activeReq = getActivePasswordReset(loginEmailOrPhone);
    if (activeReq && activeReq.status === 'temp_code_generated' && !loginPassword) {
      setResetIdentifier(loginEmailOrPhone);
      setForgotStep('complete');
      setIsForgotModalOpen(true);
      addToast('Identificamos uma senha temporária gerada. Insira o código de 6 dígitos.', 'info');
      return;
    }

    setIsLoading(true);
    try {
      await login(loginEmailOrPhone, loginPassword);
      setActivePage('agenda');
    } catch (err) {
      addToast('Falha ao realizar login. Verifique seus dados.', 'error');
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

  // Open Forgot Modal
  const handleOpenForgotModal = () => {
    setResetIdentifier(loginEmailOrPhone || '');
    setResetRequestedSuccess(false);
    setForgotStep('request');
    setIsForgotModalOpen(true);
  };

  // Submit Password Reset Request
  const handleForgotRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const idf = resetIdentifier.trim() || loginEmailOrPhone.trim();
    if (!idf) {
      addToast('Por favor, informe seu e-mail ou WhatsApp.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestPasswordReset(idf, resetCustomerName);
      if (res.success) {
        setResetRequestedSuccess(true);
      }
    } catch (err) {
      addToast('Erro ao enviar solicitação. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Complete Reset with 6-digit code
  const handleForgotCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const idf = resetIdentifier.trim() || loginEmailOrPhone.trim();
    if (!idf) {
      addToast('Por favor, informe seu e-mail ou WhatsApp.', 'error');
      return;
    }
    if (!resetTempCode.trim() || resetTempCode.trim().length < 4) {
      addToast('Informe a senha temporária de 6 dígitos recebida no WhatsApp.', 'error');
      return;
    }
    if (!resetNewPassword || resetNewPassword.length < 4) {
      addToast('A nova senha deve ter pelo menos 4 caracteres.', 'error');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      addToast('A confirmação de senha não coincide com a nova senha.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const success = await completePasswordReset(idf, resetTempCode, resetNewPassword);
      if (success) {
        setIsForgotModalOpen(false);
        setActivePage('agenda');
      }
    } catch (err) {
      addToast('Erro ao validar senha temporária. Verifique os dados.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto space-y-6 animate-fadeIn">
      
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
        <p className="text-xs text-neutral-400 font-sans max-w-xs mx-auto">
          Faça login ou crie sua conta para agendar seus horários
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="bg-[#111111] p-1 rounded-2xl border border-white/10 flex gap-1">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mode === 'login'
              ? 'bg-[#DAA520] text-black shadow-md shadow-[#DAA520]/20'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>Entrar</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('register')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mode === 'register'
              ? 'bg-[#DAA520] text-black shadow-md shadow-[#DAA520]/20'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Criar Conta</span>
        </button>
      </div>

      {/* Form Container */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
        
        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-sans flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#DAA520]" />
                E-mail ou Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={loginEmailOrPhone}
                onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                placeholder="Ex: (11) 99999-8888 ou seu@email.com"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-[#DAA520] transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-sans flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#DAA520]" />
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Sua senha de acesso"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-3 pr-10 text-sm text-white focus:outline-none focus:border-[#DAA520] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-[#DAA520]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Entrando...' : 'Entrar'}</span>
            </button>

            {/* SINGLE CLEAN "ESQUECI MINHA SENHA" BUTTON */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleOpenForgotModal}
                className="text-xs font-mono font-medium text-neutral-400 hover:text-[#DAA520] transition-colors inline-flex items-center gap-1.5 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-neutral-900/60 border border-transparent hover:border-neutral-800"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#DAA520]" />
                <span>Esqueci minha senha</span>
              </button>
            </div>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-sans flex items-center gap-1.5">
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
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-sans flex items-center gap-1.5">
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
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-sans flex items-center gap-1.5">
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
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 font-sans flex items-center gap-1">
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
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 font-sans flex items-center gap-1">
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
              className="w-full py-3 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-[#DAA520]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 pt-3"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isLoading ? 'Cadastrando...' : 'Cadastrar e Entrar'}</span>
            </button>
          </form>
        )}

      </div>

      {/* Security Footer Note */}
      <div className="text-center text-[11px] text-neutral-500 font-mono">
        <p>Barbearia Jadson Barber • Seus dados estão seguros</p>
      </div>

      {/* MODAL RECUPERAÇÃO DE SENHA (ESQUECI A SENHA) */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141414] border border-neutral-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-[#DAA520] flex items-center justify-center border border-amber-500/20">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">Recuperação de Senha</h3>
                  <p className="text-[11px] text-neutral-400">Redefina seu acesso com segurança</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Step Switcher */}
            <div className="p-4 bg-black/40 border-b border-neutral-800/80">
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-black rounded-xl border border-neutral-800 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setForgotStep('request')}
                  className={`py-2 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    forgotStep === 'request'
                      ? 'bg-[#DAA520] text-black shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1. Solicitar Código</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForgotStep('complete')}
                  className={`py-2 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    forgotStep === 'complete'
                      ? 'bg-[#DAA520] text-black shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>2. Já tenho o Código</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              {forgotStep === 'request' ? (
                !resetRequestedSuccess ? (
                  <form onSubmit={handleForgotRequestSubmit} className="space-y-4">
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Informe seu WhatsApp ou E-mail cadastrado. A barbearia gerará um <strong>código de 6 dígitos</strong> e enviará no seu WhatsApp.
                    </p>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-sans flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#DAA520]" />
                        WhatsApp ou E-mail
                      </label>
                      <input
                        type="text"
                        value={resetIdentifier}
                        onChange={(e) => setResetIdentifier(e.target.value)}
                        placeholder="Ex: (11) 99999-8888 ou seu@email.com"
                        className="w-full bg-black/70 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#DAA520] transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-sans flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#DAA520]" />
                        Seu Nome Completo (Opcional)
                      </label>
                      <input
                        type="text"
                        value={resetCustomerName}
                        onChange={(e) => setResetCustomerName(e.target.value)}
                        placeholder="Ex: Carlos Silva"
                        className="w-full bg-black/70 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#DAA520] transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#DAA520] to-amber-500 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md shadow-[#DAA520]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isLoading ? 'Enviando...' : 'Solicitar Código no WhatsApp'}</span>
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4 text-center py-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white font-mono">Solicitação Enviada!</h4>
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        A equipe da Barbearia Jadson Barber já foi notificada e enviará seu código de 6 dígitos no WhatsApp.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setForgotStep('complete')}
                      className="w-full py-3 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#DAA520]/20"
                    >
                      <span>Avançar para Inserir Código</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )
              ) : (
                <form onSubmit={handleForgotCompleteSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-sans flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#DAA520]" />
                      Seu WhatsApp ou E-mail
                    </label>
                    <input
                      type="text"
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      placeholder="Ex: (11) 99999-8888 ou seu@email.com"
                      className="w-full bg-black/70 border border-neutral-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#DAA520]"
                      required
                    />
                  </div>

                  <div className="space-y-1 bg-amber-950/20 p-2.5 rounded-xl border border-amber-500/30">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-amber-300 font-mono flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-[#DAA520]" />
                        Código de 6 Dígitos
                      </span>
                      <span className="text-[10px] text-neutral-400 font-sans">Recebido no WhatsApp</span>
                    </label>
                    <input
                      type="text"
                      maxLength={8}
                      value={resetTempCode}
                      onChange={(e) => setResetTempCode(e.target.value)}
                      placeholder="0 0 0 0 0 0"
                      className="w-full bg-black border border-amber-500/50 rounded-xl px-3.5 py-2 text-center text-base font-mono font-black text-amber-300 tracking-[0.3em] focus:outline-none focus:border-[#DAA520]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-sans flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#DAA520]" />
                        Nova Senha
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowResetPassword((p) => !p)}
                        className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {showResetPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showResetPassword ? 'Ocultar' : 'Mostrar'}</span>
                      </button>
                    </div>
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      className="w-full bg-black/70 border border-neutral-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#DAA520]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-sans flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#DAA520]" />
                      Confirmar Nova Senha
                    </label>
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                      className="w-full bg-black/70 border border-neutral-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#DAA520]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#DAA520]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isLoading ? 'Salvando...' : 'Salvar Nova Senha & Entrar'}</span>
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

