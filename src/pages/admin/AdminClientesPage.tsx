import React, { useState } from 'react';
import { ContactRound, Search, Calendar, Phone, Mail, DollarSign, History, X, ChevronRight, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Customer, Appointment } from '../../types';

export const AdminClientesPage: React.FC = () => {
  const { customers, appointments, deleteCustomer, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleDeleteCustomer = async (c: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Deseja realmente remover o cliente "${c.name}" da base de dados?`)) {
      await deleteCustomer(c.id);
      if (selectedCustomer?.id === c.id) {
        setSelectedCustomer(null);
      }
    }
  };

  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = c.name || '';
    const phone = c.phone || '';
    const email = c.email || '';
    return name.toLowerCase().includes(q) || phone.includes(q) || email.toLowerCase().includes(q);
  });

  // Customer historical appointments
  const customerHistory = selectedCustomer
    ? appointments.filter(
        (app) =>
          ((app.customerName || '').toLowerCase() === (selectedCustomer.name || '').toLowerCase()) ||
          (selectedCustomer.phone && app.customerPhone === selectedCustomer.phone)
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
                filteredCustomers.map((c) => {
                  const avatarSrc = c.avatar || c.photo;
                  return (
                    <tr key={c.id} className="hover:bg-neutral-900/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {avatarSrc ? (
                            <img
                              src={avatarSrc}
                              alt={c.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-amber-500/40 shadow-sm shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 font-bold font-mono text-sm shrink-0">
                              {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-sm text-white font-sans">{c.name}</div>
                            <div className="text-[10px] text-neutral-500">Cadastrado em {c.createdAt}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 space-y-0.5">
                        <div className="text-neutral-300 font-bold">{c.phone}</div>
                        <div className="text-[11px] text-neutral-400">{c.email}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
                          {c.totalAppointments || 0} visitas
                        </span>
                      </td>
                      <td className="p-4 font-bold text-emerald-400">
                        R$ {(c.totalSpent || 0).toFixed(2)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedCustomer(c)}
                            className="py-1.5 px-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-amber-400 font-bold text-[11px] uppercase transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Histórico</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteCustomer(c, e)}
                            className="p-1.5 rounded-xl bg-neutral-900 hover:bg-red-950/60 border border-neutral-800 hover:border-red-800/60 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                            title="Excluir cliente"
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

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#111111] border border-neutral-800 rounded-3xl p-6 space-y-4 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-3">
                {selectedCustomer.avatar || selectedCustomer.photo ? (
                  <img
                    src={selectedCustomer.avatar || selectedCustomer.photo}
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
                  <p className="text-[11px] text-neutral-400 font-mono">{selectedCustomer.phone || '-'} • {selectedCustomer.email || '-'}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-1 rounded-lg text-neutral-400 hover:text-white bg-neutral-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-black/60 rounded-2xl border border-neutral-800 text-center">
                <div className="text-[10px] text-neutral-400 uppercase font-mono font-bold">Total Visitas</div>
                <div className="text-xl font-black font-mono text-amber-400">{selectedCustomer.totalAppointments || 0}</div>
              </div>
              <div className="p-3 bg-black/60 rounded-2xl border border-neutral-800 text-center">
                <div className="text-[10px] text-neutral-400 uppercase font-mono font-bold">Total Consumido</div>
                <div className="text-xl font-black font-mono text-emerald-400">R$ {(selectedCustomer.totalSpent || 0).toFixed(2)}</div>
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
                        <span className="text-amber-400">R$ {(app.totalPrice || 0).toFixed(2)}</span>
                      </div>
                      <div className="text-neutral-400">{(app.services || []).map((s) => s.name).join(', ')}</div>
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
