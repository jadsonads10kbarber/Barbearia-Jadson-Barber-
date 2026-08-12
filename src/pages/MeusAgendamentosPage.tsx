import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  Calendar,
  Clock,
  User,
  Scissors,
  CalendarClock,
  CircleX,
  Pencil,
  CircleCheck,
  ArrowRight,
  Info,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Appointment, ServiceItem, AppointmentService } from '../types';
import {
  formatDateBR,
  getWeekdayName,
  getAvailableSlots,
  TimeSlot,
} from '../utils/availability';
import { Modal } from '../components/Modal';
import { findSmartComboMatch } from '../utils/comboMatcher';
import { Sparkles } from 'lucide-react';

export const MeusAgendamentosPage: React.FC = () => {
  const {
    appointments,
    cancelAppointment,
    rescheduleAppointment,
    updateAppointmentServices,
    deleteAppointment,
    clearHistory,
    barbers,
    services,
    setActivePage,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'proximos' | 'historico'>('proximos');

  // Modal States
  const [cancelModalAppointment, setCancelModalAppointment] = useState<Appointment | null>(null);
  const [rescheduleAppointmentItem, setRescheduleAppointmentItem] = useState<Appointment | null>(null);
  const [editServicesAppointmentItem, setEditServicesAppointmentItem] = useState<Appointment | null>(null);
  const [isClearHistoryModalOpen, setIsClearHistoryModalOpen] = useState(false);

  // Reschedule Form States
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleBarberId, setRescheduleBarberId] = useState<string>('');
  const [rescheduleSlot, setRescheduleSlot] = useState<TimeSlot | null>(null);

  // Edit Services Form States
  const [editSelectedServices, setEditSelectedServices] = useState<ServiceItem[]>([]);
  const [editSelectedCombo, setEditSelectedCombo] = useState<ServiceItem | null>(null);

  // Separate upcoming vs history appointments
  const { upcomingList, historyList } = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    const upcoming: Appointment[] = [];
    const history: Appointment[] = [];

    appointments.forEach((app) => {
      if (app.status === 'Cancelado' || app.status === 'Concluído' || app.date < today) {
        history.push(app);
      } else {
        upcoming.push(app);
      }
    });

    return { upcomingList: upcoming, historyList: history };
  }, [appointments]);

  // Open Reschedule Modal
  const handleOpenReschedule = (app: Appointment) => {
    setRescheduleAppointmentItem(app);
    setRescheduleDate(app.date);
    setRescheduleBarberId(app.barberId);
    setRescheduleSlot(null);
  };

  // Open Edit Services Modal
  const handleOpenEditServices = (app: Appointment) => {
    setEditServicesAppointmentItem(app);

    if (app.isCombo) {
      const comboFound = services.find((s) => s.id === app.services[0]?.id) || null;
      setEditSelectedCombo(comboFound);
      setEditSelectedServices([]);
    } else {
      setEditSelectedCombo(null);
      const matched = services.filter((s) => app.services.some((as) => as.id === s.id));
      setEditSelectedServices(matched);
    }
  };

  // Available slots for rescheduling
  const rescheduleBarberObj = barbers.find((b) => b.id === rescheduleBarberId);
  const rescheduleAvailableSlots = useMemo(() => {
    if (!rescheduleAppointmentItem || !rescheduleBarberObj || !rescheduleDate) {
      return [];
    }
    return getAvailableSlots(
      rescheduleDate,
      rescheduleBarberObj,
      rescheduleAppointmentItem.totalDuration,
      appointments,
      rescheduleAppointmentItem.id // exclude current appointment ID
    );
  }, [rescheduleAppointmentItem, rescheduleBarberObj, rescheduleDate, appointments]);

  // Submit Reschedule
  const handleConfirmReschedule = async () => {
    if (!rescheduleAppointmentItem || !rescheduleSlot || !rescheduleBarberObj) {
      addToast('Selecione uma data e horário válidos para reagendar.', 'error');
      return;
    }

    await rescheduleAppointment(
      rescheduleAppointmentItem.id,
      rescheduleDate,
      rescheduleSlot.time,
      rescheduleSlot.endTime,
      rescheduleBarberObj.id,
      rescheduleBarberObj.name
    );

    setRescheduleAppointmentItem(null);
  };

  // Submit Cancel
  const handleConfirmCancel = async () => {
    if (cancelModalAppointment) {
      await cancelAppointment(cancelModalAppointment.id);
      setCancelModalAppointment(null);
    }
  };

  // Submit Edit Services
  const handleConfirmEditServices = async () => {
    if (!editServicesAppointmentItem) return;

    let newTotalPrice = 0;
    let newTotalDuration = 0;
    let isCombo = false;
    let formattedServices: AppointmentService[] = [];

    if (editSelectedCombo) {
      isCombo = true;
      newTotalPrice = editSelectedCombo.price;
      newTotalDuration = editSelectedCombo.durationMinutes;
      formattedServices = [
        {
          id: editSelectedCombo.id,
          name: editSelectedCombo.name,
          price: editSelectedCombo.price,
          durationMinutes: editSelectedCombo.durationMinutes,
        },
      ];
    } else if (editSelectedServices.length > 0) {
      const match = findSmartComboMatch(editSelectedServices, services);
      if (match) {
        isCombo = true;
        newTotalPrice = match.smartTotalPrice;
        newTotalDuration = match.smartTotalDuration;
        formattedServices = [
          {
            id: match.combo.id,
            name: `${match.combo.name} (Combo Promocional Automático)`,
            price: match.combo.price,
            durationMinutes: match.combo.durationMinutes,
          },
          ...match.remainingIndividualServices.map((s) => ({
            id: s.id,
            name: s.name,
            price: s.price,
            durationMinutes: s.durationMinutes,
          })),
        ];
        addToast(
          `Combo Promocional (${match.combo.name}) aplicado! Economia de R$ ${match.savings.toFixed(2).replace('.', ',')}`,
          'success'
        );
      } else {
        isCombo = false;
        newTotalPrice = editSelectedServices.reduce((sum, s) => sum + s.price, 0);
        newTotalDuration = editSelectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
        formattedServices = editSelectedServices.map((s) => ({
          id: s.id,
          name: s.name,
          price: s.price,
          durationMinutes: s.durationMinutes,
        }));
      }
    } else {
      addToast('Selecione pelo menos um serviço.', 'error');
      return;
    }

    // Verify if new total duration still fits in current appointment time slot
    if (newTotalDuration > editServicesAppointmentItem.totalDuration) {
      addToast(
        'A nova duração dos serviços é maior que a atual. Favor reagendar para escolher um novo horário adequado.',
        'info'
      );
    }

    await updateAppointmentServices(
      editServicesAppointmentItem.id,
      formattedServices,
      newTotalPrice,
      newTotalDuration,
      isCombo
    );

    setEditServicesAppointmentItem(null);
  };

  const currentList = activeTab === 'proximos' ? upcomingList : historyList;

  return (
    <div className="pb-24 pt-2 px-4 max-w-3xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <div>
          <h1 className="text-xl font-black text-white font-sans flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-[#DAA520]" />
            Agendamentos
          </h1>
          <p className="text-xs text-[#8E9299] mt-0.5 uppercase tracking-wider">
            Acompanhe seus horários agendados e histórico de atendimentos
          </p>
        </div>

        {activeTab === 'historico' && historyList.length > 0 && (
          <button
            onClick={() => setIsClearHistoryModalOpen(true)}
            className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs uppercase flex items-center gap-1.5 transition-colors border border-rose-500/30 shrink-0"
            title="Excluir todo o histórico"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Excluir Histórico</span>
            <span className="sm:hidden">Limpar</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-[#111111] p-1 rounded-xl border border-white/10">
        <button
          onClick={() => setActiveTab('proximos')}
          className={`flex-1 py-2 rounded-lg font-sans text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${
            activeTab === 'proximos'
              ? 'bg-[#DAA520] text-black shadow-sm'
              : 'text-[#8E9299] hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Próximos ({upcomingList.length})
        </button>

        <button
          onClick={() => setActiveTab('historico')}
          className={`flex-1 py-2 rounded-lg font-sans text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${
            activeTab === 'historico'
              ? 'bg-[#DAA520] text-black shadow-sm'
              : 'text-[#8E9299] hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Histórico ({historyList.length})
        </button>
      </div>

      {/* EMPTY STATE */}
      {currentList.length === 0 && (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto text-amber-400">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-mono">
              Você ainda não possui agendamentos {activeTab === 'proximos' ? 'próximos' : 'no histórico'}.
            </h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Garanta seu estilo agendando seu corte ou barba na Barbearia JADSON BARBER.
            </p>
          </div>
          <button
            onClick={() => setActivePage('agenda')}
            className="py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 inline-flex items-center gap-2"
          >
            <span>Agendar Agora</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* APPOINTMENTS CARDS LIST */}
      <div className="space-y-4">
        {currentList.map((app) => {
          const isCancelled = app.status === 'Cancelado';
          const isConfirmed = app.status === 'Confirmado';
          const isCompleted = app.status === 'Concluído';

          return (
            <div
              key={app.id}
              className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl hover:border-neutral-700 transition-all"
            >
              {/* Header Info & Status Badge */}
              <div className="flex items-start justify-between gap-3 border-b border-neutral-800/80 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-white font-mono">
                      {formatDateBR(app.date)} ({getWeekdayName(app.date)})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-300 font-mono">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {app.startTime} às {app.endTime} ({app.totalDuration} min)
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg font-mono flex items-center gap-1.5 border ${
                    isCancelled
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : isConfirmed
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : isCompleted
                      ? 'bg-neutral-800 text-gray-400 border-neutral-700'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {isCancelled && <CircleX className="w-3.5 h-3.5" />}
                  {isConfirmed && <CircleCheck className="w-3.5 h-3.5" />}
                  {!isCancelled && !isConfirmed && <Calendar className="w-3.5 h-3.5" />}
                  {app.status}
                </span>
              </div>

              {/* Barber & Price */}
              <div className="grid grid-cols-2 gap-4 border-b border-neutral-800/80 pb-3">
                <div>
                  <span className="text-[10px] uppercase text-amber-400 font-bold block">
                    Barbeiro
                  </span>
                  <span className="text-sm font-bold text-white font-mono flex items-center gap-1.5 mt-0.5">
                    <User className="w-4 h-4 text-gray-400" />
                    {app.barberName}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase text-amber-400 font-bold block">
                    Valor Total
                  </span>
                  <span className="text-lg font-black text-amber-400 font-mono">
                    R$ {app.totalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* Services List */}
              <div>
                <span className="text-[10px] uppercase text-amber-400 font-bold block mb-1">
                  Serviços
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {app.services.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-neutral-950 text-gray-200 px-2.5 py-1 rounded-lg border border-neutral-800 flex items-center gap-1"
                    >
                      <Scissors className="w-3 h-3 text-amber-400" />
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions (Only for active upcoming appointments) */}
              {!isCancelled && !isCompleted && activeTab === 'proximos' && (
                <div className="pt-2 flex flex-wrap gap-2 border-t border-neutral-800/80">
                  <button
                    onClick={() => handleOpenReschedule(app)}
                    className="flex-1 py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-colors border border-neutral-700"
                  >
                    <CalendarClock className="w-4 h-4" />
                    Reagendar
                  </button>

                  <button
                    onClick={() => handleOpenEditServices(app)}
                    className="flex-1 py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-gray-200 font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-colors border border-neutral-700"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar Serviços
                  </button>

                  <button
                    onClick={() => setCancelModalAppointment(app)}
                    className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-colors border border-rose-500/30"
                  >
                    <CircleX className="w-4 h-4" />
                    Cancelar
                  </button>
                </div>
              )}

              {/* Actions for History tab */}
              {activeTab === 'historico' && (
                <div className="pt-2 flex justify-end border-t border-neutral-800/80">
                  <button
                    onClick={() => deleteAppointment(app.id)}
                    className="py-1.5 px-3 rounded-xl bg-neutral-800/80 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 font-bold text-xs uppercase flex items-center gap-1.5 transition-colors border border-neutral-700 hover:border-rose-500/30"
                    title="Excluir este item do histórico"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir do Histórico</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CANCEL CONFIRMATION MODAL */}
      <Modal
        isOpen={cancelModalAppointment !== null}
        onClose={() => setCancelModalAppointment(null)}
        title="Cancelar Agendamento"
        icon={<CircleX className="w-6 h-6 text-rose-400" />}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            Tem certeza que deseja cancelar este agendamento na Barbearia JADSON BARBER?
          </p>

          {cancelModalAppointment && (
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-xs text-gray-300 space-y-1 font-mono">
              <p><strong className="text-white">Data:</strong> {formatDateBR(cancelModalAppointment.date)}</p>
              <p><strong className="text-white">Horário:</strong> {cancelModalAppointment.startTime}</p>
              <p><strong className="text-white">Barbeiro:</strong> {cancelModalAppointment.barberName}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setCancelModalAppointment(null)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-neutral-800 text-gray-300 hover:text-white font-bold text-xs uppercase"
            >
              Voltar
            </button>
            <button
              onClick={handleConfirmCancel}
              className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/20"
            >
              Sim, Cancelar
            </button>
          </div>
        </div>
      </Modal>

      {/* RESCHEDULE MODAL */}
      <Modal
        isOpen={rescheduleAppointmentItem !== null}
        onClose={() => setRescheduleAppointmentItem(null)}
        title="Reagendar Atendimento"
        icon={<CalendarClock className="w-6 h-6 text-amber-400" />}
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Barber Selection */}
          <div>
            <label className="text-xs text-gray-300 block mb-1">Escolha o Barbeiro:</label>
            <select
              value={rescheduleBarberId}
              onChange={(e) => {
                setRescheduleBarberId(e.target.value);
                setRescheduleSlot(null);
              }}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.role})
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="text-xs text-gray-300 block mb-1">Escolha a Nova Data:</label>
            <input
              type="date"
              value={rescheduleDate}
              onChange={(e) => {
                setRescheduleDate(e.target.value);
                setRescheduleSlot(null);
              }}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          {/* Available Slots */}
          <div>
            <label className="text-xs text-gray-300 block mb-1.5">Horários Disponíveis:</label>
            {rescheduleAvailableSlots.length === 0 ? (
              <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                Nenhum horário disponível para a data ou barbeiro selecionados.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 bg-neutral-950 rounded-xl border border-neutral-800">
                {rescheduleAvailableSlots.map((slot) => {
                  const isSelected = rescheduleSlot?.time === slot.time;
                  return (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setRescheduleSlot(slot)}
                      className={`py-2 px-1 rounded-lg text-center text-xs font-mono font-bold border transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-black border-amber-400'
                          : slot.available
                          ? 'bg-neutral-900 text-white border-neutral-800 hover:border-amber-500/50'
                          : 'bg-neutral-950 text-gray-600 border-neutral-900 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-3 border-t border-neutral-800">
            <button
              onClick={() => setRescheduleAppointmentItem(null)}
              className="py-2.5 px-4 rounded-xl bg-neutral-800 text-gray-300 hover:text-white text-xs font-bold uppercase"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmReschedule}
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider"
            >
              Confirmar Reagendamento
            </button>
          </div>
        </div>
      </Modal>

      {/* EDIT SERVICES MODAL */}
      <Modal
        isOpen={editServicesAppointmentItem !== null}
        onClose={() => setEditServicesAppointmentItem(null)}
        title="Editar Serviços do Agendamento"
        icon={<Pencil className="w-6 h-6 text-amber-400" />}
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <p className="text-xs text-gray-300">
            Altere os serviços desejados. Se a nova duração total for maior do que o horário atual, solicite um novo horário.
          </p>

          {/* Combos */}
          <div>
            <h4 className="text-xs font-bold uppercase text-amber-400 mb-2 font-mono">Combos</h4>
            <div className="space-y-2">
              {services
                .filter((s) => s.category === 'combo')
                .map((combo) => {
                  const isSelected = editSelectedCombo?.id === combo.id;
                  return (
                    <button
                      key={combo.id}
                      onClick={() => {
                        if (isSelected) {
                          setEditSelectedCombo(null);
                        } else {
                          setEditSelectedCombo(combo);
                          setEditSelectedServices([]);
                        }
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between text-xs ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-white font-bold'
                          : 'bg-neutral-950 border-neutral-800 text-gray-300'
                      }`}
                    >
                      <span>{combo.name}</span>
                      <span className="font-mono text-amber-400">R$ {combo.price.toFixed(2)}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Individual */}
          <div>
            <h4 className="text-xs font-bold uppercase text-amber-400 mb-2 font-mono">Serviços Individuais</h4>
            <div className="space-y-2">
              {services
                .filter((s) => s.category === 'individual')
                .map((service) => {
                  const isSelected = editSelectedServices.some((s) => s.id === service.id);
                  const isDisabled = editSelectedCombo !== null;

                  return (
                    <button
                      key={service.id}
                      disabled={isDisabled}
                      onClick={() => {
                        if (isSelected) {
                          setEditSelectedServices((prev) => prev.filter((s) => s.id !== service.id));
                        } else {
                          setEditSelectedServices((prev) => [...prev, service]);
                        }
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between text-xs ${
                        isDisabled
                          ? 'opacity-40 bg-neutral-950 border-neutral-900 cursor-not-allowed text-gray-600'
                          : isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-white font-bold'
                          : 'bg-neutral-950 border-neutral-800 text-gray-300'
                      }`}
                    >
                      <span>{service.name}</span>
                      <span className="font-mono text-amber-400">R$ {service.price.toFixed(2)}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t border-neutral-800">
            <button
              onClick={() => setEditServicesAppointmentItem(null)}
              className="py-2.5 px-4 rounded-xl bg-neutral-800 text-gray-300 hover:text-white text-xs font-bold uppercase"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmEditServices}
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      </Modal>

      {/* CLEAR HISTORY CONFIRMATION MODAL */}
      <Modal
        isOpen={isClearHistoryModalOpen}
        onClose={() => setIsClearHistoryModalOpen(false)}
        title="Excluir Todo o Histórico"
        icon={<Trash2 className="w-6 h-6 text-rose-400" />}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-300 leading-relaxed">
            Tem certeza que deseja apagar permanentemente todo o seu histórico de agendamentos passados e cancelados?
          </p>

          <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl text-xs text-rose-300 font-mono flex items-center gap-2">
            <Info className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Esta ação não poderá ser desfeita. ({historyList.length} itens serão removidos)</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsClearHistoryModalOpen(false)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-neutral-800 text-gray-300 hover:text-white font-bold text-xs uppercase"
            >
              Cancelar
            </button>
            <button
              onClick={async () => {
                await clearHistory();
                setIsClearHistoryModalOpen(false);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/20"
            >
              Sim, Excluir Tudo
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
