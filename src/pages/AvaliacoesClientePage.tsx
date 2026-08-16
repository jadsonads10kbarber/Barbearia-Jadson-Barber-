import React, { useState, useMemo } from 'react';
import {
  Star,
  MessageSquare,
  Sparkles,
  Award,
  CheckCircle2,
  Filter,
  User,
  Calendar,
  ThumbsUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AvaliacoesClientePage: React.FC = () => {
  const { reviews, barbers, barbershopInfo, setIsReviewModalOpen } = useApp();
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | 'all'>('all');

  const visibleReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (r.status === 'Oculto') return false;
      if (selectedRatingFilter !== 'all' && r.rating !== selectedRatingFilter) return false;
      return true;
    });
  }, [reviews, selectedRatingFilter]);

  const approvedReviews = reviews.filter((r) => r.status !== 'Oculto');
  const totalApproved = approvedReviews.length;
  const avgRating = totalApproved > 0
    ? (approvedReviews.reduce((acc, r) => acc + r.rating, 0) / totalApproved).toFixed(1)
    : '5.0';

  const fiveStarCount = approvedReviews.filter((r) => r.rating === 5).length;
  const fiveStarPct = totalApproved > 0 ? Math.round((fiveStarCount / totalApproved) * 100) : 100;

  return (
    <div className="pb-24 pt-2 px-4 max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="border-b border-neutral-800 pb-3">
        <h1 className="text-xl font-black font-mono flex items-center gap-2 text-white">
          <Star className="w-5 h-5 text-[#DAA520] fill-[#DAA520]" />
          <span>Avaliações & Experiências</span>
        </h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          Confira o que nossos clientes dizem sobre o atendimento na {barbershopInfo.name}
        </p>
      </div>

      {/* Overview Score Card */}
      <div className="bg-[#111111] border border-[#DAA520]/25 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#DAA520]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-[#DAA520]/40 flex flex-col items-center justify-center shrink-0 shadow-lg">
              <span className="text-3xl font-black font-mono text-[#DAA520]">{avgRating}</span>
              <div className="flex items-center gap-0.5 mt-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-2.5 h-2.5 ${
                      s <= Math.round(Number(avgRating))
                        ? 'text-[#DAA520] fill-[#DAA520]'
                        : 'text-neutral-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-sm font-black uppercase text-white font-mono">
                  Excelente Satisfação
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  {fiveStarPct}% 5 Estrelas
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Baseado em {totalApproved} {totalApproved === 1 ? 'avaliação verificada' : 'avaliações verificadas'} de clientes.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Deixar Minha Avaliação</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedRatingFilter('all')}
          className={`py-1.5 px-3.5 rounded-xl text-xs font-mono font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
            selectedRatingFilter === 'all'
              ? 'bg-[#DAA520] text-black shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          Todas ({totalApproved})
        </button>

        {[5, 4, 3, 2, 1].map((rating) => {
          const count = approvedReviews.filter((r) => r.rating === rating).length;
          if (count === 0 && selectedRatingFilter !== rating) return null;

          return (
            <button
              key={rating}
              onClick={() => setSelectedRatingFilter(rating)}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                selectedRatingFilter === rating
                  ? 'bg-[#DAA520] text-black shadow-md'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              <span>{rating}</span>
              <Star className="w-3 h-3 fill-current" />
              <span className="opacity-70 text-[11px]">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Review Cards List */}
      {visibleReviews.length === 0 ? (
        <div className="bg-[#111111] border border-neutral-800 rounded-3xl p-8 text-center space-y-3">
          <MessageSquare className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="text-sm font-bold text-white font-mono">Nenhuma avaliação encontrada neste filtro</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Seja um dos primeiros a compartilhar sua experiência após seu corte ou barba!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#111111] border border-neutral-800/90 hover:border-[#DAA520]/30 rounded-2xl p-4 sm:p-5 transition-all shadow-md space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {rev.customerAvatar ? (
                    <img
                      src={rev.customerAvatar}
                      alt={rev.authorName}
                      className="w-10 h-10 rounded-full object-cover border border-[#DAA520]/40"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500/20 to-neutral-800 border border-[#DAA520]/30 text-[#DAA520] font-black font-mono flex items-center justify-center text-sm shrink-0">
                      {rev.authorName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-mono">
                        {rev.authorName}
                      </span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/20 font-mono">
                        Cliente Verificado
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-400 font-mono">
                      <span>{rev.date || 'Recente'}</span>
                      {rev.barberName && (
                        <>
                          <span>•</span>
                          <span className="text-[#DAA520]">Barbeiro: {rev.barberName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 bg-black/40 px-2 py-1 rounded-lg border border-neutral-800 shrink-0">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= rev.rating ? 'text-[#DAA520] fill-[#DAA520]' : 'text-neutral-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {rev.comment && (
                <p className="text-xs text-neutral-200 leading-relaxed font-sans pl-1">
                  "{rev.comment}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
