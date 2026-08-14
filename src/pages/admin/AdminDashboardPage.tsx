import React, { useState } from 'react';
import {
  DollarSign,
  CalendarDays,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  ShoppingBag,
  Scissors,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AppointmentStatus } from '../../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

export const AdminDashboardPage: React.FC = () => {
  const {
    appointments,
    updateAppointmentStatus,
    barbers,
    services,
    customers,
    currentUser,
    products,
    setActivePage,
    addToast,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('todos');

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter today's appointments
  const todayAppointments = appointments.filter((app) => app.date === todayStr);

  // Filtered by selected status tab
  const filteredAppointments = todayAppointments.filter((app) => {
    if (statusFilter === 'todos') return true;
    return app.status === statusFilter;
  });

  // Calculate Key Metrics
  const todayRevenue = todayAppointments
    .filter((a) => a.status === 'Concluído' || a.status === 'Confirmado' || a.status === 'Em atendimento')
    .reduce((acc, a) => acc + a.totalPrice, 0);

  const completedToday = todayAppointments.filter((a) => a.status === 'Concluído').length;
  const pendingToday = todayAppointments.filter((a) => a.status === 'Agendado' || a.status === 'Confirmado').length;
  const inProgressToday = todayAppointments.filter((a) => a.status === 'Em atendimento').length;

  // Chart data: Last 7 days revenue (100% real data from appointments)
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateFormatted = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('pt-BR', { weekday: 'short' });

    const dayAppts = appointments.filter(
      (a) => a.date === dateFormatted && (a.status === 'Concluído' || a.status === 'Confirmado')
    );
    const dayTotal = dayAppts.reduce((acc, a) => acc + a.totalPrice, 0);

    return {
      day: dayLabel.toUpperCase(),
      date: dateFormatted,
      valor: dayTotal,
    };
  });

  // Chart data: Category distribution (100% real data)
  const cortesCount = appointments.filter((a) => !a.isCombo && a.status === 'Concluído').length;
  const combosCount = appointments.filter((a) => a.isCombo && a.status === 'Concluído').length;
  const produtosCount = products.reduce((acc, p) => acc + (p.salesCount || 0), 0);

  const pieData = [
    { name: 'Cortes', value: cortesCount, color: '#DAA520' },
    { name: 'Combos VIP', value: combosCount, color: '#3b82f6' },
    { name: 'Produtos', value: produtosCount, color: '#10b981' },
  ];

  return (
    <AdminLayout
      title="Dashboard Visão Geral"
      subtitle="Acompanhamento em tempo real das métricas da Barbearia Jadson Barber"
    >
      {/* Quick Action Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111111] p-4 rounded-2xl border border-neutral-800">
        <div>
          <h2 className="text-sm font-mono font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            Sistema Sincronizado com Firebase
          </h2>
          <p className="text-xs text-neutral-400 font-sans mt-0.5">
            Hoje, {new Date().toLocaleDateString('pt-BR', { dateStyle: 'full' })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActivePage('admin-agendamentos')}
            className="py-2.5 px-3.5 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Agendamento</span>
          </button>

          <button
            onClick={() => setActivePage('admin-produtos')}
            className="py-2.5 px-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Registrar Venda</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-4 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-neutral-400">Faturamento Hoje</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-black font-mono text-white">
              R$ {todayRevenue.toFixed(2)}
            </div>
            <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Em tempo real</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-neutral-400">Total Hoje</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-black font-mono text-white">
              {todayAppointments.length} agendamentos
            </div>
            <div className="text-[11px] text-neutral-400 font-sans">
              {pendingToday} pendentes • {completedToday} concluídos
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-neutral-400">Em Atendimento</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Scissors className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-black font-mono text-purple-400">
              {inProgressToday} clientes
            </div>
            <div className="text-[11px] text-neutral-400 font-sans">
              Nas cadeiras da barbearia agora
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-neutral-400">Equipe Ativa</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-black font-mono text-white">
              {barbers.filter((b) => b.status === 'available').length} / {barbers.length}
            </div>
            <div className="text-[11px] text-neutral-400 font-sans">
              Barbeiros disponíveis
            </div>
          </div>
        </div>

      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart: Revenue last 7 days */}
        <div className="lg:col-span-2 bg-[#111111] border border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#DAA520]" />
                Faturamento dos Últimos 7 Dias
              </h3>
              <p className="text-xs text-neutral-400 font-sans">Evolução diária de receitas acumuladas</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DAA520" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#DAA520" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                <XAxis dataKey="day" stroke="#666666" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#666666" fontSize={11} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px' }}
                  labelStyle={{ color: '#DAA520', fontWeight: 'bold' }}
                  formatter={(val: number) => [`R$ ${val.toFixed(2)}`, 'Faturamento']}
                />
                <Area type="monotone" dataKey="valor" stroke="#DAA520" strokeWidth={3} fillOpacity={1} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Popularity */}
        <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-mono font-bold uppercase text-white">Distribuição de Receita</h3>
            <p className="text-xs text-neutral-400">Proporção por tipo de serviço</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-neutral-800">
            {pieData.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-neutral-300">{p.name}</span>
                </div>
                <span className="font-bold text-white">{p.value} pedidos</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Today's Agenda Workflow List */}
      <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-5 space-y-4">
        
        {/* Table Header & Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div>
            <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#DAA520]" />
              Agendamentos do Dia ({todayAppointments.length})
            </h3>
            <p className="text-xs text-neutral-400 font-sans">
              Gerencie a fila de atendimento em tempo real
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-black/60 p-1 rounded-xl border border-neutral-800">
            {['todos', 'Agendado', 'Confirmado', 'Em atendimento', 'Concluído', 'Cancelado'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`py-1.5 px-3 rounded-lg font-mono text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-[#DAA520] text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-3">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-10 space-y-2 bg-neutral-900/30 rounded-2xl border border-dashed border-neutral-800">
              <Clock className="w-8 h-8 text-neutral-600 mx-auto" />
              <p className="text-xs font-mono text-neutral-400">Nenhum agendamento encontrado para este filtro hoje.</p>
            </div>
          ) : (
            filteredAppointments.map((app) => {
              const matchedCustomer = customers.find(
                (c) =>
                  c.id === app.customerId ||
                  (c.phone && c.phone === app.customerPhone) ||
                  c.name.toLowerCase() === app.customerName.toLowerCase()
              );
              const customerAvatarSrc =
                app.customerAvatar ||
                matchedCustomer?.avatar ||
                matchedCustomer?.photo ||
                (currentUser &&
                (currentUser.name.toLowerCase() === app.customerName.toLowerCase() ||
                  currentUser.phone === app.customerPhone)
                  ? currentUser.avatar
                  : '');

              return (
              <div
                key={app.id}
                className="bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
              >
                {/* Time & Customer Info */}
                <div className="flex items-start gap-3.5">
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 text-center shrink-0 min-w-[70px]">
                    <div className="text-xs font-mono font-bold text-amber-400">{app.startTime}</div>
                    <div className="text-[10px] text-neutral-500 font-mono">até {app.endTime}</div>
                  </div>

                  <div className="flex items-start gap-3">
                    {/* Customer Photo / Avatar */}
                    {customerAvatarSrc ? (
                      <img
                        src={customerAvatarSrc}
                        alt={app.customerName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-amber-500/50 shadow-md shrink-0 mt-0.5"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 font-bold font-mono text-xs shrink-0 mt-0.5">
                        {app.customerName ? app.customerName.charAt(0).toUpperCase() : 'C'}
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white font-sans">{app.customerName}</span>
                        <span className="text-xs text-neutral-400 font-mono">({app.customerPhone})</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-300">
                        <span className="font-semibold text-amber-400">
                          {app.services.map((s) => s.name).join(', ')}
                        </span>
                        <span>•</span>
                        <span className="text-neutral-400">Barbeiro: {app.barberName}</span>
                      </div>

                      <div className="text-xs font-mono font-bold text-white">
                        R$ {app.totalPrice.toFixed(2)} • {app.totalDuration} min
                      </div>
                    </div>
                  </div>
                </div>

                {/* Workflow Status Actions */}
                <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-neutral-800">
                  
                  {/* Current Status Pill */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                      app.status === 'Concluído'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : app.status === 'Em atendimento'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                        : app.status === 'Confirmado'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                        : app.status === 'Cancelado'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}
                  >
                    {app.status}
                  </span>

                  {/* Actions depending on current status */}
                  {app.status === 'Agendado' && (
                    <button
                      onClick={() => updateAppointmentStatus(app.id, 'Confirmado')}
                      className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-[11px] font-bold uppercase transition-colors cursor-pointer"
                    >
                      Confirmar
                    </button>
                  )}

                  {(app.status === 'Agendado' || app.status === 'Confirmado') && (
                    <button
                      onClick={() => updateAppointmentStatus(app.id, 'Em atendimento')}
                      className="py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-[11px] font-bold uppercase transition-colors cursor-pointer"
                    >
                      Iniciar Atendimento
                    </button>
                  )}

                  {app.status === 'Em atendimento' && (
                    <button
                      onClick={() => updateAppointmentStatus(app.id, 'Concluído')}
                      className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[11px] font-bold uppercase transition-colors cursor-pointer"
                    >
                      Concluir (R$ {app.totalPrice.toFixed(2)})
                    </button>
                  )}

                  {app.status !== 'Concluído' && app.status !== 'Cancelado' && (
                    <button
                      onClick={() => updateAppointmentStatus(app.id, 'Cancelado')}
                      className="py-1.5 px-2.5 rounded-xl bg-neutral-900 hover:bg-red-950/60 text-red-400 border border-neutral-800 text-[11px] font-mono font-bold uppercase transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}

                </div>
              </div>
              );
            })
          )}
        </div>

      </div>

    </AdminLayout>
  );
};
