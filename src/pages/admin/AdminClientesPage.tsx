import React, { useState } from 'react';
import { ContactRound, Search, Calendar, Phone, Mail, DollarSign, History, X, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Customer, Appointment } from '../../types';

export const AdminClientesPage: React.FC = () => {
  const { customers, appointments } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q);
  });

  // Customer historical appointments
  const customerHistory = selectedCustomer
    ? appointments.filter(
        (app) => app.customerName.toLowerCase() === selectedCustomer.name.toLowerCase() || app.customerPhone === selectedCustomer.phone
      )
    : [];

  return (
    <AdminLayout
      title="Gestão de Clientes & CRM"
      subtitle="Histórico de presença, consumo acumulado e canal direto com clientes"
    >
      {/* Search Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#111111] p-4 rounded-2xl border border-neutral-800">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, telefone ou e-mail..."
            className="w-full bg-black/80 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
          />
        </div>

        <div className="text-xs font-mono text-neutral-400">
          Base de Clientes: <strong className="text-white">{customers.length} cadastrados</strong>
        </div>
      </div>

      {/* Customers Table / Grid */}
      <div className="bg-[#111111] border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 font-bold uppercase">
              <tr>
                <th className="p-4">Cliente</th>
                <th className="p-4">Contato</th>
                <th className="p-4">Agendamentos</th>
                <th className="p-4">Total Gasto</th>
                <th className="p-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-500 font-mono">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-sm text-white font-sans">{c.name}</div>
                      <div className="text-[10px] text-neutral-500">Cadastrado em {c.createdAt}</div>
                    </td>
                    <td className="p-4 space-y-0.5">
                      <div className="text-neutral-300 font-bold">{c.phone}</div>
                      <div className="text-[11px] text-neutral-400">{c.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
                        {c.totalAppointments} visitas
                      </span>
                    </td>
                    <td className="p-4 font-bold text-emerald-400">
                      R$ {c.totalSpent.toFixed(2)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="py-1.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-amber-400 font-bold text-[11px] uppercase transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Histórico</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#111111] border border-neutral-800 rounded-3xl p-6 space-y-4 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <ContactRound className="w-5 h-5 text-[#DAA520]" />
                <div>
                  <h3 className="text-sm font-mono font-bold uppercase text-white">{selectedCustomer.name}</h3>
                  <p className="text-[11px] text-neutral-400 font-mono">{selectedCustomer.phone} • {selectedCustomer.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-1 rounded-lg text-neutral-400 hover:text-white bg-neutral-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-black/60 rounded-2xl border border-neutral-800 text-center">
                <div className="text-[10px] text-neutral-400 uppercase font-mono font-bold">Total Visitas</div>
                <div className="text-xl font-black font-mono text-amber-400">{selectedCustomer.totalAppointments}</div>
              </div>
              <div className="p-3 bg-black/60 rounded-2xl border border-neutral-800 text-center">
                <div className="text-[10px] text-neutral-400 uppercase font-mono font-bold">Total Consumido</div>
                <div className="text-xl font-black font-mono text-emerald-400">R$ {selectedCustomer.totalSpent.toFixed(2)}</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase text-white flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#DAA520]" />
                Histórico Completo de Agendamentos ({customerHistory.length})
              </h4>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {customerHistory.length === 0 ? (
                  <p className="text-xs text-neutral-500 font-mono text-center py-6">
                    Nenhum histórico recente no sistema.
                  </p>
                ) : (
                  customerHistory.map((app) => (
                    <div key={app.id} className="p-3 bg-black/80 rounded-xl border border-neutral-800 space-y-1 text-xs font-mono">
                      <div className="flex justify-between font-bold text-white">
                        <span>{app.date} às {app.startTime}</span>
                        <span className="text-amber-400">R$ {app.totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="text-neutral-400">{app.services.map((s) => s.name).join(', ')}</div>
                      <div className="flex justify-between text-[10px] text-neutral-500">
                        <span>Barbeiro: {app.barberName}</span>
                        <span className="uppercase text-emerald-400">{app.status}</span>
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
