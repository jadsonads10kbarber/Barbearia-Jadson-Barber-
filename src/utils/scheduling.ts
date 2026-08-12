import { Barber, Appointment, BlockedDate } from '../types';

export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export interface SlotAvailability {
  time: string; // HH:mm
  available: boolean;
  reason?: string;
}

export function getAvailableSlots(
  date: string, // YYYY-MM-DD
  barber: Barber | undefined,
  totalDurationMinutes: number,
  existingAppointments: Appointment[],
  blockedDates: BlockedDate[] = []
): SlotAvailability[] {
  if (!barber) return [];

  // 1. Check if date is globally blocked
  const isBlocked = blockedDates.some(
    (b) => b.date === date && (!b.barberId || b.barberId === barber.id)
  );
  if (isBlocked) return [];

  // 2. Check day of week (0 = Sunday, 1 = Mon, ..., 6 = Sat)
  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayOfWeek = dateObj.getDay();

  // If barber doesn't work on this day of week
  if (!barber.workingDays.includes(dayOfWeek)) {
    return [];
  }

  // If barber has an explicit off day on this date
  if (barber.offDays && barber.offDays.includes(date)) {
    return [];
  }

  // 3. Barber status
  if (barber.status === 'off') {
    return [];
  }

  const startMins = timeToMinutes(barber.workingHours.start);
  const endMins = timeToMinutes(barber.workingHours.end);
  const lunchStartMins = timeToMinutes(barber.lunchBreak.start);
  const lunchEndMins = timeToMinutes(barber.lunchBreak.end);

  // Filter active appointments for this barber on this date
  const dayAppointments = existingAppointments.filter(
    (app) =>
      app.barberId === barber.id &&
      app.date === date &&
      app.status !== 'Cancelado'
  );

  const slots: SlotAvailability[] = [];
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const currentMins = now.getHours() * 60 + now.getMinutes();

  // Generate slots every 30 minutes
  for (let mins = startMins; mins <= endMins - totalDurationMinutes; mins += 30) {
    const timeStr = minutesToTime(mins);
    const slotEndMins = mins + totalDurationMinutes;

    // A. Past time check for today
    if (date === todayStr && mins <= currentMins) {
      slots.push({ time: timeStr, available: false, reason: 'Horário já passou' });
      continue;
    }

    // B. Exceeds working hours check
    if (slotEndMins > endMins) {
      slots.push({ time: timeStr, available: false, reason: 'Excede o horário de fechamento' });
      continue;
    }

    // C. Lunch break overlap check (CRITICAL requirement 34)
    // Slot overlaps lunch if slotStart < lunchEnd AND slotEnd > lunchStart
    const overlapsLunch = mins < lunchEndMins && slotEndMins > lunchStartMins;
    if (overlapsLunch) {
      slots.push({ time: timeStr, available: false, reason: 'Horário de almoço do barbeiro' });
      continue;
    }

    // D. Existing appointment collision check
    let hasCollision = false;
    for (const app of dayAppointments) {
      const appStartMins = timeToMinutes(app.startTime);
      const appEndMins = timeToMinutes(app.endTime);

      // Overlap condition: slotStart < appEnd AND slotEnd > appStart
      if (mins < appEndMins && slotEndMins > appStartMins) {
        hasCollision = true;
        break;
      }
    }

    if (hasCollision) {
      slots.push({ time: timeStr, available: false, reason: 'Horário já reservado' });
      continue;
    }

    // Available!
    slots.push({ time: timeStr, available: true });
  }

  return slots;
}
