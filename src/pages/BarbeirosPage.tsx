import React from 'react';
import { Users, Star, Clock, Award, ArrowRight, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Barber } from '../types';

export const BarbeirosPage: React.FC = () => {
  const { barbers, setActivePage, setSelectedBarberForBooking } = useApp();

  const handleSelectBarberAndBook = (barber: Barber) => {
    setSelectedBarberForBooking(barber);
    setActivePage('agenda');
  };

  return (
    <div className="pb-24 pt-2 px-4 max-w-3xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="border-b border-neutral-800 pb-3">
        <h1 className="text-2xl font-black text-white font-mono flex items-center gap-2">
          <Users className="w-6 h-6 text-amber-400" />
          Nossa Equipe de Barbeiros
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Profissionais qualificados prontos para entregar a melhor experiência e estilo
        </p>
      </div>

      {/* Barbers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {barbers.map((barber) => (
          <div
            key={barber.id}
            className="bg-neutral-900/80 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-neutral-700 transition-all"
          >
            <div>
              {/* Image & Header */}
              <div className="relative h-48 bg-neutral-950">
                <img
                  src={barber.photo}
                  alt={barber.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
                
                {/* Rating Badge */}
                <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-amber-400 text-xs font-bold font-mono px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{barber.rating} ({barber.reviewsCount})</span>
                </div>
              </div>

              {/* Info Body */}
              <div className="p-5 space-y-3">
                <div>
                  <h2 className="text-lg font-bold text-white font-mono">{barber.name}</h2>
                  <p className="text-xs text-amber-400 font-semibold">{barber.role}</p>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  {barber.description}
                </p>

                {/* Specialties */}
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">
                    Especialidades:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {barber.specialties.map((spec, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-neutral-950 text-gray-200 px-2.5 py-0.5 rounded-md border border-neutral-800"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Individual Working Hours & Lunch Break */}
                <div className="pt-2 border-t border-neutral-800 text-xs text-gray-400 space-y-1 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Horário: {barber.workingHours.start} às {barber.workingHours.end}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-400/90 font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Intervalo de Almoço: {barber.lunchBreak.start} às {barber.lunchBreak.end}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="p-4 bg-neutral-950/60 border-t border-neutral-800">
              <button
                onClick={() => handleSelectBarberAndBook(barber)}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
              >
                <span>Agendar com {barber.name.split(' ')[0]}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
