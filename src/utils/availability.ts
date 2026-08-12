import { Barber, Appointment } from '../types';

export interface TimeSlot {
  time: string; // '08:00'
  endTime: string; // '08:30'
  available: boolean;
  reason?: string; // 'Horário de almoço' | 'Já passou' | 'Ocupado' | 'Sem tempo hábil'
  shift: 'MANHÃ' | 'TARDE' | 'NOITE';
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
  excludeAppointmentId?: string // used when rescheduling to ignore the current appointment
): TimeSlot[] {
  if (!barber || totalDurationMinutes <= 0 || !dateStr) {
    return [];
  }

  const duration = Math.max(15, totalDurationMinutes);
  const selectedDate = new Date(`${dateStr}T00:00:00`);
  const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Check if barber works on this day of week
  if (!barber.workingDays.includes(dayOfWeek)) {
    return []; // Barber is off on this day
  }

  // Parse barber working hours and lunch break
  const workStartMin = timeToMinutes(barber.workingHours.start);
  const workEndMin = timeToMinutes(barber.workingHours.end);
  const lunchStartMin = timeToMinutes(barber.lunchBreak.start);
  const lunchEndMin = timeToMinutes(barber.lunchBreak.end);

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

  const slots: TimeSlot[] = [];

  // Generate 30-minute step candidates from workStart to workEnd
  for (let min = workStartMin; min < workEndMin; min += 30) {
    const timeStr = minutesToTime(min);
    const proposedEndMin = min + duration;
    const proposedEndTimeStr = minutesToTime(proposedEndMin);
    const shift = getShift(timeStr);

    let available = true;
    let reason = undefined;

    // 1. Past time check (for today)
    if (isToday && min <= currentMinutes) {
      available = false;
      reason = 'Horário já passou';
    }

    // 2. Closing time check (duration must fit before shop closes)
    if (available && proposedEndMin > workEndMin) {
      available = false;
      reason = 'Excede o horário de fechamento';
    }

    // 3. Lunch break check (entire service duration must not overlap lunch)
    if (
      available &&
      checkIntervalOverlap(min, proposedEndMin, lunchStartMin, lunchEndMin)
    ) {
      available = false;
      reason = 'Horário de almoço do barbeiro';
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
