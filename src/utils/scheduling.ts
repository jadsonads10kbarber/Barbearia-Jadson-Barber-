import { Barber, Appointment, BlockedDate, WeeklyDayConfig } from '../types';

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
  isExtra?: boolean;
}

export function getAvailableSlots(
  date: string, // YYYY-MM-DD
  barber: Barber | undefined,
  totalDurationMinutes: number,
  existingAppointments: Appointment[],
  blockedDates: BlockedDate[] = [],
  weeklySchedule?: WeeklyDayConfig[]
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

  // Find weekly day config if provided (Master Shop Schedule)
  const dayConfig = weeklySchedule?.find((d) => d.dayOfWeek === dayOfWeek);
  if (dayConfig && !dayConfig.active) {
    return [];
  }

  // If barber doesn't work on this day of week
  if (barber.workingDays && barber.workingDays.length > 0) {
    const isBarberWorking = barber.workingDays.includes(dayOfWeek);
    const isShopExplicitlyOpen = dayConfig && dayConfig.active;
    if (!isBarberWorking && !isShopExplicitlyOpen) {
      return [];
    }
  }

  // If barber has an explicit off day on this date
  if (barber.offDays && barber.offDays.includes(date)) {
    return [];
  }

  // 3. Barber status
  if (barber.status === 'off') {
    return [];
  }

  const barberStartMins = timeToMinutes(barber.workingHours.start);
  const barberEndMins = timeToMinutes(barber.workingHours.end);
  const barberLunchStartMins = timeToMinutes(barber.lunchBreak.start);
  const barberLunchEndMins = timeToMinutes(barber.lunchBreak.end);

  const shopStartMins = dayConfig?.startTime ? timeToMinutes(dayConfig.startTime) : barberStartMins;
  const shopEndMins = dayConfig?.endTime ? timeToMinutes(dayConfig.endTime) : barberEndMins;
  const shopLunchStartMins = dayConfig?.lunchStart ? timeToMinutes(dayConfig.lunchStart) : null;
  const shopLunchEndMins = dayConfig?.lunchEnd ? timeToMinutes(dayConfig.lunchEnd) : null;

  const effectiveStartMins = Math.max(barberStartMins, shopStartMins);
  const effectiveEndMins = Math.min(barberEndMins, shopEndMins);

  // Filter active appointments for this barber on this date
  const dayAppointments = existingAppointments.filter(
    (app) =>
      app.barberId === barber.id &&
      app.date === date &&
      app.status !== 'Cancelado'
  );

  const disabledSlots = dayConfig?.disabledSlots || [];
  const extraSlots = dayConfig?.extraSlots || [];

  // Gather candidate times
  const candidateTimesSet = new Set<string>();
  for (let mins = effectiveStartMins; mins <= effectiveEndMins - totalDurationMinutes; mins += 30) {
    candidateTimesSet.add(minutesToTime(mins));
  }
  for (const extra of extraSlots) {
    candidateTimesSet.add(extra);
  }

  const sortedTimes = Array.from(candidateTimesSet).sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

  const slots: SlotAvailability[] = [];
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const currentMins = now.getHours() * 60 + now.getMinutes();

  for (const timeStr of sortedTimes) {
    const mins = timeToMinutes(timeStr);
    const slotEndMins = mins + totalDurationMinutes;
    const isExtra = extraSlots.includes(timeStr);

    // Check if explicitly disabled by admin
    if (disabledSlots.includes(timeStr)) {
      slots.push({ time: timeStr, available: false, reason: 'Horário desativado pelo estabelecimento', isExtra });
      continue;
    }

    // A. Past time check for today
    if (date === todayStr && mins <= currentMins) {
      slots.push({ time: timeStr, available: false, reason: 'Horário já passou', isExtra });
      continue;
    }

    // B. Barber Lunch break overlap check
    const overlapsBarberLunch = mins < barberLunchEndMins && slotEndMins > barberLunchStartMins;
    if (overlapsBarberLunch) {
      slots.push({ time: timeStr, available: false, reason: 'Horário de almoço do barbeiro', isExtra });
      continue;
    }

    // C. Shop Lunch break overlap check
    if (shopLunchStartMins !== null && shopLunchEndMins !== null) {
      const overlapsShopLunch = mins < shopLunchEndMins && slotEndMins > shopLunchStartMins;
      if (overlapsShopLunch) {
        slots.push({ time: timeStr, available: false, reason: 'Horário de almoço do estabelecimento', isExtra });
        continue;
      }
    }

    // C. Existing appointment collision check
    let hasCollision = false;
    for (const app of dayAppointments) {
      const appStartMins = timeToMinutes(app.startTime);
      const appEndMins = timeToMinutes(app.endTime);

      if (mins < appEndMins && slotEndMins > appStartMins) {
        hasCollision = true;
        break;
      }
    }

    if (hasCollision) {
      slots.push({ time: timeStr, available: false, reason: 'Horário já reservado', isExtra });
      continue;
    }

    // Available!
    slots.push({ time: timeStr, available: true, isExtra });
  }

  return slots;
}
