import React, { useMemo } from 'react';
import {
  History,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency, formatPercent } from '../services/financialCalculations';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export const HistoryPage: React.FC = () => {
  const { incomes, expenses, availableMonths, selectedMonth, setSelectedMonth } = useFinancial();

  // Helper to format "YYYY-MM" to "Mês YYYY"
  const formatMonthName = (mKey: string) => {
    try {
      const [year, month] = mKey.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      const label = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      return label.charAt(0).toUpperCase() + label.slice(1);
    } catch {
      return mKey;
    }
  };

  // Compile monthly statistics
  const monthlyStats = useMemo(() => {
    return availableMonths.map((mKey) => {
      const mIncomes = incomes.filter((i) => i.date?.startsWith(mKey) || i.recurring);
      const mExpenses = expenses.filter((e) => e.date?.startsWith(mKey) || e.recurring);

      const totalInc = mIncomes.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      const totalExp = mExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      const balance = totalInc - totalExp;
      const savingsRate = totalInc > 0 ? (Math.max(0, balance) / totalInc) * 100 : 0;

      return {
        key: mKey,
        label: formatMonthName(mKey),
        renda: totalInc,
        gastos: totalExp,
        saldo: balance,
        taxaPoupanca: savingsRate,
        incomesCount: mIncomes.length,
        expensesCount: mExpenses.length,
      };
    });
  }, [availableMonths, incomes, expenses]);

  // Reversed for chronological chart display
  const chartData = useMemo(() => {
    return [...monthlyStats].reverse();
  }, [monthlyStats]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-6 h-6 text-indigo-500" />
          Histórico & Comparativo Mensal
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Acompanhe sua consistência financeira e a evolução mês a mês
        </p>
      </div>

      {/* Comparison Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Evolução de Renda vs Gastos
          </h2>
          <span className="text-xs text-slate-400">Comparação cronológica</span>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(v) => `R$ ${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(val: any) => [formatCurrency(Number(val)), '']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="renda" name="Renda Total" fill="#10B981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="gastos" name="Gastos Totais" fill="#EF4444" radius={[6, 6, 0, 0]} />
              <Bar dataKey="saldo" name="Saldo Líquido" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Summary Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Resumo dos Meses Registrados
          </h2>
          <span className="text-xs text-slate-400">
            {monthlyStats.length} {monthlyStats.length === 1 ? 'mês' : 'meses'}
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {monthlyStats.map((st) => {
            const isSelected = selectedMonth === st.key;
            return (
              <div
                key={st.key}
                onClick={() => setSelectedMonth(st.key)}
                className={`p-4 sm:px-6 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {st.label}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          Mês Ativo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {st.incomesCount} rendas • {st.expensesCount} despesas
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:flex items-center gap-4 sm:gap-8 text-right">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Renda</span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(st.renda)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Gastos</span>
                    <span className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrency(st.gastos)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Saldo</span>
                    <span
                      className={`text-xs sm:text-sm font-bold ${
                        st.saldo >= 0
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {formatCurrency(st.saldo)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
