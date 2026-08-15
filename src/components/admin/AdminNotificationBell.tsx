import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Volume2,
  VolumeX,
  Volume1,
  CheckCheck,
  Trash2,
  Upload,
  Play,
  RotateCcw,
  X,
  Calendar,
  Star,
  Package,
  Info,
  Check,
  Music,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationSoundType } from '../../utils/audio';

interface AdminNotificationBellProps {
  align?: 'left' | 'right';
  className?: string;
}

export const AdminNotificationBell: React.FC<AdminNotificationBellProps> = ({
  align = 'right',
  className = '',
}) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearNotifications,
    isSoundMuted,
    toggleSoundMuted,
    soundVolume,
    setSoundVolume,
    soundType,
    setSoundType,
    customSoundName,
    uploadCustomSound,
    resetToDefaultSound,
    testNotificationSound,
    setActivePage,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifs' | 'sound'>('notifs');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleTestSound = () => {
    setIsPlayingPreview(true);
    testNotificationSound();
    setTimeout(() => {
      setIsPlayingPreview(false);
    }, 1200);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    await uploadCustomSound(file);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    markNotificationRead(notif.id);
    if (notif.type === 'agendamento') {
      setActivePage('admin-agendamentos');
      setIsOpen(false);
    } else if (notif.type === 'avaliacao') {
      setActivePage('admin-avaliacoes');
      setIsOpen(false);
    } else if (notif.type === 'estoque') {
      setActivePage('admin-estoque');
      setIsOpen(false);
    }
  };

  const soundOptions: { id: NotificationSoundType; label: string; desc: string; icon: string }[] = [
    {
      id: 'bell',
      label: 'Sino Dourado (Padrão)',
      desc: 'Toque harmônico e cristalino de balcão',
      icon: '🔔',
    },
    {
      id: 'cash',
      label: 'Caixa Registradora',
      desc: 'Som marcante de agendamento & venda',
      icon: '💰',
    },
    {
      id: 'chime',
      label: 'Chime Harmônico',
      desc: 'Escala ascendente suave e moderna',
      icon: '✨',
    },
    {
      id: 'marimba',
      label: 'Marimba Acústica',
      desc: 'Acorde orgânico e acolhedor',
      icon: '🎵',
    },
    {
      id: 'success',
      label: 'Triunfo Moderno',
      desc: 'Notificação digital refinada',
      icon: '🎯',
    },
    {
      id: 'custom',
      label: customSoundName ? `Arquivo: ${customSoundName}` : 'Áudio do Dispositivo',
      desc: customSoundName ? 'Arquivo personalizado carregado' : 'Carregue um arquivo .mp3 ou .wav do seu aparelho',
      icon: '📁',
    },
  ];

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
          isOpen
            ? 'bg-[#DAA520] text-black border-[#DAA520] shadow-lg shadow-[#DAA520]/20'
            : unreadCount > 0
            ? 'bg-neutral-900 border-amber-500/50 text-amber-400 hover:bg-neutral-800'
            : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800'
        }`}
        title="Central de Notificações e Sons"
        aria-label="Abrir Notificações"
      >
        <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'animate-pulse' : ''}`} />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-[#DAA520] text-black font-mono font-black text-[10px] flex items-center justify-center shadow-md animate-bounce">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Sound Muted Mini Indicator */}
        {isSoundMuted && (
          <span
            className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-neutral-950 border border-neutral-700 text-neutral-400 flex items-center justify-center"
            title="Sons Silenciados"
          >
            <VolumeX className="w-2.5 h-2.5 text-red-400" />
          </span>
        )}
      </button>

      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className={`fixed left-2 right-2 top-16 z-50 max-w-[calc(100vw-16px)] mx-auto sm:max-w-[420px] sm:w-[420px] sm:absolute ${
            align === 'right' ? 'sm:right-0 sm:left-auto' : 'sm:left-0 sm:right-auto'
          } sm:top-full sm:mt-2 bg-[#111111] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] sm:max-h-[600px] animate-fadeIn`}
          style={{ boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)' }}
        >
          {/* Panel Header */}
          <div className="p-3.5 sm:p-4 border-b border-neutral-800/80 bg-neutral-950 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#DAA520]/20 text-[#DAA520] border border-[#DAA520]/30 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black font-mono tracking-tight text-white uppercase flex items-center gap-1.5 flex-wrap">
                  <span className="truncate">Central de Alertas</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[#DAA520] text-[10px] font-bold shrink-0">
                      {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-neutral-400 font-mono truncate">
                  Sons em tempo real & Agendamentos
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={toggleSoundMuted}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isSoundMuted
                    ? 'bg-red-950/40 border-red-800/40 text-red-400 hover:bg-red-900/60'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white'
                }`}
                title={isSoundMuted ? 'Ativar Sons' : 'Silenciar Sons'}
              >
                {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-neutral-800 bg-neutral-900/50 p-1.5 gap-1.5 shrink-0">
            <button
              onClick={() => setActiveTab('notifs')}
              className={`flex-1 py-2 px-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                activeTab === 'notifs'
                  ? 'bg-neutral-800 text-[#DAA520] shadow-sm font-black'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
              }`}
            >
              <Bell className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Notificações</span>
              {unreadCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#DAA520] animate-ping shrink-0" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('sound')}
              className={`flex-1 py-2 px-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                activeTab === 'sound'
                  ? 'bg-neutral-800 text-[#DAA520] shadow-sm font-black'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Controle de Som</span>
              {isSoundMuted && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-red-950 text-red-400 font-mono shrink-0">
                  MUDO
                </span>
              )}
            </button>
          </div>

          {/* Tab 1: Notifications List */}
          {activeTab === 'notifs' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Actions Bar */}
              {notifications.length > 0 && (
                <div className="px-3.5 py-2 bg-neutral-950/60 border-b border-neutral-800/60 flex items-center justify-between text-xs shrink-0">
                  <span className="text-neutral-400 font-mono text-[11px]">
                    Total: {notifications.length} registros
                  </span>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Marcar lidas</span>
                      </button>
                    )}
                    <button
                      onClick={clearNotifications}
                      className="text-[11px] text-neutral-500 hover:text-red-400 font-mono flex items-center gap-1 cursor-pointer transition-colors ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Limpar</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2.5 max-h-[50vh] sm:max-h-[380px]">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center space-y-3 px-4">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-600 flex items-center justify-center mx-auto">
                      <Bell className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-neutral-400 font-mono">
                      Nenhuma notificação por aqui
                    </div>
                    <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                      Quando novos agendamentos forem realizados, você receberá um alerta visual e sonoro instantâneo.
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const isUnread = !notif.read;
                    let IconComponent = Info;
                    let iconColor = 'text-blue-400 bg-blue-950/40 border-blue-800/40';

                    if (notif.type === 'agendamento') {
                      IconComponent = Calendar;
                      iconColor = 'text-[#DAA520] bg-amber-950/50 border-amber-500/40';
                    } else if (notif.type === 'avaliacao') {
                      IconComponent = Star;
                      iconColor = 'text-yellow-400 bg-yellow-950/40 border-yellow-800/40';
                    } else if (notif.type === 'estoque') {
                      IconComponent = Package;
                      iconColor = 'text-red-400 bg-red-950/40 border-red-800/40';
                    }

                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`group relative p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer w-full min-w-0 ${
                          isUnread
                            ? 'bg-amber-950/25 border-amber-500/40 hover:bg-amber-950/35 shadow-sm'
                            : 'bg-neutral-900/40 border-neutral-800/70 hover:bg-neutral-800/40 text-neutral-400'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                          {/* Type Icon */}
                          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-sm ${iconColor}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 pr-7 text-left">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className={`text-xs font-mono tracking-tight truncate ${
                                  isUnread ? 'text-white font-black' : 'text-neutral-300 font-bold'
                                }`}
                              >
                                {notif.title}
                              </span>
                              {isUnread && (
                                <span className="inline-block w-2 h-2 rounded-full bg-[#DAA520] shrink-0 animate-pulse" />
                              )}
                            </div>

                            <p
                              className={`text-[11px] sm:text-xs mt-1 leading-relaxed text-left break-words ${
                                isUnread ? 'text-neutral-200' : 'text-neutral-400'
                              }`}
                            >
                              {notif.message}
                            </p>

                            <div className="flex items-center justify-between gap-1.5 mt-2.5 pt-2 border-t border-neutral-800/50 text-[10px] text-neutral-500 font-mono flex-wrap">
                              <span className="shrink-0">{notif.date}</span>
                              {notif.type === 'agendamento' && (
                                <span className="text-[#DAA520] font-bold flex items-center gap-1 hover:underline">
                                  <span>Ver na Agenda</span>
                                  <ExternalLink className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Delete individual button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notif.id);
                            }}
                            className="absolute top-2.5 right-2.5 p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                            title="Remover notificação"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Sound & Alert Controls */}
          {activeTab === 'sound' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[440px]">
              {/* Quick Status Box */}
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      isSoundMuted
                        ? 'bg-red-950/40 border-red-800/40 text-red-400'
                        : 'bg-[#DAA520]/20 border-[#DAA520]/30 text-[#DAA520]'
                    }`}
                  >
                    {isSoundMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white font-mono uppercase">
                      {isSoundMuted ? 'Áudio Silenciado' : 'Efeito Sonoro Ativo'}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-sans">
                      {isSoundMuted
                        ? 'Notificações visuais continuam funcionando'
                        : 'Toca ao receber novo agendamento'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={toggleSoundMuted}
                  className={`py-1.5 px-3 rounded-xl font-mono text-xs font-bold border transition-colors cursor-pointer ${
                    isSoundMuted
                      ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/60'
                      : 'bg-red-950/40 border-red-800/50 text-red-400 hover:bg-red-900/60'
                  }`}
                >
                  {isSoundMuted ? 'Ativar Som' : 'Silenciar'}
                </button>
              </div>

              {/* Volume Slider */}
              <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white font-mono uppercase flex items-center gap-2">
                    {soundVolume === 0 || isSoundMuted ? (
                      <VolumeX className="w-4 h-4 text-red-400" />
                    ) : soundVolume < 50 ? (
                      <Volume1 className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-[#DAA520]" />
                    )}
                    <span>Volume do Alerta</span>
                  </label>
                  <span className="text-xs font-mono font-black text-[#DAA520]">
                    {isSoundMuted ? 'Mudo (0%)' : `${soundVolume}%`}
                  </span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={soundVolume}
                  onChange={(e) => setSoundVolume(Number(e.target.value))}
                  disabled={isSoundMuted}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#DAA520] disabled:opacity-40"
                />

                <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                  <span>0% (Silencioso)</span>
                  <span>50%</span>
                  <span>100% (Máximo)</span>
                </div>
              </div>

              {/* Sound Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white font-mono uppercase flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-[#DAA520]" />
                    <span>Selecione o Som de Notificação</span>
                  </label>
                  {soundType === 'custom' && (
                    <button
                      onClick={resetToDefaultSound}
                      className="text-[10px] text-neutral-400 hover:text-amber-400 font-mono flex items-center gap-1 cursor-pointer transition-colors"
                      title="Voltar ao som padrão de sino"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restaurar Padrão
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {soundOptions.map((opt) => {
                    const isSelected = soundType === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setSoundType(opt.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#DAA520]/15 border-[#DAA520] shadow-sm'
                            : 'bg-neutral-900/50 border-neutral-800 hover:bg-neutral-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xl shrink-0">{opt.icon}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold font-mono text-white flex items-center gap-2">
                              <span className="truncate">{opt.label}</span>
                              {opt.id === 'bell' && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-[#DAA520] font-mono shrink-0">
                                  Padrão
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-400 truncate">{opt.desc}</p>
                          </div>
                        </div>

                        <div className="shrink-0 ml-2">
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-[#DAA520] text-black flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-neutral-700" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upload Custom Sound from Device */}
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white font-mono uppercase flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-[#DAA520]" />
                    <span>Áudio do Dispositivo</span>
                  </div>
                  {customSoundName && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-800/30">
                      Salvo no Dispositivo
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Escolha qualquer arquivo de áudio (.mp3, .wav, .ogg, .m4a) do seu smartphone ou computador para usar como alarme de novos agendamentos.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="admin-device-sound-upload"
                />

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex-1 py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-mono text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#DAA520]" />
                    <span>{isUploading ? 'Carregando...' : 'Buscar Som no Dispositivo'}</span>
                  </button>

                  {customSoundName && (
                    <button
                      onClick={resetToDefaultSound}
                      className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Remover som customizado e voltar ao padrão"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Test Sound Button */}
              <div className="pt-2">
                <button
                  onClick={handleTestSound}
                  disabled={isPlayingPreview}
                  className="w-full py-3 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c4951d] text-black font-mono text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#DAA520]/20 cursor-pointer disabled:opacity-60"
                >
                  <Play className={`w-4 h-4 fill-current ${isPlayingPreview ? 'animate-spin' : ''}`} />
                  <span>
                    {isPlayingPreview ? 'Reproduzindo Efeito Sonoro...' : 'Testar Som de Notificação'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Panel Footer */}
          <div className="p-3 border-t border-neutral-800/80 bg-neutral-950 text-center">
            <div className="text-[10px] font-mono text-neutral-500 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Monitoramento em tempo real ativo (Firestore Sync)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
