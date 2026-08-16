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
  ArrowRight,
  Copy,
  Check,
  QrCode,
  AlertCircle,
  HelpCircle,
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
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Post-Registration Success Modal with 3-digit + 1-letter code
  const [newlyCreatedCode, setNewlyCreatedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

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

  // 5 Taps gesture state on scissors for Admin Access
  const [tapCount, setTapCount] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if identifier has a generated temporary code
  useEffect(() => {
    if (loginIdentifier.trim().length >= 3 && mode === 'login') {
      const active = getActivePasswordReset(loginIdentifier);
      if (active && active.status === 'temp_code_generated') {
        setResetIdentifier(loginIdentifier);
      }
    }
  }, [loginIdentifier, mode, passwordResetRequests]);

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
    const cleanId = loginIdentifier.trim();
    if (!cleanId) {
      addToast('Por favor, informe seu Código de Acesso, WhatsApp ou E-mail.', 'error');
      return;
    }

    // Check if there is an active temporary code waiting for this user
    const activeReq = getActivePasswordReset(cleanId);
    if (activeReq && activeReq.status === 'temp_code_generated' && !loginPassword) {
      setResetIdentifier(cleanId);
      setForgotStep('complete');
      setIsForgotModalOpen(true);
      addToast('Identificamos uma redefinição ativa. Insira o código recebido no WhatsApp.', 'info');
      return;
    }

    setIsLoading(true);
    try {
      await login(cleanId, loginPassword);
      setActivePage('agenda');
    } catch (err: any) {
      // Error message is already toasted in login()
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = registerName.trim();
    const phone = registerPhone.trim();
    const email = registerEmail.trim();
    const pass = registerPassword.trim();
    const confPass = registerConfirmPassword.trim();

    if (!name) {
      addToast('Por favor, informe seu nome completo.', 'error');
      return;
    }
    if (!phone) {
      addToast('Por favor, informe seu número de WhatsApp.', 'error');
      return;
    }
    if (!email) {
      addToast('Por favor, informe seu e-mail.', 'error');
      return;
    }
    if (pass && pass !== confPass) {
      addToast('As senhas digitadas não coincidem.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerUser(name, phone, email, pass);
      if (res.success && res.accessCode) {
        setNewlyCreatedCode(res.accessCode);
      } else {
        setActivePage('agenda');
      }
    } catch (err: any) {
      // Error toasted in registerUser()
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!newlyCreatedCode) return;
    navigator.clipboard.writeText(newlyCreatedCode);
    setCopiedCode(true);
    addToast('Código copiado para a área de transferência!', 'success');
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleCloseCelebration = () => {
    setNewlyCreatedCode(null);
    setActivePage('agenda');
  };

  // Open Forgot Modal
  const handleOpenForgotModal = () => {
    setResetIdentifier(loginIdentifier || '');
    setResetRequestedSuccess(false);
    setForgotStep('request');
    setIsForgotModalOpen(true);
  };

  // Submit Password Reset Request
  const handleForgotRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const idf = resetIdentifier.trim() || loginIdentifier.trim();
    if (!idf) {
      addToast('Por favor, informe seu Código, WhatsApp ou E-mail.', 'error');
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
    const idf = resetIdentifier.trim() || loginIdentifier.trim();
    if (!idf) {
      addToast('Por favor, informe seu número de WhatsApp.', 'error');
      return;
    }
    if (!resetTempCode.trim() || resetTempCode.trim().length < 4) {
      addToast('Informe o código de 6 dígitos recebido no WhatsApp.', 'error');
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
    <div id="client-login-page" className="pb-24 pt-6 px-4 max-w-md mx-auto space-y-6 animate-fadeIn">
      
      {/* Brand Header */}
      <div className="text-center space-y-2 pt-2">
        <button
          id="btn-scissors-secret-tap"
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
          Faça login ou cadastre-se para agendar seus serviços exclusivos
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="bg-[#111111] p-1 rounded-2xl border border-white/10 flex gap-1">
        <button
          id="tab-mode-login"
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
          id="tab-mode-register"
          type="button"
          onClick={() => setMode('register')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mode === 'register'
              ? 'bg-[#DAA520] text-black shadow-md shadow-[#DAA520]/20'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar-se</span>
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
        
        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form id="form-client-login" onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-sans flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#DAA520]" />
                Código de Acesso, WhatsApp ou E-mail
              </label>
              <input
                id="input-login-identifier"
                type="text"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="Ex: 123A (ou 123a), (11) 99999-8888 ou seu e-mail"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-[#DAA520] transition-colors"
                required
              />
              <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-sans pt-0.5">
                <Sparkles className="w-3 h-3 text-[#DAA520] shrink-0" />
                <span>O código (3 dígitos e 1 letra) aceita maiúsculas ou minúsculas.</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-sans flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#DAA520]" />
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Ocultar' : 'Mostrar'}</span>
                </button>
              </div>
              <input
                id="input-login-password"
                type={showPassword ? 'text' : 'password'}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Sua senha cadastrada"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-[#DAA520] transition-colors"
              />
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-[#DAA520]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Entrando...' : 'Acessar Conta'}</span>
            </button>

            {/* ESQUECI MINHA SENHA */}
            <div className="pt-2 text-center">
              <button
                id="btn-forgot-password-modal"
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
          <form id="form-client-register" onSubmit={handleRegisterSubmit} className="space-y-3.5">
            
            {/* Uniqueness Info Banner */}
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200/90 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cadastro Único & Código Exclusivo</span>
              </div>
              <p className="text-[11px] leading-relaxed text-neutral-300">
                Cada telefone e e-mail só pode ser cadastrado uma única vez. Ao concluir, você receberá um <strong>Código de Acesso de 3 dígitos e 1 letra</strong> (ex: 123A).
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-sans flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#DAA520]" />
                Nome Completo
              </label>
              <input
                id="input-register-name"
                type="text"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                placeholder="Ex: Carlos Silva"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#DAA520] transition-colors"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-sans flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#DAA520]" />
                  Telefone / WhatsApp
                </span>
                <span className="text-[10px] text-amber-400 font-mono">Sem duplicação</span>
              </label>
              <input
                id="input-register-phone"
                type="tel"
                value={registerPhone}
                onChange={(e) => setRegisterPhone(e.target.value)}
                placeholder="(11) 99999-8888"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#DAA520] transition-colors"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-sans flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#DAA520]" />
                  E-mail
                </span>
                <span className="text-[10px] text-amber-400 font-mono">Sem duplicação</span>
              </label>
              <input
                id="input-register-email"
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#DAA520] transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 font-sans flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#DAA520]" />
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword((p) => !p)}
                    className="text-[10px] text-neutral-400 hover:text-white"
                  >
                    {showRegisterPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
                <input
                  id="input-register-password"
                  type={showRegisterPassword ? 'text' : 'password'}
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
                  id="input-register-confirm-password"
                  type={showRegisterPassword ? 'text' : 'password'}
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  placeholder="******"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DAA520]"
                />
              </div>
            </div>

            <button
              id="btn-register-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-[#DAA520]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 pt-3"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isLoading ? 'Cadastrando...' : 'Criar Minha Conta & Gerar Código'}</span>
            </button>
          </form>
        )}

      </div>

      {/* Security Footer Note */}
      <div className="text-center text-[11px] text-neutral-500 font-mono">
        <p>Barbearia Jadson Barber • Ambiente Seguro & Exclusivo</p>
      </div>

      {/* CELEBRATION MODAL: POST-REGISTRATION UNIQUE CODE */}
      {newlyCreatedCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#141414] border-2 border-[#DAA520] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scaleUp p-6 text-center space-y-5">
            
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-[#DAA520]/40 text-[#DAA520] flex items-center justify-center mx-auto shadow-lg shadow-[#DAA520]/20">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black font-mono text-white">
                🎉 Cadastro Realizado com Sucesso!
              </h2>
              <p className="text-xs text-neutral-300">
                Seu cadastro único foi concluído. Guarde seu Código de Acesso:
              </p>
            </div>

            {/* Access Code Big Box */}
            <div className="bg-black/80 border-2 border-dashed border-[#DAA520] rounded-2xl p-4 space-y-2">
              <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                Seu Código de Acesso Exclusivo
              </span>
              <div className="text-3xl font-black font-mono tracking-[0.25em] text-[#DAA520]">
                {newlyCreatedCode}
              </div>
              <p className="text-[11px] text-neutral-400">
                (3 dígitos e 1 letra — você pode digitar maiúsculo ou minúsculo: <span className="text-white font-mono">{newlyCreatedCode.toLowerCase()}</span> ou <span className="text-white font-mono">{newlyCreatedCode}</span>)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex-1 py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-neutral-700"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#DAA520]" />}
                <span>{copiedCode ? 'Código Copiado!' : 'Copiar Código'}</span>
              </button>
            </div>

            <div className="bg-neutral-900/60 p-3 rounded-xl text-left text-[11px] text-neutral-300 space-y-1 border border-neutral-800">
              <p className="font-semibold text-white flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Como acessar no futuro:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-neutral-400 pl-1">
                <li>Digite seu código ({newlyCreatedCode}) + sua senha.</li>
                <li>Ou use seu WhatsApp / E-mail + sua senha.</li>
              </ul>
            </div>

            <button
              id="btn-enter-app-after-register"
              type="button"
              onClick={handleCloseCelebration}
              className="w-full py-3.5 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-[#DAA520]/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Acessar o Aplicativo Agora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
                      Informe seu <strong>Código de Acesso, WhatsApp ou E-mail</strong>. A equipe da barbearia gerará um <strong>código temporário de 6 dígitos</strong> e enviará para você.
                    </p>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-sans flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-[#DAA520]" />
                        Seu Código, WhatsApp ou E-mail
                      </label>
                      <input
                        type="text"
                        value={resetIdentifier}
                        onChange={(e) => setResetIdentifier(e.target.value)}
                        placeholder="Ex: 123A ou (11) 99999-8888"
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
                      <span>{isLoading ? 'Enviando...' : 'Solicitar Código de Redefinição'}</span>
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
                        A equipe da Barbearia Jadson Barber já foi notificada e enviará seu código de 6 dígitos diretamente no seu WhatsApp.
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
                      <KeyRound className="w-3.5 h-3.5 text-[#DAA520]" />
                      Seu Código, WhatsApp ou E-mail
                    </label>
                    <input
                      type="text"
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      placeholder="Ex: 123A ou (11) 99999-8888"
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
                      <span className="text-[10px] text-neutral-400 font-sans">Recebido</span>
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
