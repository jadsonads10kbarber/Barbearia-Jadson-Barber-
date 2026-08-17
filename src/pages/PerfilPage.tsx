import React, { useState, useRef } from 'react';
import {
  User,
  Phone,
  Mail,
  CalendarCheck,
  LogOut,
  Edit2,
  Check,
  ShieldCheck,
  Award,
  Sparkles,
  Scissors,
  Camera,
  Trash2,
  Upload,
  KeyRound,
  Copy,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PerfilPage: React.FC = () => {
  const { currentUser, logout, updateProfile, appointments, setActivePage, addToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    if (!currentUser?.accessCode) return;
    navigator.clipboard.writeText(currentUser.accessCode);
    setCopiedCode(true);
    addToast('Código de Acesso copiado!', 'success');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, phone, email });
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Por favor, selecione um arquivo de imagem válido.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL('image/jpeg', 0.85);
          updateProfile({ avatar: base64 });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Reset input value so re-selecting same file triggers onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    updateProfile({ avatar: '' });
  };

  if (!currentUser) {
    return (
      <div className="min-h-[calc(100dvh-132px)] py-8 px-4 max-w-md mx-auto flex flex-col justify-center items-center text-center space-y-5 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-[#DAA520]/15 border border-[#DAA520]/40 flex items-center justify-center text-[#DAA520] shadow-lg shadow-[#DAA520]/10">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-white font-sans">Acesse o seu Perfil</h2>
          <p className="text-xs text-gray-400 max-w-xs">
            Entre na sua conta ou faça seu cadastro para visualizar seus dados, cupons e histórico de agendamentos.
          </p>
        </div>
        <button
          onClick={() => setActivePage('login')}
          className="w-full py-3.5 px-5 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#DAA520]/20 cursor-pointer"
        >
          Entrar ou Criar Conta
        </button>
      </div>
    );
  }

  const myAppointments = appointments.filter((app) => app.customerName === currentUser?.name || app.customerPhone === currentUser?.phone);
  const totalAgendados = myAppointments.filter((app) => app.status === 'Agendado' || app.status === 'Confirmado').length;
  const totalConcluidos = myAppointments.filter((app) => app.status === 'Concluído').length;

  return (
    <div className="min-h-[calc(100dvh-132px)] py-4 pb-20 px-4 max-w-md mx-auto flex flex-col justify-between space-y-4 animate-fadeIn">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
      
      {/* Title */}
      <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white font-mono flex items-center gap-2">
            <User className="w-5 h-5 text-[#DAA520]" />
            Meu Perfil
          </h1>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Gerencie suas informações pessoais e sua conta JADSON BARBER
          </p>
        </div>

        <button
          onClick={logout}
          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Sair da Conta"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>

      {/* User Card */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden space-y-4">
        {/* Decorative Gold Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#DAA520]/5 rounded-full blur-2xl pointer-events-none" />

        {/* Profile Header with Avatar Upload */}
        <div className="flex items-center gap-4">
          <div className="relative group shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-2xl bg-[#DAA520] text-black font-black text-xl flex items-center justify-center shadow-lg shadow-[#DAA520]/25 shrink-0 border border-[#DAA520]/40 overflow-hidden cursor-pointer relative group transition-transform active:scale-95"
              title="Clique para alterar sua foto de perfil"
            >
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <span>{currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}</span>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[9px] font-bold gap-0.5">
                <Camera className="w-4 h-4 text-[#DAA520]" />
                <span>Alterar</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#DAA520] text-black flex items-center justify-center shadow-md hover:bg-[#c9951b] transition-all cursor-pointer border border-neutral-900"
              title="Carregar foto do dispositivo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-mono truncate">{currentUser?.name}</h2>
              <span className="bg-[#DAA520]/20 text-[#DAA520] border border-[#DAA520]/30 text-[9px] font-extrabold font-mono px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 fill-[#DAA520] text-[#DAA520]" />
                VIP
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{currentUser?.email}</p>
            <p className="text-[11px] text-[#DAA520] font-mono mt-0.5">{currentUser?.phone}</p>
          </div>
        </div>

        {/* Action Buttons for Avatar */}
        <div className="flex items-center gap-2 pt-1 border-t border-neutral-800/80">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-1.5 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-gray-300 hover:text-white font-mono text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#DAA520]" />
            <span>Carregar Foto do Dispositivo</span>
          </button>
          {currentUser?.avatar && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="py-1.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Remover Foto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Remover</span>
            </button>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-neutral-800">
          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#DAA520]/10 text-[#DAA520] flex items-center justify-center shrink-0 border border-[#DAA520]/20">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-lg font-black text-white font-mono leading-tight block">{totalAgendados}</span>
              <span className="text-[10px] text-gray-400 uppercase font-sans font-bold">Ativos</span>
            </div>
          </div>

          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-lg font-black text-white font-mono leading-tight block">{totalConcluidos}</span>
              <span className="text-[10px] text-gray-400 uppercase font-sans font-bold">Concluídos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form or Info Card */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
          <h3 className="text-xs font-bold text-[#DAA520] uppercase tracking-widest font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Dados Pessoais
          </h3>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-[#DAA520] hover:text-[#c9951b] font-bold flex items-center gap-1 font-mono cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-300 uppercase font-sans flex items-center gap-1.5">
                <User className="w-3 h-3 text-[#DAA520]" />
                Nome Completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DAA520]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-300 uppercase font-sans flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-[#DAA520]" />
                Telefone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DAA520]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-300 uppercase font-sans flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-[#DAA520]" />
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DAA520]"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2 px-3 rounded-xl bg-neutral-800 text-gray-300 text-xs font-bold uppercase cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-3 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-extrabold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 text-xs text-gray-300 font-sans">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
              <span className="text-gray-400 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-[#DAA520]" />
                Nome:
              </span>
              <span className="font-bold text-white">{currentUser?.name}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
              <span className="text-gray-400 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#DAA520]" />
                Telefone:
              </span>
              <span className="font-bold text-white">{currentUser?.phone}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
              <span className="text-gray-400 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#DAA520]" />
                E-mail:
              </span>
              <span className="font-bold text-white">{currentUser?.email}</span>
            </div>

            {currentUser?.accessCode && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-950/20 border border-[#DAA520]/30">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-[#DAA520]" />
                  <div>
                    <span className="text-[10px] text-[#DAA520] font-mono uppercase tracking-wider block font-bold">
                      Código de Acesso
                    </span>
                    <span className="text-sm font-mono font-black text-amber-300 tracking-wider">
                      {currentUser.accessCode}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="py-1 px-2.5 rounded-lg bg-[#DAA520]/20 hover:bg-[#DAA520]/30 text-[#DAA520] border border-[#DAA520]/40 text-[10px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Copiar código de acesso"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Shortcuts */}
      <div className="space-y-2">
        <button
          onClick={() => setActivePage('meus-agendamentos')}
          className="w-full p-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-mono text-xs font-bold uppercase flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <CalendarCheck className="w-4 h-4 text-[#DAA520]" />
            <span>Ver Meus Agendamentos</span>
          </div>
          <span className="text-[#DAA520]">→</span>
        </button>

        <button
          onClick={() => setActivePage('agenda')}
          className="w-full p-3.5 rounded-2xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono text-xs font-extrabold uppercase flex items-center justify-between shadow-lg shadow-[#DAA520]/15 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Scissors className="w-4 h-4 stroke-[2.5]" />
            <span>Fazer Novo Agendamento</span>
          </div>
          <span>+</span>
        </button>
      </div>

      {/* Logout button bottom */}
      <button
        onClick={logout}
        className="w-full py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Sair da Conta JADSON BARBER</span>
      </button>

    </div>
  );
};

