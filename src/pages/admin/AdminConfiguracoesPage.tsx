import React, { useState, useRef, useEffect } from 'react';
import {
  Settings,
  Save,
  MapPin,
  Phone,
  Instagram,
  QrCode,
  Database,
  CheckCircle2,
  ExternalLink,
  Search,
  Navigation,
  Bell,
  Volume2,
  VolumeX,
  Volume1,
  Upload,
  Play,
  RotateCcw,
  Music,
  Check,
  Calendar,
  CalendarCheck,
  Store,
  TicketPercent,
  Scissors,
  Users,
  Star,
  Newspaper,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  Sliders,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { NotificationSoundType } from '../../utils/audio';
import { ClientAppModulesConfig } from '../../types';
import { defaultClientModules } from '../../data/initialData';

export const AdminConfiguracoesPage: React.FC = () => {
  const {
    barbershopInfo,
    updateSettings,
    addToast,
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
  } = useApp();

  const [name, setName] = useState(barbershopInfo.name || 'Barbearia Jadson Barber');
  const [cep, setCep] = useState(barbershopInfo.cep || '44086-402');
  const [address, setAddress] = useState(barbershopInfo.address || 'Rua Curitiba, 401 - Parque Ipê');
  const [neighborhood, setNeighborhood] = useState(barbershopInfo.neighborhood || 'Parque Ipê');
  const [city, setCity] = useState(barbershopInfo.city || 'Feira de Santana - BA');
  const [phone, setPhone] = useState(barbershopInfo.phone || '75 983137171');
  const [instagram, setInstagram] = useState(barbershopInfo.instagram || '@jadsonbarberbarbearia');
  const [pixKey, setPixKey] = useState(barbershopInfo.pixKey || '75983137171');
  const [loadingCep, setLoadingCep] = useState(false);
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [isUploadingSound, setIsUploadingSound] = useState(false);

  // Client Modules State
  const [clientModules, setClientModules] = useState<ClientAppModulesConfig>(() => {
    return barbershopInfo.clientModules || defaultClientModules;
  });

  useEffect(() => {
    if (barbershopInfo.clientModules) {
      setClientModules({
        ...defaultClientModules,
        ...barbershopInfo.clientModules,
      });
    }
  }, [barbershopInfo.clientModules]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggleModule = async (key: keyof ClientAppModulesConfig, label: string) => {
    const nextValue = !clientModules[key];
    const updated: ClientAppModulesConfig = {
      ...clientModules,
      [key]: nextValue,
    };
    setClientModules(updated);
    await updateSettings({ clientModules: updated });
    addToast(
      nextValue
        ? `Módulo "${label}" ativado no app do cliente.`
        : `Módulo "${label}" ocultado do app do cliente.`,
      nextValue ? 'success' : 'info'
    );
  };

  const handleEnableAllModules = async () => {
    const allEnabled: ClientAppModulesConfig = {
      showAgendamento: true,
      showMeusAgendamentos: true,
      showCupons: true,
      showBarbearia: true,
      showServicos: true,
      showEquipe: true,
      showAvaliacoes: true,
      showFeed: true,
    };
    setClientModules(allEnabled);
    await updateSettings({ clientModules: allEnabled });
    addToast('Todos os módulos foram ativados no aplicativo do cliente!', 'success');
  };

  const handleDisableAllModules = async () => {
    const allDisabled: ClientAppModulesConfig = {
      showAgendamento: false,
      showMeusAgendamentos: false,
      showCupons: false,
      showBarbearia: false,
      showServicos: false,
      showEquipe: false,
      showAvaliacoes: false,
      showFeed: false,
    };
    setClientModules(allDisabled);
    await updateSettings({ clientModules: allDisabled });
    addToast('Todos os módulos opcionais foram desativados no app do cliente.', 'info');
  };

  const modulesDefinition: {
    key: keyof ClientAppModulesConfig;
    title: string;
    badge: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    accentColor: string;
  }[] = [
    {
      key: 'showAgendamento',
      title: 'Agendar Horário (Agendamento)',
      badge: 'Principal',
      description: 'Permite que os clientes escolham barbeiro, data, horário e serviço para agendar.',
      icon: Calendar,
      accentColor: '#DAA520',
    },
    {
      key: 'showMeusAgendamentos',
      title: 'Meus Agendamentos & Histórico',
      badge: 'Cliente',
      description: 'Aba que lista todos os agendamentos anteriores, cancelados e próximos do cliente.',
      icon: CalendarCheck,
      accentColor: '#3b82f6',
    },
    {
      key: 'showCupons',
      title: 'Cupons de Desconto & Ofertas',
      badge: 'Marketing',
      description: 'Exibe a aba com cupons promocionais públicos e vouchers individuais para o cliente copiar.',
      icon: TicketPercent,
      accentColor: '#10b981',
    },
    {
      key: 'showBarbearia',
      title: 'A Barbearia (Sobre & Localização)',
      badge: 'Institucional',
      description: 'Página com horários de atendimento, botão de rota no Google Maps e WhatsApp oficial.',
      icon: Store,
      accentColor: '#f59e0b',
    },
    {
      key: 'showServicos',
      title: 'Serviços & Combos Promocionais',
      badge: 'Catálogo',
      description: 'Catálogo detalhado de todos os cortes, químicas, barboterapia e combos com preços.',
      icon: Scissors,
      accentColor: '#ec4899',
    },
    {
      key: 'showEquipe',
      title: 'Nossa Equipe de Barbeiros',
      badge: 'Profissionais',
      description: 'Apresentação dos barbeiros da barbearia, biografia, fotos e especialidades.',
      icon: Users,
      accentColor: '#8b5cf6',
    },
    {
      key: 'showAvaliacoes',
      title: 'Avaliações & Experiências',
      badge: 'Reputação',
      description: 'Mural de notas por estrelas, depoimentos de clientes e formulário de avaliação pública.',
      icon: Star,
      accentColor: '#eab308',
    },
    {
      key: 'showFeed',
      title: 'Feed de Novidades & Estilo',
      badge: 'Mural',
      description: 'Mural de tendências, cortes da semana e comunicados da barbearia para os clientes.',
      icon: Newspaper,
      accentColor: '#06b6d4',
    },
  ];

  const activeModulesCount = Object.values(clientModules).filter(Boolean).length;

  const handleTestSound = () => {
    setIsPlayingTest(true);
    testNotificationSound();
    setTimeout(() => setIsPlayingTest(false), 1200);
  };

  const handleSoundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingSound(true);
    await uploadCustomSound(file);
    setIsUploadingSound(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      desc: 'Som clássico vibrante de venda/agendamento',
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
      desc: customSoundName ? 'Arquivo salvo no seu aparelho' : 'Carregue um arquivo .mp3 ou .wav do seu aparelho',
      icon: '📁',
    },
  ];

  // Busca rápida de CEP no ViaCEP
  const handleSearchCep = async () => {
    const rawCep = cep.replace(/\D/g, '');
    if (rawCep.length !== 8) {
      addToast('Digite um CEP válido com 8 dígitos.', 'error');
      return;
    }

    try {
      setLoadingCep(true);
      const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
      const data = await res.json();
      if (data.erro) {
        addToast('CEP não encontrado. Digite o endereço manualmente.', 'error');
      } else {
        const logradouro = data.logradouro ? `${data.logradouro}` : '';
        const bairro = data.bairro || '';
        const localidade = `${data.localidade || ''} - ${data.uf || ''}`;

        setNeighborhood(bairro);
        setCity(localidade);
        setAddress(logradouro ? `${logradouro} - ${bairro}, ${localidade}` : `${bairro}, ${localidade}`);
        addToast('Endereço carregado via CEP com sucesso!', 'success');
      }
    } catch (e) {
      console.warn('Erro ao consultar CEP:', e);
      addToast('Não foi possível consultar o CEP automaticamente. Preencha manualmente.', 'info');
    } finally {
      setLoadingCep(false);
    }
  };

  const currentFullQuery = `${address.trim()}${cep.trim() ? `, CEP ${cep.trim()}` : ''}`;
  const previewMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentFullQuery)}`;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('O nome oficial é obrigatório.', 'error');
      return;
    }
    if (!address.trim()) {
      addToast('O endereço completo é obrigatório.', 'error');
      return;
    }

    const cleanAddress = address.trim();
    const cleanCep = cep.trim();
    const cleanPhone = phone.trim();
    const fullQuery = `${cleanAddress}${cleanCep ? `, CEP ${cleanCep}` : ''}`;
    const generatedMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullQuery)}`;

    await updateSettings({
      name: name.trim(),
      cep: cleanCep,
      address: cleanAddress,
      neighborhood: neighborhood.trim(),
      city: city.trim(),
      googleMapsUrl: generatedMapsUrl,
      phone: cleanPhone,
      whatsapp: cleanPhone.replace(/\D/g, ''),
      instagram: instagram.trim(),
      pixKey: pixKey.trim(),
      clientModules,
    });
  };

  return (
    <AdminLayout
      title="Configurações Gerais do Sistema"
      subtitle="Identidade da barbearia, CEP, módulos visíveis para clientes e alertas em tempo real"
    >
      {/* Firebase Status Badge */}
      <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
              <span>Infraestrutura Firebase Sincronizada</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xs text-neutral-300 font-sans">
              O aplicativo do cliente e este painel administrativo operam no mesmo Firestore em tempo real.
            </div>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold uppercase border border-emerald-500/40 shrink-0">
          Ativo & Conectado
        </span>
      </div>

      {/* CONTROLE DE MÓDULOS DO APP DO CLIENTE */}
      <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DAA520]/20 text-[#DAA520] border border-[#DAA520]/30 flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black font-mono tracking-tight text-white uppercase flex items-center gap-2">
                <span>Controle de Visualização no App do Cliente</span>
                <span className="px-2 py-0.5 rounded-full bg-[#DAA520]/15 border border-[#DAA520]/30 text-[#DAA520] text-[10px] font-bold">
                  {activeModulesCount} de {modulesDefinition.length} Ativos
                </span>
              </h2>
              <p className="text-xs text-neutral-400 font-sans">
                Ative ou desative as abas, botões e funcionalidades que aparecem para os clientes no aplicativo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleEnableAllModules}
              className="py-1.5 px-3 rounded-xl bg-emerald-950/40 border border-emerald-700/50 hover:bg-emerald-900/60 text-emerald-400 font-mono text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ativar Todos</span>
            </button>

            <button
              type="button"
              onClick={handleDisableAllModules}
              className="py-1.5 px-3 rounded-xl bg-red-950/40 border border-red-800/50 hover:bg-red-900/60 text-red-400 font-mono text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Desativar Todos</span>
            </button>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {modulesDefinition.map((mod) => {
            const Icon = mod.icon;
            const isEnabled = clientModules[mod.key] !== false;

            return (
              <div
                key={mod.key}
                onClick={() => handleToggleModule(mod.key, mod.title)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start justify-between gap-3.5 ${
                  isEnabled
                    ? 'bg-neutral-900/90 border-neutral-700/90 hover:border-[#DAA520]/60 shadow-sm'
                    : 'bg-black/60 border-neutral-800/70 hover:border-neutral-700 opacity-65'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                      isEnabled
                        ? 'bg-[#DAA520]/20 text-[#DAA520] border-[#DAA520]/40'
                        : 'bg-neutral-900 text-neutral-500 border-neutral-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-white truncate">
                        {mod.title}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase font-bold ${
                          isEnabled
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                        }`}
                      >
                        {isEnabled ? 'Visível' : 'Oculto'}
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-400 font-sans leading-relaxed line-clamp-2">
                      {mod.description}
                    </p>
                  </div>
                </div>

                {/* Switch Toggle Component */}
                <div className="shrink-0 pt-0.5">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isEnabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleModule(mod.key, mod.title);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer focus:outline-none ${
                      isEnabled ? 'bg-[#DAA520]' : 'bg-neutral-800'
                    }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-black rounded-full transition-transform duration-200 ease-in-out absolute top-1 ${
                        isEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Real-time sync hint */}
        <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#DAA520]" />
            <span>As alterações são sincronizadas instantaneamente no aplicativo dos clientes sem necessidade de recarregar.</span>
          </div>
          <span className="text-[11px] font-mono text-amber-400 font-bold hidden sm:inline">
            Salvo automaticamente
          </span>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-[#111111] border border-neutral-800 rounded-2xl p-6 space-y-5">
        <div className="border-b border-neutral-800 pb-3">
          <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#DAA520]" />
            Identidade do Sistema
          </h3>
        </div>

        {/* Nome Oficial & CEP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-mono font-bold uppercase text-neutral-300">
              Nome Oficial do Aplicativo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
              placeholder="Ex: Barbearia Jadson Barber"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-bold uppercase text-neutral-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                CEP da Barbearia
              </span>
              <span className="text-[10px] text-neutral-400 font-normal">8 dígitos</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                placeholder="Ex: 44086-402"
                className="w-full bg-black/80 border border-neutral-800 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520] font-mono"
              />
              <button
                type="button"
                onClick={handleSearchCep}
                disabled={loadingCep}
                title="Buscar CEP automaticamente"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-neutral-800 hover:bg-[#DAA520] text-neutral-300 hover:text-black transition-colors"
              >
                <Search className={`w-3.5 h-3.5 ${loadingCep ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Endereço Completo */}
        <div className="space-y-1">
          <label className="text-xs font-mono font-bold uppercase text-neutral-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Endereço Completo da Barbearia (Rua, Número, Bairro, Cidade - UF)
            </span>
            <span className="text-[10px] text-amber-400 font-sans">Usado para rota no Google Maps</span>
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ex: Rua Curitiba, 401 - Parque Ipê, Feira de Santana - BA"
            className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
            required
          />
        </div>

        {/* Google Maps Live Preview Box */}
        <div className="bg-black/60 border border-neutral-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#DAA520]/15 text-[#DAA520] flex items-center justify-center shrink-0 border border-[#DAA520]/30">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Google Maps do Cliente</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.2 rounded-full uppercase font-mono">
                  Rota Direta
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                {currentFullQuery || 'Informe o endereço e CEP acima'}
              </p>
            </div>
          </div>

          <a
            href={previewMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-[#DAA520] hover:text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Testar no Google Maps</span>
          </a>
        </div>

        {/* Contato & PIX */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-mono font-bold uppercase text-neutral-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              Telefone / WhatsApp
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-bold uppercase text-neutral-300 flex items-center gap-1.5">
              <Instagram className="w-3.5 h-3.5 text-amber-400" />
              Instagram
            </label>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-bold uppercase text-neutral-300 flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              Chave PIX Oficial
            </label>
            <input
              type="text"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
              required
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="py-3 px-6 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Configurações Gerais</span>
          </button>
        </div>
      </form>

      {/* NOTIFICAÇÕES SONORAS & ALERTA DE AGENDAMENTO */}
      <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DAA520]/20 text-[#DAA520] border border-[#DAA520]/30 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black font-mono tracking-tight text-white uppercase flex items-center gap-2">
                <span>Notificação Sonora de Agendamentos</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
                  Tempo Real
                </span>
              </h2>
              <p className="text-xs text-neutral-400 font-sans">
                Emite um efeito sonoro instantâneo toda vez que um cliente realizar um agendamento com o painel aberto.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleSoundMuted}
              className={`py-2 px-4 rounded-xl font-mono text-xs font-bold border transition-colors flex items-center gap-2 cursor-pointer ${
                isSoundMuted
                  ? 'bg-red-950/40 border-red-800/50 text-red-400 hover:bg-red-900/60'
                  : 'bg-emerald-950/40 border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/60'
              }`}
            >
              {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isSoundMuted ? 'Som Silenciado (Mudo)' : 'Som Ativo'}</span>
            </button>
          </div>
        </div>

        {/* Volume & Test Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Volume Box */}
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase text-white flex items-center gap-2">
                {soundVolume === 0 || isSoundMuted ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : soundVolume < 50 ? (
                  <Volume1 className="w-4 h-4 text-amber-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#DAA520]" />
                )}
                <span>Controle de Volume</span>
              </label>
              <span className="text-xs font-mono font-black text-[#DAA520]">
                {isSoundMuted ? 'Silenciado' : `${soundVolume}%`}
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
              <span>0% (Mudo)</span>
              <span>50%</span>
              <span>100% (Volume Máximo)</span>
            </div>
          </div>

          {/* Test Action Box */}
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between gap-3">
            <div>
              <div className="text-xs font-mono font-bold uppercase text-white">
                Demonstração de Áudio
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Clique para escutar como soará a notificação quando um agendamento entrar.
              </p>
            </div>

            <button
              onClick={handleTestSound}
              disabled={isPlayingTest}
              className="w-full py-2.5 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-md"
            >
              <Play className={`w-4 h-4 fill-current ${isPlayingTest ? 'animate-spin' : ''}`} />
              <span>{isPlayingTest ? 'Reproduzindo Som...' : 'Testar Notificação Sonora'}</span>
            </button>
          </div>
        </div>

        {/* Escolha do Som / Carregar do Dispositivo */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase text-neutral-300 flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-[#DAA520]" />
              <span>Efeito Sonoro Padrão & Personalizado</span>
            </h3>
            {soundType === 'custom' && (
              <button
                onClick={resetToDefaultSound}
                className="text-xs text-neutral-400 hover:text-amber-400 font-mono flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restaurar Sino Padrão
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {soundOptions.map((opt) => {
              const isSelected = soundType === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSoundType(opt.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#DAA520]/15 border-[#DAA520] shadow-sm'
                      : 'bg-neutral-900/60 border-neutral-800 hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0">{opt.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold font-mono text-white flex items-center gap-2">
                        <span className="truncate">{opt.label}</span>
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

        {/* Upload do Dispositivo */}
        <div className="p-4 rounded-xl bg-black/60 border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold uppercase text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#DAA520]" />
              <span>Importar Som Personalizado do Dispositivo</span>
              {customSoundName && (
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                  {customSoundName}
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400">
              Faça upload de qualquer áudio (.mp3, .wav, .ogg, .m4a) armazenado no seu smartphone ou computador.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
            onChange={handleSoundUpload}
            className="hidden"
            id="page-sound-upload-input"
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingSound}
              className="py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-mono text-xs font-bold uppercase transition-colors flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Upload className="w-3.5 h-3.5 text-[#DAA520]" />
              <span>{isUploadingSound ? 'Importando...' : 'Buscar Áudio no Aparelho'}</span>
            </button>

            {customSoundName && (
              <button
                type="button"
                onClick={resetToDefaultSound}
                className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                title="Remover e voltar ao padrão"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

    </AdminLayout>
  );
};

