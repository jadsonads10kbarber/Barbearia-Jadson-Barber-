import React, { useState, useEffect } from 'react';
import {
  Star,
  Sparkles,
  X,
  Check,
  Scissors,
  User,
  Clock,
  ThumbsUp,
  Award,
  Sparkle,
  UserCheck,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ComplimentOption {
  id: string;
  label: string;
  icon: React.ElementType;
}

const COMPLIMENT_OPTIONS: ComplimentOption[] = [
  { id: 'corte', label: 'Corte Impecável', icon: Scissors },
  { id: 'pontualidade', label: 'Pontualidade', icon: Clock },
  { id: 'atendimento', label: 'Ótimo Atendimento', icon: ThumbsUp },
  { id: 'ambiente', label: 'Ambiente Agradável', icon: Sparkles },
  { id: 'profissional', label: 'Profissional Atencioso', icon: UserCheck },
  { id: 'recomendo', label: 'Super Recomendo', icon: Award },
];

const RATING_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Péssimo', color: 'text-rose-400' },
  2: { label: 'Ruim', color: 'text-orange-400' },
  3: { label: 'Regular', color: 'text-amber-400' },
  4: { label: 'Muito Bom', color: 'text-yellow-400' },
  5: { label: 'Excelente', color: 'text-[#DAA520]' },
};

export const ClientReviewModal: React.FC = () => {
  const {
    pendingReviewAppointment,
    isReviewModalOpen,
    setIsReviewModalOpen,
    submitAppointmentReview,
    dismissAppointmentReview,
    barbers,
  } = useApp();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Corte Impecável', 'Ótimo Atendimento']);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Auto-open modal when a new pending review appears
  useEffect(() => {
    if (pendingReviewAppointment) {
      setIsReviewModalOpen(true);
      setIsMinimized(false);
      setRating(5);
      setComment('');
      setSelectedTags(['Corte Impecável', 'Ótimo Atendimento']);
    }
  }, [pendingReviewAppointment?.id]);

  if (!pendingReviewAppointment) {
    return null;
  }

  const app = pendingReviewAppointment;
  const barber = barbers.find((b) => b.id === app.barberId);
  const effectiveRating = hoverRating || rating;
  const currentLabelInfo = RATING_LABELS[effectiveRating] || RATING_LABELS[5];

  const toggleTag = (label: string) => {
    if (selectedTags.includes(label)) {
      setSelectedTags((prev) => prev.filter((t) => t !== label));
    } else {
      setSelectedTags((prev) => [...prev, label]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await submitAppointmentReview(app.id, rating, comment, selectedTags);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    dismissAppointmentReview(app.id);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsReviewModalOpen(false);
  };

  // If minimized, render a sleek floating notification pill at the bottom right
  if (isMinimized && !isReviewModalOpen) {
    return (
      <aside
        id="client-review-floating-pill"
        aria-label="Avaliação de atendimento pendente"
        className="fixed bottom-20 sm:bottom-6 right-4 z-40 max-w-sm w-[calc(100%-2rem)] sm:w-auto bg-[#141414]/95 border border-[#DAA520]/40 rounded-2xl p-3.5 shadow-2xl shadow-black/80 backdrop-blur-xl transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#DAA520] flex items-center justify-center text-black shrink-0 shadow-md">
            <Star className="w-4 h-4 fill-black stroke-black" />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-1 text-[11px] font-bold uppercase text-[#DAA520] font-mono">
              <Sparkles className="w-3 h-3" />
              <span>Avalie seu corte</span>
            </div>
            <p className="text-xs font-semibold text-white truncate">
              {app.barberName} • {app.services.map((s) => s.name).join(', ')}
            </p>
          </div>
          <button
            onClick={() => {
              setIsMinimized(false);
              setIsReviewModalOpen(true);
            }}
            className="py-1.5 px-3 rounded-lg bg-[#DAA520] hover:bg-[#c4931a] text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shrink-0 shadow"
          >
            <span>Avaliar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    );
  }

  if (!isReviewModalOpen) {
    return null;
  }

  return (
    <div
      id="client-review-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div
        id="client-review-modal-card"
        className="relative w-full max-w-md bg-[#121212] border border-neutral-800 rounded-2xl shadow-2xl shadow-black overflow-hidden text-white animate-scaleUp max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#DAA520]/15 border border-[#DAA520]/30 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 text-[#DAA520] fill-[#DAA520]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-sans">
                Avaliar Atendimento
              </h2>
              <p className="text-[11px] text-neutral-400 font-sans">
                {app.barberName} • {app.services.map((s) => s.name).join(', ')}
              </p>
            </div>
          </div>

          <button
            onClick={handleMinimize}
            title="Fechar"
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar">
          {/* Interactive Star Rating */}
          <div className="bg-[#181818] border border-neutral-800/80 rounded-xl p-4 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
              {[1, 2, 3, 4, 5].map((starValue) => {
                const isFilled = (hoverRating !== null ? hoverRating : rating) >= starValue;
                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1.5 rounded-lg transition-transform hover:scale-115 active:scale-95 cursor-pointer focus:outline-none"
                    aria-label={`Nota ${starValue} de 5`}
                  >
                    <Star
                      className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                        isFilled
                          ? 'text-[#DAA520] fill-[#DAA520]'
                          : 'text-neutral-600 fill-transparent hover:text-neutral-500'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <p className={`text-xs font-bold font-mono tracking-wider uppercase ${currentLabelInfo.color}`}>
              {currentLabelInfo.label} ({effectiveRating}/5)
            </p>
          </div>

          {/* Compliment Tags with Lucide Icons */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-400 font-sans block">
              Destaques do atendimento:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {COMPLIMENT_OPTIONS.map((opt) => {
                const isSelected = selectedTags.includes(opt.label);
                const IconComponent = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleTag(opt.label)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-all border cursor-pointer flex items-center gap-2 text-left ${
                      isSelected
                        ? 'bg-[#DAA520]/15 border-[#DAA520]/50 text-[#DAA520]'
                        : 'bg-[#181818] border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#DAA520]' : 'text-neutral-500'}`} />
                    <span className="truncate flex-1">{opt.label}</span>
                    {isSelected && <Check className="w-3 h-3 text-[#DAA520] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Simple Comment Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="review-comment-textarea"
              className="text-xs font-medium text-neutral-400 font-sans flex items-center justify-between"
            >
              <span>Comentário (opcional):</span>
              <span className="text-[10px] text-neutral-500 font-mono">{comment.length}/200</span>
            </label>
            <textarea
              id="review-comment-textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 200))}
              rows={2}
              placeholder="Escreva sua opinião sobre o atendimento..."
              className="w-full bg-[#181818] border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#DAA520] transition-colors resize-none font-sans"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#0e0e0e] border-t border-neutral-800 flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleDismiss}
            disabled={isSubmitting}
            className="py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white font-medium text-xs transition-colors cursor-pointer border border-neutral-800"
          >
            Depois
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c4931a] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#DAA520]/20 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Enviando...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Salvar Avaliação</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
