import React, { useState } from 'react';
import { Clock, CalendarX, Plus, Trash2, ShieldAlert, X, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const AdminHorariosPage: React.FC = () => {
  const { barbershopInfo, updateSettings, blockedDates, addBlockedDate, deleteBlockedDate, addToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for general hours
  const [weekdays, setWeekdays] = useState(barbershopInfo.hours.weekdays);
  const [saturday, setSaturday] = useState(barbershopInfo.hours.saturday);
  const [sunday, setSunday] = useState(barbershopInfo.hours.sunday);

  // Form state for new blocked date
  const [blockDate, setBlockDate] = useState(new Date().toISOString().split('T')[0]);
  const [blockReason, setBlockReason] = useState('Feriado / Manutenção');
  const [blockNotes, setBlockNotes] = useState('');

  const handleSaveGeneralHours = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      hours: {
        weekdays,
        saturday,
        sunday,
      },
    });
  };

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDate || !blockReason.trim()) {
      addToast('Informe uma data e motivo do bloqueio.', 'error');
      return;
    }

    await addBlockedDate({
      date: blockDate,
      reason: blockReason.trim(),
      notes: blockNotes.trim() || undefined,
    });

    setIsModalOpen(false);
    setBlockNotes('');
  };

  return (
    <AdminLayout
      title="Gestão de Horários de Funcionamento e Datas Bloqueadas"
      subtitle="Configure os horários gerais da Barbearia Jadson Barber e bloqueie feriados no calendário do app"
    >
      {/* General Hours Config Card */}
      <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#DAA520]" />
            Horários Gerais da Barbearia
          </h3>
        </div>

        <form onSubmit={handleSaveGeneralHours} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold uppercase text-neutral-300">Segunda a Sexta</label>
              <input
                type="text"
                value={weekdays}
                onChange={(e) => setWeekdays(e.target.value)}
                className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold uppercase text-neutral-300">Sábado</label>
              <input
                type="text"
                value={saturday}
                onChange={(e) => setSaturday(e.target.value)}
                className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold uppercase text-neutral-300">Domingo</label>
              <input
                type="text"
                value={sunday}
                onChange={(e) => setSunday(e.target.value)}
                className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="py-2.5 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Salvar Horários de Atendimento
          </button>
        </form>
      </div>

      {/* Blocked Dates Management Card */}
      <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div>
            <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
              <CalendarX className="w-4 h-4 text-red-400" />
              Datas e Feriados Bloqueados ({blockedDates.length})
            </h3>
            <p className="text-xs text-neutral-400 font-sans">
              Datas bloqueadas aqui ficam indisponíveis para agendamentos no aplicativo
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Bloquear Nova Data</span>
          </button>
        </div>

        {/* Blocked Dates List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {blockedDates.length === 0 ? (
            <p className="col-span-3 text-xs text-neutral-500 font-mono text-center py-6">
              Nenhuma data bloqueada cadastrada.
            </p>
          ) : (
            blockedDates.map((b) => (
              <div
                key={b.id}
                className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-amber-400 font-mono">{b.date}</div>
                  <div className="text-xs font-bold text-white font-sans">{b.reason}</div>
                  {b.notes && <div className="text-[11px] text-neutral-400">{b.notes}</div>}
                </div>

                <button
                  onClick={() => deleteBlockedDate(b.id)}
                  className="p-2 rounded-xl bg-black/60 hover:bg-red-950/60 text-neutral-400 hover:text-red-400 border border-neutral-800 transition-colors"
                  title="Remover Bloqueio"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Block Date Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#111111] border border-neutral-800 rounded-3xl p-6 space-y-4 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
                <CalendarX className="w-4 h-4 text-red-400" />
                Bloquear Data no Calendário
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-neutral-400 hover:text-white bg-neutral-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBlock} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">Data a Bloquear</label>
                <input
                  type="date"
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">Motivo do Bloqueio</label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Ex: Feriado de Natal / Treinamento de Equipe"
                  className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">Observações (Opcional)</label>
                <input
                  type="text"
                  value={blockNotes}
                  onChange={(e) => setBlockNotes(e.target.value)}
                  placeholder="Ex: Barbearia totalmente fechada neste dia"
                  className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Confirmar Bloqueio
              </button>
            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  );
};
