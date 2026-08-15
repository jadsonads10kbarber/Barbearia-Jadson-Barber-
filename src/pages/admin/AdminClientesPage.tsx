import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  Phone,
  Mail,
  DollarSign,
  History,
  X,
  ChevronRight,
  Trash2,
  TicketPercent,
  Edit2,
  Plus,
  UserCheck,
  UserX,
  Users,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  FileText,
  Clock,
  Scissors
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Customer, Appointment, Coupon } from '../../types';

// Preset avatar options for quick selection
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
];

export const AdminClientesPage: React.FC = () => {
  const {
    customers,
    appointments,
    coupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addToast,
    barbershopInfo
  } = useApp();

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'inativo' | 'com-cupom'>('todos');
  const [sortBy, setSortBy] = useState<'visitas' | 'consumo' | 'nome' | 'recentes'>('visitas');

  // Drawer / Details Modal
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Edit Customer Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhoto, setEditPhoto] = useState('');
  const [editStatus, setEditStatus] = useState<'ativo' | 'inativo'>('ativo');
  const [editNotes, setEditNotes] = useState('');
  const [editTotalAppointments, setEditTotalAppointments] = useState('0');
  const [editTotalSpent, setEditTotalSpent] = useState('0.00');

  // Create Customer Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhoto, setNewPhoto] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Coupon for Customer Modal state
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponTargetCustomer, setCouponTargetCustomer] = useState<Customer | null>(null);
  const [couponTab, setCouponTab] = useState<'disponibilizar' | 'existentes' | 'novo'>('disponibilizar');
  const [couponSearchFilter, setCouponSearchFilter] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscountType, setCouponDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [couponDiscountValue, setCouponDiscountValue] = useState('15');
  const [couponMinOrder, setCouponMinOrder] = useState('0.00');
  const [couponLimitPerClient, setCouponLimitPerClient] = useState('1');
  const [couponStartDate, setCouponStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [couponEndDate, setCouponEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isSubmittingCoupon, setIsSubmittingCoupon] = useState(false);

  // Helper to generate a personalized coupon code
  const generatePersonalizedCode = (name?: string) => {
    const cleanName = (name || 'CLIENTE')
      .trim()
      .split(' ')[0]
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 8);
    const randomNum = Math.floor(10 + Math.random() * 90);
    return `VIP-${cleanName}-${randomNum}`;
  };

  // Open Coupon Modal for specific customer
  const handleOpenCouponModal = (customer: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCouponTargetCustomer(customer);
    setCouponTab('disponibilizar');
    setCouponSearchFilter('');
    setCouponCode(generatePersonalizedCode(customer.name));
    setCouponDiscountType('percentage');
    setCouponDiscountValue('15');
    setCouponMinOrder('0.00');
    setCouponLimitPerClient('1');
    setCouponStartDate(new Date().toISOString().split('T')[0]);
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setCouponEndDate(d.toISOString().split('T')[0]);
    setIsCouponModalOpen(true);
  };

  // Open Edit Customer Modal
  const handleOpenEditModal = (customer: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCustomer(customer);
    setEditName(customer.name || '');
    setEditPhone(customer.phone || '');
    setEditEmail(customer.email || '');
    setEditPhoto(customer.photo || customer.avatar || '');
    setEditStatus(customer.status || 'ativo');
    setEditNotes(customer.notes || '');
    setEditTotalAppointments(String(customer.totalAppointments || 0));
    setEditTotalSpent(Number(customer.totalSpent || 0).toFixed(2));
    setIsEditModalOpen(true);
  };

  // Open Create Customer Modal
  const handleOpenCreateModal = () => {
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewPhoto('');
    setNewNotes('');
    setIsCreateModalOpen(true);
  };

  // Save Customer Edits
  const handleSaveCustomerEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    if (!editName.trim()) {
      addToast('O nome do cliente é obrigatório.', 'error');
      return;
    }

    const payload: Partial<Customer> = {
      name: editName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
      photo: editPhoto.trim(),
      avatar: editPhoto.trim(),
      status: editStatus,
      notes: editNotes.trim(),
      totalAppointments: parseInt(editTotalAppointments, 10) || 0,
      totalSpent: parseFloat(editTotalSpent) || 0,
    };

    await updateCustomer(editingCustomer.id, payload);

    // If currently viewed in details drawer, update local selection
    if (selectedCustomer?.id === editingCustomer.id) {
      setSelectedCustomer({
        ...selectedCustomer,
        ...payload,
      } as Customer);
    }

    setIsEditModalOpen(false);
  };

  // Create New Customer
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      addToast('Informe o nome do cliente.', 'error');
      return;
    }

    await addCustomer({
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim(),
      photo: newPhoto.trim(),
      avatar: newPhoto.trim(),
      status: 'ativo',
      notes: newNotes.trim(),
      totalAppointments: 0,
      totalSpent: 0,
    });

    setIsCreateModalOpen(false);
  };

  // Delete Customer Confirmation
  const handleDeleteCustomer = async (c: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Deseja realmente remover o cliente "${c.name}" da base de dados?`)) {
      await deleteCustomer(c.id);
      if (selectedCustomer?.id === c.id) {
        setSelectedCustomer(null);
      }
    }
  };

  // Submit Coupon Creation for Customer
  const handleCreateCouponForCustomer = async (sendWhatsApp: boolean = false) => {
    if (!couponTargetCustomer) return;
    const cleanCode = couponCode.trim().toUpperCase();
    const valNum = parseFloat(couponDiscountValue);
    const minNum = parseFloat(couponMinOrder) || 0;
    const limitPerClientNum = parseInt(couponLimitPerClient, 10) || 1;

    if (!cleanCode || isNaN(valNum) || valNum <= 0) {
      addToast('Informe um código e valor de desconto válido.', 'error');
      return;
    }

    setIsSubmittingCoupon(true);

    const payload: Omit<Coupon, 'id' | 'usedCount'> = {
      code: cleanCode,
      type: 'individual',
      targetCustomerId: couponTargetCustomer.id,
      targetCustomerName: couponTargetCustomer.name,
      targetCustomerPhone: couponTargetCustomer.phone,
      discountType: couponDiscountType,
      discountValue: valNum,
      minOrderValue: minNum,
      startDate: couponStartDate,
      endDate: couponEndDate,
      usageLimit: limitPerClientNum,
      usageLimitPerClient: limitPerClientNum,
      allowedServiceIds: [],
      status: 'ativo',
    };

    const success = await addCoupon(payload);
    setIsSubmittingCoupon(false);

    if (success) {
      if (sendWhatsApp && couponTargetCustomer.phone) {
        handleSendCouponWhatsApp(couponTargetCustomer, cleanCode, couponDiscountType, valNum, couponEndDate);
      }
      setCouponTab('existentes');
    }
  };

  // WhatsApp sender helper
  const handleSendCouponWhatsApp = (
    customer: Customer,
    code: string,
    discType: 'percentage' | 'fixed',
    discVal: number,
    validUntil: string
  ) => {
    const phoneClean = (customer.phone || '').replace(/\D/g, '');
    if (!phoneClean) {
      addToast('Cliente não possui telefone cadastrado para WhatsApp.', 'error');
      return;
    }

    const formattedVal = discType === 'percentage' ? `${discVal}%` : `R$ ${discVal.toFixed(2)}`;
    const [y, m, d] = (validUntil || '').split('-');
    const formattedDate = y && m && d ? `${d}/${m}/${y}` : validUntil;

    const barbershopName = barbershopInfo?.name || 'Jadson Barber';
    const message = encodeURIComponent(
      `Olá ${customer.name || 'amigo'}! ✂️💈\n\n` +
      `Temos uma novidade especial para você na *${barbershopName}*!\n\n` +
      `Você ganhou um cupom de desconto exclusivo de *${formattedVal}* para o seu próximo agendamento!\n\n` +
      `🎟️ *Código do Cupom:* \`${code}\`\n` +
      `📅 *Válido até:* ${formattedDate}\n\n` +
      `Acesse nosso app e utilize seu código na hora de agendar. Te esperamos aqui!`
    );

    window.open(`https://wa.me/55${phoneClean}?text=${message}`, '_blank');
  };

  // Copy code to clipboard helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    addToast(`Código ${code} copiado para a área de transferência!`, 'info');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Calculate customer's coupons
  const getCustomerCoupons = (customerId: string, customerPhone?: string, customerName?: string) => {
    return coupons.filter(
      (c) =>
        c.type === 'individual' &&
        (c.targetCustomerId === customerId ||
          (customerPhone && c.targetCustomerPhone === customerPhone) ||
          (customerName && c.targetCustomerName?.toLowerCase() === customerName.toLowerCase()))
    );
  };

  // Filter & sort customers
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        // Text Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const name = (c.name || '').toLowerCase();
          const phone = (c.phone || '').toLowerCase();
          const email = (c.email || '').toLowerCase();
          const notes = (c.notes || '').toLowerCase();
          if (!name.includes(q) && !phone.includes(q) && !email.includes(q) && !notes.includes(q)) {
            return false;
          }
        }

        // Status Filter
        if (statusFilter === 'ativo') return c.status !== 'inativo';
        if (statusFilter === 'inativo') return c.status === 'inativo';
        if (statusFilter === 'com-cupom') {
          const cCoupons = getCustomerCoupons(c.id, c.phone, c.name);
          return cCoupons.some((coup) => coup.status === 'ativo');
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'visitas') return (b.totalAppointments || 0) - (a.totalAppointments || 0);
        if (sortBy === 'consumo') return (b.totalSpent || 0) - (a.totalSpent || 0);
        if (sortBy === 'nome') return (a.name || '').localeCompare(b.name || '');
        if (sortBy === 'recentes') return b.id.localeCompare(a.id);
        return 0;
      });
  }, [customers, coupons, searchQuery, statusFilter, sortBy]);

  // General CRM stats
  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter((c) => c.status !== 'inativo').length;
    const totalSpent = customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0);
    const totalVisits = customers.reduce((acc, c) => acc + (c.totalAppointments || 0), 0);
    const withActiveCoupons = customers.filter((c) => {
      const custCoups = getCustomerCoupons(c.id, c.phone, c.name);
      return custCoups.some((coup) => coup.status === 'ativo');
    }).length;

    return { total, active, totalSpent, totalVisits, withActiveCoupons };
  }, [customers, coupons]);

  // Customer historical appointments for the selected customer drawer
  const customerHistory = useMemo(() => {
    if (!selectedCustomer) return [];
    return appointments.filter(
      (app) =>
        ((app.customerName || '').toLowerCase() === (selectedCustomer.name || '').toLowerCase()) ||
        (selectedCustomer.phone && (app.customerPhone || '').replace(/\D/g, '') === selectedCustomer.phone.replace(/\D/g, ''))
    );
  }, [selectedCustomer, appointments]);

  return (
    <AdminLayout
      title="Gestão de Clientes & CRM"
      subtitle="Base de clientes, cupons de desconto individuais exclusivos e histórico de atendimento"
    >
      {/* Top CRM Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-neutral-400 uppercase font-bold">Total de Clientes</span>
            <div className="text-xl md:text-2xl font-black font-mono text-white mt-0.5">{stats.total}</div>
            <div className="text-[10px] text-emerald-400 mt-0.5 font-mono">{stats.active} ativos</div>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[#DAA520]">
            <Users className="w-5 h-5 md:w-6 md:h-6" />
          </div>
        </div>

        <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-neutral-400 uppercase font-bold">Total Consumido</span>
            <div className="text-xl md:text-2xl font-black font-mono text-emerald-400 mt-0.5">
              R$ {stats.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-neutral-500 mt-0.5 font-mono">Faturamento acumulado</div>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <DollarSign className="w-5 h-5 md:w-6 md:h-6" />
          </div>
        </div>

        <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-neutral-400 uppercase font-bold">Total de Visitas</span>
            <div className="text-xl md:text-2xl font-black font-mono text-amber-400 mt-0.5">{stats.totalVisits}</div>
            <div className="text-[10px] text-neutral-500 mt-0.5 font-mono">Atendimentos realizados</div>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
          </div>
        </div>

        <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-neutral-400 uppercase font-bold">Com Cupons Ativos</span>
            <div className="text-xl md:text-2xl font-black font-mono text-purple-400 mt-0.5">{stats.withActiveCoupons}</div>
            <div className="text-[10px] text-neutral-500 mt-0.5 font-mono">Beneficiados com desconto</div>
          </div>
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
            <TicketPercent className="w-5 h-5 md:w-6 md:h-6" />
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Filters, Sort & New Customer Button */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[#111111] p-4 rounded-2xl border border-neutral-800">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome, telefone ou e-mail..."
              className="w-full bg-black/80 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#DAA520]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex bg-black p-1 rounded-xl border border-neutral-800 overflow-x-auto shrink-0">
            <button
              onClick={() => setStatusFilter('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'todos' ? 'bg-[#DAA520] text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Todos ({customers.length})
            </button>
            <button
              onClick={() => setStatusFilter('ativo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'ativo' ? 'bg-[#DAA520] text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Ativos
            </button>
            <button
              onClick={() => setStatusFilter('com-cupom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                statusFilter === 'com-cupom' ? 'bg-[#DAA520] text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <TicketPercent className="w-3 h-3" />
              Com Cupom
            </button>
            <button
              onClick={() => setStatusFilter('inativo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'inativo' ? 'bg-[#DAA520] text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Inativos
            </button>
          </div>
        </div>

        {/* Sort and Add New Customer */}
        <div className="flex items-center gap-2 justify-end">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            aria-label="Ordenar clientes"
            className="bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-neutral-300 focus:outline-none focus:border-[#DAA520]"
          >
            <option value="visitas">Ordenar por: Mais Visitas</option>
            <option value="consumo">Ordenar por: Maior Consumo</option>
            <option value="nome">Ordenar por: Nome (A-Z)</option>
            <option value="recentes">Ordenar por: Mais Recentes</option>
          </select>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-[#DAA520] hover:bg-[#b8860b] text-black font-bold text-xs font-mono rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/10 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* Customers Table List */}
      <div className="bg-[#111111] border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Cliente</th>
                <th className="p-4">Contato</th>
                <th className="p-4">Histórico & Consumo</th>
                <th className="p-4">Cupons Exclusivos</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-neutral-500 font-mono">
                    <Users className="w-8 h-8 mx-auto mb-2 text-neutral-600 opacity-50" />
                    Nenhum cliente encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const avatarSrc = c.photo || c.avatar;
                  const clientCoupons = getCustomerCoupons(c.id, c.phone, c.name);
                  const activeCoupons = clientCoupons.filter((coup) => coup.status === 'ativo');
                  const isInactive = c.status === 'inativo';

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-neutral-900/60 transition-colors ${
                        isInactive ? 'opacity-60 bg-red-950/5' : ''
                      }`}
                    >
                      {/* Customer Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {avatarSrc ? (
                            <img
                              src={avatarSrc}
                              alt={c.name}
                              className="w-11 h-11 rounded-full object-cover border-2 border-amber-500/40 shadow-sm shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 font-bold font-mono text-base shrink-0">
                              {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white font-sans truncate">{c.name}</span>
                              {isInactive && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-500/20 border border-red-500/40 text-red-400 font-bold">
                                  Inativo
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                              <span>Cadastrado em {c.createdAt || 'recente'}</span>
                              {c.notes && (
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" title="Possui observações" />
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="p-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-neutral-300 font-bold">
                          <Phone className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                          <span>{c.phone || 'Sem telefone'}</span>
                          {c.phone && (
                            <a
                              href={`https://wa.me/55${c.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded-md text-emerald-400 hover:bg-emerald-500/20 transition-colors ml-1"
                              title="Abrir WhatsApp"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        {c.email && (
                          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                            <Mail className="w-3 h-3 text-neutral-500 shrink-0" />
                            <span className="truncate max-w-[180px]">{c.email}</span>
                          </div>
                        )}
                      </td>

                      {/* History & Total Spent */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-[11px]">
                              {c.totalAppointments || 0} visitas
                            </span>
                            <span className="font-bold text-emerald-400">
                              R$ {(c.totalSpent || 0).toFixed(2)}
                            </span>
                          </div>
                          {c.lastAppointmentDate && (
                            <div className="text-[10px] text-neutral-500">
                              Última visita: {c.lastAppointmentDate}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Exclusive Coupons Badge */}
                      <td className="p-4">
                        {clientCoupons.length > 0 ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold text-[11px] flex items-center gap-1">
                                <TicketPercent className="w-3 h-3" />
                                {activeCoupons.length} ativo{activeCoupons.length !== 1 ? 's' : ''} ({clientCoupons.length} total)
                              </span>
                            </div>
                            <div className="text-[10px] text-neutral-400 truncate max-w-[160px]">
                              {clientCoupons.map((cp) => cp.code).slice(0, 2).join(', ')}
                              {clientCoupons.length > 2 ? '...' : ''}
                            </div>
                          </div>
                        ) : (
                          <span className="text-neutral-500 text-[11px] italic">Nenhum cupom gerado</span>
                        )}
                      </td>

                      {/* Action Buttons: Cupom, Editar, Histórico, Excluir */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* BOTÃO CUPOM */}
                          <button
                            onClick={(e) => handleOpenCouponModal(c, e)}
                            className="py-1.5 px-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 font-bold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                            title="Disponibilizar cupom de desconto para este cliente"
                          >
                            <TicketPercent className="w-3.5 h-3.5 text-[#DAA520]" />
                            <span>Cupom</span>
                          </button>

                          {/* BOTÃO EDITAR */}
                          <button
                            onClick={(e) => handleOpenEditModal(c, e)}
                            className="py-1.5 px-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-400 font-bold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                            title="Editar dados cadastrais do cliente"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>

                          {/* BOTÃO HISTÓRICO */}
                          <button
                            onClick={() => setSelectedCustomer(c)}
                            className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                            title="Ver detalhes e histórico de agendamentos"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>

                          {/* BOTÃO EXCLUIR */}
                          <button
                            onClick={(e) => handleDeleteCustomer(c, e)}
                            className="p-1.5 rounded-xl bg-neutral-900 hover:bg-red-950/60 border border-neutral-800 hover:border-red-800/60 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                            title="Remover cliente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: DISPONIBILIZAR CUPOM PARA O CLIENTE */}
      {/* ========================================================================= */}
      {isCouponModalOpen && couponTargetCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-[#111111] border border-neutral-800 rounded-3xl p-6 space-y-5 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                {couponTargetCustomer.photo || couponTargetCustomer.avatar ? (
                  <img
                    src={couponTargetCustomer.photo || couponTargetCustomer.avatar}
                    alt={couponTargetCustomer.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-500 shadow-md shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 font-bold font-mono text-base shrink-0">
                    {couponTargetCustomer.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-mono font-bold uppercase text-white">
                      Cupons para {couponTargetCustomer.name}
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">
                    {couponTargetCustomer.phone || 'Sem telefone'} • {couponTargetCustomer.totalAppointments || 0} visitas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex bg-black p-1 rounded-xl border border-neutral-800">
              <button
                type="button"
                onClick={() => setCouponTab('disponibilizar')}
                className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  couponTab === 'disponibilizar' ? 'bg-[#DAA520] text-black shadow-md shadow-[#DAA520]/20' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <TicketPercent className="w-3.5 h-3.5" />
                <span>Cupons Cadastrados ({coupons.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setCouponTab('existentes')}
                className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  couponTab === 'existentes' ? 'bg-[#DAA520] text-black shadow-md shadow-[#DAA520]/20' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Deste Cliente ({getCustomerCoupons(couponTargetCustomer.id, couponTargetCustomer.phone, couponTargetCustomer.name).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setCouponTab('novo')}
                className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  couponTab === 'novo' ? 'bg-[#DAA520] text-black shadow-md shadow-[#DAA520]/20' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Criar Novo</span>
              </button>
            </div>

            {/* TAB 1: DISPONIBILIZAR CUPOM JÁ CADASTRADO NO SISTEMA */}
            {couponTab === 'disponibilizar' && (
              <div className="space-y-3">
                {/* Search / Filter for registered coupons */}
                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={couponSearchFilter}
                    onChange={(e) => setCouponSearchFilter(e.target.value)}
                    placeholder="Filtrar cupons cadastrados por código..."
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#DAA520] font-mono"
                  />
                  {couponSearchFilter && (
                    <button
                      onClick={() => setCouponSearchFilter('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                  <span>Escolha um cupom para enviar diretamente ao WhatsApp de <strong>{couponTargetCustomer.name}</strong>:</span>
                  <span className="text-amber-400 font-bold">{coupons.filter(c => !couponSearchFilter || c.code.toLowerCase().includes(couponSearchFilter.toLowerCase())).length} disponíveis</span>
                </div>

                {/* List of registered coupons */}
                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {coupons.length === 0 ? (
                    <div className="p-8 text-center bg-black/60 rounded-2xl border border-neutral-800 space-y-3">
                      <TicketPercent className="w-10 h-10 mx-auto text-neutral-600 opacity-40" />
                      <p className="text-xs text-neutral-400 font-mono">
                        Nenhum cupom cadastrado no sistema ainda.
                      </p>
                      <button
                        type="button"
                        onClick={() => setCouponTab('novo')}
                        className="px-4 py-2 bg-[#DAA520] text-black font-bold text-xs font-mono rounded-xl cursor-pointer"
                      >
                        Cadastrar Primeiro Cupom
                      </button>
                    </div>
                  ) : (
                    coupons
                      .filter((c) => !couponSearchFilter || c.code.toLowerCase().includes(couponSearchFilter.toLowerCase()))
                      .map((c) => {
                        const isActive = c.status === 'ativo';
                        const isCopied = copiedCode === c.code;
                        const isIndividualForOther = c.type === 'individual' && c.targetCustomerId && c.targetCustomerId !== couponTargetCustomer.id;

                        return (
                          <div
                            key={c.id}
                            className={`p-3.5 bg-black/80 rounded-2xl border transition-all ${
                              isActive ? 'border-neutral-800 hover:border-amber-500/40' : 'border-neutral-800/40 opacity-60'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-start gap-2.5 min-w-0">
                                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5">
                                  <TicketPercent className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono font-black text-sm text-amber-400 tracking-wider">
                                      {c.code}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                                        isActive
                                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
                                      }`}
                                    >
                                      {isActive ? 'Ativo' : 'Inativo'}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-neutral-800 text-neutral-300 border border-neutral-700">
                                      {c.type === 'individual' ? 'Individual' : 'Geral'}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-neutral-300 font-mono mt-1">
                                    Desconto de{' '}
                                    <strong className="text-emerald-400">
                                      {c.discountType === 'percentage'
                                        ? `${c.discountValue}% OFF`
                                        : `R$ ${c.discountValue.toFixed(2)} OFF`}
                                    </strong>
                                    {c.minOrderValue && c.minOrderValue > 0 ? ` • Mínimo R$ ${c.minOrderValue.toFixed(2)}` : ''}
                                    {c.endDate ? ` • Válido até ${c.endDate}` : ''}
                                  </div>
                                  {isIndividualForOther && (
                                    <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                                      * Vinculado originalmente a: {c.targetCustomerName || 'Outro cliente'}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                {/* Copy Button */}
                                <button
                                  type="button"
                                  onClick={() => handleCopyCode(c.code)}
                                  className="px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer text-xs font-mono flex items-center gap-1"
                                  title="Copiar código"
                                >
                                  {isCopied ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>Copiado!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Copiar</span>
                                    </>
                                  )}
                                </button>

                                {/* Send via WhatsApp Button */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSendCouponWhatsApp(
                                      couponTargetCustomer,
                                      c.code,
                                      c.discountType,
                                      c.discountValue,
                                      c.endDate
                                    )
                                  }
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                                  title="Disponibilizar e Enviar no WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>Enviar WhatsApp</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: FORMULÁRIO DE NOVO CUPOM */}
            {couponTab === 'novo' && (
              <div className="space-y-4">
                {/* Código do Cupom */}
                <div>
                  <label className="block text-xs font-mono font-bold text-neutral-300 uppercase mb-1.5">
                    Código do Cupom
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Ex: VIP-JADSON-20"
                      className="flex-1 bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-amber-400 uppercase tracking-wider focus:outline-none focus:border-[#DAA520]"
                    />
                    <button
                      type="button"
                      onClick={() => setCouponCode(generatePersonalizedCode(couponTargetCustomer.name))}
                      className="px-3 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                      title="Gerar outro código aleatório"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                      <span>Gerar Outro</span>
                    </button>
                  </div>
                </div>

                {/* Tipo de Desconto & Valor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-bold text-neutral-300 uppercase mb-1.5">
                      Tipo de Desconto
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-black p-1 rounded-xl border border-neutral-800">
                      <button
                        type="button"
                        onClick={() => setCouponDiscountType('percentage')}
                        className={`py-2 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                          couponDiscountType === 'percentage'
                            ? 'bg-[#DAA520] text-black'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        Porcentagem (%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCouponDiscountType('fixed')}
                        className={`py-2 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                          couponDiscountType === 'fixed'
                            ? 'bg-[#DAA520] text-black'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        Valor Fixo (R$)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-neutral-300 uppercase mb-1.5">
                      Valor do Desconto {couponDiscountType === 'percentage' ? '(%)' : '(R$)'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={couponDiscountType === 'percentage' ? 100 : 500}
                      step="1"
                      value={couponDiscountValue}
                      onChange={(e) => setCouponDiscountValue(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-emerald-400 focus:outline-none focus:border-[#DAA520]"
                    />
                  </div>
                </div>

                {/* Atalhos rápidos de desconto */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase mr-1">Atalhos:</span>
                  {couponDiscountType === 'percentage' ? (
                    ['10', '15', '20', '30', '50'].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setCouponDiscountValue(pct)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer ${
                          couponDiscountValue === pct
                            ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                            : 'bg-black border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {pct}% OFF
                      </button>
                    ))
                  ) : (
                    ['5', '10', '15', '20', '30'].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCouponDiscountValue(val)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer ${
                          couponDiscountValue === val
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-black border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        R$ {val},00 OFF
                      </button>
                    ))
                  )}
                </div>

                {/* Pedido Mínimo & Limite de Uso */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-bold text-neutral-300 uppercase mb-1.5">
                      Pedido Mínimo (R$)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={couponMinOrder}
                      onChange={(e) => setCouponMinOrder(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#DAA520]"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">Deixe 0 para qualquer valor</span>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-neutral-300 uppercase mb-1.5">
                      Limite de Usos pelo Cliente
                    </label>
                    <select
                      value={couponLimitPerClient}
                      onChange={(e) => setCouponLimitPerClient(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#DAA520]"
                    >
                      <option value="1">1x (Uso único / Exclusivo)</option>
                      <option value="2">2x (Pode usar até 2 vezes)</option>
                      <option value="3">3x (Pode usar até 3 vezes)</option>
                      <option value="999">Ilimitado durante o período</option>
                    </select>
                  </div>
                </div>

                {/* Validade */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-bold text-neutral-300 uppercase mb-1.5">
                      Data Início
                    </label>
                    <input
                      type="date"
                      value={couponStartDate}
                      onChange={(e) => setCouponStartDate(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#DAA520]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold text-neutral-300 uppercase mb-1.5">
                      Data de Vencimento
                    </label>
                    <input
                      type="date"
                      value={couponEndDate}
                      onChange={(e) => setCouponEndDate(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#DAA520]"
                    />
                  </div>
                </div>

                {/* Atalhos de validade */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase mr-1">Duração:</span>
                  {[
                    { label: '7 Dias', days: 7 },
                    { label: '15 Dias', days: 15 },
                    { label: '30 Dias', days: 30 },
                    { label: '60 Dias', days: 60 },
                    { label: 'Fim do Ano', days: 0 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        if (preset.days === 0) {
                          setCouponEndDate('2026-12-31');
                        } else {
                          d.setDate(d.getDate() + preset.days);
                          setCouponEndDate(d.toISOString().split('T')[0]);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-black hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Action Buttons: Salvar / Salvar e Enviar WhatsApp */}
                <div className="flex flex-col sm:flex-row items-stretch gap-3 pt-3 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => handleCreateCouponForCustomer(false)}
                    disabled={isSubmittingCoupon}
                    className="flex-1 py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Apenas Salvar Cupom</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCreateCouponForCustomer(true)}
                    disabled={isSubmittingCoupon}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#DAA520] hover:bg-[#b8860b] text-black font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
                  >
                    <MessageCircle className="w-4 h-4 text-black" />
                    <span>Salvar & Enviar no WhatsApp</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: LISTAGEM DE CUPONS DESTE CLIENTE */}
            {couponTab === 'existentes' && (
              <div className="space-y-3">
                {(() => {
                  const clientCoupons = getCustomerCoupons(
                    couponTargetCustomer.id,
                    couponTargetCustomer.phone,
                    couponTargetCustomer.name
                  );

                  if (clientCoupons.length === 0) {
                    return (
                      <div className="p-8 text-center bg-black/60 rounded-2xl border border-neutral-800 space-y-3">
                        <TicketPercent className="w-10 h-10 mx-auto text-neutral-600 opacity-40" />
                        <p className="text-xs text-neutral-400 font-mono">
                          Nenhum cupom individual foi gerado para este cliente ainda.
                        </p>
                        <button
                          type="button"
                          onClick={() => setCouponTab('novo')}
                          className="px-4 py-2 bg-[#DAA520] text-black font-bold text-xs font-mono rounded-xl cursor-pointer"
                        >
                          Criar Primeiro Cupom
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                      {clientCoupons.map((c) => {
                        const isActive = c.status === 'ativo';
                        const isCopied = copiedCode === c.code;

                        return (
                          <div
                            key={c.id}
                            className={`p-3.5 bg-black/80 rounded-2xl border transition-all ${
                              isActive
                                ? 'border-neutral-800 hover:border-amber-500/40'
                                : 'border-neutral-800/40 opacity-60'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                                  <TicketPercent className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-black text-sm text-amber-400 tracking-wider">
                                      {c.code}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                                        isActive
                                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
                                      }`}
                                    >
                                      {isActive ? 'Ativo' : 'Inativo'}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                                    Desconto de{' '}
                                    <strong className="text-white">
                                      {c.discountType === 'percentage'
                                        ? `${c.discountValue}%`
                                        : `R$ ${c.discountValue.toFixed(2)}`}
                                    </strong>{' '}
                                    • Válido até {c.endDate}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {/* Copy Button */}
                                <button
                                  type="button"
                                  onClick={() => handleCopyCode(c.code)}
                                  className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                                  title="Copiar código"
                                >
                                  {isCopied ? (
                                    <Check className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>

                                {/* WhatsApp Send Button */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSendCouponWhatsApp(
                                      couponTargetCustomer,
                                      c.code,
                                      c.discountType,
                                      c.discountValue,
                                      c.endDate
                                    )
                                  }
                                  className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 transition-colors cursor-pointer"
                                  title="Enviar no WhatsApp"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </button>

                                {/* Toggle Status */}
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const nextStatus = isActive ? 'inativo' : 'ativo';
                                    await updateCoupon(c.id, { status: nextStatus });
                                  }}
                                  className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-colors text-[10px] font-mono cursor-pointer"
                                  title={isActive ? 'Desativar Cupom' : 'Ativar Cupom'}
                                >
                                  {isActive ? 'Pausar' : 'Ativar'}
                                </button>

                                {/* Delete */}
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (window.confirm(`Remover cupom "${c.code}"?`)) {
                                      await deleteCoupon(c.id);
                                    }
                                  }}
                                  className="p-2 rounded-xl bg-neutral-900 hover:bg-red-950/60 border border-neutral-800 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                                  title="Excluir Cupom"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDITAR CLIENTE */}
      {/* ========================================================================= */}
      {isEditModalOpen && editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#111111] border border-neutral-800 rounded-3xl p-6 space-y-5 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-mono font-bold uppercase text-white">Editar Cliente</h3>
                  <p className="text-xs text-neutral-400 font-mono">
                    ID: {editingCustomer.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomerEdit} className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-xs font-mono font-bold text-neutral-300 uppercase mb-1.5">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#DAA520]"
                />
              </div>

              {/* Telefone e E-mail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-neutral-300 uppercase mb-1.5">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#DAA520]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-neutral-300 uppercase mb-1.5">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="cliente@email.com"
                    className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#DAA520]"
                  />
                </div>
              </div>

              {/* Status do Cliente */}
              <div>
                <label className="block text-xs font-mono font-bold text-neutral-300 uppercase mb-1.5">
                  Status Cadastral
                </label>
                <div className="grid grid-cols-2 gap-2 bg-black p-1 rounded-xl border border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setEditStatus('ativo')}
                    className={`py-2 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      editStatus === 'ativo' ? 'bg-emerald-500 text-black' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Ativo
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditStatus('inativo')}
                    className={`py-2 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      editStatus === 'inativo' ? 'bg-red-500 text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <UserX className="w-3.5 h-3.5" />
                    Inativo
                  </button>
                </div>
              </div>

              {/* Foto / Avatar */}
              <div>
                <label className="block text-xs font-mono font-bold text-neutral-300 uppercase mb-1.5">
                  URL da Foto / Avatar
                </label>
                <div className="flex items-center gap-3">
                  {editPhoto ? (
                    <img
                      src={editPhoto}
                      alt="Preview"
                      className="w-12 h-12 rounded-full object-cover border-2 border-sky-500 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sky-400 font-bold font-mono text-sm shrink-0">
                      {editName ? editName.charAt(0).toUpperCase() : 'C'}
                    </div>
                  )}
                  <input
                    type="url"
                    value={editPhoto}
                    onChange={(e) => setEditPhoto(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#DAA520]"
                  />
                </div>

                {/* Preset Avatars */}
                <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase shrink-0">Sugestões:</span>
                  {AVATAR_PRESETS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditPhoto(url)}
                      className={`w-7 h-7 rounded-full overflow-hidden border-2 shrink-0 transition-transform hover:scale-110 cursor-pointer ${
                        editPhoto === url ? 'border-amber-400 scale-105' : 'border-neutral-700 opacity-60'
                      }`}
                    >
                      <img src={url} alt="Preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Métricas de CRM (Visitas e Gasto Total) */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-black/60 rounded-2xl border border-neutral-800">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase mb-1">
                    Total de Visitas
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editTotalAppointments}
                    onChange={(e) => setEditTotalAppointments(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-1.5 text-xs font-mono text-amber-400 font-bold focus:outline-none focus:border-[#DAA520]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase mb-1">
                    Total Gasto (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editTotalSpent}
                    onChange={(e) => setEditTotalSpent(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-1.5 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-[#DAA520]"
                  />
                </div>
              </div>

              {/* Observações / Notas */}
              <div>
                <label className="block text-xs font-mono font-bold text-neutral-300 uppercase mb-1.5">
                  Observações & Preferências do Cliente
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Ex: Prefere corte baixo na tesoura, cliente VIP, alérgico a navalha..."
                  className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-[#DAA520] resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-xs font-mono font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#DAA520] hover:bg-[#b8860b] text-black font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-black" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NOVO CLIENTE */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#111111] border border-neutral-800 rounded-3xl p-6 space-y-5 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[#DAA520]">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-mono font-bold uppercase text-white">Cadastrar Novo Cliente</h3>
                  <p className="text-xs text-neutral-400 font-mono">
                    Adicionar cliente à base do sistema
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-neutral-300 uppercase mb-1.5">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Marcos Vinicius"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#DAA520]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-neutral-300 uppercase mb-1.5">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#DAA520]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-neutral-300 uppercase mb-1.5">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="marcos@email.com"
                    className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#DAA520]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-neutral-300 uppercase mb-1.5">
                  URL da Foto (Opcional)
                </label>
                <input
                  type="url"
                  value={newPhoto}
                  onChange={(e) => setNewPhoto(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#DAA520]"
                />

                {/* Preset Avatars */}
                <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase shrink-0">Sugestões:</span>
                  {AVATAR_PRESETS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewPhoto(url)}
                      className={`w-7 h-7 rounded-full overflow-hidden border-2 shrink-0 transition-transform hover:scale-110 cursor-pointer ${
                        newPhoto === url ? 'border-amber-400 scale-105' : 'border-neutral-700 opacity-60'
                      }`}
                    >
                      <img src={url} alt="Preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-neutral-300 uppercase mb-1.5">
                  Observações / Preferências
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Anotações sobre corte, estilo ou preferências..."
                  className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-[#DAA520] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-xs font-mono font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#DAA520] hover:bg-[#b8860b] text-black font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-black" />
                  <span>Cadastrar Cliente</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER / MODAL: DETALHES COMPLETOS & HISTÓRICO DO CLIENTE */}
      {/* ========================================================================= */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#111111] border border-neutral-800 rounded-3xl p-6 space-y-4 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-3">
                {selectedCustomer.photo || selectedCustomer.avatar ? (
                  <img
                    src={selectedCustomer.photo || selectedCustomer.avatar}
                    alt={selectedCustomer.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-500 shadow-md shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 font-bold font-mono text-base shrink-0">
                    {selectedCustomer.name ? selectedCustomer.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-mono font-bold uppercase text-white">{selectedCustomer.name || 'Cliente'}</h3>
                  <p className="text-[11px] text-neutral-400 font-mono">
                    {selectedCustomer.phone || '-'} • {selectedCustomer.email || '-'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white bg-neutral-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Action Shortcuts inside Details Modal */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleOpenCouponModal(selectedCustomer)}
                className="py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 font-bold text-xs font-mono flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <TicketPercent className="w-4 h-4" />
                <span>Disponibilizar Cupom</span>
              </button>

              <button
                onClick={() => handleOpenEditModal(selectedCustomer)}
                className="py-2 px-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-400 font-bold text-xs font-mono flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <span>Editar Dados</span>
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-black/60 rounded-2xl border border-neutral-800 text-center">
                <div className="text-[10px] text-neutral-400 uppercase font-mono font-bold">Total Visitas</div>
                <div className="text-xl font-black font-mono text-amber-400">{selectedCustomer.totalAppointments || 0}</div>
              </div>
              <div className="p-3 bg-black/60 rounded-2xl border border-neutral-800 text-center">
                <div className="text-[10px] text-neutral-400 uppercase font-mono font-bold">Total Consumido</div>
                <div className="text-xl font-black font-mono text-emerald-400">
                  R$ {(selectedCustomer.totalSpent || 0).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Observações / Notas */}
            {selectedCustomer.notes && (
              <div className="p-3 bg-black/80 rounded-xl border border-amber-500/20 space-y-1">
                <div className="text-[10px] text-amber-400 font-mono font-bold uppercase flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Observações do Cliente
                </div>
                <p className="text-xs text-neutral-300 font-mono">{selectedCustomer.notes}</p>
              </div>
            )}

            {/* Histórico Completo de Agendamentos */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase text-white flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#DAA520]" />
                Histórico de Agendamentos ({customerHistory.length})
              </h4>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {customerHistory.length === 0 ? (
                  <p className="text-xs text-neutral-500 font-mono text-center py-6">
                    Nenhum agendamento registrado no sistema.
                  </p>
                ) : (
                  customerHistory.map((app) => (
                    <div
                      key={app.id}
                      className="p-3 bg-black/80 rounded-xl border border-neutral-800 space-y-1 text-xs font-mono hover:border-neutral-700 transition-colors"
                    >
                      <div className="flex justify-between font-bold text-white">
                        <span>
                          {app.date} às {app.startTime}
                        </span>
                        <span className="text-amber-400">R$ {(app.totalPrice || 0).toFixed(2)}</span>
                      </div>
                      <div className="text-neutral-400 truncate">
                        {(app.services || []).map((s) => s.name).join(', ')}
                      </div>
                      <div className="flex justify-between text-[10px] text-neutral-500 pt-0.5">
                        <span>Barbeiro: {app.barberName}</span>
                        <span
                          className={`uppercase font-bold ${
                            app.status === 'Concluído'
                              ? 'text-emerald-400'
                              : app.status === 'Cancelado'
                              ? 'text-red-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
