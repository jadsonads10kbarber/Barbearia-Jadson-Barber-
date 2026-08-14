import React, { useState } from 'react';
import { Star, MessageSquare, ThumbsUp, Trash2, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const AdminAvaliacoesPage: React.FC = () => {
  const { reviews, barbers, customers, currentUser, deleteReview, addToast } = useApp();

  const [selectedBarberId, setSelectedBarberId] = useState('todos');
  const [selectedRating, setSelectedRating] = useState('todos');

  const filteredReviews = reviews.filter((r) => {
    if (selectedBarberId !== 'todos' && r.barberId !== selectedBarberId) return false;
    if (selectedRating !== 'todos' && r.rating !== parseInt(selectedRating, 10)) return false;
    return true;
  });

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  const approvalRate = totalReviews > 0
    ? `${Math.round((reviews.filter((r) => r.rating >= 4).length / totalReviews) * 100)}%`
    : '0%';

  return (
    <AdminLayout
      title="Gestão de Avaliações & Feedback de Clientes"
      subtitle="Acompanhe o nível de satisfação da barbearia e a reputação individual de cada barbeiro"
    >
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-4 text-center">
          <div className="text-xs text-neutral-400 font-mono font-bold uppercase">Nota Média Geral</div>
          <div className="text-3xl font-black font-mono text-amber-400 mt-1 flex items-center justify-center gap-1.5">
            <Star className="w-6 h-6 fill-amber-400" />
            <span>{avgRating}</span>
          </div>
        </div>

        <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-4 text-center">
          <div className="text-xs text-neutral-400 font-mono font-bold uppercase">Total de Avaliações</div>
          <div className="text-3xl font-black font-mono text-white mt-1">
            {totalReviews}
          </div>
        </div>

        <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-4 text-center">
          <div className="text-xs text-neutral-400 font-mono font-bold uppercase">Aprovação de Clientes</div>
          <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
            {approvalRate}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedBarberId}
            onChange={(e) => setSelectedBarberId(e.target.value)}
            className="bg-black/80 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
          >
            <option value="todos">Todos os Barbeiros</option>
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="bg-black/80 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
          >
            <option value="todos">Todas as Notas</option>
            <option value="5">5 Estrelas</option>
            <option value="4">4 Estrelas</option>
            <option value="3">3 Estrelas</option>
            <option value="2">2 Estrelas ou Menos</option>
          </select>
        </div>

        <div className="text-xs font-mono text-neutral-400">
          Exibindo {filteredReviews.length} avaliações
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="bg-[#111111] border border-dashed border-neutral-800 rounded-2xl p-10 text-center text-xs font-mono text-neutral-500">
            Nenhuma avaliação para os filtros selecionados.
          </div>
        ) : (
          filteredReviews.map((r) => {
            const author = r.customerName || r.authorName || 'Cliente';
            const matchedCustomer = customers.find(
              (c) => c.name.toLowerCase() === author.toLowerCase()
            );
            const avatarSrc =
              r.customerAvatar ||
              matchedCustomer?.avatar ||
              matchedCustomer?.photo ||
              (currentUser && currentUser.name.toLowerCase() === author.toLowerCase()
                ? currentUser.avatar
                : '');

            return (
            <div
              key={r.id}
              className="bg-[#111111] border border-neutral-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-start gap-3">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={author}
                    className="w-10 h-10 rounded-full object-cover border-2 border-amber-500/40 shadow-sm shrink-0 mt-0.5"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 font-bold font-mono text-xs shrink-0 mt-0.5">
                    {author ? author.charAt(0).toUpperCase() : 'C'}
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-white font-sans">{author}</span>
                    {r.barberName && (
                      <span className="text-[11px] text-neutral-500 font-mono">para {r.barberName}</span>
                    )}
                    <span className="text-[10px] text-neutral-600 font-mono">• {r.date}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-700'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-mono font-bold text-amber-400 ml-1">{r.rating}.0</span>
                  </div>

                  <p className="text-xs text-neutral-300 font-sans italic leading-relaxed">
                    "{r.comment}"
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 shrink-0">
                <button
                  onClick={() => deleteReview(r.id)}
                  className="p-2 rounded-xl bg-neutral-900 hover:bg-red-950/60 text-neutral-400 hover:text-red-400 border border-neutral-800 transition-colors"
                  title="Excluir Avaliação"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })
      )}
      </div>

    </AdminLayout>
  );
};
