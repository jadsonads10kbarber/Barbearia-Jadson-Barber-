import React, { useState } from 'react';
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
  Navigation,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { timeToMinutes } from '../utils/scheduling';

const DAYS_LIST = [
  { dow: 1, name: 'Segunda-feira', short: 'Segunda' },
  { dow: 2, name: 'Terça-feira', short: 'Terça' },
  { dow: 3, name: 'Quarta-feira', short: 'Quarta' },
  { dow: 4, name: 'Quinta-feira', short: 'Quinta' },
  { dow: 5, name: 'Sexta-feira', short: 'Sexta' },
  { dow: 6, name: 'Sábado', short: 'Sábado' },
  { dow: 0, name: 'Domingo', short: 'Domingo' },
];

export const BarbeariaPage: React.FC = () => {
  const { barbershopInfo, setActivePage, addToast } = useApp();
  const [copied, setCopied] = useState(false);

  const fullAddressWithCep = `${barbershopInfo.address}${barbershopInfo.cep ? ` - CEP ${barbershopInfo.cep}` : ''}`;
  const mapsUrl = barbershopInfo.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddressWithCep)}`;

  const now = new Date();
  const currentDow = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const getDayConfig = (dow: number) => {
    const found = barbershopInfo.weeklySchedule?.find((w) => w.dayOfWeek === dow);
    if (found) return found;

    // Fallback based on barbershopInfo.hours summary if weeklySchedule is not yet loaded
    if (dow === 0) {
      const isSunOpen = barbershopInfo.hours?.sunday && !barbershopInfo.hours.sunday.toLowerCase().includes('fechado');
      return {
        dayOfWeek: 0,
        dayName: 'Domingo',
        active: Boolean(isSunOpen),
        startTime: '09:00',
        endTime: '14:00',
      };
    }
    if (dow === 6) {
      const isSatOpen = barbershopInfo.hours?.saturday && !barbershopInfo.hours.saturday.toLowerCase().includes('fechado');
      return {
        dayOfWeek: 6,
        dayName: 'Sábado',
        active: isSatOpen !== false,
        startTime: '08:00',
        endTime: '19:00',
      };
    }
    const isWeekOpen = barbershopInfo.hours?.weekdays && !barbershopInfo.hours.weekdays.toLowerCase().includes('fechado');
    return {
      dayOfWeek: dow,
      dayName: DAYS_LIST.find((d) => d.dow === dow)?.name || '',
      active: isWeekOpen !== false,
      startTime: '08:00',
      endTime: '20:00',
    };
  };

  const todayConfig = getDayConfig(currentDow);
  const isCurrentlyOpen = (() => {
    if (!todayConfig.active) return false;
    const startMins = timeToMinutes(todayConfig.startTime || '08:00');
    const endMins = timeToMinutes(todayConfig.endTime || '20:00');
    return currentMinutes >= startMins && currentMinutes < endMins;
  })();

  const handleOpenWhatsapp = () => {
    const url = `https://wa.me/${barbershopInfo.whatsapp}?text=${encodeURIComponent(
      'Olá! Gostaria de tirar dúvidas sobre o agendamento na Barbearia JADSON BARBER.'
    )}`;
    window.open(url, '_blank');
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(fullAddressWithCep);
    setCopied(true);
    addToast('Endereço e CEP copiados para a área de transferência!', 'success');
    setTimeout(() => setCopied(false), 2500);
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
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#DAA520]" />
            Horário de Funcionamento
          </h3>

          <div className="flex items-center gap-2">
            {isCurrentlyOpen ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold border border-emerald-500/40 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Aberto Agora (fecha às {todayConfig.endTime})
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-400 font-mono text-[11px] font-bold border border-neutral-700">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                Fechado Agora
              </span>
            )}
          </div>
        </div>

        {/* Schedule List */}
        <div className="space-y-1.5 text-xs font-mono">
          {DAYS_LIST.map((day) => {
            const config = getDayConfig(day.dow);
            const isToday = currentDow === day.dow;
            const isOpen = config.active;

            return (
              <div
                key={day.dow}
                className={`flex items-center justify-between py-2 px-3 rounded-xl transition-colors ${
                  isToday
                    ? 'bg-[#DAA520]/15 border border-[#DAA520]/40 text-white font-bold shadow-sm'
                    : 'bg-black/40 border border-neutral-800/60 text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{day.name}</span>
                  {isToday && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#DAA520] text-black font-extrabold uppercase">
                      Hoje
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isOpen ? (
                    <span className={isToday ? 'text-[#DAA520] font-extrabold' : 'text-neutral-200'}>
                      {config.startTime} às {config.endTime}
                    </span>
                  ) : (
                    <span className="text-rose-400 font-semibold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      Fechado
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Location Card */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#DAA520]" />
            Endereço & Localização
          </h3>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#DAA520] hover:text-amber-300 font-bold hover:underline flex items-center gap-1.5 transition-colors"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="bg-black/60 border border-neutral-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <p className="font-bold text-white text-sm flex items-center gap-1.5">
                <span>{barbershopInfo.address}</span>
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-300">
                <span>{barbershopInfo.neighborhood} — {barbershopInfo.city}</span>
                {barbershopInfo.cep && (
                  <span className="px-2 py-0.5 rounded bg-[#DAA520]/20 text-[#DAA520] font-mono font-bold text-[11px] border border-[#DAA520]/40">
                    CEP: {barbershopInfo.cep}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleCopyAddress}
              title="Copiar endereço e CEP"
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors shrink-0 flex items-center gap-1 text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
              <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>

          {/* Direct Route Action Banner */}
          <div className="pt-2 border-t border-neutral-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-[#DAA520]" />
              <span>Trace a rota direto pelo GPS do seu celular ou computador</span>
            </div>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-md shrink-0"
            >
              <Navigation className="w-4 h-4" />
              <span>Abrir no Google Maps</span>
            </a>
          </div>
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
