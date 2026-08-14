import React, { useState } from 'react';
import { Settings, Save, MapPin, Phone, Instagram, QrCode, Database, CheckCircle2, ExternalLink, Search, Navigation } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const AdminConfiguracoesPage: React.FC = () => {
  const { barbershopInfo, updateSettings, addToast } = useApp();

  const [name, setName] = useState(barbershopInfo.name || 'Barbearia Jadson Barber');
  const [cep, setCep] = useState(barbershopInfo.cep || '44086-402');
  const [address, setAddress] = useState(barbershopInfo.address || 'Rua Curitiba, 401 - Parque Ipê');
  const [neighborhood, setNeighborhood] = useState(barbershopInfo.neighborhood || 'Parque Ipê');
  const [city, setCity] = useState(barbershopInfo.city || 'Feira de Santana - BA');
  const [phone, setPhone] = useState(barbershopInfo.phone || '75 983137171');
  const [instagram, setInstagram] = useState(barbershopInfo.instagram || '@jadsonbarberbarbearia');
  const [pixKey, setPixKey] = useState(barbershopInfo.pixKey || '75983137171');
  const [loadingCep, setLoadingCep] = useState(false);

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
    });
  };

  return (
    <AdminLayout
      title="Configurações Gerais do Sistema"
      subtitle="Identidade da barbearia, CEP, endereço no Google Maps e sincronização em tempo real"
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

    </AdminLayout>
  );
};

