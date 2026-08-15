import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  playNotificationSound as playAudioEffect,
  NotificationSoundType,
  LOCAL_STORAGE_CUSTOM_SOUND_KEY,
  LOCAL_STORAGE_CUSTOM_SOUND_NAME_KEY,
} from '../utils/audio';
import {
  Barber,
  ServiceItem,
  Appointment,
  FeedPost,
  BarbershopInfo,
  AppointmentStatus,
  AppointmentService,
  UserAccount,
  Customer,
  InsumoItem,
  SaleProduct,
  SaleTransaction,
  ExpenseItem,
  Coupon,
  BlockedDate,
  Review,
  AdminNotification,
  AdminLog,
  DeletedAppointmentRecord,
  PasswordResetRequest,
} from '../types';
import {
  initialBarbers,
  initialServices,
  initialFeedPosts,
  initialBarbershopInfo,
  sampleAppointments,
  initialCustomers,
  initialInsumos,
  initialSaleProducts,
  initialExpenses,
  initialCoupons,
  initialBlockedDates,
  initialReviews,
  initialNotifications,
} from '../data/initialData';

export type ActivePage =
  | 'agenda'
  | 'meus-agendamentos'
  | 'feed'
  | 'barbearia'
  | 'servicos'
  | 'barbeiros'
  | 'perfil'
  | 'cupons'
  | 'login'
  | 'admin-login'
  | 'admin-dashboard'
  | 'admin-financeiro'
  | 'admin-agendamentos'
  | 'admin-historico'
  | 'admin-feed'
  | 'admin-equipe'
  | 'admin-clientes'
  | 'admin-servicos'
  | 'admin-estoque'
  | 'admin-produtos'
  | 'admin-cupons'
  | 'admin-horarios'
  | 'admin-avaliacoes'
  | 'admin-configuracoes';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface AppContextType {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  barbershopInfo: BarbershopInfo;
  barbers: Barber[];
  services: ServiceItem[];
  feedPosts: FeedPost[];
  appointments: Appointment[];
  deletedAppointments: DeletedAppointmentRecord[];
  customers: Customer[];
  insumos: InsumoItem[];
  products: SaleProduct[];
  expenses: ExpenseItem[];
  coupons: Coupon[];
  blockedDates: BlockedDate[];
  reviews: Review[];
  sales: SaleTransaction[];
  notifications: AdminNotification[];
  adminLogs: AdminLog[];

  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;

  // Client Auth
  isLoggedIn: boolean;
  currentUser: UserAccount | null;
  login: (emailOrPhone: string, password?: string) => Promise<boolean>;
  registerUser: (name: string, phone: string, email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updatedData: Partial<UserAccount>) => void;

  // Password Recovery Flow
  passwordResetRequests: PasswordResetRequest[];
  requestPasswordReset: (identifier: string, name?: string) => Promise<{ success: boolean; message: string; request?: PasswordResetRequest }>;
  generateTempPasswordForReset: (requestId: string) => Promise<{ tempCode: string; whatsappUrl: string }>;
  completePasswordReset: (identifier: string, tempCode: string, newPassword: string) => Promise<boolean>;
  getActivePasswordReset: (identifier: string) => PasswordResetRequest | undefined;

  // Admin Auth
  isAdminLoggedIn: boolean;
  adminUser: UserAccount | null;
  loginAdmin: (email: string, pass: string) => Promise<boolean>;
  logoutAdmin: () => void;

  // Pre-selection helper
  selectedBarberForBooking?: Barber;
  setSelectedBarberForBooking: (barber: Barber | undefined) => void;

  // Appointment actions
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => Promise<Appointment>;
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => Promise<boolean>;
  cancelAppointment: (
    appointmentId: string,
    cancelledBy?: 'admin' | 'cliente',
    reason?: string
  ) => Promise<boolean>;
  rescheduleAppointment: (
    appointmentId: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
    newBarberId: string,
    newBarberName: string
  ) => Promise<boolean>;
  updateAppointmentServices: (
    appointmentId: string,
    newServices: AppointmentService[],
    newTotalPrice: number,
    newTotalDuration: number,
    isCombo: boolean
  ) => Promise<boolean>;
  updateAppointment: (
    appointmentId: string,
    updatedData: Partial<Appointment>
  ) => Promise<boolean>;
  deleteAppointment: (
    appointmentId: string,
    deletedBy?: 'admin' | 'cliente',
    reason?: string
  ) => Promise<boolean>;
  restoreAppointment: (
    recordOrAppId: string,
    isFromDeletedCollection?: boolean
  ) => Promise<boolean>;
  permanentlyDeleteArchivedAppointment: (recordId: string) => Promise<boolean>;
  clearAllArchivedHistory: (options?: { type?: 'all' | 'deleted' | 'cancelled' }) => Promise<boolean>;
  clearHistory: () => Promise<boolean>;

  // Barber actions
  addBarber: (barber: Omit<Barber, 'id'>) => Promise<boolean>;
  updateBarber: (id: string, data: Partial<Barber>) => Promise<boolean>;
  deleteBarber: (id: string) => Promise<boolean>;

  // Service & Combo actions
  addService: (service: Omit<ServiceItem, 'id'>) => Promise<boolean>;
  updateService: (id: string, data: Partial<ServiceItem>) => Promise<boolean>;
  deleteService: (id: string) => Promise<boolean>;

  // Feed actions
  toggleLikePost: (postId: string) => void;
  addFeedPost: (post: Omit<FeedPost, 'id' | 'date' | 'likesCount'>) => Promise<boolean>;
  updateFeedPost: (id: string, data: Partial<FeedPost>) => Promise<boolean>;
  deleteFeedPost: (id: string) => Promise<boolean>;

  // Customer actions
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<boolean>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<boolean>;
  deleteCustomer: (id: string) => Promise<boolean>;

  // Insumo / Stock actions
  addInsumo: (item: Omit<InsumoItem, 'id'>) => Promise<boolean>;
  updateInsumo: (id: string, data: Partial<InsumoItem>) => Promise<boolean>;
  deleteInsumo: (id: string) => Promise<boolean>;

  // Sale Product actions
  addProduct: (product: Omit<SaleProduct, 'id' | 'salesCount' | 'totalRevenue'>) => Promise<boolean>;
  updateProduct: (id: string, data: Partial<SaleProduct>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  recordSale: (saleData: {
    customerName: string;
    customerPhone: string;
    productId: string;
    quantity: number;
    paymentMethod: string;
  }) => Promise<boolean>;

  // Expense actions
  addExpense: (expense: Omit<ExpenseItem, 'id'>) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;

  // Coupon actions
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usedCount'>) => Promise<boolean>;
  updateCoupon: (id: string, data: Partial<Coupon>) => Promise<boolean>;
  deleteCoupon: (id: string) => Promise<boolean>;

  // Blocked Dates actions
  addBlockedDate: (blocked: Omit<BlockedDate, 'id'>) => Promise<boolean>;
  deleteBlockedDate: (id: string) => Promise<boolean>;

  // Review actions
  addReview: (review: Omit<Review, 'id' | 'date' | 'status'>) => Promise<boolean>;
  updateReviewStatus: (id: string, status: 'Visível' | 'Oculto') => Promise<boolean>;
  deleteReview: (id: string) => Promise<boolean>;

  // Client Review Prompt & Auto-Completion
  pendingReviewAppointment: Appointment | null;
  setPendingReviewAppointment: (app: Appointment | null) => void;
  isReviewModalOpen: boolean;
  setIsReviewModalOpen: (open: boolean) => void;
  submitAppointmentReview: (
    appointmentId: string,
    rating: number,
    comment: string,
    tags?: string[]
  ) => Promise<boolean>;
  dismissAppointmentReview: (appointmentId: string) => void;
  reviewedAppointmentIds: string[];

  // Settings
  updateSettings: (newSettings: Partial<BarbershopInfo>) => Promise<boolean>;

  // Notifications & Sound System
  isSoundMuted: boolean;
  setIsSoundMuted: (muted: boolean) => void;
  toggleSoundMuted: () => void;
  soundVolume: number;
  setSoundVolume: (volume: number) => void;
  soundType: NotificationSoundType;
  setSoundType: (type: NotificationSoundType) => void;
  customSoundName: string | null;
  uploadCustomSound: (file: File) => Promise<boolean>;
  resetToDefaultSound: () => void;
  playNotificationSound: (type?: NotificationSoundType) => void;
  testNotificationSound: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearNotifications: () => void;

  // Toast System
  toasts: ToastMessage[];
  addToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Drawer / Sidebar state
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_CUSTOMER_KEY = 'jadson_customer';
const LOCAL_STORAGE_USER_KEY = 'jadson_logged_user';
const LOCAL_STORAGE_ADMIN_USER_KEY = 'jadson_admin_logged_user';
const LOCAL_STORAGE_REVIEWED_KEY = 'jadson_reviewed_appts';
const LOCAL_STORAGE_DISMISSED_REVIEW_KEY = 'jadson_dismissed_reviews';
const LOCAL_STORAGE_BARBERSHOP_INFO_KEY = 'jadson_barbershop_info';
const LOCAL_STORAGE_BARBERS_KEY = 'jadson_barbers_list';
const LOCAL_STORAGE_SOUND_MUTED_KEY = 'jadson_admin_sound_muted';
const LOCAL_STORAGE_SOUND_VOLUME_KEY = 'jadson_admin_sound_volume';
const LOCAL_STORAGE_SOUND_TYPE_KEY = 'jadson_admin_sound_type';

// Helper to sanitize Firestore payloads (remove undefined, NaN, circular refs)
export function cleanFirestoreData<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (typeof data !== 'object') {
    if (typeof data === 'number' && isNaN(data)) {
      return 0 as any;
    }
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => cleanFirestoreData(item)) as any;
  }
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    if (value !== undefined) {
      cleaned[key] = cleanFirestoreData(value);
    }
  }
  return cleaned as T;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<ActivePage>('agenda');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Client Review Prompt State
  const [manualReviewAppointment, setManualReviewAppointment] = useState<Appointment | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [dismissedReviewIds, setDismissedReviewIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_DISMISSED_REVIEW_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [reviewedAppointmentIds, setReviewedAppointmentIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_REVIEWED_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Core collections state initialized with default values, synced in real-time with Firestore
  const [barbershopInfo, setBarbershopInfo] = useState<BarbershopInfo>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_BARBERSHOP_INFO_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.weeklySchedule)) {
          return parsed;
        }
      }
    } catch (e) {}
    return initialBarbershopInfo;
  });
  const [barbers, setBarbers] = useState<Barber[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_BARBERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialBarbers;
  });
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(() => {
    try {
      const saved = localStorage.getItem('jadson_feed_posts_cache');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialFeedPosts;
  });
  const [appointments, setAppointments] = useState<Appointment[]>(sampleAppointments);
  const [deletedAppointments, setDeletedAppointments] = useState<DeletedAppointmentRecord[]>([]);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [insumos, setInsumos] = useState<InsumoItem[]>(initialInsumos);
  const [products, setProducts] = useState<SaleProduct[]>(initialSaleProducts);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(initialExpenses);
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>(initialBlockedDates);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>(initialNotifications);
  const [passwordResetRequests, setPasswordResetRequests] = useState<PasswordResetRequest[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);

  const [selectedBarberForBooking, setSelectedBarberForBooking] = useState<Barber | undefined>();

  // Toasts State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Logged in Client User
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading user from localStorage', e);
    }
    return null;
  });

  const isLoggedIn = Boolean(currentUser);

  // Logged in Admin User
  const [adminUser, setAdminUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ADMIN_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading admin user', e);
    }
    return null;
  });

  const isAdminLoggedIn = Boolean(adminUser && adminUser.role === 'admin');

  // Customer info state
  const [customerName, setCustomerNameState] = useState<string>(() => {
    if (currentUser?.name) return currentUser.name;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CUSTOMER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.name || 'Cliente Jadson Barber';
      }
    } catch (e) {
      // fallback
    }
    return 'Cliente Jadson Barber';
  });

  const [customerPhone, setCustomerPhoneState] = useState<string>(() => {
    if (currentUser?.phone) return currentUser.phone;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CUSTOMER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.phone || '(11) 99999-8888';
      }
    } catch (e) {
      // fallback
    }
    return '(11) 99999-8888';
  });

  const getClientLikeId = (): string => {
    if (currentUser?.id) return `user_${currentUser.id}`;
    if (currentUser?.phone) {
      const clean = currentUser.phone.replace(/\D/g, '');
      if (clean) return `phone_${clean}`;
    }
    if (customerPhone) {
      const clean = customerPhone.replace(/\D/g, '');
      if (clean.length >= 8) return `phone_${clean}`;
    }
    try {
      let localId = localStorage.getItem('jadson_client_device_id');
      if (!localId) {
        localId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('jadson_client_device_id', localId);
      }
      return localId;
    } catch {
      return 'device_client_default';
    }
  };

  // Notifications & Sound State
  const [isSoundMuted, setIsSoundMutedState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SOUND_MUTED_KEY);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [soundVolume, setSoundVolumeState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SOUND_VOLUME_KEY);
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) return parsed;
      }
    } catch {}
    return 80;
  });

  const [soundType, setSoundTypeState] = useState<NotificationSoundType>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SOUND_TYPE_KEY);
      if (saved && ['bell', 'cash', 'chime', 'marimba', 'success', 'custom'].includes(saved)) {
        return saved as NotificationSoundType;
      }
    } catch {}
    return 'bell';
  });

  const [customSoundName, setCustomSoundName] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_CUSTOM_SOUND_NAME_KEY) || null;
    } catch {
      return null;
    }
  });

  const [customSoundData, setCustomSoundData] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_CUSTOM_SOUND_KEY) || null;
    } catch {
      return null;
    }
  });

  const playSoundRef = useRef<(type?: NotificationSoundType) => void>(() => {});
  const isInitialApptsLoad = useRef(true);
  const knownApptIds = useRef<Set<string>>(new Set());
  const autoCompletedIds = useRef<Set<string>>(new Set());

  // Attach Firestore Realtime Listeners
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    try {
      // 1. Appointments listener
      const apptsUnsub = onSnapshot(
        collection(db, 'appointments'),
        (snapshot) => {
          const list: Appointment[] = [];
          const currentIds = new Set<string>();

          snapshot.forEach((d) => {
            const data = d.data();
            list.push({ id: d.id, ...data } as Appointment);
            currentIds.add(d.id);
          });

          // Sort by date/startTime desc
          list.sort((a, b) => `${b.date} ${b.startTime}`.localeCompare(`${a.date} ${a.startTime}`));
          setAppointments(list);

          // Trigger sound effect ONLY for newly created appointments arriving after initial load
          if (!isInitialApptsLoad.current) {
            let hasNewCreatedAppt = false;
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added' && !knownApptIds.current.has(change.doc.id)) {
                hasNewCreatedAppt = true;
              }
            });

            if (hasNewCreatedAppt) {
              playSoundRef.current();
            }
          } else {
            isInitialApptsLoad.current = false;
          }

          knownApptIds.current = currentIds;
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'appointments')
      );
      unsubs.push(apptsUnsub);

      // 2. Services listener
      const servUnsub = onSnapshot(
        collection(db, 'services'),
        (snapshot) => {
          const list: ServiceItem[] = [];
          snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as ServiceItem));
          setServices(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'services')
      );
      unsubs.push(servUnsub);

      // 3. Barbers listener
      const barbUnsub = onSnapshot(
        collection(db, 'barbers'),
        (snapshot) => {
          const list: Barber[] = [];
          snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Barber));
          if (list.length > 0) {
            setBarbers(list);
            try {
              localStorage.setItem(LOCAL_STORAGE_BARBERS_KEY, JSON.stringify(list));
            } catch (e) {}
          } else {
            const saved = localStorage.getItem(LOCAL_STORAGE_BARBERS_KEY);
            if (saved) {
              try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  setBarbers(parsed);
                  return;
                }
              } catch (e) {}
            }
            setBarbers([]);
          }
        },
        (err) => {
          console.warn('Firestore barbers listener notice:', err);
        }
      );
      unsubs.push(barbUnsub);

      // 4. Feed listener
      const feedUnsub = onSnapshot(
        collection(db, 'feed'),
        (snapshot) => {
          const list: FeedPost[] = [];
          const clientLikeId = getClientLikeId();
          snapshot.forEach((d) => {
            const data = d.data() as Partial<FeedPost>;
            const likedBy = Array.isArray(data.likedBy) ? data.likedBy : [];
            const isLiked = likedBy.includes(clientLikeId);
            list.push({
              id: d.id,
              title: data.title || '',
              category: data.category || 'Tendências',
              content: data.content || '',
              image: data.image || '',
              date: data.date || 'Hoje',
              likesCount: typeof data.likesCount === 'number' ? data.likesCount : (likedBy.length || 0),
              author: data.author || 'Barbearia Jadson Barber',
              active: data.active ?? true,
              highlighted: data.highlighted ?? false,
              isLiked,
              likedBy,
            } as FeedPost);
          });
          if (list.length > 0) {
            setFeedPosts(list);
            try {
              localStorage.setItem('jadson_feed_posts_cache', JSON.stringify(list));
            } catch (e) {}
          } else {
            const saved = localStorage.getItem('jadson_feed_posts_cache');
            if (saved) {
              try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  setFeedPosts(parsed);
                  return;
                }
              } catch (e) {}
            }
          }
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'feed')
      );
      unsubs.push(feedUnsub);

      // 5. Customers listener
      const custUnsub = onSnapshot(
        collection(db, 'customers'),
        (snapshot) => {
          const list: Customer[] = [];
          snapshot.forEach((d) => {
            const data = d.data() || {};
            list.push({
              id: d.id,
              name: data.name || '',
              phone: data.phone || '',
              email: data.email || '',
              avatar: data.avatar || data.photo || '',
              photo: data.photo || data.avatar || '',
              createdAt: data.createdAt || '',
              totalAppointments: typeof data.totalAppointments === 'number' ? data.totalAppointments : (Number(data.totalAppointments) || 0),
              totalSpent: typeof data.totalSpent === 'number' ? data.totalSpent : (Number(data.totalSpent) || 0),
              ...data,
            } as Customer);
          });
          setCustomers(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'customers')
      );
      unsubs.push(custUnsub);

      // 6. Insumos listener
      const insUnsub = onSnapshot(
        collection(db, 'inventory'),
        (snapshot) => {
          const list: InsumoItem[] = [];
          snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as InsumoItem));
          setInsumos(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'inventory')
      );
      unsubs.push(insUnsub);

      // 7. Sale Products listener
      const prodUnsub = onSnapshot(
        collection(db, 'products'),
        (snapshot) => {
          const list: SaleProduct[] = [];
          snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as SaleProduct));
          setProducts(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'products')
      );
      unsubs.push(prodUnsub);

      // 8. Expenses listener
      const expUnsub = onSnapshot(
        collection(db, 'financialTransactions'),
        (snapshot) => {
          const list: ExpenseItem[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            if (data.type === 'expense' || data.amount) {
              list.push({ id: d.id, ...data } as ExpenseItem);
            }
          });
          setExpenses(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'financialTransactions')
      );
      unsubs.push(expUnsub);

      // 9. Coupons listener
      const coupUnsub = onSnapshot(
        collection(db, 'coupons'),
        (snapshot) => {
          const list: Coupon[] = [];
          snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Coupon));
          setCoupons(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'coupons')
      );
      unsubs.push(coupUnsub);

      // 10. Blocked Dates listener
      const blockUnsub = onSnapshot(
        collection(db, 'blockedDates'),
        (snapshot) => {
          const list: BlockedDate[] = [];
          snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as BlockedDate));
          setBlockedDates(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'blockedDates')
      );
      unsubs.push(blockUnsub);

      // 11. Reviews listener
      const revUnsub = onSnapshot(
        collection(db, 'reviews'),
        (snapshot) => {
          const list: Review[] = [];
          snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Review));
          setReviews(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'reviews')
      );
      unsubs.push(revUnsub);

      // 12. Settings listener
      const setUnsub = onSnapshot(
        doc(db, 'settings', 'barbershopInfo'),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as BarbershopInfo;
            setBarbershopInfo(data);
            try {
              localStorage.setItem(LOCAL_STORAGE_BARBERSHOP_INFO_KEY, JSON.stringify(data));
            } catch (e) {}
          }
        },
        (err) => handleFirestoreError(err, OperationType.GET, 'settings/barbershopInfo')
      );
      unsubs.push(setUnsub);

      // 13. Notifications listener
      const notifUnsub = onSnapshot(
        collection(db, 'notifications'),
        (snapshot) => {
          const list: AdminNotification[] = [];
          snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as AdminNotification));
          // Sort unread first, then by date descending
          list.sort((a, b) => {
            if (a.read !== b.read) return a.read ? 1 : -1;
            return (b.date || '').localeCompare(a.date || '');
          });
          setNotifications(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'notifications')
      );
      unsubs.push(notifUnsub);

      // 14. Logs listener
      const logsUnsub = onSnapshot(
        collection(db, 'adminLogs'),
        (snapshot) => {
          const list: AdminLog[] = [];
          snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as AdminLog));
          list.sort((a, b) => b.date.localeCompare(a.date));
          setAdminLogs(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'adminLogs')
      );
      unsubs.push(logsUnsub);

      // 15. Deleted Appointments history listener
      const delApptsUnsub = onSnapshot(
        collection(db, 'deletedAppointments'),
        (snapshot) => {
          const list: DeletedAppointmentRecord[] = [];
          snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as DeletedAppointmentRecord));
          list.sort((a, b) => (b.deletedAt || '').localeCompare(a.deletedAt || ''));
          setDeletedAppointments(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'deletedAppointments')
      );
      unsubs.push(delApptsUnsub);

      // 16. Password Reset Requests listener
      const resetUnsub = onSnapshot(
        collection(db, 'passwordResetRequests'),
        (snapshot) => {
          const list: PasswordResetRequest[] = [];
          snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as PasswordResetRequest));
          list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          setPasswordResetRequests(list);
        },
        (err) => console.warn('Password reset requests listener notice:', err)
      );
      unsubs.push(resetUnsub);
    } catch (e) {
      console.warn('Realtime listeners running with offline/fallback state:', e);
    }

    return () => {
      unsubs.forEach((fn) => fn());
    };
  }, []);

  // Intelligent Auto-Completion: Conclude appointments automatically when endTime is reached
  useEffect(() => {
    const checkAndAutoComplete = async () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
      const currentDay = String(now.getDate()).padStart(2, '0');
      const todayDateStr = `${currentYear}-${currentMonth}-${currentDay}`;

      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      const toComplete = appointments.filter((app) => {
        if (autoCompletedIds.current.has(app.id)) return false;
        if (app.status === 'Agendado' || app.status === 'Confirmado' || app.status === 'Em atendimento') {
          const isPastDate = app.date < todayDateStr;
          const isPastTimeToday = app.date === todayDateStr && app.endTime <= currentTimeStr;
          return isPastDate || isPastTimeToday;
        }
        return false;
      });

      if (toComplete.length > 0) {
        // Mark in memory immediately to prevent concurrent duplicate checks
        toComplete.forEach((a) => autoCompletedIds.current.add(a.id));

        for (const app of toComplete) {
          try {
            await updateDoc(doc(db, 'appointments', app.id), {
              status: 'Concluído',
              updatedAt: new Date().toISOString(),
            });
          } catch (err) {
            console.warn('Auto-complete update notice:', err);
          }
        }
      }
    };

    const timer = setTimeout(checkAndAutoComplete, 1000);
    const interval = setInterval(checkAndAutoComplete, 30000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [appointments]);

  // Determine which completed appointment requires review from the active client
  const pendingReviewAppointment = useMemo(() => {
    if (manualReviewAppointment) return manualReviewAppointment;
    if (activePage.startsWith('admin-')) return null;

    const normalizePhone = (p: string) => (p || '').replace(/\D/g, '');
    const clientPhoneDigits = normalizePhone(currentUser?.phone || customerPhone || '');

    const candidate = appointments.find((app) => {
      if (app.status !== 'Concluído') return false;
      if (app.reviewed) return false;
      if (reviewedAppointmentIds.includes(app.id)) return false;
      if (dismissedReviewIds.includes(app.id)) return false;

      const appPhoneDigits = normalizePhone(app.customerPhone || '');
      const matchesPhone =
        clientPhoneDigits &&
        appPhoneDigits &&
        (clientPhoneDigits === appPhoneDigits ||
          clientPhoneDigits.endsWith(appPhoneDigits) ||
          appPhoneDigits.endsWith(clientPhoneDigits));
      const matchesUserId = currentUser?.id && app.customerId === currentUser.id;

      return Boolean(matchesPhone || matchesUserId);
    });

    return candidate || null;
  }, [appointments, currentUser, customerPhone, reviewedAppointmentIds, dismissedReviewIds, manualReviewAppointment, activePage]);

  // Helper to record admin log
  const addAdminLog = async (action: string, details: string, previousData?: any, newData?: any) => {
    try {
      const newLog: Omit<AdminLog, 'id'> = {
        adminEmail: adminUser?.email || 'barbeariajadsonbarber@gmail.com',
        action,
        date: new Date().toISOString(),
        details,
        previousData: previousData || null,
        newData: newData || null,
      };
      await addDoc(collection(db, 'adminLogs'), newLog);
    } catch (e) {
      console.error('Error logging admin action:', e);
    }
  };

  // Helper to get active password reset for email or phone
  const getActivePasswordReset = (identifier: string): PasswordResetRequest | undefined => {
    if (!identifier || !identifier.trim()) return undefined;
    const cleanId = identifier.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    return passwordResetRequests.find((req) => {
      if (req.status === 'concluido' || req.status === 'cancelado') return false;
      const reqPhone = (req.customerPhone || '').replace(/[^0-9]/g, '');
      const reqEmail = (req.customerEmail || '').trim().toLowerCase();
      const rawPhone = identifier.replace(/[^0-9]/g, '');
      const rawEmail = identifier.trim().toLowerCase();

      if (rawPhone && reqPhone && (rawPhone === reqPhone || reqPhone.includes(rawPhone) || rawPhone.includes(reqPhone))) {
        return true;
      }
      if (rawEmail && reqEmail && rawEmail === reqEmail) {
        return true;
      }
      return false;
    });
  };

  // CLIENT PASSWORD RECOVERY REQUEST
  const requestPasswordReset = async (
    identifier: string,
    name?: string
  ): Promise<{ success: boolean; message: string; request?: PasswordResetRequest }> => {
    const raw = identifier.trim();
    if (!raw) {
      addToast('Por favor, informe seu e-mail ou WhatsApp.', 'error');
      return { success: false, message: 'Identificador vazio' };
    }

    const isEmail = raw.includes('@');
    const cleanPhone = raw.replace(/[^0-9]/g, '');

    // Check if customer exists in CRM
    const matchedCustomer = customers.find((c) => {
      const cPhone = (c.phone || '').replace(/[^0-9]/g, '');
      const cEmail = (c.email || '').trim().toLowerCase();
      if (isEmail && cEmail === raw.toLowerCase()) return true;
      if (!isEmail && cleanPhone && cPhone && (cPhone === cleanPhone || cPhone.includes(cleanPhone) || cleanPhone.includes(cPhone))) return true;
      return false;
    });

    const targetName = matchedCustomer?.name || name?.trim() || (isEmail ? raw.split('@')[0] : 'Cliente');
    const targetPhone = matchedCustomer?.phone || (!isEmail ? raw : '');
    const targetEmail = matchedCustomer?.email || (isEmail ? raw : '');
    const targetId = matchedCustomer?.id || `cust-${Date.now()}`;

    const requestId = `reset-${Date.now()}`;
    const newRequest: PasswordResetRequest = {
      id: requestId,
      customerId: targetId,
      customerName: targetName,
      customerPhone: targetPhone,
      customerEmail: targetEmail,
      status: 'pendente',
      createdAt: new Date().toISOString(),
    };

    // Update local state
    setPasswordResetRequests((prev) => [newRequest, ...prev]);

    // Save to Firestore
    try {
      await setDoc(doc(db, 'passwordResetRequests', requestId), cleanFirestoreData(newRequest));
      
      // Create admin notification
      const notif: Omit<AdminNotification, 'id'> = {
        type: 'recuperacao_senha',
        title: '🔑 Solicitação de Nova Senha',
        message: `Cliente ${targetName} (${targetPhone || targetEmail}) solicitou recuperação de senha.`,
        date: new Date().toLocaleString('pt-BR'),
        read: false,
        resetRequestId: requestId,
        customerName: targetName,
        customerPhone: targetPhone,
        customerEmail: targetEmail,
        resetStatus: 'pendente',
      };
      await addDoc(collection(db, 'notifications'), notif);
      
      // Admin action log
      addAdminLog('Solicitação de Senha', `Cliente ${targetName} (${targetPhone || targetEmail}) solicitou nova senha.`);
    } catch (err) {
      console.warn('Saved reset request locally:', err);
    }

    addToast('Solicitação de nova senha enviada ao painel administrativo!', 'success');
    return {
      success: true,
      message: 'Solicitação registrada com sucesso',
      request: newRequest,
    };
  };

  // ADMIN ACTION: GENERATE 6-DIGIT CODE & SEND VIA WHATSAPP
  const generateTempPasswordForReset = async (
    requestId: string
  ): Promise<{ tempCode: string; whatsappUrl: string }> => {
    const req = passwordResetRequests.find((r) => r.id === requestId);
    const tempCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    const targetName = req?.customerName || 'Cliente';
    const targetPhone = req?.customerPhone || '';
    const cleanDigits = targetPhone.replace(/\D/g, '');

    // Phone with Brazilian country code if missing
    let fullPhone = cleanDigits;
    if (fullPhone.length === 10 || fullPhone.length === 11) {
      fullPhone = `55${fullPhone}`;
    }

    const appUrl = window.location.origin;
    const message = `Olá, *${targetName}*! ✂️💈\n\nAqui é da *Barbearia Jadson Barber*.\n\nSeu código de 6 dígitos para redefinição de acesso é:\n\n🔑 *${tempCode}*\n\n👉 Para cadastrar sua nova senha:\n1. Acesse o aplicativo: ${appUrl}\n2. Clique no botão "Esqueci minha senha"\n3. Informe seu WhatsApp e o código temporário *${tempCode}*\n4. Crie sua nova senha!\n\n_Qualquer dúvida, estamos à disposição no WhatsApp!_`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(message)}`;

    // Update in local state
    setPasswordResetRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, tempCode, status: 'temp_code_generated', generatedAt: new Date().toISOString() }
          : r
      )
    );

    // Update in Firestore
    try {
      await setDoc(
        doc(db, 'passwordResetRequests', requestId),
        {
          tempCode,
          status: 'temp_code_generated',
          generatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Update related notifications
      notifications
        .filter((n) => n.resetRequestId === requestId)
        .forEach(async (notif) => {
          try {
            await setDoc(
              doc(db, 'notifications', notif.id),
              {
                tempCode,
                resetStatus: 'temp_code_generated',
                message: `Senha temporária [${tempCode}] gerada para ${targetName}.`,
              },
              { merge: true }
            );
          } catch (e) {}
        });

      addAdminLog('Senha Temporária Gerada', `Código [${tempCode}] gerado para ${targetName} (${targetPhone}).`);
    } catch (e) {
      console.warn('Updated temp code locally:', e);
    }

    addToast(`Senha temporária [${tempCode}] gerada com sucesso!`, 'success');
    return { tempCode, whatsappUrl };
  };

  // CLIENT COMPLETES PASSWORD RESET WITH 6-DIGIT CODE
  const completePasswordReset = async (
    identifier: string,
    tempCode: string,
    newPassword: string
  ): Promise<boolean> => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/[^0-9]/g, '');
    const cleanCode = tempCode.trim();

    if (!cleanCode || cleanCode.length < 4) {
      addToast('Por favor, informe a senha temporária de 6 dígitos.', 'error');
      return false;
    }

    if (!newPassword || newPassword.trim().length < 4) {
      addToast('A nova senha deve conter no mínimo 4 caracteres.', 'error');
      return false;
    }

    // Find active request with tempCode
    const activeReq = passwordResetRequests.find((req) => {
      if (req.status === 'concluido' || req.status === 'cancelado') return false;
      const reqCode = (req.tempCode || '').trim();
      if (reqCode !== cleanCode) return false;

      const reqPhone = (req.customerPhone || '').replace(/[^0-9]/g, '');
      const reqEmail = (req.customerEmail || '').trim().toLowerCase();

      if (cleanDigits && reqPhone && (reqPhone === cleanDigits || reqPhone.includes(cleanDigits) || cleanDigits.includes(reqPhone))) {
        return true;
      }
      if (cleanId && reqEmail && reqEmail === cleanId) {
        return true;
      }
      // If code matches exactly, allow
      return true;
    });

    if (!activeReq) {
      addToast('Senha temporária incorreta ou expirada. Verifique no seu WhatsApp.', 'error');
      return false;
    }

    // Mark request as concluded
    try {
      await setDoc(
        doc(db, 'passwordResetRequests', activeReq.id),
        {
          status: 'concluido',
          completedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {}

    setPasswordResetRequests((prev) =>
      prev.map((r) =>
        r.id === activeReq.id
          ? { ...r, status: 'concluido', completedAt: new Date().toISOString() }
          : r
      )
    );

    // Auto-login user
    const isEmail = identifier.includes('@');
    const userAcc: UserAccount = {
      id: activeReq.customerId || `usr-${Date.now()}`,
      name: activeReq.customerName || 'Cliente Jadson Barber',
      email: activeReq.customerEmail || (isEmail ? identifier : 'cliente@jadsonbarber.com.br'),
      phone: activeReq.customerPhone || (!isEmail ? identifier : '(11) 99999-8888'),
      createdAt: new Date().toISOString(),
      role: 'client',
    };

    setCurrentUser(userAcc);
    setCustomerNameState(userAcc.name);
    setCustomerPhoneState(userAcc.phone);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userAcc));

    // Update customer in CRM if exists
    if (activeReq.customerId) {
      try {
        await setDoc(
          doc(db, 'customers', activeReq.customerId),
          {
            updatedAt: new Date().toISOString(),
            passwordResetAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (e) {}
    }

    addToast(`Nova senha cadastrada com sucesso! Bem-vindo, ${userAcc.name}.`, 'success');
    return true;
  };

  // Helper to add admin notification
  const addNotification = async (type: any, title: string, message: string) => {
    try {
      const notif: Omit<AdminNotification, 'id'> = {
        type,
        title,
        message,
        date: new Date().toLocaleString('pt-BR'),
        read: false,
      };
      await addDoc(collection(db, 'notifications'), notif);
    } catch (e) {
      console.error('Error creating notification:', e);
    }
  };

  // CLIENT AUTH
  const login = async (emailOrPhone: string, _password?: string): Promise<boolean> => {
    const isEmail = emailOrPhone.includes('@');
    const user: UserAccount = {
      id: `usr-${Date.now()}`,
      name: currentUser?.name || (isEmail ? emailOrPhone.split('@')[0] : 'Cliente Jadson Barber'),
      email: isEmail ? emailOrPhone : 'cliente@jadsonbarber.com.br',
      phone: !isEmail ? emailOrPhone : '(11) 98765-4321',
      createdAt: new Date().toISOString(),
      role: 'client',
    };

    setCurrentUser(user);
    setCustomerNameState(user.name);
    setCustomerPhoneState(user.phone);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    addToast(`Bem-vindo, ${user.name}! Login realizado com sucesso.`, 'success');
    return true;
  };

  const registerUser = async (
    name: string,
    phone: string,
    email: string,
    _password?: string
  ): Promise<boolean> => {
    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      createdAt: new Date().toISOString(),
      role: 'client',
    };

    setCurrentUser(newUser);
    setCustomerNameState(newUser.name);
    setCustomerPhoneState(newUser.phone);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newUser));

    // Sync with Firestore customers collection
    try {
      await setDoc(doc(db, 'customers', newUser.id), {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        createdAt: newUser.createdAt,
        totalAppointments: 0,
        totalSpent: 0,
        status: 'ativo',
      });
      addNotification('cliente', 'Novo Cliente Cadastrado', `${newUser.name} se cadastrou no aplicativo.`);
    } catch (e) {
      console.warn('Customer saved locally', e);
    }

    addToast(`Conta criada com sucesso! Seja bem-vindo, ${newUser.name}.`, 'success');
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    addToast('Você saiu da sua conta.', 'info');
    setActivePage('agenda');
  };

  const updateProfile = (updatedData: Partial<UserAccount>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updatedData };
    setCurrentUser(updated);
    if (updated.name) setCustomerNameState(updated.name);
    if (updated.phone) setCustomerPhoneState(updated.phone);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));

    // Also synchronize avatar/name with customers collection and user's appointments
    const newAvatar = updated.avatar || '';
    const userName = updated.name || currentUser.name;
    const userPhone = updated.phone || currentUser.phone;
    const userEmail = updated.email || currentUser.email;

    // Update in customers state
    setCustomers((prev) => {
      const matchIndex = prev.findIndex(
        (c) =>
          c.id === updated.id ||
          (c.phone && c.phone === userPhone) ||
          (c.email && c.email.toLowerCase() === userEmail.toLowerCase()) ||
          c.name.toLowerCase() === userName.toLowerCase()
      );

      if (matchIndex >= 0) {
        return prev.map((c, idx) =>
          idx === matchIndex
            ? { ...c, name: userName, phone: userPhone, email: userEmail, avatar: newAvatar, photo: newAvatar }
            : c
        );
      } else {
        const newCust: Customer = {
          id: updated.id || `cust-${Date.now()}`,
          name: userName,
          phone: userPhone,
          email: userEmail,
          avatar: newAvatar,
          photo: newAvatar,
          createdAt: new Date().toLocaleDateString('pt-BR'),
          totalAppointments: 0,
          totalSpent: 0,
          status: 'ativo',
        };
        return [newCust, ...prev];
      }
    });

    // Update in user appointments state
    setAppointments((prev) =>
      prev.map((app) => {
        if (
          app.customerId === updated.id ||
          (app.customerPhone && app.customerPhone === userPhone) ||
          app.customerName.toLowerCase() === userName.toLowerCase()
        ) {
          return { ...app, customerName: userName, customerPhone: userPhone, customerAvatar: newAvatar };
        }
        return app;
      })
    );

    // Sync to Firestore
    try {
      const custDocId = updated.id || `cust-${Date.now()}`;
      setDoc(
        doc(db, 'customers', custDocId),
        cleanFirestoreData({
          id: custDocId,
          name: userName,
          phone: userPhone,
          email: userEmail,
          avatar: newAvatar,
          photo: newAvatar,
          updatedAt: new Date().toISOString(),
        }),
        { merge: true }
      ).catch((e) => console.warn('Firestore customer avatar sync notice:', e));
    } catch (e) {
      console.warn('Local customer profile updated:', e);
    }

    addToast('Perfil atualizado com sucesso!', 'success');
  };

  // ADMIN AUTH
  const loginAdmin = async (email: string, pass: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Check credentials against admin account rules
    if (cleanEmail === 'barbeariajadsonbarber@gmail.com' && pass === 'Barbearia25*') {
      try {
        // Authenticate with Firebase Auth if possible, or fallback safely
        try {
          await signInWithEmailAndPassword(auth, cleanEmail, pass);
        } catch (authErr: any) {
          if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential') {
            try {
              await createUserWithEmailAndPassword(auth, cleanEmail, pass);
            } catch (createErr) {
              // fallback
            }
          }
        }

        const adminAcc: UserAccount = {
          id: auth.currentUser?.uid || 'admin-master',
          email: cleanEmail,
          name: 'Administrador Jadson Barber',
          phone: '(11) 99999-1010',
          createdAt: new Date().toISOString(),
          role: 'admin',
        };

        setAdminUser(adminAcc);
        localStorage.setItem(LOCAL_STORAGE_ADMIN_USER_KEY, JSON.stringify(adminAcc));
        
        // Log action
        addAdminLog('Login Administrativo', 'Administrador autenticado no painel.');
        addToast('Acesso administrativo concedido. Bem-vindo!', 'success');
        setActivePage('admin-agendamentos');
        return true;
      } catch (e) {
        console.error('Admin login error:', e);
      }
    }

    addToast('Credenciais administrativas incorretas.', 'error');
    return false;
  };

  const logoutAdmin = () => {
    firebaseSignOut(auth).catch(() => {});
    setAdminUser(null);
    localStorage.removeItem(LOCAL_STORAGE_ADMIN_USER_KEY);
    addToast('Sessão administrativa encerrada.', 'info');
    setActivePage('agenda');
  };

  const setCustomerName = (name: string) => {
    setCustomerNameState(name);
    localStorage.setItem(
      LOCAL_STORAGE_CUSTOMER_KEY,
      JSON.stringify({ name, phone: customerPhone })
    );
  };

  const setCustomerPhone = (phone: string) => {
    setCustomerPhoneState(phone);
    localStorage.setItem(
      LOCAL_STORAGE_CUSTOMER_KEY,
      JSON.stringify({ name: customerName, phone })
    );
  };

  // APPOINTMENT ACTIONS (Client + Admin)
  const addAppointment = async (
    appointmentData: Omit<Appointment, 'id' | 'createdAt'>
  ): Promise<Appointment> => {
    const newId = `app-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const effectiveAvatar =
      appointmentData.customerAvatar ||
      (currentUser &&
      (currentUser.name === appointmentData.customerName ||
        currentUser.phone === appointmentData.customerPhone ||
        currentUser.id === appointmentData.customerId)
        ? currentUser.avatar
        : '') ||
      '';

    const newAppointment: Appointment = {
      ...appointmentData,
      id: newId,
      customerAvatar: effectiveAvatar,
      createdAt: new Date().toISOString(),
    };

    setAppointments((prev) => [newAppointment, ...prev]);

    // Also ensure customer in CRM has the avatar and updated count/spent
    setCustomers((prev) => {
      const matchIndex = prev.findIndex(
        (c) =>
          c.id === newAppointment.customerId ||
          c.phone === newAppointment.customerPhone ||
          c.name.toLowerCase() === newAppointment.customerName.toLowerCase()
      );
      if (matchIndex >= 0) {
        return prev.map((c, idx) =>
          idx === matchIndex
            ? {
                ...c,
                totalAppointments: (c.totalAppointments || 0) + 1,
                lastAppointmentDate: newAppointment.date,
                totalSpent: (c.totalSpent || 0) + (newAppointment.totalPrice || 0),
                avatar: effectiveAvatar || c.avatar || c.photo,
                photo: effectiveAvatar || c.photo || c.avatar,
              }
            : c
        );
      } else {
        const newCust: Customer = {
          id: newAppointment.customerId !== 'cust-local' ? newAppointment.customerId : `cust-${Date.now()}`,
          name: newAppointment.customerName,
          phone: newAppointment.customerPhone,
          email: currentUser?.email || 'cliente@jadsonbarber.com.br',
          avatar: effectiveAvatar,
          photo: effectiveAvatar,
          createdAt: new Date().toLocaleDateString('pt-BR'),
          totalAppointments: 1,
          lastAppointmentDate: newAppointment.date,
          totalSpent: newAppointment.totalPrice || 0,
          status: 'ativo',
        };
        return [newCust, ...prev];
      }
    });

    // Save to Firestore
    try {
      const cleanApp = cleanFirestoreData(newAppointment);
      await setDoc(doc(db, 'appointments', newId), cleanApp);
      addNotification(
        'agendamento',
        'Novo Agendamento',
        `${newAppointment.customerName} agendou para ${newAppointment.date} às ${newAppointment.startTime} com ${newAppointment.barberName}.`
      );
    } catch (e) {
      console.warn('Appointment saved locally:', e);
    }

    return newAppointment;
  };

  const updateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus): Promise<boolean> => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status, updatedAt: new Date().toISOString() } : a))
    );

    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status,
        updatedAt: new Date().toISOString(),
      });
      addAdminLog('Alteração de Status de Agendamento', `Agendamento ${appointmentId} alterado para ${status}.`);
      addToast(`Agendamento atualizado para "${status}".`, 'success');
      return true;
    } catch (e) {
      addToast('Status atualizado localmente.', 'info');
      return true;
    }
  };

  const cancelAppointment = async (
    appointmentId: string,
    cancelledBy: 'admin' | 'cliente' = 'admin',
    reason?: string
  ): Promise<boolean> => {
    const target = appointments.find((a) => a.id === appointmentId);
    const nowIso = new Date().toISOString();
    const who = cancelledBy === 'cliente' ? (currentUser?.name || 'Cliente') : (adminUser?.name || 'Administrador');

    setAppointments((prev) =>
      prev.map((app) => {
        if (app.id === appointmentId) {
          return {
            ...app,
            status: 'Cancelado' as AppointmentStatus,
            cancelledAt: nowIso,
            cancelledBy,
            cancelledByName: who,
            cancellationReason: reason || app.cancellationReason || '',
          };
        }
        return app;
      })
    );

    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'Cancelado',
        cancelledAt: nowIso,
        cancelledBy,
        cancelledByName: who,
        cancellationReason: reason || '',
        updatedAt: nowIso,
      });
      if (target) {
        addNotification(
          'cancelamento',
          `Agendamento Cancelado (${cancelledBy === 'cliente' ? 'pelo Cliente' : 'pelo ADM'})`,
          `O agendamento de ${target.customerName} para ${target.date} às ${target.startTime} com ${target.barberName} foi cancelado por ${who}.${reason ? ` Motivo: ${reason}` : ''}`
        );
      }
      addAdminLog(
        'Cancelamento de Agendamento',
        `Agendamento ${target ? `de ${target.customerName} (${target.date} ${target.startTime})` : appointmentId} cancelado por ${who}.${reason ? ` Motivo: ${reason}` : ''}`
      );
    } catch (e) {
      console.warn('Cancellation updated locally', e);
    }

    addToast('Agendamento cancelado com sucesso.', 'info');
    return true;
  };

  const rescheduleAppointment = async (
    appointmentId: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
    newBarberId: string,
    newBarberName: string
  ): Promise<boolean> => {
    let target = appointments.find((a) => a.id === appointmentId);
    if (!target) return false;

    const historyItem = {
      previousDate: target.date,
      previousTime: target.startTime,
      changedAt: new Date().toISOString(),
    };
    const updatedHistory = [...(target.rescheduleHistory || []), historyItem];

    const updatedData = {
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      barberId: newBarberId,
      barberName: newBarberName,
      status: 'Agendado' as AppointmentStatus,
      updatedAt: new Date().toISOString(),
      rescheduleHistory: updatedHistory,
    };

    setAppointments((prev) =>
      prev.map((app) => (app.id === appointmentId ? { ...app, ...updatedData } : app))
    );

    try {
      await updateDoc(doc(db, 'appointments', appointmentId), updatedData);
      addNotification(
        'reagendamento',
        'Agendamento Reagendado',
        `${target.customerName} reagendou para ${newDate} às ${newStartTime} com ${newBarberName}.`
      );
    } catch (e) {
      console.warn('Reschedule saved locally', e);
    }

    addToast('Agendamento reagendado com sucesso!', 'success');
    return true;
  };

  const updateAppointmentServices = async (
    appointmentId: string,
    newServices: AppointmentService[],
    newTotalPrice: number,
    newTotalDuration: number,
    isCombo: boolean
  ): Promise<boolean> => {
    const updatedData = {
      services: newServices,
      totalPrice: newTotalPrice,
      totalDuration: newTotalDuration,
      isCombo,
      updatedAt: new Date().toISOString(),
    };

    setAppointments((prev) =>
      prev.map((app) => (app.id === appointmentId ? { ...app, ...updatedData } : app))
    );

    try {
      await updateDoc(doc(db, 'appointments', appointmentId), updatedData);
    } catch (e) {
      console.warn('Services updated locally', e);
    }

    addToast('Serviços do agendamento atualizados.', 'success');
    return true;
  };

  const updateAppointment = async (
    appointmentId: string,
    updatedData: Partial<Appointment>
  ): Promise<boolean> => {
    const dataWithTimestamp = {
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };

    setAppointments((prev) =>
      prev.map((app) => (app.id === appointmentId ? { ...app, ...dataWithTimestamp } : app))
    );

    try {
      await updateDoc(doc(db, 'appointments', appointmentId), dataWithTimestamp);
      addAdminLog('Edição de Agendamento', `Agendamento ${appointmentId} atualizado.`);
    } catch (e) {
      console.warn('Appointment updated locally', e);
    }

    addToast('Agendamento atualizado com sucesso.', 'success');
    return true;
  };

  const deleteAppointment = async (
    appointmentId: string,
    deletedBy: 'admin' | 'cliente' = 'admin',
    reason?: string
  ): Promise<boolean> => {
    const target = appointments.find((app) => app.id === appointmentId);
    const nowIso = new Date().toISOString();
    const who = deletedBy === 'cliente' ? (currentUser?.name || 'Cliente') : (adminUser?.name || 'Administrador');

    if (target) {
      const delRecord: DeletedAppointmentRecord = {
        id: `del-${target.id}-${Date.now()}`,
        originalAppointmentId: target.id,
        appointment: {
          ...target,
          deletedAt: nowIso,
          deletedBy,
          deletedByName: who,
        },
        deletedAt: nowIso,
        deletedBy,
        deletedByName: who,
        reason: reason || '',
      };

      // Add to local state
      setDeletedAppointments((prev) => [delRecord, ...prev]);

      // Save to deletedAppointments in Firestore
      try {
        await setDoc(doc(db, 'deletedAppointments', delRecord.id), cleanFirestoreData(delRecord));
      } catch (e) {
        console.warn('Saved deleted record locally:', e);
      }
    }

    // Remove from appointments
    setAppointments((prev) => prev.filter((app) => app.id !== appointmentId));
    try {
      await deleteDoc(doc(db, 'appointments', appointmentId));
      addAdminLog(
        'Exclusão de Agendamento',
        `Agendamento ${target ? `de ${target.customerName} (${target.date} ${target.startTime})` : appointmentId} foi excluído por ${who}.${reason ? ` Motivo: ${reason}` : ''}`
      );
    } catch (e) {
      console.warn('Deleted locally', e);
    }
    addToast('Agendamento excluído e arquivado no histórico.', 'info');
    return true;
  };

  const restoreAppointment = async (
    recordOrAppId: string,
    isFromDeletedCollection: boolean = false
  ): Promise<boolean> => {
    if (isFromDeletedCollection) {
      const record = deletedAppointments.find(
        (d) => d.id === recordOrAppId || d.originalAppointmentId === recordOrAppId
      );
      if (!record) {
        addToast('Registro excluído não encontrado.', 'error');
        return false;
      }

      const restoredAppt: Appointment = {
        ...record.appointment,
        status: 'Agendado',
        updatedAt: new Date().toISOString(),
      };
      delete restoredAppt.deletedAt;
      delete restoredAppt.deletedBy;
      delete restoredAppt.deletedByName;
      delete restoredAppt.cancelledAt;
      delete restoredAppt.cancelledBy;
      delete restoredAppt.cancelledByName;
      delete restoredAppt.cancellationReason;

      setAppointments((prev) => [restoredAppt, ...prev.filter((a) => a.id !== restoredAppt.id)]);
      setDeletedAppointments((prev) => prev.filter((d) => d.id !== record.id));

      try {
        await setDoc(doc(db, 'appointments', restoredAppt.id), cleanFirestoreData(restoredAppt));
        await deleteDoc(doc(db, 'deletedAppointments', record.id));
        addAdminLog('Restauração de Agendamento', `Agendamento ${restoredAppt.id} de ${restoredAppt.customerName} restaurado para "Agendado".`);
        addToast(`Agendamento de ${restoredAppt.customerName} restaurado para "Agendado" com sucesso!`, 'success');
        return true;
      } catch (e) {
        console.warn('Restored locally:', e);
        addToast(`Agendamento de ${restoredAppt.customerName} restaurado localmente.`, 'success');
        return true;
      }
    } else {
      const target = appointments.find((a) => a.id === recordOrAppId);
      if (!target) {
        addToast('Agendamento não encontrado.', 'error');
        return false;
      }

      const updatedData: Partial<Appointment> = {
        status: 'Agendado',
        updatedAt: new Date().toISOString(),
        cancelledAt: '',
        cancelledBy: undefined,
        cancelledByName: '',
        cancellationReason: '',
      };

      setAppointments((prev) =>
        prev.map((app) => (app.id === recordOrAppId ? { ...app, ...updatedData } : app))
      );

      try {
        await updateDoc(doc(db, 'appointments', recordOrAppId), cleanFirestoreData(updatedData));
        addAdminLog('Restauração de Agendamento Cancelado', `Agendamento de ${target.customerName} reativado para "Agendado".`);
        addToast(`Agendamento de ${target.customerName} reativado com sucesso!`, 'success');
        return true;
      } catch (e) {
        console.warn('Restored locally:', e);
        addToast(`Agendamento reativado localmente.`, 'success');
        return true;
      }
    }
  };

  const permanentlyDeleteArchivedAppointment = async (recordId: string): Promise<boolean> => {
    setDeletedAppointments((prev) => prev.filter((d) => d.id !== recordId));
    try {
      await deleteDoc(doc(db, 'deletedAppointments', recordId));
      addAdminLog('Exclusão Permanente de Histórico', `Registro de histórico ${recordId} excluído definitivamente.`);
    } catch (e) {
      console.warn('Permanently deleted locally:', e);
    }
    addToast('Registro excluído definitivamente do histórico.', 'info');
    return true;
  };

  const clearAllArchivedHistory = async (options?: { type?: 'all' | 'deleted' | 'cancelled' }): Promise<boolean> => {
    const type = options?.type || 'all';

    if (type === 'all' || type === 'deleted') {
      const toDelete = [...deletedAppointments];
      setDeletedAppointments([]);
      for (const item of toDelete) {
        try {
          await deleteDoc(doc(db, 'deletedAppointments', item.id));
        } catch (e) {}
      }
    }

    if (type === 'all' || type === 'cancelled') {
      const cancelledAppts = appointments.filter((a) => a.status === 'Cancelado');
      setAppointments((prev) => prev.filter((a) => a.status !== 'Cancelado'));
      for (const app of cancelledAppts) {
        try {
          await deleteDoc(doc(db, 'appointments', app.id));
        } catch (e) {}
      }
    }

    addAdminLog('Limpeza de Histórico', `Histórico de agendamentos (${type}) limpo com sucesso.`);
    addToast('Histórico limpo com sucesso.', 'success');
    return true;
  };

  const clearHistory = async (): Promise<boolean> => {
    const today = new Date().toISOString().split('T')[0];
    setAppointments((prev) =>
      prev.filter((app) => app.status !== 'Cancelado' && app.status !== 'Concluído' && app.date >= today)
    );
    addToast('Histórico antigo limpo com sucesso.', 'success');
    return true;
  };

  // BARBERS CRUD
  const addBarber = async (barberData: Omit<Barber, 'id'>): Promise<boolean> => {
    const newId = `barber-${Date.now()}`;
    const newBarber: Barber = {
      ...barberData,
      id: newId,
      name: barberData.name?.trim() || 'Barbeiro',
      role: barberData.role || 'Barbeiro Especialista',
      photo: barberData.photo || 'https://images.unsplash.com/photo-1503443207922-dff7d543fd0e?w=500&auto=format&fit=crop&q=80',
      rating: barberData.rating !== undefined ? barberData.rating : 5.0,
      reviewsCount: barberData.reviewsCount !== undefined ? barberData.reviewsCount : 0,
      status: barberData.status || 'available',
      active: barberData.active !== false,
      employmentStatus: barberData.employmentStatus || 'Admitido',
      specialties: Array.isArray(barberData.specialties) ? barberData.specialties : ['Degradê', 'Barba'],
      serviceCommission: Number(barberData.serviceCommission) || 0,
      salesCommission: Number(barberData.salesCommission) || 0,
      salary: Number(barberData.salary) || 0,
      workingHours: barberData.workingHours || { start: '08:00', end: '20:00' },
      lunchBreak: barberData.lunchBreak || { start: '12:00', end: '13:00' },
      workingDays: barberData.workingDays || [0, 1, 2, 3, 4, 5, 6],
      notes: barberData.notes || '',
      phone: barberData.phone || barberData.phone1 || '',
      phone1: barberData.phone1 || barberData.phone || '',
      phone2: barberData.phone2 || '',
      cpf: barberData.cpf || '',
      cnpj: barberData.cnpj || '',
      pixKey: barberData.pixKey || '',
      email: barberData.email || '',
      address: barberData.address || '',
    };

    setBarbers((prev) => {
      const next = [...prev.filter((b) => b.id !== newId), newBarber];
      try {
        localStorage.setItem(LOCAL_STORAGE_BARBERS_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    try {
      const cleanPayload = cleanFirestoreData(newBarber);
      await setDoc(doc(db, 'barbers', newId), cleanPayload);
      addAdminLog('Adicionar Barbeiro', `Barbeiro ${newBarber.name} cadastrado na equipe.`);
    } catch (e) {
      console.warn('Barber saved locally in cache/localStorage:', e);
    }

    addToast('Barbeiro adicionado com sucesso!', 'success');
    return true;
  };

  const updateBarber = async (id: string, data: Partial<Barber>): Promise<boolean> => {
    setBarbers((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, ...data } : b));
      try {
        localStorage.setItem(LOCAL_STORAGE_BARBERS_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    try {
      const cleanPayload = cleanFirestoreData(data);
      await updateDoc(doc(db, 'barbers', id), cleanPayload);
      addAdminLog('Editar Barbeiro', `Dados do barbeiro ID ${id} atualizados.`);
    } catch (e) {
      console.warn('Barber updated locally in cache/localStorage:', e);
    }

    addToast('Dados do barbeiro atualizados.', 'success');
    return true;
  };

  const deleteBarber = async (id: string): Promise<boolean> => {
    setBarbers((prev) => {
      const next = prev.filter((b) => b.id !== id);
      try {
        localStorage.setItem(LOCAL_STORAGE_BARBERS_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    try {
      await deleteDoc(doc(db, 'barbers', id));
      addAdminLog('Excluir Barbeiro', `Barbeiro ID ${id} removido.`);
    } catch (e) {
      console.warn('Barber deleted locally in cache/localStorage:', e);
    }
    addToast('Barbeiro removido.', 'info');
    return true;
  };

  // SERVICES CRUD
  const addService = async (serviceData: Omit<ServiceItem, 'id'>): Promise<boolean> => {
    const newId = serviceData.category === 'combo' ? `combo-${Date.now()}` : `serv-${Date.now()}`;
    const newService: ServiceItem = { ...serviceData, id: newId, status: serviceData.status || 'ativo' };
    setServices((prev) => [...prev, newService]);

    try {
      await setDoc(doc(db, 'services', newId), newService);
      addAdminLog('Adicionar Serviço', `Serviço/Combo "${newService.name}" criado.`);
    } catch (e) {
      console.warn('Service saved locally', e);
    }

    addToast('Serviço adicionado com sucesso!', 'success');
    return true;
  };

  const updateService = async (id: string, data: Partial<ServiceItem>): Promise<boolean> => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));

    try {
      await updateDoc(doc(db, 'services', id), data);
      addAdminLog('Editar Serviço', `Serviço ID ${id} atualizado.`);
    } catch (e) {
      console.warn('Service updated locally', e);
    }

    addToast('Serviço atualizado com sucesso!', 'success');
    return true;
  };

  const deleteService = async (id: string): Promise<boolean> => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteDoc(doc(db, 'services', id));
      addAdminLog('Excluir Serviço', `Serviço ID ${id} removido.`);
    } catch (e) {
      console.warn('Service deleted locally', e);
    }
    addToast('Serviço removido.', 'info');
    return true;
  };

  // FEED ACTIONS
  const toggleLikePost = async (postId: string) => {
    const clientLikeId = getClientLikeId();
    const targetPost = feedPosts.find((p) => p.id === postId);
    if (!targetPost) return;

    const likedByList = Array.isArray(targetPost.likedBy) ? targetPost.likedBy : [];
    const alreadyLiked = likedByList.includes(clientLikeId) || Boolean(targetPost.isLiked);

    if (alreadyLiked) {
      // Toggle off / remove like
      const updatedLikedBy = likedByList.filter((id) => id !== clientLikeId);
      const newLikesCount = Math.max(0, (targetPost.likesCount || 1) - 1);

      setFeedPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, isLiked: false, likesCount: newLikesCount, likedBy: updatedLikedBy }
            : post
        )
      );

      try {
        await updateDoc(doc(db, 'feed', postId), {
          likesCount: newLikesCount,
          likedBy: updatedLikedBy,
        });
      } catch (e) {
        console.warn('Feed like updated locally', e);
      }

      addToast('Você descurtiu a publicação.', 'info');
      return;
    }

    // User has not liked yet: Add 1 like
    const updatedLikedBy = [...likedByList, clientLikeId];
    const newLikesCount = (targetPost.likesCount || 0) + 1;

    setFeedPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, isLiked: true, likesCount: newLikesCount, likedBy: updatedLikedBy }
          : post
      )
    );

    try {
      await updateDoc(doc(db, 'feed', postId), {
        likesCount: newLikesCount,
        likedBy: updatedLikedBy,
      });
    } catch (e) {
      console.warn('Feed like updated locally', e);
    }

    addToast('Publicação curtida! ❤️', 'success');
  };

  const addFeedPost = async (postData: Omit<FeedPost, 'id' | 'date' | 'likesCount'>): Promise<boolean> => {
    const newId = `post-${Date.now()}`;
    const newPost: FeedPost = {
      ...postData,
      id: newId,
      date: 'Hoje',
      likesCount: 0,
      likedBy: [],
      active: postData.active ?? true,
      highlighted: postData.highlighted ?? false,
    };
    setFeedPosts((prev) => {
      const updated = [newPost, ...prev];
      try {
        localStorage.setItem('jadson_feed_posts_cache', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      const cleanPayload = cleanFirestoreData(newPost);
      await setDoc(doc(db, 'feed', newId), cleanPayload);
      addAdminLog('Nova Publicação Feed', `Publicação "${newPost.title}" criada.`);
    } catch (e) {
      console.warn('Post saved locally', e);
    }

    addToast('Publicação criada no Feed!', 'success');
    return true;
  };

  const updateFeedPost = async (id: string, data: Partial<FeedPost>): Promise<boolean> => {
    setFeedPosts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...data } : p));
      try {
        localStorage.setItem('jadson_feed_posts_cache', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      const cleanPayload = cleanFirestoreData(data);
      await updateDoc(doc(db, 'feed', id), cleanPayload);
      addAdminLog('Editar Feed', `Publicação ID ${id} atualizada.`);
    } catch (e) {
      console.warn('Post updated locally', e);
    }

    addToast('Publicação atualizada.', 'success');
    return true;
  };

  const deleteFeedPost = async (id: string): Promise<boolean> => {
    setFeedPosts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem('jadson_feed_posts_cache', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    try {
      await deleteDoc(doc(db, 'feed', id));
      addAdminLog('Excluir Feed', `Publicação ID ${id} excluída.`);
    } catch (e) {
      console.warn('Post deleted locally', e);
    }
    addToast('Publicação excluída.', 'info');
    return true;
  };

  // CUSTOMER CRUD
  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt'>): Promise<boolean> => {
    const newId = `cust-${Date.now()}`;
    const newCustomer: Customer = {
      ...customerData,
      id: newId,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      totalAppointments: Number(customerData.totalAppointments) || 0,
      totalSpent: Number(customerData.totalSpent) || 0,
      status: customerData.status || 'ativo',
    };
    setCustomers((prev) => [newCustomer, ...prev]);

    try {
      const cleanPayload = cleanFirestoreData(newCustomer);
      await setDoc(doc(db, 'customers', newId), cleanPayload);
      addAdminLog('Adicionar Cliente', `Cliente "${newCustomer.name}" cadastrado manualmente.`);
    } catch (e) {
      console.warn('Customer saved locally', e);
    }

    addToast('Cliente cadastrado com sucesso!', 'success');
    return true;
  };

  const updateCustomer = async (id: string, data: Partial<Customer>): Promise<boolean> => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    try {
      const cleanPayload = cleanFirestoreData(data);
      await updateDoc(doc(db, 'customers', id), cleanPayload);
      addAdminLog('Editar Cliente', `Dados do cliente "${data.name || id}" atualizados.`);
    } catch (e) {
      console.warn('Customer updated locally', e);
    }
    addToast('Dados do cliente atualizados com sucesso.', 'success');
    return true;
  };

  const deleteCustomer = async (id: string): Promise<boolean> => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteDoc(doc(db, 'customers', id));
    } catch (e) {
      console.warn('Customer deleted locally', e);
    }
    addAdminLog('Exclusão de Cliente', `Registro de cliente ${id} removido.`);
    addToast('Cliente removido com sucesso.', 'success');
    return true;
  };

  // INSUMOS CRUD
  const addInsumo = async (itemData: Omit<InsumoItem, 'id'>): Promise<boolean> => {
    const newId = `ins-${Date.now()}`;
    const newItem: InsumoItem = { ...itemData, id: newId };
    setInsumos((prev) => [...prev, newItem]);

    try {
      await setDoc(doc(db, 'inventory', newId), newItem);
      addAdminLog('Adicionar Insumo', `Insumo "${newItem.name}" adicionado ao estoque.`);
    } catch (e) {
      console.warn('Insumo saved locally', e);
    }

    addToast('Insumo cadastrado no estoque.', 'success');
    return true;
  };

  const updateInsumo = async (id: string, data: Partial<InsumoItem>): Promise<boolean> => {
    setInsumos((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)));

    try {
      await updateDoc(doc(db, 'inventory', id), data);
      addAdminLog('Editar Insumo', `Insumo ID ${id} atualizado.`);
    } catch (e) {
      console.warn('Insumo updated locally', e);
    }

    addToast('Insumo atualizado.', 'success');
    return true;
  };

  const deleteInsumo = async (id: string): Promise<boolean> => {
    setInsumos((prev) => prev.filter((i) => i.id !== id));
    try {
      await deleteDoc(doc(db, 'inventory', id));
      addAdminLog('Excluir Insumo', `Insumo ID ${id} removido.`);
    } catch (e) {
      console.warn('Insumo deleted locally', e);
    }
    addToast('Insumo removido do estoque.', 'info');
    return true;
  };

  // PRODUCTS CRUD & SALES
  const addProduct = async (productData: Omit<SaleProduct, 'id' | 'salesCount' | 'totalRevenue'>): Promise<boolean> => {
    const newId = `prod-${Date.now()}`;
    const newProd: SaleProduct = {
      ...productData,
      id: newId,
      salesCount: 0,
      totalRevenue: 0,
    };
    setProducts((prev) => [...prev, newProd]);

    try {
      await setDoc(doc(db, 'products', newId), newProd);
      addAdminLog('Adicionar Produto', `Produto de venda "${newProd.name}" cadastrado.`);
    } catch (e) {
      console.warn('Product saved locally', e);
    }

    addToast('Produto de venda cadastrado!', 'success');
    return true;
  };

  const updateProduct = async (id: string, data: Partial<SaleProduct>): Promise<boolean> => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));

    try {
      await updateDoc(doc(db, 'products', id), data);
      addAdminLog('Editar Produto', `Produto ID ${id} atualizado.`);
    } catch (e) {
      console.warn('Product updated locally', e);
    }

    addToast('Produto de venda atualizado.', 'success');
    return true;
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteDoc(doc(db, 'products', id));
      addAdminLog('Excluir Produto', `Produto ID ${id} removido.`);
    } catch (e) {
      console.warn('Product deleted locally', e);
    }
    addToast('Produto removido.', 'info');
    return true;
  };

  const recordSale = async (saleData: {
    customerName: string;
    customerPhone: string;
    productId: string;
    quantity: number;
    paymentMethod: string;
  }): Promise<boolean> => {
    const prod = products.find((p) => p.id === saleData.productId);
    if (!prod) {
      addToast('Produto não encontrado.', 'error');
      return false;
    }

    if (prod.quantity < saleData.quantity) {
      addToast(`Estoque insuficiente! Apenas ${prod.quantity} unidades disponíveis.`, 'error');
      return false;
    }

    const totalAmount = prod.salePrice * saleData.quantity;
    const updatedProdQuantity = prod.quantity - saleData.quantity;
    const updatedSalesCount = prod.salesCount + saleData.quantity;
    const updatedRevenue = prod.totalRevenue + totalAmount;

    // Update product stock locally
    setProducts((prev) =>
      prev.map((p) =>
        p.id === prod.id
          ? {
              ...p,
              quantity: updatedProdQuantity,
              salesCount: updatedSalesCount,
              totalRevenue: updatedRevenue,
            }
          : p
      )
    );

    // Save sale transaction
    const saleId = `sale-${Date.now()}`;
    const transaction: SaleTransaction = {
      id: saleId,
      customerName: saleData.customerName || 'Cliente Balcão',
      customerPhone: saleData.customerPhone || '',
      items: [
        {
          productId: prod.id,
          productName: prod.name,
          quantity: saleData.quantity,
          unitPrice: prod.salePrice,
          totalPrice: totalAmount,
        },
      ],
      totalAmount,
      paymentMethod: saleData.paymentMethod,
      date: new Date().toISOString(),
    };

    try {
      await updateDoc(doc(db, 'products', prod.id), {
        quantity: updatedProdQuantity,
        salesCount: updatedSalesCount,
        totalRevenue: updatedRevenue,
      });
      await setDoc(doc(db, 'sales', saleId), transaction);
      addNotification(
        'venda',
        'Venda de Produto Realizada',
        `Venda de ${saleData.quantity}x ${prod.name} no valor de R$ ${totalAmount.toFixed(2)}.`
      );

      // Check low stock alert
      if (updatedProdQuantity <= prod.minStock) {
        addNotification(
          'estoque',
          'Alerta de Estoque Baixo',
          `O produto ${prod.name} atingiu o limite mínimo (${updatedProdQuantity} unidades).`
        );
      }
    } catch (e) {
      console.warn('Sale recorded locally', e);
    }

    addToast(`Venda registrada com sucesso! R$ ${totalAmount.toFixed(2)}`, 'success');
    return true;
  };

  // EXPENSES CRUD
  const addExpense = async (expenseData: Omit<ExpenseItem, 'id'>): Promise<boolean> => {
    const newId = `exp-${Date.now()}`;
    const newExp: ExpenseItem = { ...expenseData, id: newId };
    setExpenses((prev) => [newExp, ...prev]);

    try {
      await setDoc(doc(db, 'financialTransactions', newId), {
        ...newExp,
        type: 'expense',
      });
      addAdminLog('Registrar Despesa', `Despesa "${newExp.description}" de R$ ${newExp.amount} registrada.`);
    } catch (e) {
      console.warn('Expense saved locally', e);
    }

    addToast('Despesa registrada no financeiro.', 'success');
    return true;
  };

  const deleteExpense = async (id: string): Promise<boolean> => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    try {
      await deleteDoc(doc(db, 'financialTransactions', id));
    } catch (e) {
      console.warn('Expense deleted locally', e);
    }
    addToast('Despesa removida.', 'info');
    return true;
  };

  // COUPONS CRUD
  const addCoupon = async (couponData: Omit<Coupon, 'id' | 'usedCount'>): Promise<boolean> => {
    const newId = `coup-${Date.now()}`;
    const newCoupon: Coupon = { ...couponData, id: newId, usedCount: 0 };
    setCoupons((prev) => [...prev, newCoupon]);

    try {
      await setDoc(doc(db, 'coupons', newId), newCoupon);
      addAdminLog('Criar Cupom', `Cupom de desconto "${newCoupon.code}" criado.`);
    } catch (e) {
      console.warn('Coupon saved locally', e);
    }

    addToast('Cupom de desconto cadastrado!', 'success');
    return true;
  };

  const updateCoupon = async (id: string, data: Partial<Coupon>): Promise<boolean> => {
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));

    try {
      await updateDoc(doc(db, 'coupons', id), data);
      addAdminLog('Editar Cupom', `Cupom ID ${id} atualizado.`);
    } catch (e) {
      console.warn('Coupon updated locally', e);
    }

    addToast('Cupom atualizado.', 'success');
    return true;
  };

  const deleteCoupon = async (id: string): Promise<boolean> => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteDoc(doc(db, 'coupons', id));
      addAdminLog('Excluir Cupom', `Cupom ID ${id} removido.`);
    } catch (e) {
      console.warn('Coupon deleted locally', e);
    }
    addToast('Cupom removido.', 'info');
    return true;
  };

  // BLOCKED DATES CRUD
  const addBlockedDate = async (blockedData: Omit<BlockedDate, 'id'>): Promise<boolean> => {
    const newId = `block-${Date.now()}`;
    const newBlocked: BlockedDate = { ...blockedData, id: newId };
    setBlockedDates((prev) => [...prev, newBlocked]);

    try {
      await setDoc(doc(db, 'blockedDates', newId), newBlocked);
      addAdminLog('Bloquear Data', `Data ${newBlocked.date} bloqueada para agendamentos.`);
    } catch (e) {
      console.warn('Blocked date saved locally', e);
    }

    addToast(`Data ${newBlocked.date} bloqueada com sucesso!`, 'success');
    return true;
  };

  const deleteBlockedDate = async (id: string): Promise<boolean> => {
    setBlockedDates((prev) => prev.filter((b) => b.id !== id));
    try {
      await deleteDoc(doc(db, 'blockedDates', id));
      addAdminLog('Desbloquear Data', `Bloqueio ID ${id} removido.`);
    } catch (e) {
      console.warn('Blocked date deleted locally', e);
    }
    addToast('Data desbloqueada.', 'info');
    return true;
  };

  // REVIEWS CRUD
  const addReview = async (reviewData: Omit<Review, 'id' | 'date' | 'status'>): Promise<boolean> => {
    const newId = `rev-${Date.now()}`;
    const newReview: Review = {
      ...reviewData,
      id: newId,
      date: 'Hoje',
      status: 'Visível',
    };
    setReviews((prev) => [newReview, ...prev]);

    try {
      await setDoc(doc(db, 'reviews', newId), newReview);
      addNotification('avaliacao', 'Nova Avaliação Recebida', `${newReview.authorName} enviou uma nota ${newReview.rating}/5.`);
    } catch (e) {
      console.warn('Review saved locally', e);
    }

    addToast('Obrigado pela sua avaliação!', 'success');
    return true;
  };

  const updateReviewStatus = async (id: string, status: 'Visível' | 'Oculto'): Promise<boolean> => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      await updateDoc(doc(db, 'reviews', id), { status });
    } catch (e) {
      console.warn('Review updated locally', e);
    }
    addToast(`Status da avaliação alterado para "${status}".`, 'info');
    return true;
  };

  const deleteReview = async (id: string): Promise<boolean> => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    try {
      await deleteDoc(doc(db, 'reviews', id));
    } catch (e) {
      console.warn('Review deleted locally', e);
    }
    addToast('Avaliação removida.', 'info');
    return true;
  };

  // CLIENT REVIEW PROMPT & APPOINTMENT EVALUATION
  const submitAppointmentReview = async (
    appointmentId: string,
    rating: number,
    comment: string,
    tags: string[] = []
  ): Promise<boolean> => {
    const targetApp = appointments.find((a) => a.id === appointmentId);
    if (!targetApp) return false;

    const fullComment =
      tags.length > 0
        ? `${tags.join(' • ')}${comment ? ` — ${comment}` : ''}`
        : comment || 'Excelente atendimento!';

    const serviceName =
      targetApp.services.map((s) => s.name).join(' + ') || (targetApp.isCombo ? 'Combo VIP' : 'Corte');

    const newRevId = `rev-${Date.now()}`;
    const newRev: Review = {
      id: newRevId,
      authorName: targetApp.customerName || customerName || 'Cliente',
      customerName: targetApp.customerName || customerName || 'Cliente',
      barberId: targetApp.barberId,
      barberName: targetApp.barberName,
      rating,
      comment: fullComment,
      serviceName,
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'Visível',
    };

    // 1. Add to reviews list
    setReviews((prev) => [newRev, ...prev]);

    // 2. Mark appointment as reviewed in local state
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointmentId
          ? { ...a, reviewed: true, reviewRating: rating, updatedAt: new Date().toISOString() }
          : a
      )
    );

    // Save to reviewed list in localStorage
    const updatedReviewed = [...reviewedAppointmentIds, appointmentId];
    setReviewedAppointmentIds(updatedReviewed);
    localStorage.setItem(LOCAL_STORAGE_REVIEWED_KEY, JSON.stringify(updatedReviewed));

    // 3. Save to Firestore
    try {
      await setDoc(doc(db, 'reviews', newRevId), newRev);
      await updateDoc(doc(db, 'appointments', appointmentId), {
        reviewed: true,
        reviewRating: rating,
        updatedAt: new Date().toISOString(),
      });

      // Update Barber rating & reviewsCount dynamically
      const targetBarber = barbers.find((b) => b.id === targetApp.barberId);
      if (targetBarber) {
        const barberReviews = [...reviews.filter((r) => r.barberId === targetBarber.id), newRev];
        const newAvg = parseFloat(
          (barberReviews.reduce((acc, r) => acc + r.rating, 0) / barberReviews.length).toFixed(1)
        );
        const newCount = barberReviews.length;

        setBarbers((prev) =>
          prev.map((b) => (b.id === targetBarber.id ? { ...b, rating: newAvg, reviewsCount: newCount } : b))
        );

        await updateDoc(doc(db, 'barbers', targetBarber.id), {
          rating: newAvg,
          reviewsCount: newCount,
        });
      }

      addNotification(
        'avaliacao',
        'Nova Avaliação de Cliente',
        `${newRev.authorName} enviou uma nota ${rating}/5 ⭐ para o atendimento com ${targetApp.barberName}.`
      );
    } catch (e) {
      console.warn('Review saved locally', e);
    }

    addToast('Obrigado pela sua avaliação! Seu feedback é fundamental.', 'success');
    setIsReviewModalOpen(false);
    setManualReviewAppointment(null);
    return true;
  };

  const dismissAppointmentReview = (appointmentId: string) => {
    const updated = [...dismissedReviewIds, appointmentId];
    setDismissedReviewIds(updated);
    localStorage.setItem(LOCAL_STORAGE_DISMISSED_REVIEW_KEY, JSON.stringify(updated));
    setIsReviewModalOpen(false);
    setManualReviewAppointment(null);
  };

  const setPendingReviewAppointment = (app: Appointment | null) => {
    setManualReviewAppointment(app);
    if (app) {
      setIsReviewModalOpen(true);
    }
  };

  // SETTINGS
  const updateSettings = async (newSettings: Partial<BarbershopInfo>): Promise<boolean> => {
    const updated = { ...barbershopInfo, ...newSettings };
    setBarbershopInfo(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_BARBERSHOP_INFO_KEY, JSON.stringify(updated));
    } catch (e) {}

    try {
      await setDoc(doc(db, 'settings', 'barbershopInfo'), updated);
      addAdminLog('Alterar Configurações', 'Dados gerais da Barbearia atualizados.');
    } catch (e) {
      console.warn('Settings updated locally', e);
    }

    addToast('Configurações da Barbearia salvas!', 'success');
    return true;
  };

  // NOTIFICATIONS & SOUND METHODS
  const setIsSoundMuted = (muted: boolean) => {
    setIsSoundMutedState(muted);
    try {
      localStorage.setItem(LOCAL_STORAGE_SOUND_MUTED_KEY, String(muted));
    } catch {}
  };

  const toggleSoundMuted = () => {
    setIsSoundMutedState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(LOCAL_STORAGE_SOUND_MUTED_KEY, String(next));
      } catch {}
      addToast(next ? 'Notificações sonoras silenciadas.' : 'Notificações sonoras ativadas.', 'info');
      return next;
    });
  };

  const setSoundVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(100, vol));
    setSoundVolumeState(clamped);
    try {
      localStorage.setItem(LOCAL_STORAGE_SOUND_VOLUME_KEY, String(clamped));
    } catch {}
  };

  const setSoundType = (type: NotificationSoundType) => {
    setSoundTypeState(type);
    try {
      localStorage.setItem(LOCAL_STORAGE_SOUND_TYPE_KEY, type);
    } catch {}
    // Play sample ONLY if audio is actively enabled, volume is above 0, and on admin page
    if (!isSoundMuted && soundVolume > 0 && activePage.startsWith('admin-')) {
      playAudioEffect(soundVolume, false, type, customSoundData);
    }
  };

  const uploadCustomSound = async (file: File): Promise<boolean> => {
    try {
      if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i)) {
        addToast('Por favor, selecione um arquivo de áudio válido (.mp3, .wav, .ogg, .m4a).', 'error');
        return false;
      }

      // Max 1.8MB to ensure safe storage without memory crashes in mobile browsers
      if (file.size > 1.8 * 1024 * 1024) {
        addToast('O arquivo de áudio deve ter no máximo 1.8MB para não sobrecarregar o aparelho.', 'error');
        return false;
      }

      return new Promise<boolean>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            setCustomSoundData(result);
            setCustomSoundName(file.name);
            setSoundTypeState('custom');
            try {
              localStorage.setItem(LOCAL_STORAGE_CUSTOM_SOUND_KEY, result);
              localStorage.setItem(LOCAL_STORAGE_CUSTOM_SOUND_NAME_KEY, file.name);
              localStorage.setItem(LOCAL_STORAGE_SOUND_TYPE_KEY, 'custom');
            } catch (err) {
              console.warn('Storage error on sound upload', err);
            }
            if (!isSoundMuted && soundVolume > 0 && activePage.startsWith('admin-')) {
              playAudioEffect(soundVolume, false, 'custom', result);
            }
            addToast(`Som "${file.name}" carregado do dispositivo com sucesso!`, 'success');
            resolve(true);
          } else {
            resolve(false);
          }
        };
        reader.onerror = () => {
          addToast('Erro ao ler o arquivo de áudio do dispositivo.', 'error');
          resolve(false);
        };
        reader.readAsDataURL(file);
      });
    } catch (err) {
      console.error('Error uploading custom sound', err);
      addToast('Erro ao processar áudio.', 'error');
      return false;
    }
  };

  const resetToDefaultSound = () => {
    setCustomSoundData(null);
    setCustomSoundName(null);
    setSoundTypeState('bell');
    try {
      localStorage.removeItem(LOCAL_STORAGE_CUSTOM_SOUND_KEY);
      localStorage.removeItem(LOCAL_STORAGE_CUSTOM_SOUND_NAME_KEY);
      localStorage.setItem(LOCAL_STORAGE_SOUND_TYPE_KEY, 'bell');
    } catch {}
    if (!isSoundMuted && soundVolume > 0 && activePage.startsWith('admin-')) {
      playAudioEffect(soundVolume, false, 'bell', null, true);
    }
    addToast('Som de notificação restaurado para o padrão (Sino Dourado).', 'success');
  };

  const playNotificationSound = (type?: NotificationSoundType) => {
    // Sound is strictly allowed ONLY when the user is actively viewing an Admin page
    if (!activePage.startsWith('admin-')) return;
    if (isSoundMuted || soundVolume <= 0) return;
    playAudioEffect(soundVolume, isSoundMuted, type || soundType, customSoundData);
  };

  const testNotificationSound = () => {
    if (isSoundMuted || soundVolume <= 0) {
      addToast('O som está silenciado ou com volume zerado.', 'info');
      return;
    }
    playAudioEffect(soundVolume, false, soundType, customSoundData, true);
    addToast('Tocando som de notificação...', 'info');
  };

  // Keep playSoundRef in sync - CLIENTS AND NON-ADMIN VIEWS ARE 100% SILENT
  useEffect(() => {
    playSoundRef.current = (type?: NotificationSoundType) => {
      // Must be currently on an admin screen
      if (!activePage.startsWith('admin-')) {
        return;
      }
      if (isSoundMuted || soundVolume <= 0) {
        return;
      }
      playAudioEffect(soundVolume, isSoundMuted, type || soundType, customSoundData);
    };
  }, [soundVolume, isSoundMuted, soundType, customSoundData, activePage]);

  // Alert with sound when opening admin panel if there are unread notifications
  const hasAlertedPanelOpen = useRef(false);
  useEffect(() => {
    if (activePage.startsWith('admin-')) {
      if (!hasAlertedPanelOpen.current) {
        hasAlertedPanelOpen.current = true;
        const unreadCount = notifications.filter((n) => !n.read).length;
        if (unreadCount > 0 && !isSoundMuted && soundVolume > 0) {
          const timer = setTimeout(() => {
            if (activePage.startsWith('admin-') && !isSoundMuted && soundVolume > 0) {
              playAudioEffect(soundVolume, isSoundMuted, soundType, customSoundData);
            }
          }, 400);
          return () => clearTimeout(timer);
        }
      }
    } else {
      hasAlertedPanelOpen.current = false;
    }
  }, [activePage, notifications, isSoundMuted, soundVolume, soundType, customSoundData]);

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    updateDoc(doc(db, 'notifications', id), { read: true }).catch(() => {});
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    notifications.forEach((n) => {
      if (!n.read) {
        updateDoc(doc(db, 'notifications', n.id), { read: true }).catch(() => {});
      }
    });
    addToast('Todas as notificações foram marcadas como lidas.', 'info');
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch {}
  };

  const clearNotifications = () => {
    setNotifications([]);
    notifications.forEach((n) => {
      deleteDoc(doc(db, 'notifications', n.id)).catch(() => {});
    });
    addToast('Todas as notificações foram limpas.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        barbershopInfo,
        barbers,
        services,
        feedPosts,
        appointments,
        deletedAppointments,
        customers,
        insumos,
        products,
        expenses,
        coupons,
        blockedDates,
        reviews,
        sales,
        notifications,
        adminLogs,
        customerName,
        setCustomerName,
        customerPhone,
        setCustomerPhone,
        isLoggedIn,
        currentUser,
        login,
        registerUser,
        logout,
        updateProfile,
        isAdminLoggedIn,
        adminUser,
        loginAdmin,
        logoutAdmin,
        selectedBarberForBooking,
        setSelectedBarberForBooking,
        addAppointment,
        updateAppointment,
        updateAppointmentStatus,
        cancelAppointment,
        rescheduleAppointment,
        updateAppointmentServices,
        deleteAppointment,
        restoreAppointment,
        permanentlyDeleteArchivedAppointment,
        clearAllArchivedHistory,
        clearHistory,
        addBarber,
        updateBarber,
        deleteBarber,
        addService,
        updateService,
        deleteService,
        toggleLikePost,
        addFeedPost,
        updateFeedPost,
        deleteFeedPost,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addInsumo,
        updateInsumo,
        deleteInsumo,
        addProduct,
        updateProduct,
        deleteProduct,
        recordSale,
        addExpense,
        deleteExpense,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        addBlockedDate,
        deleteBlockedDate,
        addReview,
        updateReviewStatus,
        deleteReview,
        pendingReviewAppointment,
        setPendingReviewAppointment,
        isReviewModalOpen,
        setIsReviewModalOpen,
        submitAppointmentReview,
        dismissAppointmentReview,
        reviewedAppointmentIds,
        updateSettings,
        isSoundMuted,
        setIsSoundMuted,
        toggleSoundMuted,
        soundVolume,
        setSoundVolume,
        soundType,
        setSoundType,
        customSoundName,
        uploadCustomSound,
        resetToDefaultSound,
        playNotificationSound,
        testNotificationSound,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        clearNotifications,
        passwordResetRequests,
        requestPasswordReset,
        generateTempPasswordForReset,
        completePasswordReset,
        getActivePasswordReset,
        toasts,
        addToast,
        removeToast,
        isSidebarOpen,
        setIsSidebarOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
