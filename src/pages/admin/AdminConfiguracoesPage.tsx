import React, { useState } from 'react';
import { Settings, Save, Shield, MapPin, Phone, Instagram, QrCode, Database, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const AdminConfiguracoesPage: React.FC = () => {
  const { barbershopInfo, updateSettings, addToast } = useApp();

  const [name, setName] = useState(barbershopInfo.name);
  const [shortName, setShortName] = useState(barbershopInfo.shortName);
  const [address, setAddress] = useState(barbershopInfo.address);
  const [phone, setPhone] = useState(barbershopInfo.phone);
  const [instagram, setInstagram] = useState(barbershopInfo.instagram);
  const [pixKey, setPixKey] = useState(barbershopInfo.pixKey || '11999998888');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('O nome oficial é obrigatório.', 'error');
      return;
    }

    await updateSettings({
      name: name.trim(),
      shortName: shortName.trim(),
      address: address.trim(),
      phone: phone.trim(),
      instagram: instagram.trim(),
      pixKey: pixKey.trim(),
    });
  };

  return (
    <AdminLayout
      title="Configurações Gerais do Sistema"
      subtitle="Dados de identidade da marca, chave PIX oficial e sincronização Firebase"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-mono font-bold uppercase text-neutral-300">Nome Oficial do Aplicativo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-bold uppercase text-neutral-300">Nome Curto (Abreviação)</label>
            <input
              type="text"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-mono font-bold uppercase text-neutral-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            Endereço Completo da Barbearia
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
            required
          />
        </div>

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
