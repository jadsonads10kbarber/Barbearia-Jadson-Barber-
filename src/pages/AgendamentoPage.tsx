import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Calendar,
  Clock,
  User,
  Scissors,
  Check,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  CircleCheck,
  CircleAlert,
  LoaderCircle,
  Sparkles,
  Info,
  ShieldCheck,
  Phone,
  LogIn,
  Search,
  X,
  TicketPercent,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Barber, ServiceItem, AppointmentService, Coupon } from '../types';
import {
  getAvailableSlots,
  formatDateBR,
  getWeekdayName,
  TimeSlot,
} from '../utils/availability';
import { findSmartComboMatch, SmartComboMatch } from '../utils/comboMatcher';

type BookingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;
// 1: Calendário
// 2: Barbeiro
// 3: Horário
// 4: Serviços
// 5: Resumo
// 6: Agendando
// 7: Sucesso

export const AgendamentoPage: React.FC = () => {
  const {
    barbers,
    services,
    appointments,
    coupons,
    blockedDates,
    barbershopInfo,
    addAppointment,
    setActivePage,
    addToast,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    selectedBarberForBooking,
    setSelectedBarberForBooking,
    isLoggedIn,
    currentUser,
  } = useApp();

  const [currentStep, setCurrentStep] = useState<BookingStep>(1);

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Today ISO date YYYY-MM-DD
  const todayIso = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  }, []);

  // Form states
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | undefined>(
    selectedBarberForBooking || (barbers.length === 1 ? barbers[0] : undefined)
  );

  // Processing animation & stages state for Step 6
  const [processingStage, setProcessingStage] = useState<number>(1);
  const [processingProgress, setProcessingProgress] = useState<number>(10);

  // Auto-scroll ref for time slot selection
  const continueBtnStep3Ref = useRef<HTMLButtonElement | null>(null);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const shiftRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Auto-scroll ref and timer for Step 4 (Services / Combos)
  const continueBtnStep4Ref = useRef<HTMLDivElement | null>(null);
  const serviceScrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToContinueStep4 = () => {
    if (continueBtnStep4Ref.current) {
      continueBtnStep4Ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  const handleSelectTimeSlot = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);

    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }

    // Scroll immediately to the continue button
    scrollTimerRef.current = setTimeout(() => {
      if (continueBtnStep3Ref.current) {
        continueBtnStep3Ref.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
      if (serviceScrollTimerRef.current) {
        clearTimeout(serviceScrollTimerRef.current);
      }
    };
  }, []);

  // Selected Services State
  const [selectedIndividualServices, setSelectedIndividualServices] = useState<ServiceItem[]>([]);
  const [selectedCombo, setSelectedCombo] = useState<ServiceItem | null>(null);
  const [bookingServiceTab, setBookingServiceTab] = useState<'individual' | 'combo'>('individual');
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');

  // Processing state
  const [createdAppointmentId, setCreatedAppointmentId] = useState<string>('');

  const PRE_BOOKING_KEY = 'jadson_pre_booking_draft';

  // Restore pre-booking draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PRE_BOOKING_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedDate) setSelectedDate(parsed.selectedDate);
        if (parsed.selectedBarberId) {
          const b = barbers.find((item) => item.id === parsed.selectedBarberId);
          if (b) setSelectedBarber(b);
        }
        if (parsed.selectedTimeSlot) setSelectedTimeSlot(parsed.selectedTimeSlot);
        if (Array.isArray(parsed.selectedIndividualServicesIds)) {
          const matched = services.filter((s) => parsed.selectedIndividualServicesIds.includes(s.id));
          setSelectedIndividualServices(matched);
        }
        if (parsed.selectedComboId) {
          const c = services.find((s) => s.id === parsed.selectedComboId);
          if (c) setSelectedCombo(c);
        }
        if (parsed.currentStep && parsed.currentStep >= 1 && parsed.currentStep <= 5) {
          setCurrentStep(parsed.currentStep);
        }
      }
    } catch (e) {
      console.warn('Error loading pre-booking draft:', e);
    }
  }, [barbers, services]);

  // Save pre-booking draft whenever key booking state changes
  useEffect(() => {
    if (currentStep >= 6) {
      localStorage.removeItem(PRE_BOOKING_KEY);
      return;
    }
    if (selectedDate || selectedBarber || selectedTimeSlot || selectedCombo || selectedIndividualServices.length > 0) {
      try {
        const draft = {
          selectedDate,
          selectedBarberId: selectedBarber?.id,
          selectedTimeSlot,
          selectedIndividualServicesIds: selectedIndividualServices.map((s) => s.id),
          selectedComboId: selectedCombo?.id,
          currentStep,
        };
        localStorage.setItem(PRE_BOOKING_KEY, JSON.stringify(draft));
      } catch (e) {}
    }
  }, [selectedDate, selectedBarber, selectedTimeSlot, selectedCombo, selectedIndividualServices, currentStep]);

  // Sync preselected barber if passed from BarbeirosPage
  useEffect(() => {
    if (selectedBarberForBooking) {
      setSelectedBarber(selectedBarberForBooking);
    }
  }, [selectedBarberForBooking]);

  // Full Calendar Month State
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());

  const monthNamesPT = useMemo(
    () => [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ],
    []
  );

  const weekDaysShortPT = useMemo(() => ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'], []);

  const handlePrevMonth = () => {
    const now = new Date();
    if (
      calendarMonth.getFullYear() < now.getFullYear() ||
      (calendarMonth.getFullYear() === now.getFullYear() &&
        calendarMonth.getMonth() <= now.getMonth())
    ) {
      return;
    }
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: ({ day: number; iso: string; isPast: boolean; isToday: boolean; isClosed: boolean; isBlocked: boolean } | null)[] = [];

    // Offset blank days
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Days in month
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${(month + 1).toString().padStart(2, '0')}-${d
        .toString()
        .padStart(2, '0')}`;
      const isPast = iso < todayIso;
      const isToday = iso === todayIso;

      const dateObj = new Date(year, month, d);
      const dow = dateObj.getDay();
      const dayConfig = barbershopInfo.weeklySchedule?.find((w) => w.dayOfWeek === dow);
      const isClosed = dayConfig ? !dayConfig.active : false;
      const isBlocked = blockedDates.some((b) => b.date === iso && !b.barberId);

      days.push({ day: d, iso, isPast, isToday, isClosed, isBlocked });
    }

    return days;
  }, [calendarMonth, todayIso, barbershopInfo.weeklySchedule, blockedDates]);

  // Smart Combo Detection
  const smartComboMatch = useMemo(() => {
    if (selectedCombo) return null;
    return findSmartComboMatch(selectedIndividualServices, services);
  }, [selectedCombo, selectedIndividualServices, services]);

  // Calculate total duration & total price
  const { totalDuration, totalPrice, isCombo, isSmartComboApplied } = useMemo(() => {
    if (selectedCombo) {
      return {
        totalDuration: selectedCombo.durationMinutes,
        totalPrice: selectedCombo.price,
        isCombo: true,
        isSmartComboApplied: false,
      };
    }

    if (smartComboMatch) {
      return {
        totalDuration: smartComboMatch.smartTotalDuration,
        totalPrice: smartComboMatch.smartTotalPrice,
        isCombo: true,
        isSmartComboApplied: true,
      };
    }

    const duration = selectedIndividualServices.reduce((sum, s) => sum + s.durationMinutes, 0);
    const price = selectedIndividualServices.reduce((sum, s) => sum + s.price, 0);

    return {
      totalDuration: duration,
      totalPrice: price,
      isCombo: false,
      isSmartComboApplied: false,
    };
  }, [selectedCombo, smartComboMatch, selectedIndividualServices]);

  // Coupon discount calculation
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'percentage') {
      return (totalPrice * appliedCoupon.discountValue) / 100;
    }
    return Math.min(appliedCoupon.discountValue, totalPrice);
  }, [appliedCoupon, totalPrice]);

  const finalTotalPrice = useMemo(() => {
    return Math.max(0, totalPrice - couponDiscount);
  }, [totalPrice, couponDiscount]);

  const handleApplyCoupon = () => {
    const codeClean = couponCodeInput.trim().toUpperCase();
    if (!codeClean) {
      addToast('Digite o código do cupom.', 'error');
      return;
    }

    const found = coupons.find(
      (c) => c.code.toUpperCase() === codeClean && c.status === 'ativo'
    );

    if (!found) {
      addToast('Cupom inválido, inativo ou não encontrado.', 'error');
      setAppliedCoupon(null);
      return;
    }

    // Validação de Período de Validade
    const today = new Date().toISOString().split('T')[0];
    if (found.startDate && today < found.startDate) {
      addToast('Este cupom ainda não está ativo.', 'error');
      return;
    }
    if (found.endDate && today > found.endDate) {
      addToast('Este cupom já expirou.', 'error');
      return;
    }

    // Validação de Pedido Mínimo
    if (found.minOrderValue && totalPrice < found.minOrderValue) {
      addToast(`Pedido mínimo para este cupom é R$ ${found.minOrderValue.toFixed(2)}.`, 'error');
      return;
    }

    // Validação de Limite Global de Usos
    if (found.usageLimit && found.usedCount >= found.usageLimit) {
      addToast('Este cupom atingiu o limite global máximo de utilizações.', 'error');
      return;
    }

    // Validação de Cupom Coletivo vs Individual
    if (found.type === 'individual') {
      const matchName =
        found.targetCustomerName &&
        customerName.trim().toLowerCase().includes(found.targetCustomerName.trim().toLowerCase());
      const matchPhone =
        found.targetCustomerPhone &&
        customerPhone.replace(/\D/g, '') === found.targetCustomerPhone.replace(/\D/g, '');
      const matchId =
        currentUser && found.targetCustomerId && currentUser.id === found.targetCustomerId;

      if (!matchName && !matchPhone && !matchId) {
        addToast(
          `Cupom Exclusivo! Este cupom foi gerado para o cliente ${found.targetCustomerName || 'específico'}.`,
          'error'
        );
        return;
      }
    }

    // Validação do Limite de Uso por Cliente (usageLimitPerClient)
    const limitPerClient = found.usageLimitPerClient ?? 1;
    if (limitPerClient > 0) {
      const cleanPhone = customerPhone.replace(/\D/g, '');
      const cleanName = customerName.trim().toLowerCase();

      const previousUses = appointments.filter((app) => {
        const appPhone = (app.customerPhone || '').replace(/\D/g, '');
        const appName = (app.customerName || '').trim().toLowerCase();
        return (cleanPhone && appPhone === cleanPhone) || (cleanName && appName === cleanName);
      }).length;

      if (previousUses >= limitPerClient && limitPerClient === 1) {
        addToast(`Você já atingiu o limite máximo deste cupom (${limitPerClient} uso por cliente).`, 'error');
        return;
      }
    }

    setAppliedCoupon(found);
    addToast(`Cupom "${found.code}" aplicado com sucesso!`, 'success');
  };

  const [isAvailableCouponsModalOpen, setIsAvailableCouponsModalOpen] = useState(false);

  const availableCustomerCoupons = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const cleanPhone = customerPhone.replace(/\D/g, '');
    const cleanName = customerName.trim().toLowerCase();

    return coupons.filter((c) => {
      if (c.status !== 'ativo') return false;
      if (c.startDate && today < c.startDate) return false;
      if (c.endDate && today > c.endDate) return false;
      if (c.usageLimit && c.usedCount >= c.usageLimit) return false;

      // Type individual check
      if (c.type === 'individual') {
        const matchName =
          c.targetCustomerName &&
          cleanName &&
          cleanName.includes(c.targetCustomerName.trim().toLowerCase());
        const matchPhone =
          c.targetCustomerPhone &&
          cleanPhone &&
          cleanPhone === c.targetCustomerPhone.replace(/\D/g, '');
        const matchId =
          currentUser && c.targetCustomerId && currentUser.id === c.targetCustomerId;

        if (!matchName && !matchPhone && !matchId) return false;
      }

      // Limit per client check
      const limitPerClient = c.usageLimitPerClient ?? 1;
      if (limitPerClient > 0) {
        const previousUses = appointments.filter((app) => {
          const appPhone = (app.customerPhone || '').replace(/\D/g, '');
          const appName = (app.customerName || '').trim().toLowerCase();
          return (cleanPhone && appPhone === cleanPhone) || (cleanName && appName === cleanName);
        }).length;

        if (previousUses >= limitPerClient) return false;
      }

      return true;
    });
  }, [coupons, customerPhone, customerName, currentUser, appointments]);

  const handleSelectAndApplyCoupon = (c: Coupon) => {
    if (c.minOrderValue && totalPrice < c.minOrderValue) {
      addToast(`Pedido mínimo para este cupom é R$ ${c.minOrderValue.toFixed(2)}.`, 'error');
      return;
    }
    setAppliedCoupon(c);
    setCouponCodeInput(c.code);
    setIsAvailableCouponsModalOpen(false);
    addToast(`Cupom "${c.code}" aplicado com sucesso!`, 'success');
  };

  // Available Time Slots calculated dynamically based on date, barber & total duration
  const availableSlots = useMemo(() => {
    // Default to at least 30 min duration for initial time slot display if no services selected yet
    const effectiveDuration = totalDuration > 0 ? totalDuration : 30;
    return getAvailableSlots(
      selectedDate,
      selectedBarber,
      effectiveDuration,
      appointments,
      undefined,
      blockedDates,
      barbershopInfo.weeklySchedule
    );
  }, [selectedDate, selectedBarber, totalDuration, appointments, blockedDates, barbershopInfo.weeklySchedule]);

  // Group slots by shift
  const slotsByShift = useMemo(() => {
    const manha = availableSlots.filter((s) => s.shift === 'MANHÃ');
    const tarde = availableSlots.filter((s) => s.shift === 'TARDE');
    const noite = availableSlots.filter((s) => s.shift === 'NOITE');
    return { MANHÃ: manha, TARDE: tarde, NOITE: noite };
  }, [availableSlots]);

  // Auto-scroll to available time slots when entering Step 3 if top shift is unavailable
  useEffect(() => {
    if (currentStep === 3) {
      const shifts: ('MANHÃ' | 'TARDE' | 'NOITE')[] = ['MANHÃ', 'TARDE', 'NOITE'];

      const firstAvailableShift = shifts.find((shift) =>
        slotsByShift[shift]?.some((slot) => slot.available)
      );

      if (firstAvailableShift) {
        const isFirstShiftUnavailable =
          slotsByShift['MANHÃ'] &&
          slotsByShift['MANHÃ'].length > 0 &&
          !slotsByShift['MANHÃ'].some((s) => s.available);

        if (isFirstShiftUnavailable && firstAvailableShift !== 'MANHÃ') {
          const timer = setTimeout(() => {
            const el = shiftRefs.current[firstAvailableShift];
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 400);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [currentStep, slotsByShift]);

  // Scroll to top on step or service tab change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentStep, bookingServiceTab]);

  // Combo vs Individual Services Selection Logic
  const handleSelectIndividualService = (service: ServiceItem) => {
    // If a combo was selected, clear it when choosing an individual service
    if (selectedCombo) {
      setSelectedCombo(null);
    }

    const isAlreadySelected = selectedIndividualServices.some((s) => s.id === service.id);

    if (isAlreadySelected) {
      setSelectedIndividualServices((prev) => prev.filter((s) => s.id !== service.id));
    } else {
      setSelectedIndividualServices((prev) => [...prev, service]);
    }
  };

  const handleSelectCombo = (combo: ServiceItem) => {
    // Selecting a combo clears individual services
    if (selectedCombo?.id === combo.id) {
      setSelectedCombo(null);
    } else {
      setSelectedCombo(combo);
      setSelectedIndividualServices([]);
    }
  };

  // Step 1: Calendário -> Step 2: Barbeiro
  const handleNextFromStep1 = () => {
    if (!selectedDate) {
      addToast('Selecione uma data para continuar.', 'error');
      return;
    }
    setCurrentStep(2);
  };

  // Step 2: Barbeiro -> Step 3: Horário
  const handleNextFromStep2 = () => {
    if (!selectedBarber) {
      addToast('Selecione um barbeiro para continuar.', 'error');
      return;
    }
    setCurrentStep(3);
  };

  // Step 3: Horário -> Step 4: Serviços
  const handleNextFromStep3 = () => {
    if (!selectedTimeSlot) {
      addToast('Selecione um horário disponível para continuar.', 'error');
      return;
    }
    if (!selectedTimeSlot.available) {
      addToast('O horário selecionado não está disponível.', 'error');
      return;
    }
    setCurrentStep(4);
  };

  // Step 4: Serviços -> Step 5: Resumo
  const handleNextFromStep4 = () => {
    if (selectedIndividualServices.length === 0 && !selectedCombo) {
      addToast('Selecione pelo menos um serviço ou combo para continuar.', 'error');
      return;
    }
    setCurrentStep(5);
  };

  // Confirm booking action (Step 5: Resumo -> Step 6: Agendando -> Step 7: Sucesso)
  const handleConfirmBooking = async () => {
    if (!isLoggedIn) {
      addToast('Você precisa estar logado para confirmar o agendamento.', 'info');
      setActivePage('login');
      return;
    }

    const effectiveName = customerName?.trim() || currentUser?.name?.trim() || 'Cliente';
    const effectivePhone = customerPhone?.trim() || currentUser?.phone?.trim() || '';

    if (!effectiveName) {
      addToast('Por favor, faça login para confirmar o agendamento.', 'error');
      return;
    }

    if (!selectedDate || !selectedTimeSlot || !selectedBarber) {
      addToast('Dados do agendamento incompletos.', 'error');
      return;
    }

    // Go to Processing Screen (Step 6)
    setCurrentStep(6);
    setProcessingStage(1);
    setProcessingProgress(0);

    // Smooth progress animation from 0% to 100% over ~3.5 seconds
    const TOTAL_DURATION_MS = 3500;
    const INTERVAL_MS = 35;
    const TOTAL_STEPS = TOTAL_DURATION_MS / INTERVAL_MS;
    let currentStepCount = 0;

    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        currentStepCount += 1;
        const progress = Math.min(100, Math.round((currentStepCount / TOTAL_STEPS) * 100));
        setProcessingProgress(progress);

        if (progress < 35) {
          setProcessingStage(1);
        } else if (progress < 70) {
          setProcessingStage(2);
        } else if (progress < 100) {
          setProcessingStage(3);
        } else {
          setProcessingStage(4); // All stages 100% completed
          clearInterval(interval);
          resolve();
        }
      }, INTERVAL_MS);
    });

    // Re-verify availability
    const latestSlots = getAvailableSlots(
      selectedDate,
      selectedBarber,
      totalDuration,
      appointments
    );

    const slotStillValid = latestSlots.find(
      (s) => s.time === selectedTimeSlot.time && s.available
    );

    if (!slotStillValid) {
      addToast(
        'Este horário acabou de ser reservado ou conflita com o horário de almoço. Escolha outro horário.',
        'error'
      );
      setCurrentStep(3); // Return to Step 3 (Horário)
      return;
    }

    // Format appointment services
    let appServices: AppointmentService[] = [];

    if (selectedCombo) {
      appServices = [
        {
          id: selectedCombo.id,
          name: selectedCombo.name,
          price: selectedCombo.price,
          durationMinutes: selectedCombo.durationMinutes,
        },
      ];
    } else if (smartComboMatch) {
      appServices = [
        {
          id: smartComboMatch.combo.id,
          name: `${smartComboMatch.combo.name} (Combo Promocional Automático)`,
          price: smartComboMatch.combo.price,
          durationMinutes: smartComboMatch.combo.durationMinutes,
        },
        ...smartComboMatch.remainingIndividualServices.map((s) => ({
          id: s.id,
          name: s.name,
          price: s.price,
          durationMinutes: s.durationMinutes,
        })),
      ];
    } else {
      appServices = selectedIndividualServices.map((s) => ({
        id: s.id,
        name: s.name,
        price: s.price,
        durationMinutes: s.durationMinutes,
      }));
    }

    try {
      const created = await addAppointment({
        customerId: currentUser?.id || 'cust-local',
        customerName: effectiveName,
        customerPhone: effectivePhone,
        customerAvatar: currentUser?.avatar || '',
        barberId: selectedBarber.id,
        barberName: selectedBarber.name,
        date: selectedDate,
        startTime: selectedTimeSlot.time,
        endTime: selectedTimeSlot.endTime,
        services: appServices,
        isCombo,
        totalDuration,
        totalPrice: finalTotalPrice,
        status: 'Agendado',
      });

      setCreatedAppointmentId(created.id);

      // Brief delay so user sees 100% full life bar before switching to success screen
      await new Promise((res) => setTimeout(res, 500));

      setCurrentStep(7); // Step 7: Success
    } catch (e) {
      addToast('Não foi possível realizar o agendamento. Tente novamente.', 'error');
      setCurrentStep(5);
    }
  };

  // Auto-confirm booking if returning from login/register with pre-booking draft
  const autoConfirmTriggeredRef = useRef(false);

  useEffect(() => {
    const shouldAutoConfirm = sessionStorage.getItem('jadson_auto_confirm_after_auth') === 'true';
    if (
      shouldAutoConfirm &&
      isLoggedIn &&
      currentUser &&
      selectedDate &&
      selectedBarber &&
      selectedTimeSlot &&
      (selectedCombo || selectedIndividualServices.length > 0) &&
      !autoConfirmTriggeredRef.current &&
      currentStep <= 5
    ) {
      autoConfirmTriggeredRef.current = true;
      sessionStorage.removeItem('jadson_auto_confirm_after_auth');
      handleConfirmBooking();
    }
  }, [
    isLoggedIn,
    currentUser,
    selectedDate,
    selectedBarber,
    selectedTimeSlot,
    selectedCombo,
    selectedIndividualServices,
    currentStep,
  ]);

  // Reset booking form
  const handleNewBooking = () => {
    try {
      localStorage.removeItem(PRE_BOOKING_KEY);
      sessionStorage.removeItem('jadson_auto_confirm_after_auth');
    } catch (e) {}
    autoConfirmTriggeredRef.current = false;
    setCurrentStep(1);
    setSelectedTimeSlot(null);
    setSelectedIndividualServices([]);
    setSelectedCombo(null);
    setSelectedBarberForBooking(undefined);
  };

  return (
    <div className="pb-24 pt-2 px-4 max-w-3xl mx-auto">
      
      {/* Progress Header (Steps 1 to 5) */}
      {currentStep <= 5 && (
        <div className="sticky top-[72px] z-20 mb-3 sm:mb-4 bg-[#111111]/80 backdrop-blur-md border border-white/10 rounded-xl p-2 sm:p-2.5 shadow-2xl">
          <div className="flex items-center justify-between max-w-xl mx-auto px-1 sm:px-2">
            {[
              { step: 1, label: 'Data', icon: Calendar },
              { step: 2, label: 'Barbeiro', icon: User },
              { step: 3, label: 'Horário', icon: Clock },
              { step: 4, label: 'Serviços', icon: Scissors },
              { step: 5, label: 'Resumo', icon: ShieldCheck },
            ].map(({ step, label, icon: StepIcon }, index) => {
              const isDone = 
                step === 1 ? (Boolean(selectedDate) || currentStep > 1) :
                step === 2 ? (Boolean(selectedBarber) || currentStep > 2) :
                step === 3 ? (Boolean(selectedTimeSlot) || currentStep > 3) :
                step === 4 ? (Boolean(selectedCombo || selectedIndividualServices.length > 0) || currentStep > 4) :
                currentStep === 5;

              const isCompleted = isDone && currentStep !== step;
              const isActive = currentStep === step;

              return (
                <React.Fragment key={step}>
                  {/* Step Button */}
                  <button
                    onClick={() => {
                      if (isDone || isCompleted || currentStep > step) {
                        setCurrentStep(step as BookingStep);
                      }
                    }}
                    disabled={!isDone && !isActive && currentStep < step}
                    className={`flex flex-col items-center gap-0.5 transition-all text-center group ${
                      (isDone || isCompleted) ? 'cursor-pointer' : 'cursor-default'
                    }`}
                    title={label}
                  >
                    {/* Icon Badge */}
                    <div
                      className={`w-7 h-7 sm:w-8.5 sm:h-8.5 rounded-lg flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? 'bg-[#DAA520] text-black font-bold shadow-md shadow-[#DAA520]/20 ring-2 ring-[#DAA520]/40 scale-105'
                          : isDone || isCompleted
                          ? 'bg-[#DAA520]/20 text-[#DAA520] border border-[#DAA520]/40 hover:bg-[#DAA520]/30'
                          : 'bg-white/5 text-[#8E9299] border border-white/5'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.8]" />
                      ) : (
                        <StepIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                      )}
                    </div>

                    {/* Step Label */}
                    <span
                      className={`text-[8px] sm:text-[10px] font-sans uppercase tracking-wider font-bold transition-colors ${
                        isActive
                          ? 'text-[#DAA520]'
                          : isDone || isCompleted
                          ? 'text-white group-hover:text-[#DAA520]'
                          : 'text-[#8E9299]'
                      }`}
                    >
                      {label}
                    </span>
                  </button>

                  {/* Connecting Line */}
                  {index < 4 && (
                    <div className="flex-1 h-[1.5px] mx-0.5 sm:mx-1.5 self-center mb-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#DAA520] transition-all duration-300"
                        style={{
                          width: (isDone || currentStep > step) ? '100%' : '0%',
                        }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 1: CALENDÁRIO */}
      {currentStep === 1 && (
        <div className="space-y-3.5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white font-sans flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#DAA520]" />
                Escolha a Data
              </h2>
              <p className="text-[11px] sm:text-xs text-[#8E9299] mt-0.5 uppercase tracking-wider">
                Selecione o dia desejado para o seu atendimento na barbearia
              </p>
            </div>
          </div>

          {/* Full Monthly Calendar Selector */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl">
            {/* Calendar Header with Navigation */}
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-[#DAA520]" />
                <h3 className="text-base font-extrabold text-white font-sans uppercase tracking-wider">
                  {monthNamesPT[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-white/5 cursor-pointer"
                  disabled={
                    calendarMonth.getFullYear() === new Date().getFullYear() &&
                    calendarMonth.getMonth() === new Date().getMonth()
                  }
                  title="Mês Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setCalendarMonth(new Date())}
                  className="px-2.5 py-1 rounded-lg bg-[#DAA520]/15 hover:bg-[#DAA520]/30 text-[#DAA520] font-sans text-[10px] font-bold uppercase tracking-wider border border-[#DAA520]/30 transition-all cursor-pointer"
                  title="Voltar para Hoje"
                >
                  Hoje
                </button>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all border border-white/5 cursor-pointer"
                  title="Próximo Mês"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekdays Header Row */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-2 text-center">
              {weekDaysShortPT.map((day, idx) => (
                <span
                  key={idx}
                  className="text-[10px] sm:text-xs font-sans font-bold uppercase tracking-wider text-[#8E9299] py-0.5"
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {calendarDays.map((cell, index) => {
                if (!cell) {
                  return <div key={`empty-${index}`} className="h-10 sm:h-11" />;
                }

                const isSelected = selectedDate === cell.iso;
                const isDisabled = cell.isPast || cell.isClosed || cell.isBlocked;

                return (
                  <button
                    key={cell.iso}
                    disabled={isDisabled}
                    onClick={() => {
                      setSelectedDate(cell.iso);
                      setSelectedTimeSlot(null);
                    }}
                    title={
                      cell.isClosed
                        ? 'Estabelecimento fechado neste dia'
                        : cell.isBlocked
                        ? 'Data bloqueada'
                        : cell.isPast
                        ? 'Data já passou'
                        : 'Clique para selecionar'
                    }
                    className={`h-10 sm:h-11 rounded-xl flex flex-col items-center justify-center relative font-sans transition-all duration-150 ${
                      isSelected
                        ? 'bg-[#DAA520] text-black font-extrabold shadow-md shadow-[#DAA520]/30 scale-105 ring-2 ring-[#DAA520] cursor-pointer'
                        : cell.isClosed || cell.isBlocked
                        ? 'bg-rose-500/5 text-rose-400/40 border border-rose-500/10 cursor-not-allowed text-xs opacity-50'
                        : cell.isPast
                        ? 'bg-white/[0.02] text-[#8E9299]/30 cursor-not-allowed border border-transparent line-through text-xs'
                        : cell.isToday
                        ? 'bg-[#DAA520]/15 text-[#DAA520] border-2 border-[#DAA520] font-bold hover:bg-[#DAA520]/25 cursor-pointer'
                        : 'bg-white/5 text-white hover:bg-[#DAA520]/20 hover:text-[#DAA520] border border-white/5 font-semibold text-xs cursor-pointer'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-bold">{cell.day}</span>
                    {(cell.isClosed || cell.isBlocked) && !cell.isPast && (
                      <span className="text-[7px] text-rose-400/80 uppercase font-extrabold tracking-tighter -mt-0.5">
                        Fechado
                      </span>
                    )}
                    {cell.isToday && !isSelected && !cell.isClosed && (
                      <span className="w-1 h-1 rounded-full bg-[#DAA520] absolute bottom-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Date Indicator Banner */}
            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
              <p className="text-xs text-[#DAA520] font-medium flex items-center gap-1.5 font-sans">
                <Info className="w-4 h-4 shrink-0 text-[#DAA520]" />
                <span>
                  Data selecionada:{' '}
                  <strong className="text-white uppercase font-bold">
                    {getWeekdayName(selectedDate)}, {formatDateBR(selectedDate)}
                  </strong>
                </span>
              </p>
            </div>
          </div>

          {/* Continue Button */}
          <div className="pt-1">
            <button
              onClick={handleNextFromStep1}
              className="w-full py-3.5 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-[#DAA520]/20 flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
            >
              <span>Continuar para Escolha do Barbeiro</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ESCOLHA DE BARBEIRO */}
      {currentStep === 2 && (
        <div className="space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h2 className="text-xl font-extrabold text-white font-sans flex items-center gap-2">
                <User className="w-5 h-5 text-[#DAA520]" />
                Escolha seu Barbeiro
              </h2>
              <p className="text-xs text-[#8E9299] mt-0.5 uppercase tracking-wider">
                Selecione o profissional para o atendimento no dia {formatDateBR(selectedDate)}
              </p>
            </div>
            <button
              onClick={() => setCurrentStep(1)}
              className="p-2 rounded-lg bg-[#111111] text-[#8E9299] hover:text-white border border-white/10 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Date Selected Banner */}
          <div className="bg-[#111111] border border-[#DAA520]/30 rounded-xl p-3 flex items-center gap-2 text-xs text-white font-sans">
            <Calendar className="w-4 h-4 text-[#DAA520]" />
            <span>Data escolhida: <strong className="text-[#DAA520]">{getWeekdayName(selectedDate)}, {formatDateBR(selectedDate)}</strong></span>
          </div>

          {/* Barbers Cards List */}
          {barbers.length === 0 ? (
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 text-center space-y-3">
              <User className="w-10 h-10 text-[#DAA520] mx-auto opacity-70" />
              <h3 className="text-sm font-bold text-white font-sans">Nenhum Barbeiro Cadastrado</h3>
              <p className="text-xs text-[#8E9299] max-w-xs mx-auto">
                No momento não há profissionais cadastrados na equipe. Cadastre novos barbeiros no Painel Admin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {barbers.map((barber) => {
                const isSelected = selectedBarber?.id === barber.id;

                return (
                  <div
                    key={barber.id}
                    onClick={() => {
                      setSelectedBarber(barber);
                      setSelectedTimeSlot(null);
                    }}
                    className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer relative flex flex-row gap-3 items-center ${
                      isSelected
                        ? 'bg-[#111111] border-[#DAA520] ring-1 ring-[#DAA520]/40 shadow-md'
                        : 'bg-[#111111]/80 border-white/5 hover:border-white/20'
                    }`}
                  >
                    {/* Selected Badge Icon */}
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#DAA520] text-black flex items-center justify-center font-bold shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}

                    {/* Photo */}
                    <div className="relative shrink-0">
                      <img
                        src={barber.photo}
                        alt={barber.name}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover border border-white/10"
                      />
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md text-[#DAA520] text-[8px] font-bold px-1 py-0.2 rounded border border-[#DAA520]/30 font-sans whitespace-nowrap">
                        {barber.rating || 5.0} ★
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-0.5 min-w-0">
                      <div className="pr-6 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs sm:text-sm font-bold text-white font-sans">{barber.name}</h3>
                          <span className="text-[10px] text-[#DAA520] font-medium">• {barber.role}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-[#8E9299] line-clamp-1">{barber.description}</p>

                      {/* Specialties & Lunch Hours */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-[9px] text-[#8E9299] font-sans">
                        {barber.workingHours && (
                          <span className="flex items-center gap-1 text-gray-300">
                            <Clock className="w-2.5 h-2.5 text-[#DAA520]" />
                            {barber.workingHours.start}-{barber.workingHours.end}
                          </span>
                        )}
                        {barber.lunchBreak && (
                          <span className="text-[#DAA520]/90 font-medium">
                            Almoço: {barber.lunchBreak.start}-{barber.lunchBreak.end}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Selection Action Button */}
                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBarber(barber);
                          setSelectedTimeSlot(null);
                          setCurrentStep(3);
                        }}
                        className={`px-3 py-1.5 rounded-lg font-sans text-[11px] font-extrabold uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
                          isSelected
                            ? 'bg-[#DAA520] text-black shadow-md shadow-[#DAA520]/30 hover:bg-[#c9951b]'
                            : 'bg-[#DAA520]/15 hover:bg-[#DAA520] text-[#DAA520] hover:text-black border border-[#DAA520]/30 hover:border-[#DAA520] shadow-sm'
                        }`}
                      >
                        <User className="w-3 h-3" />
                        <span className="hidden sm:inline">{isSelected ? 'Selecionado' : 'Escolher'}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2.5 pt-2">
            <button
              onClick={() => setCurrentStep(1)}
              className="py-3 px-4 rounded-xl bg-[#111111] border border-white/10 text-[#8E9299] hover:text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Voltar
            </button>

            <button
              onClick={handleNextFromStep2}
              className="flex-1 py-3 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#DAA520]/20 flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
            >
              <span>Continuar para Horário</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: HORÁRIO */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h2 className="text-xl font-extrabold text-white font-sans flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#DAA520]" />
                Escolha o Horário
              </h2>
              <p className="text-xs text-[#8E9299] mt-0.5 uppercase tracking-wider">
                Selecione um horário disponível para o seu atendimento
              </p>
            </div>
            <button
              onClick={() => setCurrentStep(2)}
              className="p-2 rounded-lg bg-[#111111] text-[#8E9299] hover:text-white border border-white/10 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Time Slots Grouped by Shift */}
          <div className="space-y-5">
            {availableSlots.length > 0 && availableSlots.every((s) => !s.available) && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-sans flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <span>Todos os horários para esta data estão indisponíveis. Por favor, selecione outra data.</span>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-[10px] font-bold uppercase tracking-wider shrink-0 cursor-pointer border border-rose-500/30"
                >
                  Escolher Outra Data
                </button>
              </div>
            )}

            {(['MANHÃ', 'TARDE', 'NOITE'] as const).map((shiftName) => {
              const shiftSlots = slotsByShift[shiftName];
              if (shiftSlots.length === 0) return null;

              const hasAvailableSlots = shiftSlots.some((s) => s.available);

              return (
                <div
                  key={shiftName}
                  ref={(el) => {
                    shiftRefs.current[shiftName] = el;
                  }}
                  className="bg-[#111111] border border-white/5 rounded-2xl p-4 transition-all scroll-mt-20"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#DAA520]" />
                      <h3 className="text-xs font-bold text-[#DAA520] tracking-[0.2em] uppercase font-sans">
                        Turno {shiftName}
                      </h3>
                    </div>
                    {!hasAvailableSlots ? (
                      <span className="text-[10px] bg-rose-500/15 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded font-sans font-semibold uppercase tracking-wider">
                        Esgotado
                      </span>
                    ) : (
                      <span className="text-[10px] bg-[#DAA520]/15 text-[#DAA520] border border-[#DAA520]/30 px-2 py-0.5 rounded font-sans font-semibold uppercase tracking-wider">
                        Disponível
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {shiftSlots.map((slot) => {
                      const isSelected = selectedTimeSlot?.time === slot.time;

                      return (
                        <button
                          key={slot.time}
                          disabled={!slot.available}
                          onClick={() => handleSelectTimeSlot(slot)}
                          title={slot.reason || 'Horário disponível'}
                          className={`py-3 px-2 rounded-lg border text-center transition-all duration-150 flex flex-col items-center justify-center relative cursor-pointer ${
                            isSelected
                              ? 'bg-[#DAA520] text-black border-[#DAA520] font-bold shadow-md shadow-[#DAA520]/20 scale-105 z-10'
                              : slot.available
                              ? 'bg-[#111111] text-white border-white/10 hover:border-[#DAA520] hover:bg-[#DAA520]/5'
                              : 'bg-[#111111] text-[#8E9299]/40 border-white/5 cursor-not-allowed opacity-40'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-sm font-bold font-sans">{slot.time}</span>
                            {slot.isExtra && (
                              <span className="text-[8px] px-1 py-0.2 bg-[#DAA520]/20 text-[#DAA520] font-extrabold rounded">
                                EXTRA
                              </span>
                            )}
                          </div>
                          {!slot.available && (
                            <span className="text-[9px] truncate max-w-full leading-tight text-rose-400/90 font-sans mt-0.5">
                              {slot.reason === 'Horário de almoço do barbeiro' || slot.reason === 'Horário de almoço do estabelecimento'
                                ? 'Almoço'
                                : slot.reason === 'Horário já passou'
                                ? 'Passou'
                                : slot.reason?.includes('desativado')
                                ? 'Bloqueado'
                                : 'Indisponível'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Continue Button */}
          <div className="flex gap-2.5 pt-2">
            <button
              onClick={() => setCurrentStep(2)}
              className="py-3 px-4 rounded-xl bg-[#111111] border border-white/10 text-[#8E9299] hover:text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Voltar
            </button>

            <button
              ref={continueBtnStep3Ref}
              onClick={handleNextFromStep3}
              className="flex-1 py-4 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-extrabold text-sm uppercase tracking-wider transition-all shadow-lg shadow-[#DAA520]/20 flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
            >
              <span>Continuar para Serviços</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SERVIÇOS */}
      {currentStep === 4 && (
        <div className="space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h2 className="text-xl font-extrabold text-white font-sans flex items-center gap-2">
                <Scissors className="w-5 h-5 text-[#DAA520]" />
                Escolha seus Serviços
              </h2>
              <p className="text-xs text-[#8E9299] mt-0.5 uppercase tracking-wider">
                Escolha serviços individuais OU apenas 1 Combo especial
              </p>
            </div>
            <button
              onClick={() => setCurrentStep(3)}
              className="p-2 rounded-lg bg-[#111111] text-[#8E9299] hover:text-white border border-white/10 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Search Input Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#DAA520]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={bookingSearchQuery}
              onChange={(e) => setBookingSearchQuery(e.target.value)}
              placeholder="Buscar corte, barba ou combo pelo nome..."
              className="w-full bg-[#111111] border border-white/10 focus:border-[#DAA520] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none transition-colors shadow-inner font-sans"
            />
            {bookingSearchQuery && (
              <button
                type="button"
                onClick={() => setBookingSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white cursor-pointer"
                title="Limpar busca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Shortcut Navigation Buttons: Serviços Avulsos / Combos Exclusivos */}
          <div className="bg-[#111111] p-1.5 rounded-xl border border-white/10 shadow-md">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setBookingServiceTab('individual')}
                className={`py-2 px-3 rounded-lg font-sans text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                  bookingServiceTab === 'individual'
                    ? 'bg-[#DAA520] text-black shadow-md shadow-[#DAA520]/20 font-extrabold'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Scissors className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Serviços Individuais</span>
              </button>

              <button
                type="button"
                onClick={() => setBookingServiceTab('combo')}
                className={`py-2 px-3 rounded-lg font-sans text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                  bookingServiceTab === 'combo'
                    ? 'bg-[#DAA520] text-black shadow-md shadow-[#DAA520]/20 font-extrabold'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Scissors className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Combos Promocionais</span>
              </button>
            </div>
          </div>

          {/* Rule Alert Banner */}
          <div className="bg-[#DAA520]/10 border border-[#DAA520]/25 rounded-xl p-3 flex items-center gap-2.5 text-xs text-[#DAA520]">
            <Info className="w-4 h-4 text-[#DAA520] shrink-0" />
            <div className="leading-snug">
              <strong className="font-bold text-[#DAA520]">Regra de Seleção:</strong>{' '}
              <span className="text-gray-300">Você pode escolher múltiplos serviços individuais OU um único Combo promocional.</span>
            </div>
          </div>

          {/* Smart Combo Detection Alert Banner */}
          {smartComboMatch && (
            <div className="bg-[#DAA520]/15 border-2 border-[#DAA520] rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-[#DAA520]/10 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#DAA520] text-black font-extrabold flex items-center justify-center shrink-0 shadow-md">
                  <Sparkles className="w-5 h-5 fill-black" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white uppercase font-sans">
                      Combo Promocional Detectado!
                    </span>
                    <span className="text-[10px] bg-[#DAA520] text-black font-extrabold px-2 py-0.5 rounded uppercase">
                      Economia de R$ {smartComboMatch.savings.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <p className="text-xs text-[#DAA520] font-medium mt-0.5">
                    Suas escolhas ({smartComboMatch.matchedIndividualServices.map((s) => s.name).join(' + ')}) se enquadram no{' '}
                    <strong className="underline font-bold text-white">{smartComboMatch.combo.name}</strong>!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 1: INDIVIDUAL SERVICES (SHOWN FIRST) */}
          {bookingServiceTab === 'individual' && (() => {
            const filteredIndividual = services.filter(
              (s) =>
                s.category === 'individual' &&
                (bookingSearchQuery.trim() === '' ||
                  s.name.toLowerCase().includes(bookingSearchQuery.toLowerCase()) ||
                  s.description.toLowerCase().includes(bookingSearchQuery.toLowerCase()))
            );

            return (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between pt-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#DAA520] font-sans flex items-center gap-2">
                    <Scissors className="w-4 h-4" />
                    <span>Serviços Individuais</span>
                  </h3>
                  <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-gray-400">
                    {filteredIndividual.length} DISPONÍVEIS
                  </span>
                </div>

                {filteredIndividual.length === 0 ? (
                  <div className="bg-[#111111]/90 border border-neutral-800 rounded-2xl p-6 text-center space-y-2">
                    <Scissors className="w-7 h-7 text-[#DAA520] mx-auto opacity-70" />
                    <p className="text-xs text-gray-300 font-sans">
                      {bookingSearchQuery
                        ? `Nenhum serviço individual encontrado para "${bookingSearchQuery}"`
                        : 'Nenhum serviço individual cadastrado no momento.'}
                    </p>
                    {bookingSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setBookingSearchQuery('')}
                        className="py-1 px-3 rounded-lg bg-[#DAA520]/20 hover:bg-[#DAA520] text-[#DAA520] hover:text-black font-extrabold text-[11px] uppercase tracking-wider transition-all cursor-pointer border border-[#DAA520]/30"
                      >
                        Limpar Busca
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredIndividual.map((service) => {
                      const isSelected = selectedIndividualServices.some((s) => s.id === service.id);
                      const isDisabled = selectedCombo !== null;

                      return (
                        <div
                          key={service.id}
                          onClick={() => !isDisabled && handleSelectIndividualService(service)}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            isDisabled
                              ? 'opacity-40 bg-[#111111] border-white/5 cursor-not-allowed'
                              : isSelected
                              ? 'bg-[#111111] border-[#DAA520] ring-1 ring-[#DAA520]/50 shadow-md cursor-pointer'
                              : 'bg-[#111111]/90 border-white/10 hover:border-white/25 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                                  isSelected
                                    ? 'bg-[#DAA520] border-[#DAA520] text-black'
                                    : 'border-white/20 bg-neutral-900'
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-white font-sans">{service.name}</h4>
                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{service.description}</p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-sm font-extrabold text-[#DAA520] font-sans">
                                R$ {service.price.toFixed(2).replace('.', ',')}
                              </span>
                              <p className="text-xs text-gray-400 mt-0.5 font-sans">{service.durationMinutes} min</p>
                            </div>
                          </div>

                          {isDisabled && (
                            <p className="text-[10px] text-[#DAA520]/80 mt-1.5 font-medium">
                              Desabilitado pois você selecionou um Combo.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* SECTION 2: COMBOS PROMOCIONAIS */}
          {bookingServiceTab === 'combo' && (() => {
            const filteredCombos = services.filter(
              (s) =>
                s.category === 'combo' &&
                (bookingSearchQuery.trim() === '' ||
                  s.name.toLowerCase().includes(bookingSearchQuery.toLowerCase()) ||
                  s.description.toLowerCase().includes(bookingSearchQuery.toLowerCase()))
            );

            return (
              <div className="space-y-2.5 animate-fadeIn">
                <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#DAA520] font-sans mb-2.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5" />
                    Combos Promocionais (Apenas 1 por agendamento)
                  </span>
                  <span className="text-[10px] text-[#8E9299]">
                    {filteredCombos.length} disponíveis
                  </span>
                </h3>

                {filteredCombos.length === 0 ? (
                  <div className="bg-[#111111]/90 border border-neutral-800 rounded-2xl p-6 text-center space-y-2">
                    <Scissors className="w-7 h-7 text-[#DAA520] mx-auto opacity-70" />
                    <p className="text-xs text-gray-300 font-sans">
                      {bookingSearchQuery
                        ? `Nenhum combo promocional encontrado para "${bookingSearchQuery}"`
                        : 'Nenhum combo promocional cadastrado no momento.'}
                    </p>
                    {bookingSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setBookingSearchQuery('')}
                        className="py-1 px-3 rounded-lg bg-[#DAA520]/20 hover:bg-[#DAA520] text-[#DAA520] hover:text-black font-extrabold text-[11px] uppercase tracking-wider transition-all cursor-pointer border border-[#DAA520]/30"
                      >
                        Limpar Busca
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {filteredCombos.map((combo) => {
                      const isSelected = selectedCombo?.id === combo.id;
                      const isDisabled = selectedIndividualServices.length > 0;

                      return (
                        <div
                          key={combo.id}
                          onClick={() => !isDisabled && handleSelectCombo(combo)}
                          className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                            isDisabled
                              ? 'opacity-40 bg-[#111111] border-white/5 cursor-not-allowed'
                              : isSelected
                              ? 'bg-[#111111] border-[#DAA520] ring-1 ring-[#DAA520]/40 shadow-lg shadow-[#DAA520]/10 cursor-pointer'
                              : 'bg-[#111111]/90 border-white/10 hover:border-[#DAA520]/40 cursor-pointer'
                          }`}
                        >
                          {/* 1. Tag Combo */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 bg-[#DAA520] text-black font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-sans shadow-sm">
                              <Scissors className="w-3 h-3 stroke-[2.5]" />
                              <span>Combo</span>
                            </span>

                            <div className="flex items-center gap-2">
                              {combo.popular && (
                                <span className="text-[9px] bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold px-1.5 py-0.2 rounded uppercase font-sans">
                                  Mais Vendido
                                </span>
                              )}
                              <div
                                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                                  isSelected
                                    ? 'bg-[#DAA520] border-[#DAA520] text-black'
                                    : 'border-white/20 bg-neutral-900'
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </div>
                          </div>

                          {/* 2. Nome do serviço */}
                          <div>
                            <h4 className="text-sm sm:text-base font-bold text-white font-sans">{combo.name}</h4>
                          </div>

                          {/* 3. Preço & 4. Duração */}
                          <div className="flex items-baseline justify-between bg-black/60 px-3 py-2 rounded-xl border border-white/5">
                            <div>
                              <span className="text-[9px] text-[#8E9299] font-sans uppercase tracking-wider block">Preço</span>
                              <span className="text-base font-black text-[#DAA520] font-sans">
                                R$ {combo.price.toFixed(2).replace('.', ',')}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-[#8E9299] font-sans uppercase tracking-wider block">Duração</span>
                              <span className="text-xs font-bold text-gray-200 flex items-center justify-end gap-1 font-sans">
                                <Clock className="w-3 h-3 text-[#DAA520]" />
                                {combo.durationMinutes} min
                              </span>
                            </div>
                          </div>

                          {/* 5. Descrição */}
                          <div>
                            <span className="text-[9px] text-[#8E9299] font-sans uppercase tracking-wider block mb-0.5">Descrição:</span>
                            <p className="text-xs text-gray-300 font-sans leading-relaxed bg-white/[0.02] p-2 rounded-lg border border-white/5">
                              {combo.description || 'Procedimento completo combinado.'}
                            </p>
                          </div>

                          {isDisabled && (
                            <p className="text-[10px] text-[#DAA520]/80 pt-1 font-medium">
                              Desabilitado pois você já selecionou um serviço individual.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Live Total Banner */}
          <div ref={continueBtnStep4Ref} className="bg-[#111111] border border-[#DAA520]/30 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div>
              <p className="text-[10px] text-[#8E9299] uppercase tracking-wider font-sans">Total Selecionado:</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-[#DAA520] font-sans">
                  R$ {totalPrice.toFixed(2).replace('.', ',')}
                </span>
                {smartComboMatch && (
                  <span className="text-xs text-[#8E9299] line-through font-sans">
                    R$ {smartComboMatch.originalTotalPrice.toFixed(2).replace('.', ',')}
                  </span>
                )}
                <span className="text-xs text-[#8E9299] font-medium flex items-center gap-1 font-sans">
                  <Clock className="w-3 h-3 text-[#DAA520]" />
                  {totalDuration} min
                </span>
              </div>
              {smartComboMatch && (
                <span className="text-[10px] text-[#DAA520] font-bold block mt-0.5 font-sans">
                  ✨ Desconto de R$ {smartComboMatch.savings.toFixed(2).replace('.', ',')} do {smartComboMatch.combo.name} aplicado automaticamente!
                </span>
              )}
            </div>

            <button
              onClick={handleNextFromStep4}
              className="w-full sm:w-auto py-2.5 px-4 rounded-lg bg-[#DAA520] hover:bg-[#c9951b] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#DAA520]/20 cursor-pointer"
            >
              Continuar para Resumo
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: RESUMO */}
      {currentStep === 5 && (
        <div className="space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h2 className="text-xl font-extrabold text-white font-sans flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#DAA520]" />
                Resumo do Agendamento
              </h2>
              <p className="text-xs text-[#8E9299] mt-0.5 uppercase tracking-wider">
                Confira os detalhes e informe seus dados para finalizar
              </p>
            </div>
            <button
              onClick={() => setCurrentStep(4)}
              className="p-2 rounded-lg bg-[#111111] text-[#8E9299] hover:text-white border border-white/10 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Login requirement callout if user is not logged in */}
          {!isLoggedIn ? (
            <div className="bg-[#DAA520]/10 border border-[#DAA520]/30 rounded-xl p-3.5 flex items-start gap-3">
              <CircleAlert className="w-5 h-5 text-[#DAA520] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase font-mono">
                  Pré-agendamento Realizado!
                </h4>
                <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                  Para concluir e <strong className="text-[#DAA520]">confirmar o agendamento</strong> em sua conta, faça login ou cadastre-se.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white uppercase font-mono">
                  Conta Autenticada ({currentUser?.name})
                </h4>
                <p className="text-[10px] text-emerald-400 font-mono">
                  Pronto para finalizar o agendamento com garantia VIP.
                </p>
              </div>
            </div>
          )}

          {/* Summary Card */}
          <div className="bg-[#111111] border border-white/10 rounded-xl p-4 space-y-3 shadow-lg">
            
            {/* Barber */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#DAA520] font-bold block font-sans">
                  Barbeiro
                </span>
                <span className="text-sm font-bold text-white font-sans">{selectedBarber?.name}</span>
              </div>
              <img
                src={selectedBarber?.photo}
                alt={selectedBarber?.name}
                className="w-9 h-9 rounded-lg object-cover border border-[#DAA520]/40"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3 border-b border-white/5 pb-2.5">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#DAA520] font-bold block font-sans">
                  Data
                </span>
                <span className="text-xs font-bold text-white font-sans">
                  {formatDateBR(selectedDate)}
                </span>
                <p className="text-[10px] text-[#8E9299]">{getWeekdayName(selectedDate)}</p>
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#DAA520] font-bold block font-sans">
                  Horário
                </span>
                <span className="text-xs font-bold text-white font-sans">
                  {selectedTimeSlot?.time} às {selectedTimeSlot?.endTime}
                </span>
              </div>
            </div>

            {/* Services List */}
            <div className="border-b border-white/5 pb-3">
              <span className="text-[9px] uppercase tracking-widest text-[#DAA520] font-bold block mb-2 font-sans">
                Serviços Selecionados
              </span>

              {selectedCombo ? (
                <div className="bg-black/50 border border-[#DAA520]/30 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 bg-[#DAA520] text-black font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-sans">
                      Combo
                    </span>
                    <span className="text-[10px] text-gray-300 font-sans flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#DAA520]" />
                      {selectedCombo.durationMinutes} min
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white font-sans">{selectedCombo.name}</h4>
                    <span className="font-sans text-[#DAA520] font-black text-sm">
                      R$ {selectedCombo.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  {selectedCombo.description && (
                    <p className="text-[11px] text-gray-400 font-sans border-t border-white/5 pt-1.5 leading-relaxed">
                      {selectedCombo.description}
                    </p>
                  )}
                </div>
              ) : smartComboMatch ? (
                <div className="space-y-2.5">
                  {/* Smart combo badge */}
                  <div className="bg-[#DAA520]/10 border border-[#DAA520]/30 rounded-xl p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#DAA520]" />
                      <div>
                        <span className="text-xs font-extrabold text-white font-sans block">
                          {smartComboMatch.combo.name}
                        </span>
                        <span className="text-[10px] text-[#DAA520] block font-sans">
                          Combo Promocional Automático (Incluso: {smartComboMatch.matchedIndividualServices.map((s) => s.name).join(', ')})
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-[#DAA520] font-sans">
                      R$ {smartComboMatch.combo.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  {/* Extra individual services */}
                  {smartComboMatch.remainingIndividualServices.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-1 text-xs text-gray-200 font-sans px-1">
                      <span>+ {s.name}</span>
                      <span className="font-sans text-white font-bold">R$ {s.price.toFixed(2).replace('.', ',')}</span>
                    </div>
                  ))}

                  {/* Breakdown */}
                  <div className="pt-2 border-t border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#8E9299]">
                      <span>Subtotal sem promoção:</span>
                      <span className="line-through">R$ {smartComboMatch.originalTotalPrice.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#DAA520] font-bold">
                      <span>Desconto do Combo Promocional:</span>
                      <span>- R$ {smartComboMatch.savings.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                </div>
              ) : (
                selectedIndividualServices.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-0.5 text-xs text-gray-200 font-sans">
                    <span>{s.name}</span>
                    <span className="font-sans text-[#DAA520] font-bold">R$ {s.price.toFixed(2).replace('.', ',')}</span>
                  </div>
                ))
              )}
            </div>

            {/* Coupon Available Selector & Applied Card */}
            <div className="pt-2 border-t border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-widest text-[#DAA520] font-bold font-sans flex items-center gap-1">
                  <TicketPercent className="w-3.5 h-3.5" />
                  Cupom de Desconto
                </span>
                {availableCustomerCoupons.length > 0 && !appliedCoupon && (
                  <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 animate-pulse text-amber-400" />
                    {availableCustomerCoupons.length} disponível(is)
                  </span>
                )}
              </div>

              {appliedCoupon ? (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-bold text-emerald-400">{appliedCoupon.code}</span>
                      <span className="text-[10px] text-gray-300 block">
                        {appliedCoupon.discountType === 'percentage'
                          ? `${appliedCoupon.discountValue}% de desconto aplicado`
                          : `R$ ${appliedCoupon.discountValue.toFixed(2)} de desconto aplicado`}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponCodeInput('');
                      addToast('Cupom removido.', 'info');
                    }}
                    className="text-[10px] text-red-400 hover:text-red-300 underline cursor-pointer"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAvailableCouponsModalOpen(true)}
                  className={`w-full py-2.5 px-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-between transition-all cursor-pointer shadow-sm group ${
                    availableCustomerCoupons.length > 0
                      ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 border-amber-500/40 text-[#DAA520] hover:bg-amber-500/30'
                      : 'bg-neutral-900/80 border-white/10 text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>
                      {availableCustomerCoupons.length > 0
                        ? 'Você possui cupons disponíveis!'
                        : 'Selecionar Cupom de Desconto'}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-lg ${
                      availableCustomerCoupons.length > 0
                        ? 'bg-[#DAA520] text-black group-hover:scale-105 transition-transform'
                        : 'bg-black text-neutral-400 border border-white/10'
                    }`}
                  >
                    {availableCustomerCoupons.length > 0
                      ? 'Ver e Aplicar'
                      : 'Ver Cupons'}
                  </span>
                </button>
              )}
            </div>

            {/* Totals */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div>
                <span className="text-[10px] text-[#8E9299] block font-sans">Duração Estimada:</span>
                <span className="text-xs font-bold text-white font-sans flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#DAA520]" />
                  {totalDuration} minutos
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-[#8E9299] block font-sans">Valor Total:</span>
                {couponDiscount > 0 ? (
                  <div>
                    <span className="text-xs text-neutral-400 line-through mr-2">
                      R$ {totalPrice.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-xl font-black text-emerald-400 font-sans">
                      R$ {finalTotalPrice.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ) : (
                  <span className="text-xl font-black text-[#DAA520] font-sans">
                    R$ {totalPrice.toFixed(2).replace('.', ',')}
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentStep(4)}
              className="py-3.5 px-4 rounded-xl bg-neutral-900 border border-neutral-800 text-gray-300 hover:text-white font-bold text-xs uppercase cursor-pointer"
            >
              Editar
            </button>

            {!isLoggedIn ? (
              <button
                onClick={() => {
                  sessionStorage.setItem('jadson_auto_confirm_after_auth', 'true');
                  addToast('Para concluir seu agendamento, entre ou cadastre sua conta.', 'info');
                  setActivePage('login');
                }}
                className="flex-1 py-3.5 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xl shadow-[#DAA520]/20 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4 stroke-[2.5]" />
                <span>Entrar na Conta para Concluir</span>
              </button>
            ) : (
              <button
                onClick={handleConfirmBooking}
                className="flex-1 py-3.5 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-[#DAA520]/20 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <CircleCheck className="w-5 h-5" />
                <span>Confirmar Agendamento</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 6: AGENDANDO (PROCESSING WITH ELEGANT GLASS UI & SCISSOR ANIMATION) */}
      {currentStep === 6 && (
        <div className="py-6 sm:py-10 max-w-lg mx-auto space-y-6 animate-fadeIn">
          {/* Main Processing Glass Card */}
          <div className="bg-[#121212]/90 border border-[#DAA520]/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-[#DAA520]/15 text-center relative overflow-hidden space-y-6">
            
            {/* Ambient Background Gold Glow Beam */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#DAA520]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Scissors Cutting Badge */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              {/* Outer Spinning Gold Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-[#DAA520]/20 border-t-[#DAA520] border-r-[#DAA520]/70 animate-spin" />
              
              {/* Pulsing Aura */}
              <div className="absolute -inset-1 rounded-full bg-[#DAA520]/20 blur-md animate-pulse" />
              
              {/* Scissor Icon Container with Snip Animation */}
              <div className="relative z-10 w-20 h-20 rounded-full bg-[#1A1A1A] border-2 border-[#DAA520] shadow-xl shadow-[#DAA520]/30 flex items-center justify-center">
                <Scissors className="w-10 h-10 text-[#DAA520] animate-scissor-snip stroke-[2.5]" />
              </div>
            </div>

            {/* Title & Status */}
            <div className="space-y-1.5 relative z-10">
              <h2 className="text-xl sm:text-2xl font-black text-white font-sans tracking-wide">
                Finalizando seu Agendamento
              </h2>
              <p className="text-xs text-[#DAA520] font-semibold flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Processando em tempo real...</span>
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 relative z-10">
              <div className="w-full bg-white/5 border border-white/10 h-3 rounded-full overflow-hidden p-0.5 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-[#DAA520] via-[#F3E5AB] to-[#DAA520] rounded-full transition-all duration-500 shadow-md shadow-[#DAA520]/40"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#8E9299] font-mono px-1">
                <span>VERIFICAÇÃO DE VAGA</span>
                <span className="text-[#DAA520] font-bold">{processingProgress}%</span>
              </div>
            </div>

            {/* Smart Verification Stages Checklist */}
            <div className="bg-black/50 border border-white/5 rounded-2xl p-4 text-left space-y-2.5 relative z-10 backdrop-blur-sm">
              
              {/* Stage 1 */}
              <div className={`flex items-center gap-3 text-xs transition-all duration-300 ${
                processingStage >= 1 ? 'text-white' : 'text-[#8E9299]/50'
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  processingStage > 1
                    ? 'bg-[#DAA520] text-black'
                    : processingStage === 1
                    ? 'bg-[#DAA520]/20 text-[#DAA520] border border-[#DAA520] animate-pulse'
                    : 'bg-white/5 text-[#8E9299] border border-white/10'
                }`}>
                  {processingStage > 1 ? <Check className="w-3 h-3 stroke-[3]" /> : '1'}
                </div>
                <span className="font-medium">Conectando à agenda do barbeiro {selectedBarber?.name}</span>
              </div>

              {/* Stage 2 */}
              <div className={`flex items-center gap-3 text-xs transition-all duration-300 ${
                processingStage >= 2 ? 'text-white' : 'text-[#8E9299]/50'
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  processingStage > 2
                    ? 'bg-[#DAA520] text-black'
                    : processingStage === 2
                    ? 'bg-[#DAA520]/20 text-[#DAA520] border border-[#DAA520] animate-pulse'
                    : 'bg-white/5 text-[#8E9299] border border-white/10'
                }`}>
                  {processingStage > 2 ? <Check className="w-3 h-3 stroke-[3]" /> : '2'}
                </div>
                <span className="font-medium">Garantindo horário das {selectedTimeSlot?.time} ({formatDateBR(selectedDate)})</span>
              </div>

              {/* Stage 3 */}
              <div className={`flex items-center gap-3 text-xs transition-all duration-300 ${
                processingStage >= 3 ? 'text-white' : 'text-[#8E9299]/50'
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  processingStage > 3
                    ? 'bg-[#DAA520] text-black'
                    : processingStage === 3
                    ? 'bg-[#DAA520]/20 text-[#DAA520] border border-[#DAA520] animate-pulse'
                    : 'bg-white/5 text-[#8E9299] border border-white/10'
                }`}>
                  {processingStage >= 3 ? <Check className="w-3 h-3 stroke-[3]" /> : '3'}
                </div>
                <span className="font-medium">Gerando confirmação e enviando notificação</span>
              </div>

            </div>

            {/* Quick Summary Badge inside card */}
            <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-around gap-2 text-[11px] text-[#8E9299] relative z-10">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#DAA520]" />
                <span className="text-white font-medium">{selectedBarber?.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#DAA520]" />
                <span className="text-white font-medium">{selectedTimeSlot?.time} hs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-[#DAA520]" />
                <span className="text-[#DAA520] font-bold">R$ {totalPrice.toFixed(2)}</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* STEP 7: AGENDAMENTO REALIZADO COM SUCESSO */}
      {currentStep === 7 && (
        <div className="py-8 space-y-6 animate-scaleUp text-center">
          
          <div className="w-20 h-20 bg-[#DAA520]/20 border-2 border-[#DAA520] text-[#DAA520] rounded-full mx-auto flex items-center justify-center shadow-2xl shadow-[#DAA520]/20">
            <CircleCheck className="w-12 h-12 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white font-sans">
              Agendamento Realizado com Sucesso!
            </h2>
            <p className="text-xs text-[#DAA520] font-semibold">
              Seu horário está garantido na Barbearia JADSON BARBER.
            </p>
          </div>

          {/* Ticket Summary Card */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 text-left max-w-md mx-auto space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs text-[#8E9299]">Barbeiro:</span>
              <span className="text-sm font-bold text-white font-sans">{selectedBarber?.name}</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs text-[#8E9299]">Data e Horário:</span>
              <span className="text-sm font-bold text-[#DAA520] font-sans">
                {formatDateBR(selectedDate)} às {selectedTimeSlot?.time}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs text-[#8E9299]">Duração Total:</span>
              <span className="text-sm font-bold text-white font-sans">{totalDuration} min</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8E9299]">Valor Total:</span>
              <span className="text-lg font-black text-[#DAA520] font-sans">
                R$ {totalPrice.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
            <button
              onClick={() => setActivePage('meus-agendamentos')}
              className="flex-1 py-3.5 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-extrabold text-sm uppercase tracking-wider transition-colors shadow-lg shadow-[#DAA520]/20 cursor-pointer"
            >
              Ver Meus Agendamentos
            </button>

            <button
              onClick={handleNewBooking}
              className="py-3.5 px-4 rounded-xl bg-[#111111] border border-white/10 text-gray-300 hover:text-white font-bold text-xs uppercase cursor-pointer"
            >
              Novo Agendamento
            </button>
          </div>

        </div>
      )}

      {/* Modal for Selecting Available Coupons */}
      {isAvailableCouponsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#111111] border border-[#DAA520]/40 rounded-3xl p-5 space-y-4 relative shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <TicketPercent className="w-5 h-5 text-[#DAA520]" />
                <h3 className="text-sm font-mono font-bold uppercase text-white">
                  Seus Cupons Disponíveis
                </h3>
              </div>
              <button
                onClick={() => setIsAvailableCouponsModalOpen(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-300 font-sans">
              Selecione um dos cupons promocionais abaixo para aplicar automaticamente ao seu agendamento:
            </p>

            <div className="space-y-3">
              {availableCustomerCoupons.map((coupon) => {
                const isIndividual = coupon.type === 'individual';
                const meetsMinOrder = !coupon.minOrderValue || totalPrice >= coupon.minOrderValue;

                return (
                  <div
                    key={coupon.id}
                    className={`p-4 rounded-2xl border space-y-2.5 transition-all ${
                      isIndividual
                        ? 'bg-purple-950/20 border-purple-500/40'
                        : 'bg-black/60 border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-amber-400 text-base bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-xl">
                          {coupon.code}
                        </span>
                        {isIndividual && (
                          <span className="text-[9px] font-mono font-bold uppercase bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                            Exclusivo
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}% OFF`
                          : `R$ ${coupon.discountValue.toFixed(2)} OFF`}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-neutral-400 space-y-1">
                      {coupon.minOrderValue > 0 && (
                        <div>
                          Pedido Mínimo:{' '}
                          <span className={meetsMinOrder ? 'text-neutral-200' : 'text-rose-400 font-bold'}>
                            R$ {coupon.minOrderValue.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div>Validade: até {coupon.endDate}</div>
                    </div>

                    <button
                      type="button"
                      disabled={!meetsMinOrder}
                      onClick={() => handleSelectAndApplyCoupon(coupon)}
                      className={`w-full py-2 px-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        meetsMinOrder
                          ? 'bg-[#DAA520] hover:bg-[#c9951b] text-black shadow-md'
                          : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                      }`}
                    >
                      {meetsMinOrder ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Aplicar este Cupom</span>
                        </>
                      ) : (
                        <span>Pedido abaixo do valor mínimo</span>
                      )}
                    </button>
                  </div>
                );
              })}

              {availableCustomerCoupons.length === 0 && (
                <div className="text-center py-6 space-y-3 bg-black/40 rounded-2xl border border-white/5 p-4">
                  <TicketPercent className="w-10 h-10 text-neutral-600 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-xs font-mono font-bold text-neutral-300">
                      Nenhum cupom disponível
                    </p>
                    <p className="text-[11px] text-neutral-400 font-sans">
                      Você não possui cupons de desconto ativos no momento para este agendamento.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
