import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Trash2,
  RotateCcw,
  Calendar,
  Clock,
  User,
  Phone,
  Scissors,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Sparkles,
  Info,
  CalendarX,
  X,
  ExternalLink,
  ShieldCheck,
  UserX,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Appointment, DeletedAppointmentRecord, Barber } from '../../types';

interface UnifiedHistoryItem {
  key: string;
  id: string; // appointment id or deleted record id
  originalAppointmentId: string;
  type: 'cancelado' | 'excluido';
  author: 'cliente' | 'admin' | 'sistema';
  authorName: string;
  timestamp: string;
  reason?: string;
  appointment: Appointment;
  isFromDeletedCollection: boolean;
}

export const AdminHistoricoPage: React.FC = () => {
  const {
    appointments,
    deletedAppointments,
    barbers,
    restoreAppointment,
    permanentlyDeleteArchivedAppointment,
    clearAllArchivedHistory,
    addToast,
  } = useApp();

  // Primary tab: 'todos' | 'cancelados' | 'excluidos'
  const [activeTab, setActiveTab] = useState<'todos' | 'cancelados' | 'excluidos'>('todos');
  
  // Secondary filters
  const [authorFilter, setAuthorFilter] = useState<'todos' | 'cliente' | 'admin'>('todos');
  const [barberFilter, setBarberFilter] = useState<string>('todos');
  const [dateFilter, setDateFilter] = useState<string>('todos');
  const [customDate, setCustomDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Modals state
  const [itemToRestore, setItemToRestore] = useState<UnifiedHistoryItem | null>(null);
  const [itemToDeletePermanently, setItemToDeletePermanently] = useState<UnifiedHistoryItem | null>(null);
  const [itemDetailsModal, setItemDetailsModal] = useState<UnifiedHistoryItem | null>(null);
  const [isClearHistoryModalOpen, setIsClearHistoryModalOpen] = useState(false);
  const [clearHistoryType, setClearHistoryType] = useState<'all' | 'deleted' | 'cancelled'>('all');
  const [isClearing, setIsClearing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Unify Cancelled appointments (from active collection) and Deleted appointments (from archive)
  const unifiedList = useMemo(() => {
    const list: UnifiedHistoryItem[] = [];

    // 1. Cancelled appointments in active appointments list
    appointments
      .filter((app) => app.status === 'Cancelado')
      .forEach((app) => {
        const who: 'cliente' | 'admin' | 'sistema' =
          app.cancelledBy === 'cliente'
            ? 'cliente'
            : app.cancelledBy === 'admin'
            ? 'admin'
            : 'sistema';

        list.push({
          key: `canc-${app.id}`,
          id: app.id,
          originalAppointmentId: app.id,
          type: 'cancelado',
          author: who,
          authorName: app.cancelledByName || (who === 'cliente' ? 'Cliente' : who === 'admin' ? 'Administrador' : 'Sistema'),
          timestamp: app.cancelledAt || app.updatedAt || app.createdAt,
          reason: app.cancellationReason || 'Agendamento cancelado',
          appointment: app,
          isFromDeletedCollection: false,
        });
      });

    // 2. Deleted appointments from archive
    deletedAppointments.forEach((record) => {
      const who: 'cliente' | 'admin' | 'sistema' =
        record.deletedBy === 'cliente'
          ? 'cliente'
          : record.deletedBy === 'admin'
          ? 'admin'
          : 'admin';

      list.push({
        key: `del-${record.id}`,
        id: record.id,
        originalAppointmentId: record.originalAppointmentId || record.appointment.id,
        type: 'excluido',
        author: who,
        authorName: record.deletedByName || (who === 'cliente' ? 'Cliente' : 'Administrador'),
        timestamp: record.deletedAt || record.appointment.updatedAt || record.appointment.createdAt,
        reason: record.reason || 'Agendamento excluído do sistema',
        appointment: record.appointment,
        isFromDeletedCollection: true,
      });
    });

    // Sort by timestamp
    list.sort((a, b) => {
      const timeA = a.timestamp || '';
      const timeB = b.timestamp || '';
      return sortOrder === 'desc' ? timeB.localeCompare(timeA) : timeA.localeCompare(timeB);
    });

    return list;
  }, [appointments, deletedAppointments, sortOrder]);

  // Filtered List
  const filteredList = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return unifiedList.filter((item) => {
      // 1. Tab filter
      if (activeTab === 'cancelados' && item.type !== 'cancelado') return false;
      if (activeTab === 'excluidos' && item.type !== 'excluido') return false;

      // 2. Author filter
      if (authorFilter !== 'todos' && item.author !== authorFilter) return false;

      // 3. Barber filter
      if (barberFilter !== 'todos' && item.appointment.barberId !== barberFilter) return false;

      // 4. Date filter
      if (dateFilter === 'hoje') {
        const itemDate = (item.timestamp || '').split('T')[0] || item.appointment.date;
        if (itemDate !== todayStr && item.appointment.date !== todayStr) return false;
      } else if (dateFilter === 'personalizada' && customDate) {
        const itemDate = (item.timestamp || '').split('T')[0] || item.appointment.date;
        if (itemDate !== customDate && item.appointment.date !== customDate) return false;
      }

      // 5. Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const app = item.appointment;
        const matchName = (app.customerName || '').toLowerCase().includes(q);
        const matchPhone = (app.customerPhone || '').replace(/\D/g, '').includes(q.replace(/\D/g, ''));
        const matchBarber = (app.barberName || '').toLowerCase().includes(q);
        const matchServices = (app.services || []).some((s) => (s.name || '').toLowerCase().includes(q));
        const matchReason = (item.reason || '').toLowerCase().includes(q);
        const matchAuthor = (item.authorName || '').toLowerCase().includes(q);

        if (!matchName && !matchPhone && !matchBarber && !matchServices && !matchReason && !matchAuthor) {
          return false;
        }
      }

      return true;
    });
  }, [unifiedList, activeTab, authorFilter, barberFilter, dateFilter, customDate, searchQuery]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalCancelled = unifiedList.filter((i) => i.type === 'cancelado').length;
    const cancelledByClient = unifiedList.filter((i) => i.type === 'cancelado' && i.author === 'cliente').length;
    const cancelledByAdmin = unifiedList.filter((i) => i.type === 'cancelado' && i.author === 'admin').length;
    const totalDeleted = unifiedList.filter((i) => i.type === 'excluido').length;
    const deletedByClient = unifiedList.filter((i) => i.type === 'excluido' && i.author === 'cliente').length;
    const deletedByAdmin = unifiedList.filter((i) => i.type === 'excluido' && i.author === 'admin').length;
    
    const totalLostRevenue = unifiedList.reduce(
      (acc, item) => acc + (Number(item.appointment.totalPrice) || 0),
      0
    );

    return {
      totalItems: unifiedList.length,
      totalCancelled,
      cancelledByClient,
      cancelledByAdmin,
      totalDeleted,
      deletedByClient,
      deletedByAdmin,
      totalLostRevenue,
    };
  }, [unifiedList]);

  // Handle Restore
  const handleConfirmRestore = async () => {
    if (!itemToRestore) return;
    setIsRestoring(true);
    try {
      if (itemToRestore.isFromDeletedCollection) {
        await restoreAppointment(itemToRestore.id, true);
      } else {
        await restoreAppointment(itemToRestore.appointment.id, false);
      }
      setItemToRestore(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRestoring(false);
    }
  };

  // Handle Permanent Delete
  const handleConfirmPermanentDelete = async () => {
    if (!itemToDeletePermanently) return;
    try {
      if (itemToDeletePermanently.isFromDeletedCollection) {
        await permanentlyDeleteArchivedAppointment(itemToDeletePermanently.id);
      } else {
        // If it's a cancelled appointment still in active collection, delete it permanently
        await permanentlyDeleteArchivedAppointment(itemToDeletePermanently.id);
      }
      setItemToDeletePermanently(null);
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Clear History
  const handleConfirmClearHistory = async () => {
    setIsClearing(true);
    try {
      await clearAllArchivedHistory({ type: clearHistoryType });
      setIsClearHistoryModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsClearing(false);
    }
  };

  // Format date & time
  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'Data não informada';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // WhatsApp generator
  const openWhatsApp = (phone: string, customerName: string, appointmentDate: string, appointmentTime: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
    const text = encodeURIComponent(
      `Olá, ${customerName}! Aqui é da Barbearia Jadson Barber. Vimos seu agendamento anterior para ${appointmentDate} às ${appointmentTime}. Gostaria de reagendar um novo horário conosco?`
    );
    window.open(`https://wa.me/${phoneWithCountry}?text=${text}`, '_blank');
  };

  return (
    <AdminLayout
      title="Histórico de Cancelamentos e Exclusões"
      subtitle="Registro completo e auditoria de todos os agendamentos excluídos e cancelados por clientes e administradores"
    >
      <div className="space-y-6">

        {/* 1. TOP STATS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Total Cancelados */}
          <div className="bg-[#111111] p-4 rounded-2xl border border-neutral-800 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase text-neutral-400">Total Cancelados</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black font-mono text-white tracking-tight">
                {stats.totalCancelled}
              </div>
              <div className="text-[10px] font-mono text-neutral-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-amber-400">{stats.cancelledByClient} por Clientes</span>
                <span>•</span>
                <span className="text-neutral-300">{stats.cancelledByAdmin} por ADM</span>
              </div>
            </div>
          </div>

          {/* Total Excluídos */}
          <div className="bg-[#111111] p-4 rounded-2xl border border-neutral-800 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase text-neutral-400">Total Excluídos</span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black font-mono text-white tracking-tight">
                {stats.totalDeleted}
              </div>
              <div className="text-[10px] font-mono text-neutral-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-rose-400">{stats.deletedByAdmin} por ADM</span>
                {stats.deletedByClient > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-neutral-300">{stats.deletedByClient} por Clientes</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Cancelados por Clientes */}
          <div className="bg-[#111111] p-4 rounded-2xl border border-neutral-800 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase text-neutral-400">Origem: Clientes</span>
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                <UserX className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black font-mono text-white tracking-tight">
                {stats.cancelledByClient + stats.deletedByClient}
              </div>
              <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                Cancelados/removidos via app do cliente
              </div>
            </div>
          </div>

          {/* Valor Financeiro Não Convertido */}
          <div className="bg-[#111111] p-4 rounded-2xl border border-neutral-800 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase text-neutral-400">Total Desmarcado</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
                R$ {stats.totalLostRevenue.toFixed(2).replace('.', ',')}
              </div>
              <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                Soma dos valores dos horários desmarcados
              </div>
            </div>
          </div>
        </div>

        {/* 2. CONTROLS BAR: TABS & ACTION BUTTONS */}
        <div className="bg-[#111111] p-4 rounded-2xl border border-neutral-800 space-y-4">
          
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Primary Category Tabs */}
            <div className="flex bg-black/60 p-1 rounded-xl border border-neutral-800">
              <button
                onClick={() => setActiveTab('todos')}
                className={`py-2 px-3.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'todos'
                    ? 'bg-[#DAA520] text-black shadow-md shadow-[#DAA520]/20'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Todos ({unifiedList.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('cancelados')}
                className={`py-2 px-3.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'cancelados'
                    ? 'bg-[#DAA520] text-black shadow-md shadow-[#DAA520]/20'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <XCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Cancelados ({stats.totalCancelled})</span>
              </button>

              <button
                onClick={() => setActiveTab('excluidos')}
                className={`py-2 px-3.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'excluidos'
                    ? 'bg-[#DAA520] text-black shadow-md shadow-[#DAA520]/20'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Excluídos ({stats.totalDeleted})</span>
              </button>
            </div>

            {/* Clear History & Sort Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                className="py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                title={`Ordenar por data (${sortOrder === 'desc' ? 'Mais recentes primeiro' : 'Mais antigos primeiro'})`}
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-[#DAA520]" />
                <span className="hidden sm:inline">
                  {sortOrder === 'desc' ? 'Mais recentes' : 'Mais antigos'}
                </span>
              </button>

              {unifiedList.length > 0 && (
                <button
                  onClick={() => setIsClearHistoryModalOpen(true)}
                  className="py-2 px-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar Histórico</span>
                </button>
              )}
            </div>
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-neutral-800/80">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por cliente, fone, barbeiro..."
                className="w-full bg-black/60 border border-neutral-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#DAA520]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Author Filter (Quem cancelou/excluiu) */}
            <div className="flex items-center gap-2 bg-black/60 border border-neutral-800 rounded-xl px-3 py-1.5">
              <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold shrink-0">Origem:</span>
              <select
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value as any)}
                className="w-full bg-transparent text-xs text-white font-mono focus:outline-none cursor-pointer"
              >
                <option value="todos" className="bg-neutral-900 text-white">Todos os Autores</option>
                <option value="cliente" className="bg-neutral-900 text-white">Pelo Cliente</option>
                <option value="admin" className="bg-neutral-900 text-white">Pelo Administrador (ADM)</option>
              </select>
            </div>

            {/* Barber Filter */}
            <div className="flex items-center gap-2 bg-black/60 border border-neutral-800 rounded-xl px-3 py-1.5">
              <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold shrink-0">Barbeiro:</span>
              <select
                value={barberFilter}
                onChange={(e) => setBarberFilter(e.target.value)}
                className="w-full bg-transparent text-xs text-white font-mono focus:outline-none cursor-pointer"
              >
                <option value="todos" className="bg-neutral-900 text-white">Todos os Barbeiros</option>
                {barbers.map((b) => (
                  <option key={b.id} value={b.id} className="bg-neutral-900 text-white">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-2 bg-black/60 border border-neutral-800 rounded-xl px-3 py-1.5">
              <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold shrink-0">Período:</span>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-transparent text-xs text-white font-mono focus:outline-none cursor-pointer"
              >
                <option value="todos" className="bg-neutral-900 text-white">Todo o Período</option>
                <option value="hoje" className="bg-neutral-900 text-white">Somente Hoje</option>
                <option value="personalizada" className="bg-neutral-900 text-white">Data Específica</option>
              </select>
              {dateFilter === 'personalizada' && (
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="bg-neutral-900 text-xs text-[#DAA520] font-mono border border-neutral-700 rounded-lg px-2 py-0.5 focus:outline-none"
                />
              )}
            </div>

          </div>

        </div>

        {/* 3. HISTORY LIST / CARDS */}
        <div className="space-y-3">
          {filteredList.length === 0 ? (
            <div className="bg-[#111111] border border-neutral-800 rounded-3xl p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500 flex items-center justify-center mx-auto">
                <CalendarX className="w-7 h-7" />
              </div>
              <h3 className="text-base font-mono font-bold text-white uppercase">
                Nenhum agendamento encontrado no histórico
              </h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                {searchQuery || authorFilter !== 'todos' || barberFilter !== 'todos' || dateFilter !== 'todos'
                  ? 'Nenhum registro corresponde aos filtros selecionados. Tente ajustar a busca.'
                  : 'Quando agendamentos forem cancelados ou excluídos por você ou pelos clientes, eles serão arquivados aqui automaticamente.'}
              </p>
              {(searchQuery || authorFilter !== 'todos' || barberFilter !== 'todos' || dateFilter !== 'todos') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setAuthorFilter('todos');
                    setBarberFilter('todos');
                    setDateFilter('todos');
                  }}
                  className="py-2 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-[#DAA520] border border-neutral-800 text-xs font-mono font-bold uppercase transition-colors"
                >
                  Limpar Todos os Filtros
                </button>
              )}
            </div>
          ) : (
            filteredList.map((item) => {
              const app = item.appointment;
              const isCancelled = item.type === 'cancelado';
              const isDeleted = item.type === 'excluido';
              const isByClient = item.author === 'cliente';
              const isByAdmin = item.author === 'admin';

              return (
                <div
                  key={item.key}
                  className="bg-[#111111] border border-neutral-800 hover:border-neutral-700/80 rounded-2xl p-4 sm:p-5 transition-all shadow-sm space-y-4"
                >
                  {/* Card Header: Badges & Timestamps */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-800/80">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Main Type Badge */}
                      {isCancelled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-400">
                          <XCircle className="w-3 h-3" />
                          Cancelado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/10 border border-rose-500/30 text-rose-400">
                          <Trash2 className="w-3 h-3" />
                          Excluído
                        </span>
                      )}

                      {/* Author / Origin Badge */}
                      {isByClient ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-sky-500/10 border border-sky-500/30 text-sky-400">
                          <User className="w-3 h-3" />
                          Pelo Cliente ({item.authorName})
                        </span>
                      ) : isByAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/10 border border-purple-500/30 text-purple-400">
                          <ShieldCheck className="w-3 h-3" />
                          Pelo Administrador
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-neutral-800 border border-neutral-700 text-neutral-300">
                          Pelo Sistema
                        </span>
                      )}

                      {/* ID tag */}
                      <span className="text-[10px] font-mono text-neutral-500">
                        ID: {app.id}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{isCancelled ? 'Cancelado em:' : 'Excluído em:'} {formatDateTime(item.timestamp)}</span>
                    </div>
                  </div>

                  {/* Card Body: Customer + Booking Data */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* 1. Cliente */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-mono font-bold uppercase text-neutral-500">Cliente</div>
                      <div className="flex items-center gap-3">
                        {app.customerAvatar ? (
                          <img
                            src={app.customerAvatar}
                            alt={app.customerName}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-xl object-cover border border-neutral-800 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                            {app.customerName?.charAt(0) || 'C'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white truncate font-sans">
                            {app.customerName}
                          </div>
                          <div className="text-xs font-mono text-neutral-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-neutral-500 shrink-0" />
                            <span>{app.customerPhone || 'Sem telefone'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. Horário & Barbeiro */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-mono font-bold uppercase text-neutral-500">Horário & Profissional</div>
                      <div className="space-y-1">
                        <div className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{app.date} • {app.startTime} às {app.endTime}</span>
                        </div>
                        <div className="text-xs font-mono text-neutral-300 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                          <span>Barbeiro: <strong className="text-white">{app.barberName}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* 3. Serviços & Valor */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-mono font-bold uppercase text-neutral-500">Serviços & Valor Total</div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center justify-between">
                          <span className="truncate pr-2">
                            {app.services?.map((s) => s.name).join(', ') || 'Serviços Barbearia'}
                          </span>
                          <span className="text-[#DAA520] font-mono shrink-0">
                            R$ {(Number(app.totalPrice) || 0).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-neutral-500 mt-0.5">
                          Duração: {app.totalDuration || 30} min {app.isCombo ? '• Combo Especial' : ''}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Reason & Notes section */}
                  {item.reason && (
                    <div className="bg-black/50 border border-neutral-800/80 rounded-xl px-3.5 py-2.5 text-xs text-neutral-300 font-sans flex items-start gap-2">
                      <Info className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-neutral-400 font-mono text-[10px] uppercase block">Motivo / Detalhes:</strong>
                        <span>{item.reason}</span>
                      </div>
                    </div>
                  )}

                  {/* Reschedule History if applicable */}
                  {app.rescheduleHistory && app.rescheduleHistory.length > 0 && (
                    <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-xl p-2.5 text-[11px] font-mono text-neutral-400">
                      <span className="text-amber-400/80 font-bold block mb-1">Histórico de Reagendamentos Anteriores:</span>
                      {app.rescheduleHistory.map((h, i) => (
                        <div key={i} className="text-neutral-400">
                          • Mudou de {h.previousDate} ({h.previousTime}) em {formatDateTime(h.changedAt)}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Card Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-neutral-800/80">
                    
                    {/* Left Actions: WhatsApp + Details */}
                    <div className="flex items-center gap-2">
                      {app.customerPhone && (
                        <button
                          onClick={() => openWhatsApp(app.customerPhone, app.customerName, app.date, app.startTime)}
                          className="py-1.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Enviar mensagem para o cliente no WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      )}

                      <button
                        onClick={() => setItemDetailsModal(item)}
                        className="py-1.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Ver Detalhes</span>
                      </button>
                    </div>

                    {/* Right Actions: Restore & Permanent Delete */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setItemToRestore(item)}
                        className="py-1.5 px-3.5 rounded-xl bg-[#DAA520]/10 hover:bg-[#DAA520]/20 text-[#DAA520] border border-[#DAA520]/30 text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Reativar este agendamento na agenda ativa"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restaurar / Reativar</span>
                      </button>

                      {item.isFromDeletedCollection && (
                        <button
                          onClick={() => setItemToDeletePermanently(item)}
                          className="py-1.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Excluir este registro definitivamente do histórico"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Excluir Definitivo</span>
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* 4. MODAL: RESTORE APPOINTMENT */}
      {itemToRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#111111] border border-[#DAA520]/40 rounded-3xl p-6 space-y-4 relative shadow-2xl">
            <button
              onClick={() => setItemToRestore(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#DAA520]/10 border border-[#DAA520]/30 text-[#DAA520] flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-mono font-bold text-white uppercase">
                Restaurar Agendamento?
              </h3>
              <p className="text-xs text-neutral-400 font-sans">
                O agendamento de <strong className="text-white">{itemToRestore.appointment.customerName}</strong> para{' '}
                <strong className="text-amber-400">{itemToRestore.appointment.date} às {itemToRestore.appointment.startTime}</strong> com{' '}
                <strong className="text-white">{itemToRestore.appointment.barberName}</strong> será reativado com status{' '}
                <strong className="text-emerald-400">"Agendado"</strong> na agenda ativa.
              </p>
            </div>

            <div className="bg-black/60 p-3 rounded-xl border border-neutral-800 text-xs font-mono space-y-1">
              <div className="text-neutral-400 flex justify-between">
                <span>Serviços:</span>
                <span className="text-white truncate max-w-[200px]">
                  {itemToRestore.appointment.services?.map((s) => s.name).join(', ')}
                </span>
              </div>
              <div className="text-neutral-400 flex justify-between">
                <span>Valor:</span>
                <span className="text-[#DAA520]">
                  R$ {(Number(itemToRestore.appointment.totalPrice) || 0).toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToRestore(null)}
                className="py-2.5 px-3 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-300 font-mono text-xs font-bold cursor-pointer hover:bg-neutral-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                disabled={isRestoring}
                className="py-2.5 px-3 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isRestoring ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Restaurando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sim, Reativar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: PERMANENT DELETE */}
      {itemToDeletePermanently && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#111111] border border-rose-500/40 rounded-3xl p-6 space-y-4 relative shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-mono font-bold text-white uppercase">
                Excluir Definitivamente?
              </h3>
              <p className="text-xs text-neutral-400 font-sans">
                Esta ação removerá permanentemente o registro de histórico de{' '}
                <strong className="text-white">{itemToDeletePermanently.appointment.customerName}</strong> ({itemToDeletePermanently.appointment.date}).
                Esta operação não pode ser desfeita.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDeletePermanently(null)}
                className="py-2.5 px-3 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-300 font-mono text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmPermanentDelete}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg cursor-pointer"
              >
                Sim, Excluir Definitivo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: CLEAR HISTORY */}
      {isClearHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#111111] border border-rose-500/40 rounded-3xl p-6 space-y-4 relative shadow-2xl">
            <button
              onClick={() => setIsClearHistoryModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-mono font-bold text-white uppercase">
                Limpeza do Histórico
              </h3>
              <p className="text-xs text-neutral-400 font-sans">
                Selecione quais registros você deseja purgar definitivamente do histórico:
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <label
                onClick={() => setClearHistoryType('all')}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  clearHistoryType === 'all'
                    ? 'bg-rose-950/40 border-rose-500/50 text-white'
                    : 'bg-black/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    clearHistoryType === 'all' ? 'border-rose-400 bg-rose-500' : 'border-neutral-600'
                  }`}>
                    {clearHistoryType === 'all' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold">Limpar Tudo (Cancelados & Excluídos)</div>
                    <div className="text-[10px] text-neutral-500">Apaga todo o histórico arquivado</div>
                  </div>
                </div>
                <span className="text-xs font-mono text-neutral-400">{unifiedList.length} itens</span>
              </label>

              <label
                onClick={() => setClearHistoryType('deleted')}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  clearHistoryType === 'deleted'
                    ? 'bg-rose-950/40 border-rose-500/50 text-white'
                    : 'bg-black/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    clearHistoryType === 'deleted' ? 'border-rose-400 bg-rose-500' : 'border-neutral-600'
                  }`}>
                    {clearHistoryType === 'deleted' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold">Limpar Apenas Excluídos</div>
                    <div className="text-[10px] text-neutral-500">Mantém os cancelados</div>
                  </div>
                </div>
                <span className="text-xs font-mono text-neutral-400">{stats.totalDeleted} itens</span>
              </label>

              <label
                onClick={() => setClearHistoryType('cancelled')}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  clearHistoryType === 'cancelled'
                    ? 'bg-rose-950/40 border-rose-500/50 text-white'
                    : 'bg-black/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    clearHistoryType === 'cancelled' ? 'border-rose-400 bg-rose-500' : 'border-neutral-600'
                  }`}>
                    {clearHistoryType === 'cancelled' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold">Limpar Apenas Cancelados</div>
                    <div className="text-[10px] text-neutral-500">Mantém os excluídos</div>
                  </div>
                </div>
                <span className="text-xs font-mono text-neutral-400">{stats.totalCancelled} itens</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsClearHistoryModalOpen(false)}
                className="py-2.5 px-3 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-300 font-mono text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmClearHistory}
                disabled={isClearing}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isClearing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Limpando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirmar Limpeza</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: FULL DETAILS VIEW */}
      {itemDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#111111] border border-neutral-800 rounded-3xl p-6 space-y-4 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setItemDetailsModal(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                itemDetailsModal.type === 'cancelado'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}>
                {itemDetailsModal.type === 'cancelado' ? <XCircle className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-mono font-bold text-white uppercase">
                  Detalhes do Agendamento {itemDetailsModal.type === 'cancelado' ? 'Cancelado' : 'Excluído'}
                </h3>
                <p className="text-xs text-neutral-400 font-mono">
                  ID: {itemDetailsModal.appointment.id}
                </p>
              </div>
            </div>

            {/* Information Grid */}
            <div className="space-y-3 text-xs font-mono">
              <div className="bg-black/60 p-3.5 rounded-xl border border-neutral-800 space-y-2">
                <div className="text-[10px] uppercase font-bold text-neutral-500">Dados do Cliente</div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Nome:</span>
                  <span className="text-white font-bold">{itemDetailsModal.appointment.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Telefone:</span>
                  <span className="text-white">{itemDetailsModal.appointment.customerPhone || 'Não informado'}</span>
                </div>
              </div>

              <div className="bg-black/60 p-3.5 rounded-xl border border-neutral-800 space-y-2">
                <div className="text-[10px] uppercase font-bold text-neutral-500">Atendimento Agendado</div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Barbeiro:</span>
                  <span className="text-white font-bold">{itemDetailsModal.appointment.barberName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Data & Horário:</span>
                  <span className="text-amber-400 font-bold">
                    {itemDetailsModal.appointment.date} • {itemDetailsModal.appointment.startTime} às {itemDetailsModal.appointment.endTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Duração Total:</span>
                  <span className="text-white">{itemDetailsModal.appointment.totalDuration} minutos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Valor Total:</span>
                  <span className="text-[#DAA520] font-bold">
                    R$ {(Number(itemDetailsModal.appointment.totalPrice) || 0).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              <div className="bg-black/60 p-3.5 rounded-xl border border-neutral-800 space-y-2">
                <div className="text-[10px] uppercase font-bold text-neutral-500">Serviços Inclusos</div>
                <div className="space-y-1.5">
                  {itemDetailsModal.appointment.services?.map((serv, idx) => (
                    <div key={idx} className="flex justify-between text-neutral-300">
                      <span>• {serv.name}</span>
                      <span className="text-neutral-400">R$ {serv.price?.toFixed(2).replace('.', ',')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-black/60 p-3.5 rounded-xl border border-neutral-800 space-y-2">
                <div className="text-[10px] uppercase font-bold text-neutral-500">Auditoria & Motivo</div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Autor da Ação:</span>
                  <span className="text-sky-400 font-bold">{itemDetailsModal.authorName} ({itemDetailsModal.author.toUpperCase()})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Data/Hora da Ação:</span>
                  <span className="text-white">{formatDateTime(itemDetailsModal.timestamp)}</span>
                </div>
                {itemDetailsModal.reason && (
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Motivo Registrado:</span>
                    <span className="text-neutral-200 bg-neutral-900 p-2 rounded-lg block">{itemDetailsModal.reason}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setItemDetailsModal(null)}
                className="py-2.5 px-4 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-300 font-mono text-xs font-bold cursor-pointer"
              >
                Fechar
              </button>

              <button
                type="button"
                onClick={() => {
                  const target = itemDetailsModal;
                  setItemDetailsModal(null);
                  setItemToRestore(target);
                }}
                className="py-2.5 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Agendamento</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </AdminLayout>
  );
};
