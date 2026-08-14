import {
  Barber,
  ServiceItem,
  FeedPost,
  BarbershopInfo,
  Appointment,
  Customer,
  InsumoItem,
  SaleProduct,
  ExpenseItem,
  Coupon,
  BlockedDate,
  Review,
  AdminNotification,
} from '../types';

export const initialBarbershopInfo: BarbershopInfo = {
  name: 'Barbearia Jadson Barber',
  slogan: 'Seu estilo, seu momento.',
  description: 'A Barbearia Jadson Barber oferece uma experiência premium em cortes modernos, barbas desenhadas e tratamento masculino completo. Espaço exclusivo com ambiente climatizado, atendimento com horário marcado e profissionais altamente qualificados.',
  cep: '44086-402',
  address: 'Rua Curitiba, 401 - Parque Ipê',
  neighborhood: 'Parque Ipê',
  city: 'Feira de Santana - BA',
  phone: '(75) 98313-7171',
  whatsapp: '5575983137171',
  instagram: '@jadsonbarberbarbearia',
  pixKey: '75983137171',
  hours: {
    weekdays: 'Segunda a Sexta: 08:00 às 20:00',
    saturday: 'Sábado: 08:00 às 19:00',
    sunday: 'Domingo: Fechado',
  },
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rua+Curitiba%2C+401+-+Parque+Ip%C3%AA%2C+Feira+de+Santana+-+BA%2C+44086-402',
  weeklySchedule: [
    {
      dayOfWeek: 0,
      dayName: 'Domingo',
      active: false,
      startTime: '09:00',
      endTime: '14:00',
      lunchStart: '12:00',
      lunchEnd: '13:00',
      disabledSlots: [],
      extraSlots: [],
    },
    {
      dayOfWeek: 1,
      dayName: 'Segunda-feira',
      active: true,
      startTime: '08:00',
      endTime: '20:00',
      lunchStart: '12:00',
      lunchEnd: '13:00',
      disabledSlots: [],
      extraSlots: [],
    },
    {
      dayOfWeek: 2,
      dayName: 'Terça-feira',
      active: true,
      startTime: '08:00',
      endTime: '20:00',
      lunchStart: '12:00',
      lunchEnd: '13:00',
      disabledSlots: [],
      extraSlots: [],
    },
    {
      dayOfWeek: 3,
      dayName: 'Quarta-feira',
      active: true,
      startTime: '08:00',
      endTime: '20:00',
      lunchStart: '12:00',
      lunchEnd: '13:00',
      disabledSlots: [],
      extraSlots: [],
    },
    {
      dayOfWeek: 4,
      dayName: 'Quinta-feira',
      active: true,
      startTime: '08:00',
      endTime: '20:00',
      lunchStart: '12:00',
      lunchEnd: '13:00',
      disabledSlots: [],
      extraSlots: [],
    },
    {
      dayOfWeek: 5,
      dayName: 'Sexta-feira',
      active: true,
      startTime: '08:00',
      endTime: '20:00',
      lunchStart: '12:00',
      lunchEnd: '13:00',
      disabledSlots: [],
      extraSlots: [],
    },
    {
      dayOfWeek: 6,
      dayName: 'Sábado',
      active: true,
      startTime: '08:00',
      endTime: '19:00',
      lunchStart: '12:00',
      lunchEnd: '13:00',
      disabledSlots: [],
      extraSlots: [],
    },
  ],
};

export const initialBarbers: Barber[] = [];

export const initialServices: ServiceItem[] = [];

export const initialFeedPosts: FeedPost[] = [];

export const sampleAppointments: Appointment[] = [];

export const initialCustomers: Customer[] = [];

export const initialInsumos: InsumoItem[] = [];

export const initialSaleProducts: SaleProduct[] = [];

export const initialExpenses: ExpenseItem[] = [];

export const initialCoupons: Coupon[] = [];

export const initialBlockedDates: BlockedDate[] = [];

export const initialReviews: Review[] = [];

export const initialNotifications: AdminNotification[] = [];

