export type ThemeMode = 'dark' | 'light';

export interface Barber {
  id: string;
  name: string;
  role: string;
  photo: string;
  specialties: string[];
  description: string;
  rating: number;
  reviewsCount: number;
  status: 'available' | 'busy' | 'off';
  phone?: string;
  cpf?: string;
  cnpj?: string;
  pixKey?: string;
  email?: string;
  phone1?: string;
  phone2?: string;
  address?: string;
  serviceCommission?: number; // %
  salesCommission?: number;   // %
  salary?: number;            // R$
  active?: boolean;            // Ativado / Desativado
  employmentStatus?: 'Admitido' | 'Demitido'; // Admitir / Demitir
  workingHours: {
    start: string; // e.g., '08:00'
    end: string;   // e.g., '20:00'
  };
  lunchBreak: {
    start: string; // e.g., '12:00'
    end: string;   // e.g., '13:00'
  };
  workingDays: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  offDays?: string[]; // YYYY-MM-DD specific off days
  notes?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description: string;
  category: 'individual' | 'combo';
  popular?: boolean;
  includedServiceIds?: string[];
  status?: 'ativo' | 'inativo';
  image?: string;
}

export type AppointmentStatus = 'Agendado' | 'Confirmado' | 'Em atendimento' | 'Concluído' | 'Cancelado';

export interface AppointmentService {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAvatar?: string;
  barberId: string;
  barberName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  services: AppointmentService[];
  isCombo: boolean;
  totalDuration: number; // minutes
  totalPrice: number; // R$
  status: AppointmentStatus;
  createdAt: string;
  updatedAt?: string;
  cancelledAt?: string;
  cancelledBy?: 'admin' | 'cliente' | 'sistema';
  cancelledByName?: string;
  cancellationReason?: string;
  deletedAt?: string;
  deletedBy?: 'admin' | 'cliente';
  deletedByName?: string;
  paymentMethod?: string;
  notes?: string;
  reviewed?: boolean;
  reviewRating?: number;
  rescheduleHistory?: {
    previousDate: string;
    previousTime: string;
    changedAt: string;
  }[];
}

export interface DeletedAppointmentRecord {
  id: string; // e.g. del-app-123
  originalAppointmentId: string;
  appointment: Appointment;
  deletedAt: string;
  deletedBy: 'admin' | 'cliente';
  deletedByName?: string;
  reason?: string;
}

export interface FeedPost {
  id: string;
  title: string;
  category: string;
  content: string;
  image: string;
  date: string;
  likesCount: number;
  author: string;
  isLiked?: boolean;
  active?: boolean;
  highlighted?: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  createdAt: string;
  role?: 'client' | 'admin';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  photo?: string;
  createdAt: string;
  totalAppointments: number;
  lastAppointmentDate?: string;
  totalSpent: number;
  status: 'ativo' | 'inativo';
  notes?: string;
}

export interface InsumoItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string; // e.g. 'un', 'caixa', 'pacote', 'litro'
  minStock: number;
  unitCost: number;
  supplier: string;
  entryDate: string;
  expirationDate?: string;
  notes?: string;
}

export interface SaleProduct {
  id: string;
  name: string;
  category: string;
  sku: string;
  costPrice: number;
  salePrice: number;
  quantity: number;
  minStock: number;
  supplier: string;
  image?: string;
  status: 'ativo' | 'inativo';
  salesCount: number;
  totalRevenue: number;
}

export interface SaleTransaction {
  id: string;
  customerName: string;
  customerPhone: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  totalAmount: number;
  paymentMethod: string;
  date: string;
}

export interface ExpenseItem {
  id: string;
  description: string;
  category: string; // e.g., 'Insumos', 'Aluguel', 'Energia/Água', 'Equipamentos', 'Outros'
  amount: number;
  date: string;
  notes?: string;
}

export interface Coupon {
  id: string;
  code: string;
  type?: 'coletivo' | 'individual'; // Coletivo (para todos) ou Individual (para um cliente)
  targetCustomerId?: string;
  targetCustomerName?: string;
  targetCustomerPhone?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  startDate: string;
  endDate: string;
  usageLimit: number; // Limite total global
  usageLimitPerClient?: number; // Quantidade de usos por cada cliente (ex: 1)
  usedCount: number;
  allowedServiceIds: string[];
  status: 'ativo' | 'inativo' | 'arquivado';
}

export interface BlockedDate {
  id: string;
  date: string; // YYYY-MM-DD
  reason: string;
  notes?: string;
  barberId?: string; // Optional if blocked specifically for 1 barber or all
}

export interface Review {
  id: string;
  authorName: string;
  customerName?: string;
  customerAvatar?: string;
  barberId?: string;
  barberName?: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  serviceName?: string;
  status: 'Visível' | 'Oculto';
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
  createdAt: string;
  lastLogin?: string;
}

export interface AdminLog {
  id: string;
  adminEmail: string;
  action: string;
  date: string; // ISO string
  details: string;
  previousData?: any;
  newData?: any;
}

export interface AdminNotification {
  id: string;
  type: 'agendamento' | 'cancelamento' | 'reagendamento' | 'avaliacao' | 'estoque' | 'cliente' | 'venda' | 'recuperacao_senha';
  title: string;
  message: string;
  date: string;
  read: boolean;
  appointmentId?: string;
  customerAvatar?: string;
  resetRequestId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  tempCode?: string;
  resetStatus?: 'pendente' | 'temp_code_generated' | 'concluido';
}

export interface PasswordResetRequest {
  id: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  tempCode?: string; // 6-digit code generated by admin (e.g. '849201')
  status: 'pendente' | 'temp_code_generated' | 'concluido' | 'cancelado';
  createdAt: string;
  generatedAt?: string;
  completedAt?: string;
  adminNotes?: string;
}

export interface WeeklyDayConfig {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  dayName: string;
  active: boolean;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  lunchStart: string; // HH:mm
  lunchEnd: string;   // HH:mm
  disabledSlots: string[]; // HH:mm array
  extraSlots: string[];    // HH:mm array
}

export interface BarbershopInfo {
  name: string;
  shortName?: string;
  cep?: string;
  pixKey?: string;
  slogan: string;
  description: string;
  address: string;
  neighborhood: string;
  city: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  googleMapsUrl: string;
  logo?: string;
  weeklySchedule?: WeeklyDayConfig[];
}
