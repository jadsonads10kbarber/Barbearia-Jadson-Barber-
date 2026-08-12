import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  Clock,
  User,
  Scissors,
  CheckCircle2,
  XCircle,
  Calendar as CalendarIcon,
  X,
  Phone,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Appointment, Barber, ServiceItem, AppointmentService } from '../../types';
import { getAvailableSlots } from '../../utils/scheduling';

export const AdminAgendamentosPage: React.FC = () => {
  const {
    appointments,
    barbers,
    services,
    blockedDates,
    addAppointment,
    updateAppointmentStatus,
    rescheduleAppointment,
    deleteAppointment,
    addToast,
  } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedBarberId, setSelectedBarberId] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [targetAppointment, setTargetAppointment] = useState<Appointment | null>(null);

  // Manual Booking Form State
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formCustomerPhone, setFormCustomerPhone] = useState('');
  const [formBarberId, setFormBarberId] = useState(barbers[0]?.id || '');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formSelectedServiceIds, setFormSelectedServiceIds] = useState<string[]>([]);
  const [formSelectedTime, setFormSelectedTime] = useState('');

  // Reschedule Form State
  const [reschDate, setReschDate] = useState(new Date().toISOString().split('T')[0]);
  const [reschTime, setReschTime] = useState('');
  const [reschBarberId, setReschBarberId] = useState('');

  // Selected barber for manual booking
  const activeFormBarber = barbers.find((b) => b.id === formBarberId);

  // Calculate selected services & duration
  const selectedServicesList = services.filter((s) => formSelectedServiceIds.includes(s.id));
  const totalDuration = selectedServicesList.reduce((acc, s) => acc + s.durationMinutes, 0) || 30;
  const totalPrice = selectedServicesList.reduce((acc, s) => acc + s.price, 0);

  // Compute Available Slots
  const availableSlots = getAvailableSlots(
    formDate,
    activeFormBarber,
    totalDuration,
    appointments,
    blockedDates
  );

  // Computed Reschedule Slots
  const activeReschBarber = barbers.find((b) => b.id === (reschBarberId || targetAppointment?.barberId));
  const reschSlots = getAvailableSlots(
    reschDate,
    activeReschBarber,
    targetAppointment?.totalDuration || 30,
    appointments,
    blockedDates
  );

  // Filter Appointments
  const filteredAppointments = appointments.filter((app) => {
    if (selectedDate && app.date !== selectedDate && selectedDate !== 'todas') return false;
    if (selectedBarberId !== 'todos' && app.barberId !== selectedBarberId) return false;
    if (selectedStatus !== 'todos' && app.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = app.customerName.toLowerCase().includes(q);
      const matchPhone = app.customerPhone.includes(q);
      if (!matchName && !matchPhone) return false;
    }
    return true;
  });

  const toggleServiceSelection = (servId: string) => {
    if (formSelectedServiceIds.includes(servId)) {
      setFormSelectedServiceIds(formSelectedServiceIds.filter((id) => id !== servId));
    } else {
      setFormSelectedServiceIds([...formSelectedServiceIds, servId]);
    }
  };

  const handleManualBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerName.trim() || !formCustomerPhone.trim()) {
      addToast('Por favor, informe o nome e telefone do cliente.', 'error');
      return;
    }
    if (selectedServicesList.length === 0) {
      addToast('Selecione pelo menos um serviço ou combo.', 'error');
      return;
    }
    if (!formSelectedTime) {
      addToast('Selecione um horário disponível.', 'error');
      return;
    }

    const [startH, startM] = formSelectedTime.split(':').map(Number);
    const startMins = startH * 60 + startM;
    const endMins = startMins + totalDuration;
    const endH = Math.floor(endMins / 60);
    const endM = endMins % 60;
    const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    const isCombo = selectedServicesList.some((s) => s.category === 'combo');

    await addAppointment({
      customerId: `cust-manual-${Date.now()}`,
      customerName: formCustomerName.trim(),
      customerPhone: formCustomerPhone.trim(),
      barberId: activeFormBarber!.id,
      barberName: activeFormBarber!.name,
      date: formDate,
      startTime: formSelectedTime,
      endTime: endTimeStr,
      services: selectedServicesList.map((s) => ({
        id: s.id,
        name: s.name,
        price: s.price,
        durationMinutes: s.durationMinutes,
      })),
      isCombo,
      totalDuration,
      totalPrice,
      status: 'Confirmado',
    });

    setIsManualModalOpen(false);
    setFormCustomerName('');
    setFormCustomerPhone('');
    setFormSelectedServiceIds([]);
    setFormSelectedTime('');
  };

  const handleOpenReschedule = (app: Appointment) => {
    setTargetAppointment(app);
    setReschDate(app.date);
    setReschBarberId(app.barberId);
    setReschTime(app.startTime);
    setIsRescheduleModalOpen(true);
  };

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAppointment || !reschTime) return;

    const [startH, startM] = reschTime.split(':').map(Number);
    const startMins = startH * 60 + startM;
    const endMins = startMins + targetAppointment.totalDuration;
    const endH = Math.floor(endMins / 60);
    const endM = endMins % 60;
    const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    const newBarber = barbers.find((b) => b.id === reschBarberId) || {
      id: targetAppointment.barberId,
      name: targetAppointment.barberName,
    };

    await rescheduleAppointment(
      targetAppointment.id,
      reschDate,
      reschTime,
      endTimeStr,
      newBarber.id,
      newBarber.name
    );

    setIsRescheduleModalOpen(false);
    setTargetAppointment(null);
  };

  return (
    <AdminLayout
      title="Gestão Geral de Agendamentos"
      subtitle="Visualização, criação manual e controle de agenda de todos os barbeiros"
    >
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111111] p-4 rounded-2xl border border-neutral-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-black/60 px-3 py-2 rounded-xl border border-neutral-800">
            <CalendarIcon className="w-4 h-4 text-[#DAA520]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs text-white font-mono focus:outline-none"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('todas')}
                className="text-[10px] text-neutral-400 hover:text-white uppercase font-mono font-bold"
              >
                Ver Todas
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 bg-black/60 px-3 py-2 rounded-xl border border-neutral-800">
            <User className="w-4 h-4 text-neutral-400" />
            <select
              value={selectedBarberId}
              onChange={(e) => setSelectedBarberId(e.target.value)}
              className="bg-transparent text-xs text-white font-mono focus:outline-none"
            >
              <option value="todos">Todos os Barbeiros</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => setIsManualModalOpen(true)}
          className="py-2.5 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar Manualmente</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente ou telefone..."
            className="w-full bg-black/80 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#DAA520]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 w-full md:w-auto">
          {['todos', 'Agendado', 'Confirmado', 'Em atendimento', 'Concluído', 'Cancelado'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`py-1.5 px-3 rounded-lg font-mono text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                selectedStatus === st ? 'bg-[#DAA520] text-black' : 'text-neutral-400 hover:text-white bg-black/40'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="bg-[#111111] border border-dashed border-neutral-800 rounded-2xl p-10 text-center space-y-2">
            <Clock className="w-8 h-8 text-neutral-600 mx-auto" />
            <p className="text-xs font-mono text-neutral-400">
              Nenhum agendamento encontrado para o filtro selecionado.
            </p>
          </div>
        ) : (
          filteredAppointments.map((app) => (
            <div
              key={app.id}
              className="bg-[#111111] border border-neutral-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-center shrink-0 min-w-[80px]">
                  <div className="text-xs font-mono font-bold text-amber-400">{app.startTime}</div>
                  <div className="text-[10px] text-neutral-500 font-mono">até {app.endTime}</div>
                  <div className="text-[9px] text-neutral-400 font-mono mt-1 font-bold">{app.date}</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white font-sans">{app.customerName}</span>
                    <span className="text-xs text-neutral-400 font-mono">({app.customerPhone})</span>
                  </div>

                  <div className="text-xs text-amber-400 font-semibold">
                    {app.services.map((s) => s.name).join(' + ')}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 font-mono">
                    <span>Barbeiro: <strong className="text-white">{app.barberName}</strong></span>
                    <span>•</span>
                    <span>Duração: <strong className="text-white">{app.totalDuration} min</strong></span>
                    <span>•</span>
                    <span>Valor: <strong className="text-white">R$ {app.totalPrice.toFixed(2)}</strong></span>
                  </div>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-neutral-800">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                    app.status === 'Concluído'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : app.status === 'Em atendimento'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                      : app.status === 'Confirmado'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      : app.status === 'Cancelado'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}
                >
                  {app.status}
                </span>

                {app.status !== 'Concluído' && app.status !== 'Cancelado' && (
                  <>
                    <button
                      onClick={() => handleOpenReschedule(app)}
                      className="py-1.5 px-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-amber-400 text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reagendar</span>
                    </button>

                    <button
                      onClick={() => updateAppointmentStatus(app.id, 'Cancelado')}
                      className="py-1.5 px-2.5 rounded-xl bg-neutral-900 hover:bg-red-950/60 text-red-400 border border-neutral-800 text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </>
                )}

                <button
                  onClick={() => deleteAppointment(app.id)}
                  className="p-2 rounded-xl bg-neutral-900 hover:bg-red-900/40 text-neutral-500 hover:text-red-400 border border-neutral-800 transition-colors cursor-pointer"
                  title="Excluir do sistema"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Manual Booking Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#111111] border border-neutral-800 rounded-3xl p-6 space-y-4 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#DAA520]" />
                Novo Agendamento Manual
              </h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white bg-neutral-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualBookingSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">Nome do Cliente</label>
                  <input
                    type="text"
                    value={formCustomerName}
                    onChange={(e) => setFormCustomerName(e.target.value)}
                    placeholder="Nome completo"
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">Telefone / WhatsApp</label>
                  <input
                    type="tel"
                    value={formCustomerPhone}
                    onChange={(e) => setFormCustomerPhone(e.target.value)}
                    placeholder="(11) 99999-8888"
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">Barbeiro</label>
                  <select
                    value={formBarberId}
                    onChange={(e) => setFormBarberId(e.target.value)}
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                  >
                    {barbers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">Data</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                  />
                </div>
              </div>

              {/* Service Selection Checklist */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">Selecione os Serviços/Combos</label>
                <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-black/60 rounded-xl border border-neutral-800">
                  {services.map((s) => {
                    const isSelected = formSelectedServiceIds.includes(s.id);
                    return (
                      <div
                        key={s.id}
                        onClick={() => toggleServiceSelection(s.id)}
                        className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500/50 text-white font-bold'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white'
                        }`}
                      >
                        <div>
                          <span>{s.name}</span>
                          <span className="text-[10px] text-neutral-400 font-mono ml-2">({s.durationMinutes} min)</span>
                        </div>
                        <span className="font-mono text-amber-400">R$ {s.price.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Slots Available */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">Horários Disponíveis ({availableSlots.filter((s) => s.available).length})</label>
                <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1">
                  {availableSlots.length === 0 ? (
                    <p className="col-span-4 text-xs text-neutral-500 font-mono text-center py-3">
                      Sem horários para esta data/barbeiro.
                    </p>
                  ) : (
                    availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setFormSelectedTime(slot.time)}
                        className={`py-2 rounded-xl font-mono text-xs font-bold transition-all ${
                          !slot.available
                            ? 'bg-neutral-900/50 text-neutral-600 border border-neutral-900 cursor-not-allowed'
                            : formSelectedTime === slot.time
                            ? 'bg-[#DAA520] text-black border border-amber-400 shadow-md scale-105'
                            : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:border-amber-500/50'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-black/80 border border-neutral-800 rounded-xl p-3 flex justify-between items-center text-xs font-mono font-bold">
                <span className="text-neutral-400">Total: {totalDuration} min</span>
                <span className="text-amber-400 text-sm">R$ {totalPrice.toFixed(2)}</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Confirmar Agendamento
              </button>

            </form>

          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {isRescheduleModalOpen && targetAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#111111] border border-neutral-800 rounded-3xl p-6 space-y-4 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                Reagendar Agendamento
              </h3>
              <button
                onClick={() => setIsRescheduleModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white bg-neutral-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReschedule} className="space-y-4">
              <div className="text-xs text-neutral-300 font-sans space-y-1">
                <div>Cliente: <strong className="text-white">{targetAppointment.customerName}</strong></div>
                <div>Serviço: <strong className="text-amber-400">{targetAppointment.services.map((s) => s.name).join(', ')}</strong></div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">Nova Data</label>
                <input
                  type="date"
                  value={reschDate}
                  onChange={(e) => setReschDate(e.target.value)}
                  className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">Barbeiro</label>
                <select
                  value={reschBarberId}
                  onChange={(e) => setReschBarberId(e.target.value)}
                  className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                >
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">Horários Livres</label>
                <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto">
                  {reschSlots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setReschTime(slot.time)}
                      className={`py-2 rounded-xl font-mono text-xs font-bold transition-all ${
                        !slot.available
                          ? 'bg-neutral-900/50 text-neutral-600 cursor-not-allowed'
                          : reschTime === slot.time
                          ? 'bg-[#DAA520] text-black border border-amber-400'
                          : 'bg-neutral-900 text-neutral-300 hover:border-amber-500/50'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Salvar Reagendamento
              </button>
            </form>

          </div>
        </div>
      )}

    </AdminLayout>
  );
};
