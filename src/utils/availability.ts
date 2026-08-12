import { Barber, Appointment, BlockedDate, WeeklyDayConfig } from '../types';

export interface TimeSlot {
  time: string; // '08:00'
  endTime: string; // '08:30'
  available: boolean;
  reason?: string; // 'Horário de almoço' | 'Já passou' | 'Ocupado' | 'Sem tempo hábil'
  shift: 'MANHÃ' | 'TARDE' | 'NOITE';
  isExtra?: boolean;
}

// Convert "HH:mm" to total minutes from midnight
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Convert total minutes from midnight back to "HH:mm"
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Check if two time intervals [start1, end1] and [start2, end2] overlap
export function checkIntervalOverlap(
  start1Min: number,
  end1Min: number,
  start2Min: number,
  end2Min: number
): boolean {
  // Two intervals overlap if start1 < end2 AND start2 < end1
  return start1Min < end2Min && start2Min < end1Min;
}

// Classify time into shift
export function getShift(timeStr: string): 'MANHÃ' | 'TARDE' | 'NOITE' {
  const min = timeToMinutes(timeStr);
  if (min < 12 * 60) {
    return 'MANHÃ'; // Before 12:00
  } else if (min < 17 * 60) {
    return 'TARDE'; // 12:00 to 16:59
  } else {
    return 'NOITE'; // 17:00 onwards
  }
}

/**
 * CENTRAL AVAILABILITY ENGINE
 * Calculates available time slots for a given date, barber, and total duration.
 */
export function getAvailableSlots(
  dateStr: string, // YYYY-MM-DD
  barber: Barber | undefined,
  totalDurationMinutes: number, // e.g. 30, 50, 60
  existingAppointments: Appointment[],
  excludeAppointmentId?: string, // used when rescheduling to ignore the current appointment
  blockedDates: BlockedDate[] = [],
  weeklySchedule?: WeeklyDayConfig[]
): TimeSlot[] {
  if (!barber || totalDurationMinutes <= 0 || !dateStr) {
    return [];
  }

  // 0. Check global blocked dates
  const isBlocked = blockedDates.some(
    (b) => b.date === dateStr && (!b.barberId || b.barberId === barber.id)
  );
  if (isBlocked) return [];

  const duration = Math.max(15, totalDurationMinutes);
  const [year, month, day] = dateStr.split('-').map(Number);
  const selectedDate = new Date(year, month - 1, day);
  const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Check weekly schedule day status (Master Shop Schedule)
  const dayConfig = weeklySchedule?.find((d) => d.dayOfWeek === dayOfWeek);
  if (dayConfig && !dayConfig.active) {
    return []; // Shop is closed on this day
  }

  // Check if barber works on this day of week
  if (barber.workingDays && barber.workingDays.length > 0) {
    const isBarberWorking = barber.workingDays.includes(dayOfWeek);
    const isShopExplicitlyOpen = dayConfig && dayConfig.active;
    if (!isBarberWorking && !isShopExplicitlyOpen) {
      return []; // Barber is off on this day
    }
  }

  // Parse barber working hours and lunch break
  const barberStartMin = timeToMinutes(barber.workingHours.start);
  const barberEndMin = timeToMinutes(barber.workingHours.end);
  const barberLunchStartMin = timeToMinutes(barber.lunchBreak.start);
  const barberLunchEndMin = timeToMinutes(barber.lunchBreak.end);

  // Parse shop hours from weeklySchedule dayConfig
  const shopStartMin = dayConfig?.startTime ? timeToMinutes(dayConfig.startTime) : barberStartMin;
  const shopEndMin = dayConfig?.endTime ? timeToMinutes(dayConfig.endTime) : barberEndMin;
  const shopLunchStartMin = dayConfig?.lunchStart ? timeToMinutes(dayConfig.lunchStart) : null;
  const shopLunchEndMin = dayConfig?.lunchEnd ? timeToMinutes(dayConfig.lunchEnd) : null;

  // Effective standard candidate bounds
  const effectiveStartMin = Math.max(barberStartMin, shopStartMin);
  const effectiveEndMin = Math.min(barberEndMin, shopEndMin);

  // Current date and time for past time blocking
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  const isToday = dateStr === todayStr;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Filter existing active appointments for this barber on this date
  const barberAppointments = existingAppointments.filter((app) => {
    if (app.id === excludeAppointmentId) return false;
    if (app.barberId !== barber.id) return false;
    if (app.date !== dateStr) return false;
    if (app.status === 'Cancelado') return false;
    return true;
  });

  const disabledSlots = dayConfig?.disabledSlots || [];
  const extraSlots = dayConfig?.extraSlots || [];

  // Generate candidate time strings
  const candidateTimesSet = new Set<string>();
  for (let min = effectiveStartMin; min < effectiveEndMin; min += 30) {
    candidateTimesSet.add(minutesToTime(min));
  }
  for (const extra of extraSlots) {
    candidateTimesSet.add(extra);
  }

  const sortedTimes = Array.from(candidateTimesSet).sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

  const slots: TimeSlot[] = [];

  for (const timeStr of sortedTimes) {
    const min = timeToMinutes(timeStr);
    const proposedEndMin = min + duration;
    const proposedEndTimeStr = minutesToTime(proposedEndMin);
    const shift = getShift(timeStr);
    const isExtra = extraSlots.includes(timeStr);

    let available = true;
    let reason = undefined;

    // Disabled explicitly by admin
    if (disabledSlots.includes(timeStr)) {
      available = false;
      reason = 'Horário desativado pelo estabelecimento';
    }

    // 1. Past time check (for today)
    if (available && isToday && min <= currentMinutes) {
      available = false;
      reason = 'Horário já passou';
    }

    // 2. Barber Lunch break check
    if (
      available &&
      checkIntervalOverlap(min, proposedEndMin, barberLunchStartMin, barberLunchEndMin)
    ) {
      available = false;
      reason = 'Horário de almoço do barbeiro';
    }

    // 3. Shop Lunch break check (if configured)
    if (
      available &&
      shopLunchStartMin !== null &&
      shopLunchEndMin !== null &&
      checkIntervalOverlap(min, proposedEndMin, shopLunchStartMin, shopLunchEndMin)
    ) {
      available = false;
      reason = 'Horário de almoço do estabelecimento';
    }

    // 4. Existing appointments collision check
    if (available) {
      for (const app of barberAppointments) {
        const appStartMin = timeToMinutes(app.startTime);
        const appEndMin = timeToMinutes(app.endTime);

        if (checkIntervalOverlap(min, proposedEndMin, appStartMin, appEndMin)) {
          available = false;
          reason = 'Horário já reservado';
          break;
        }
      }
    }

    slots.push({
      time: timeStr,
      endTime: proposedEndTimeStr,
      available,
      reason,
      shift,
      isExtra,
    });
  }

  return slots;
}

/**
 * Format ISO date string into readable Portuguese format
 */
export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export function getWeekdayName(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(`${dateStr}T00:00:00`);
  const weekdays = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ];
  return weekdays[date.getDay()];
}
