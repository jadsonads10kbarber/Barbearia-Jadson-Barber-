import React, { useState } from 'react';
import {
  WalletCards,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Filter,
  Calendar,
  X,
  PieChart as PieIcon,
  Tag,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const AdminFinanceiroPage: React.FC = () => {
  const { appointments, expenses, products, addExpense, deleteExpense, addToast } = useApp();

  const [period, setPeriod] = useState<'hoje' | 'semana' | 'mes' | 'todos'>('mes');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // New Expense Form State
  const [expDescription, setExpDescription] = useState('');
  const [expCategory, setExpCategory] = useState('Insumos');
  const [expAmount, setExpAmount] = useState('');
  const [expNotes, setExpNotes] = useState('');

  // Date Filtering helper
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const filterByPeriod = (dateStr: string) => {
    if (period === 'hoje') return dateStr === todayStr;
    if (period === 'semana') {
      const target = new Date(dateStr);
      const diffTime = Math.abs(now.getTime() - target.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }
    if (period === 'mes') {
      return dateStr.substring(0, 7) === todayStr.substring(0, 7);
    }
    return true;
  };

  // Service Revenues
  const totalServiceRevenue = appointments
    .filter((a) => (a.status === 'Concluído' || a.status === 'Confirmado') && filterByPeriod(a.date))
    .reduce((acc, a) => acc + a.totalPrice, 0);

  // Product Revenues
  const totalProductRevenue = products
    .reduce((acc, p) => acc + p.totalRevenue, 0);

  // Total Gross Revenue
  const totalGrossRevenue = totalServiceRevenue + totalProductRevenue;

  // Expenses Total
  const filteredExpenses = expenses.filter((e) => filterByPeriod(e.date));
  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  // Net Profit
  const netProfit = totalGrossRevenue - totalExpenses;

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(expAmount);
    if (!expDescription.trim() || isNaN(amountNum) || amountNum <= 0) {
      addToast('Por favor, informe uma descrição e valor válido.', 'error');
      return;
    }

    await addExpense({
      description: expDescription.trim(),
      category: expCategory,
      amount: amountNum,
      date: new Date().toISOString().split('T')[0],
      notes: expNotes.trim() || undefined,
    });

    setExpDescription('');
    setExpAmount('');
    setExpNotes('');
    setIsExpenseModalOpen(false);
  };

  // Chart comparison data
  const chartData = [
    { name: 'Serviços', valor: totalServiceRevenue },
    { name: 'Produtos', valor: totalProductRevenue },
    { name: 'Despesas', valor: totalExpenses },
    { name: 'Lucro Líquido', valor: netProfit > 0 ? netProfit : 0 },
  ];

  return (
    <AdminLayout
      title="Gestão Financeira e Caixa"
      subtitle="Controle completo de faturamento, vendas de produtos e despesas operacionais"
    >
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111111] p-4 rounded-2xl border border-neutral-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#DAA520]" />
          <span className="text-xs font-mono font-bold uppercase text-neutral-300">Período:</span>
          <div className="flex bg-black/60 p-1 rounded-xl border border-neutral-800 gap-1">
            {(['hoje', 'semana', 'mes', 'todos'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`py-1.5 px-3 rounded-lg font-mono text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                  period === p ? 'bg-[#DAA520] text-black shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {p === 'mes' ? 'Este Mês' : p === 'semana' ? '7 Dias' : p === 'hoje' ? 'Hoje' : 'Tudo'}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIsExpenseModalOpen(true)}
          className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Lançar Nova Despesa</span>
        </button>
      </div>

      {/* Financial Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-neutral-400">Faturamento Bruto</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-white">R$ {totalGrossRevenue.toFixed(2)}</div>
          <div className="text-[11px] text-neutral-400">Serviços: R$ {totalServiceRevenue.toFixed(2)}</div>
        </div>

        <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-neutral-400">Venda de Produtos</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">R$ {totalProductRevenue.toFixed(2)}</div>
          <div className="text-[11px] text-neutral-400">Balcão e cosméticos</div>
        </div>

        <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-neutral-400">Despesas Totais</span>
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center font-bold">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-red-400">R$ {totalExpenses.toFixed(2)}</div>
          <div className="text-[11px] text-neutral-400">{filteredExpenses.length} lançamentos</div>
        </div>

        <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-neutral-400">Lucro Líquido</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <WalletCards className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl font-black font-mono ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            R$ {netProfit.toFixed(2)}
          </div>
          <div className="text-[11px] text-neutral-400">Receita menos despesas</div>
        </div>

      </div>

      {/* Chart Section */}
      <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
          <PieIcon className="w-4 h-4 text-[#DAA520]" />
          Comparativo Financeiro do Período
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
              <XAxis dataKey="name" stroke="#888888" fontSize={11} fontFamily="monospace" />
              <YAxis stroke="#888888" fontSize={11} fontFamily="monospace" />
              <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px' }} />
              <Bar dataKey="valor" fill="#DAA520" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense List Section */}
      <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-red-400" />
            Lançamentos de Despesas
          </h3>
          <span className="text-xs font-mono text-neutral-400">{filteredExpenses.length} despesas cadastradas</span>
        </div>

        <div className="space-y-2">
          {filteredExpenses.length === 0 ? (
            <p className="text-xs text-neutral-500 font-mono text-center py-6">
              Nenhuma despesa registrada para o período selecionado.
            </p>
          ) : (
            filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3 flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-white font-sans">{exp.description}</div>
                  <div className="text-xs text-neutral-400 font-mono flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-950/60 border border-red-800/40 text-red-300 font-bold">
                      {exp.category}
                    </span>
                    <span>• {exp.date}</span>
                    {exp.notes && <span>• {exp.notes}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-black text-red-400">
                    - R$ {exp.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => deleteExpense(exp.id)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Expense Creation Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#111111] border border-neutral-800 rounded-2xl p-6 space-y-4 relative shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-red-400" />
                Lançar Nova Despesa
              </h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white bg-neutral-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">Descrição da Despesa</label>
                <input
                  type="text"
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  placeholder="Ex: Compra de Lâminas / Conta de Luz"
                  className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">Categoria</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                  >
                    <option value="Insumos">Insumos</option>
                    <option value="Aluguel">Aluguel</option>
                    <option value="Energia/Água">Energia/Água</option>
                    <option value="Equipamentos">Equipamentos</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="150.00"
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">Observações (Opcional)</label>
                <input
                  type="text"
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  placeholder="Ex: Pagamento efetuado via PIX"
                  className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Confirmar Lançamento
              </button>
            </form>

          </div>
        </div>
      )}

    </AdminLayout>
  );
};
