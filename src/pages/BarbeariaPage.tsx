import React from 'react';
import {
  Store,
  MapPin,
  Phone,
  MessageCircle,
  Instagram,
  Clock,
  ShieldCheck,
  Scissors,
  ExternalLink,
  Award,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BarbeariaPage: React.FC = () => {
  const { barbershopInfo, setActivePage } = useApp();

  const handleOpenWhatsapp = () => {
    const url = `https://wa.me/${barbershopInfo.whatsapp}?text=${encodeURIComponent(
      'Olá! Gostaria de tirar dúvidas sobre o agendamento na Barbearia JADSON BARBER.'
    )}`;
    window.open(url, '_blank');
  };

  return (
    <div className="pb-24 pt-2 px-4 max-w-3xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="border-b border-neutral-800 pb-3">
        <h1 className="text-2xl font-black font-mono flex items-center gap-2">
          <Store className="w-6 h-6 text-[#DAA520]" />
          <span>A Barbearia <span className="text-[#DAA520]">JADSON</span> <span className="text-white">BARBER</span></span>
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Conheça nosso espaço, localização e canais de atendimento oficial
        </p>
      </div>

      {/* Hero Card */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-500/20 shadow-2xl bg-neutral-900">
        <div className="h-56 sm:h-64 relative bg-neutral-950">
          <img
            src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1000&auto=format&fit=crop&q=80"
            alt="Barbearia JADSON BARBER"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />
          
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div className="space-y-1">
              <span className="text-[10px] tracking-widest text-amber-400 uppercase font-bold bg-black/60 px-2.5 py-1 rounded-md border border-amber-500/30">
                Barbearia Premium
              </span>
              <h2 className="text-3xl font-black font-mono tracking-tight flex items-center gap-2">
                <span className="text-[#DAA520]">JADSON</span>
                <span className="text-white">BARBER</span>
              </h2>
              <p className="text-xs text-amber-400 font-semibold">{barbershopInfo.slogan}</p>
            </div>

            <button
              onClick={() => setActivePage('agenda')}
              className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 shrink-0 hidden sm:block"
            >
              Agendar Horário
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-gray-300 leading-relaxed">
            {barbershopInfo.description}
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-center space-y-1">
              <Award className="w-5 h-5 text-amber-400 mx-auto" />
              <span className="text-xs font-bold text-white block">Equipe Master</span>
              <span className="text-[10px] text-gray-400">Barbeiros certificados</span>
            </div>

            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-center space-y-1">
              <Sparkles className="w-5 h-5 text-amber-400 mx-auto" />
              <span className="text-xs font-bold text-white block">Espaço VIP</span>
              <span className="text-[10px] text-gray-400">Ambiente climatizado</span>
            </div>

            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-center space-y-1 col-span-2 sm:col-span-1">
              <ShieldCheck className="w-5 h-5 text-amber-400 mx-auto" />
              <span className="text-xs font-bold text-white block">Horário Marcado</span>
              <span className="text-[10px] text-gray-400">Sem filas nem espera</span>
            </div>
          </div>
        </div>
      </div>

      {/* Opening Hours Card */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-xl">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2 border-b border-neutral-800 pb-2">
          <Clock className="w-4 h-4 text-amber-400" />
          Horário de Funcionamento
        </h3>

        <div className="space-y-2 text-xs text-gray-300 font-mono">
          <div className="flex justify-between py-1 border-b border-neutral-800/60">
            <span>Segunda a Sexta:</span>
            <span className="text-amber-400 font-bold">08:00 às 20:00</span>
          </div>
          <div className="flex justify-between py-1 border-b border-neutral-800/60">
            <span>Sábado:</span>
            <span className="text-amber-400 font-bold">08:00 às 19:00</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Domingo e Feriados:</span>
            <span className="text-rose-400 font-bold">Fechado</span>
          </div>
        </div>
      </div>

      {/* Location Card */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            Endereço & Localização
          </h3>

          <a
            href={barbershopInfo.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-amber-400 font-bold hover:underline flex items-center gap-1"
          >
            <span>Ver no Mapa</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="text-xs text-gray-300 space-y-1">
          <p className="font-bold text-white text-sm">{barbershopInfo.address}</p>
          <p>{barbershopInfo.neighborhood} — {barbershopInfo.city}</p>
        </div>

        {/* Visual Map Box Placeholder */}
        <div className="h-40 rounded-xl bg-neutral-950 border border-neutral-800 relative overflow-hidden flex flex-col items-center justify-center p-4 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
            <MapPin className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-white">{barbershopInfo.address}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Clique no botão acima para abrir a rota no Google Maps</p>
        </div>
      </div>

      {/* Direct Contact Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleOpenWhatsapp}
          className="py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Atendimento no WhatsApp</span>
        </button>

        <a
          href={`tel:${barbershopInfo.phone.replace(/[^0-9]/g, '')}`}
          className="py-3.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
        >
          <Phone className="w-5 h-5 text-amber-400" />
          <span>Ligar ({barbershopInfo.phone})</span>
        </a>
      </div>

    </div>
  );
};
