import React, { useState, useEffect } from 'react';
import {
  Clock,
  CalendarX,
  Plus,
  Trash2,
  X,
  Check,
  CheckCircle2,
  XCircle,
  Coffee,
  Sparkles,
  Save,
  RotateCcw,
  CalendarDays,
  Info,
  Sun,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { WeeklyDayConfig } from '../../types';
import { timeToMinutes, minutesToTime } from '../../utils/scheduling';

const DAYS_OF_WEEK = [
  { dayOfWeek: 1, name: 'Segunda-feira', short: 'Seg' },
  { dayOfWeek: 2, name: 'Terça-feira', short: 'Ter' },
  { dayOfWeek: 3, name: 'Quarta-feira', short: 'Qua' },
  { dayOfWeek: 4, name: 'Quinta-feira', short: 'Qui' },
  { dayOfWeek: 5, name: 'Sexta-feira', short: 'Sex' },
  { dayOfWeek: 6, name: 'Sábado', short: 'Sáb' },
  { dayOfWeek: 0, name: 'Domingo', short: 'Dom' },
];

export const AdminHorariosPage: React.FC = () => {
  const { barbershopInfo, updateSettings, blockedDates, addBlockedDate, deleteBlockedDate, addToast } = useApp();

  // Initialize weekly schedule
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyDayConfig[]>(() => {
    if (barbershopInfo.weeklySchedule && barbershopInfo.weeklySchedule.length > 0) {
      return barbershopInfo.weeklySchedule;
    }
    return [
      { dayOfWeek: 1, dayName: 'Segunda-feira', active: true, startTime: '08:00', endTime: '20:00', lunchStart: '12:00', lunchEnd: '13:00', disabledSlots: [], extraSlots: [] },
      { dayOfWeek: 2, dayName: 'Terça-feira', active: true, startTime: '08:00', endTime: '20:00', lunchStart: '12:00', lunchEnd: '13:00', disabledSlots: [], extraSlots: [] },
      { dayOfWeek: 3, dayName: 'Quarta-feira', active: true, startTime: '08:00', endTime: '20:00', lunchStart: '12:00', lunchEnd: '13:00', disabledSlots: [], extraSlots: [] },
      { dayOfWeek: 4, dayName: 'Quinta-feira', active: true, startTime: '08:00', endTime: '20:00', lunchStart: '12:00', lunchEnd: '13:00', disabledSlots: [], extraSlots: [] },
      { dayOfWeek: 5, dayName: 'Sexta-feira', active: true, startTime: '08:00', endTime: '20:00', lunchStart: '12:00', lunchEnd: '13:00', disabledSlots: [], extraSlots: [] },
      { dayOfWeek: 6, dayName: 'Sábado', active: true, startTime: '08:00', endTime: '19:00', lunchStart: '12:00', lunchEnd: '13:00', disabledSlots: [], extraSlots: [] },
      { dayOfWeek: 0, dayName: 'Domingo', active: false, startTime: '09:00', endTime: '14:00', lunchStart: '12:00', lunchEnd: '13:00', disabledSlots: [], extraSlots: [] },
    ];
  });

  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(1); // Default Segunda-feira
  const [newExtraTime, setNewExtraTime] = useState<string>('20:30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal for blocked dates
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockDate, setBlockDate] = useState(new Date().toISOString().split('T')[0]);
  const [blockReason, setBlockReason] = useState('Feriado / Manutenção');
  const [blockNotes, setBlockNotes] = useState('');

  // Sync state if barbershopInfo updates
  useEffect(() => {
    if (barbershopInfo.weeklySchedule && barbershopInfo.weeklySchedule.length > 0) {
      setWeeklySchedule(barbershopInfo.weeklySchedule);
    }
  }, [barbershopInfo.weeklySchedule]);

  // Current active day config
  const currentDayConfig = weeklySchedule.find((d) => d.dayOfWeek === selectedDayOfWeek) || {
    dayOfWeek: selectedDayOfWeek,
    dayName: DAYS_OF_WEEK.find((d) => d.dayOfWeek === selectedDayOfWeek)?.name || 'Dia',
    active: true,
    startTime: '08:00',
    endTime: '20:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    disabledSlots: [],
    extraSlots: [],
  };

  // Helper to update current day's config in state
  const updateCurrentDayConfig = (updated: Partial<WeeklyDayConfig>) => {
    setWeeklySchedule((prev) =>
      prev.map((item) => (item.dayOfWeek === selectedDayOfWeek ? { ...item, ...updated } : item))
    );
  };

  // Generate slot list for selected day
  const generateSlotList = () => {
    const startMins = timeToMinutes(currentDayConfig.startTime || '08:00');
    const endMins = timeToMinutes(currentDayConfig.endTime || '20:00');
    const lunchStartMins = timeToMinutes(currentDayConfig.lunchStart || '12:00');
    const lunchEndMins = timeToMinutes(currentDayConfig.lunchEnd || '13:00');

    const slotsSet = new Set<string>();

    // Standard 30-min slots
    for (let mins = startMins; mins <= endMins - 30; mins += 30) {
      slotsSet.add(minutesToTime(mins));
    }

    // Add extra slots
    (currentDayConfig.extraSlots || []).forEach((e) => slotsSet.add(e));

    const sortedSlots = Array.from(slotsSet).sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

    return sortedSlots.map((timeStr) => {
      const mins = timeToMinutes(timeStr);
      const isExtra = (currentDayConfig.extraSlots || []).includes(timeStr);
      const isDisabled = (currentDayConfig.disabledSlots || []).includes(timeStr);
      const isLunch = mins >= lunchStartMins && mins < lunchEndMins;

      return {
        time: timeStr,
        isExtra,
        isDisabled,
        isLunch,
        isActive: !isDisabled,
      };
    });
  };

  const currentSlots = generateSlotList();

  // Toggle slot active/disabled
  const handleToggleSlot = (timeStr: string) => {
    const currentDisabled = currentDayConfig.disabledSlots || [];
    if (currentDisabled.includes(timeStr)) {
      // Enable slot
      updateCurrentDayConfig({
        disabledSlots: currentDisabled.filter((t) => t !== timeStr),
      });
    } else {
      // Disable slot
      updateCurrentDayConfig({
        disabledSlots: [...currentDisabled, timeStr],
      });
    }
  };

  // Add extra slot
  const handleAddExtraSlot = () => {
    if (!newExtraTime) {
      addToast('Selecione um horário para acrescentar.', 'error');
      return;
    }

    const currentExtras = currentDayConfig.extraSlots || [];
    if (currentExtras.includes(newExtraTime)) {
      addToast(`O horário extra ${newExtraTime} já existe neste dia.`, 'info');
      return;
    }

    const currentDisabled = currentDayConfig.disabledSlots || [];

    updateCurrentDayConfig({
      extraSlots: [...currentExtras, newExtraTime].sort((a, b) => timeToMinutes(a) - timeToMinutes(b)),
      disabledSlots: currentDisabled.filter((t) => t !== newExtraTime), // Ensure it is active
    });

    addToast(`Horário extra ${newExtraTime} acrescentado para ${currentDayConfig.dayName}!`, 'success');
  };

  // Remove extra slot
  const handleRemoveExtraSlot = (timeStr: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentExtras = currentDayConfig.extraSlots || [];
    const currentDisabled = currentDayConfig.disabledSlots || [];

    updateCurrentDayConfig({
      extraSlots: currentExtras.filter((t) => t !== timeStr),
      disabledSlots: currentDisabled.filter((t) => t !== timeStr),
    });

    addToast(`Horário extra ${timeStr} removido.`, 'info');
  };

  // Quick actions for slots
  const handleEnableAllSlots = () => {
    updateCurrentDayConfig({ disabledSlots: [] });
    addToast('Todos os horários do dia foram ativados.', 'success');
  };

  const handleDisableLunchSlots = () => {
    const lunchStartMins = timeToMinutes(currentDayConfig.lunchStart || '12:00');
    const lunchEndMins = timeToMinutes(currentDayConfig.lunchEnd || '13:00');

    const lunchSlots = currentSlots
      .filter((s) => {
        const m = timeToMinutes(s.time);
        return m >= lunchStartMins && m < lunchEndMins;
      })
      .map((s) => s.time);

    const newDisabled = Array.from(new Set([...(currentDayConfig.disabledSlots || []), ...lunchSlots]));
    updateCurrentDayConfig({ disabledSlots: newDisabled });
    addToast('Horários do intervalo de almoço bloqueados.', 'info');
  };

  const handleDisableAllSlots = () => {
    const allTimeStrs = currentSlots.map((s) => s.time);
    updateCurrentDayConfig({ disabledSlots: allTimeStrs });
    addToast('Todos os horários do dia foram desativados.', 'info');
  };

  // Save all weekly schedule settings
  const handleSaveSchedule = async () => {
    setIsSubmitting(true);
    try {
      const weekdayItem = weeklySchedule.find((d) => d.dayOfWeek === 1);
      const satItem = weeklySchedule.find((d) => d.dayOfWeek === 6);
      const sunItem = weeklySchedule.find((d) => d.dayOfWeek === 0);

      const hoursSummary = {
        weekdays: weekdayItem?.active
          ? `Segunda a Sexta: ${weekdayItem.startTime} às ${weekdayItem.endTime}`
          : 'Segunda a Sexta: Fechado',
        saturday: satItem?.active
          ? `Sábado: ${satItem.startTime} às ${satItem.endTime}`
          : 'Sábado: Fechado',
        sunday: sunItem?.active
          ? `Domingo: ${sunItem.startTime} às ${sunItem.endTime}`
          : 'Domingo: Fechado',
      };

      await updateSettings({
        weeklySchedule,
        hours: hoursSummary,
      });

      addToast('Configuração de horários atualizada com sucesso!', 'success');
    } catch (err) {
      addToast('Erro ao salvar horários.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create blocked date
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

    setIsBlockModalOpen(false);
    setBlockNotes('');
  };

  return (
    <AdminLayout
      title="Gerenciamento de Horários e Agenda Semanal"
      subtitle="Configure o funcionamento por dia da semana, personalize os botões de horários e acrescente horários extras"
    >
      {/* Top Save Bar */}
      <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-mono font-bold uppercase text-white">Configuração Global de Atendimento</h2>
            <p className="text-xs text-neutral-400 font-sans">
              As alterações feitas aqui afetam imediatamente os horários disponíveis no aplicativo dos clientes
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveSchedule}
          disabled={isSubmitting}
          className="py-2.5 px-5 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Salvando...' : 'Salvar Todos os Horários'}</span>
        </button>
      </div>

      {/* Days of Week Selector Tabs */}
      <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-mono font-bold uppercase text-neutral-400 flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
            Selecione o Dia da Semana
          </span>
          <span className="text-[11px] font-mono text-amber-400 font-bold">
            {currentDayConfig.dayName} {currentDayConfig.active ? '(Aberto)' : '(Fechado)'}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {DAYS_OF_WEEK.map((d) => {
            const dayConfig = weeklySchedule.find((item) => item.dayOfWeek === d.dayOfWeek);
            const isSelected = selectedDayOfWeek === d.dayOfWeek;
            const isActiveDay = dayConfig?.active ?? true;

            return (
              <button
                key={d.dayOfWeek}
                onClick={() => setSelectedDayOfWeek(d.dayOfWeek)}
                className={`py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center ${
                  isSelected
                    ? 'bg-[#DAA520] text-black font-bold border border-amber-300 shadow-lg scale-[1.02]'
                    : isActiveDay
                    ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800'
                    : 'bg-black/60 text-neutral-600 border border-neutral-900'
                }`}
              >
                <span className="text-xs font-mono font-bold uppercase">{d.short}</span>
                <span className={`text-[9px] font-mono uppercase font-semibold ${isSelected ? 'text-black' : isActiveDay ? 'text-emerald-400' : 'text-rose-500'}`}>
                  {isActiveDay ? 'Aberto' : 'Fechado'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Configuration Card for Selected Day */}
      <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-5 space-y-6">
        
        {/* Day Header & Status Switch */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <h3 className="text-base font-mono font-bold text-white uppercase flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-400" />
              Horários de {currentDayConfig.dayName}
            </h3>
            <p className="text-xs text-neutral-400 font-sans mt-0.5">
              Defina os limites de funcionamento e clique nos botões para ativar/desativar horários específicos
            </p>
          </div>

          <div className="flex items-center gap-3 bg-black/60 p-2 rounded-xl border border-neutral-800">
            <span className="text-xs font-mono font-bold uppercase text-neutral-300">Funcionamento:</span>
            <button
              type="button"
              onClick={() => updateCurrentDayConfig({ active: !currentDayConfig.active })}
              className={`py-1.5 px-3.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                currentDayConfig.active
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              }`}
            >
              {currentDayConfig.active ? '✓ Dia Ativo (Aberto)' : '✕ Dia Fechado'}
            </button>
          </div>
        </div>

        {/* Operating Hours Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-black/50 p-4 rounded-xl border border-neutral-800/80">
          <div className="space-y-1">
            <label className="text-xs font-mono font-bold uppercase text-neutral-300">Horário de Abertura</label>
            <input
              type="time"
              value={currentDayConfig.startTime || '08:00'}
              onChange={(e) => updateCurrentDayConfig({ startTime: e.target.value })}
              className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
              disabled={!currentDayConfig.active}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-bold uppercase text-neutral-300">Horário de Fechamento</label>
            <input
              type="time"
              value={currentDayConfig.endTime || '20:00'}
              onChange={(e) => updateCurrentDayConfig({ endTime: e.target.value })}
              className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
              disabled={!currentDayConfig.active}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-bold uppercase text-neutral-300 flex items-center gap-1">
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              Início do Almoço
            </label>
            <input
              type="time"
              value={currentDayConfig.lunchStart || '12:00'}
              onChange={(e) => updateCurrentDayConfig({ lunchStart: e.target.value })}
              className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
              disabled={!currentDayConfig.active}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-bold uppercase text-neutral-300 flex items-center gap-1">
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              Fim do Almoço
            </label>
            <input
              type="time"
              value={currentDayConfig.lunchEnd || '13:00'}
              onChange={(e) => updateCurrentDayConfig({ lunchEnd: e.target.value })}
              className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
              disabled={!currentDayConfig.active}
            />
          </div>
        </div>

        {/* Section 2: Acrescentar Horário Extra */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-mono font-bold uppercase text-amber-400">
                Acrescentar Horário Extra para {currentDayConfig.dayName}
              </h4>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">
              {currentDayConfig.extraSlots?.length || 0} horário(s) extra(s) cadastrado(s)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-black border border-neutral-800 rounded-xl px-3 py-2">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <input
                type="time"
                value={newExtraTime}
                onChange={(e) => setNewExtraTime(e.target.value)}
                className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={handleAddExtraSlot}
              disabled={!currentDayConfig.active}
              className="py-2 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Acrescentar Horário Extra</span>
            </button>
          </div>
        </div>

        {/* Section 3: Botões de Horários Grid */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-2">
            <div>
              <h4 className="text-xs font-mono font-bold uppercase text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#DAA520]" />
                Botões de Horários - {currentDayConfig.dayName} ({currentSlots.length} gerados)
              </h4>
              <p className="text-[11px] text-neutral-400 font-sans">
                Clique nos botões abaixo para ativar ou desativar cada horário individualmente
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleEnableAllSlots}
                className="py-1 px-2.5 rounded-lg bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase hover:bg-emerald-900/50 transition-colors cursor-pointer"
              >
                Ativar Todos
              </button>

              <button
                type="button"
                onClick={handleDisableLunchSlots}
                className="py-1 px-2.5 rounded-lg bg-purple-950/40 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold uppercase hover:bg-purple-900/50 transition-colors cursor-pointer"
              >
                Bloquear Almoço
              </button>

              <button
                type="button"
                onClick={handleDisableAllSlots}
                className="py-1 px-2.5 rounded-lg bg-rose-950/40 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold uppercase hover:bg-rose-900/50 transition-colors cursor-pointer"
              >
                Desativar Todos
              </button>
            </div>
          </div>

          {/* Color Legend Bar */}
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-neutral-400 bg-black/40 p-2.5 rounded-xl border border-neutral-800">
            <span className="font-bold text-white uppercase text-[10px]">Legenda:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500"></span>
              <span>Ativo (Disponível)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/30 border border-rose-500"></span>
              <span>Desativado (Bloqueado)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-500/30 border border-purple-500"></span>
              <span>Horário de Almoço</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500/40 border border-amber-400"></span>
              <span>Horário Extra</span>
            </div>
          </div>

          {/* Slots Interactive Grid */}
          {!currentDayConfig.active ? (
            <div className="bg-black/60 border border-dashed border-neutral-800 rounded-2xl p-8 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <p className="text-xs font-mono text-neutral-400">
                A barbearia está marcada como <strong className="text-rose-400">FECHADA</strong> em {currentDayConfig.dayName}.
              </p>
              <p className="text-[11px] text-neutral-500">
                Ative o dia no botão de funcionamento acima para liberar os botões de horários.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {currentSlots.map((slot) => {
                const { time, isExtra, isDisabled, isLunch, isActive } = slot;

                let btnStyle = 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60';
                let badgeText = 'Ativo';

                if (isDisabled) {
                  btnStyle = 'bg-rose-950/40 text-rose-400 border-rose-500/40 opacity-75 hover:opacity-100 hover:bg-rose-900/60';
                  badgeText = 'Desativado';
                } else if (isExtra) {
                  btnStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/60 hover:bg-amber-500/30 shadow-md';
                  badgeText = 'Extra';
                } else if (isLunch) {
                  btnStyle = 'bg-purple-950/40 text-purple-300 border-purple-500/40 hover:bg-purple-900/60';
                  badgeText = 'Almoço';
                }

                return (
                  <div
                    key={time}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleToggleSlot(time)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleToggleSlot(time);
                      }
                    }}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-mono font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer relative group ${btnStyle}`}
                    title={isDisabled ? `Clique para ativar ${time}` : `Clique para desativar ${time}`}
                  >
                    <span className="text-sm tracking-wide">{time}</span>

                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded-md bg-black/40 border border-white/10">
                      {badgeText}
                    </span>

                    {/* Delete Icon for Extra Slots */}
                    {isExtra && (
                      <button
                        type="button"
                        onClick={(e) => handleRemoveExtraSlot(time, e)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-md transition-transform hover:scale-110"
                        title="Remover horário extra"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>

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
            onClick={() => setIsBlockModalOpen(true)}
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
                  className="p-2 rounded-xl bg-black/60 hover:bg-red-950/60 text-neutral-400 hover:text-red-400 border border-neutral-800 transition-colors cursor-pointer"
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
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#111111] border border-neutral-800 rounded-3xl p-6 space-y-4 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
                <CalendarX className="w-4 h-4 text-red-400" />
                Bloquear Data no Calendário
              </h3>
              <button
                onClick={() => setIsBlockModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white bg-neutral-900 cursor-pointer"
              >
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
