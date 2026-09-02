import React, { useMemo } from 'react';
import {
  Wallet,
  Receipt,
  PiggyBank,
  TrendingUp,
  Percent,
  ShieldAlert,
  Mic,
  Plus,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import {
  formatCurrency,
  formatPercent,
  generateFinancialInsights,
} from '../services/financialCalculations';
import { getCategoryColor } from '../services/categoryService';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { PageTab } from '../components/Sidebar';

interface DashboardPageProps {
  onOpenVoice: () => void;
  onNavigateTab: (tab: PageTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenVoice,
  onNavigateTab,
}) => {
  const {
    monthlyIncomes,
    monthlyExpenses,
    totalIncome,
    totalExpenses,
    fixedExpenses,
    variableExpenses,
    essentialExpenses,
    availableBalance,
    committedPercentage,
    expensesByCategory,
    investments,
    emergencyFund,
    emergencyFundTarget,
    emergencyFundProgress,
    loadDemoData,
  } = useFinancial();

  const totalInvestments = useMemo(() => {
    return investments.reduce(
      (acc, curr) => acc + (curr.initialAmount || 0) + (curr.monthlyContribution || 0),
      0
    );
  }, [investments]);

  // Generate intelligent insights based on real user numbers
  const insights = useMemo(() => {
    return generateFinancialInsights({
      totalIncome,
      totalExpenses,
      fixedExpenses,
      variableExpenses,
      essentialExpenses,
      availableBalance,
      committedPercentage,
      expensesByCategory,
      emergencyFundCurrent: emergencyFund.currentAmount,
      emergencyFundTarget,
    });
  }, [
    totalIncome,
    totalExpenses,
    fixedExpenses,
    variableExpenses,
    essentialExpenses,
    availableBalance,
    committedPercentage,
    expensesByCategory,
    emergencyFund,
    emergencyFundTarget,
  ]);

  // Top Category
  const topCategory = useMemo(() => {
    const entries = Object.entries(expensesByCategory);
    if (entries.length === 0) return { name: 'Nenhuma', value: 0 };
    return entries.reduce((max, curr) => (curr[1] > max.value ? { name: curr[0], value: curr[1] } : max), {
      name: '',
      value: 0,
    });
  }, [expensesByCategory]);

  // Chart data: Category Donut
  const categoryChartData = useMemo(() => {
    return Object.entries(expensesByCategory).map(([name, value]) => ({
      name,
      value,
      color: getCategoryColor(name),
    }));
  }, [expensesByCategory]);

  // Chart data: Income vs Expenses vs Balance
  const comparisonData = useMemo(() => {
    return [
      { name: 'Renda', valor: totalIncome, fill: '#10B981' },
      { name: 'Gastos', valor: totalExpenses, fill: '#EF4444' },
      { name: 'Saldo', valor: Math.max(0, availableBalance), fill: '#3B82F6' },
    ];
  }, [totalIncome, totalExpenses, availableBalance]);

  const hasData = monthlyIncomes.length > 0 || monthlyExpenses.length > 0;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Onboarding Banner if empty */}
      {!hasData && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl space-y-4">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Entenda seu dinheiro. Organize seu mês. Planeje seu futuro.
            </h2>
            <p className="text-sm text-emerald-100 leading-relaxed">
              Informe sua renda e seus gastos por texto ou simplesmente fale. O aplicativo organiza
              seus dados e mostra como está sua vida financeira sem termos complicados.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="onboarding-voice-start-btn"
              type="button"
              onClick={onOpenVoice}
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-800 text-xs font-bold shadow-md hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-2"
            >
              <Mic className="w-4 h-4 text-emerald-600" />
              🎙️ Começar por voz
            </button>
            <button
              id="onboarding-text-start-btn"
              type="button"
              onClick={onOpenVoice}
              className="px-4 py-2.5 rounded-xl bg-emerald-700/80 text-white text-xs font-bold border border-emerald-400/40 hover:bg-emerald-700 transition-all flex items-center gap-2"
            >
              ⌨️ Começar digitando
            </button>
            <button
              id="onboarding-demo-start-btn"
              type="button"
              onClick={loadDemoData}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-emerald-100 hover:text-white hover:underline ml-auto"
            >
              Ver exemplo com dados preenchidos
            </button>
          </div>
        </div>
      )}

      {/* High Density 4-Card KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Renda Mensal */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Renda Mensal</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalIncome)}
          </h3>
          <div className="flex items-center gap-1 mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{monthlyIncomes.length} entradas cadastradas</span>
          </div>
        </div>

        {/* Card 2: Gastos Totais */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Gastos Totais</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalExpenses)}
          </h3>
          <div className="flex items-center gap-1 mt-2 text-xs font-bold text-rose-500">
            <span>{monthlyExpenses.length} despesas lançadas</span>
          </div>
        </div>

        {/* Card 3: Saldo Disponível */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Saldo Disponível</p>
          <h3
            className={`text-2xl font-bold tracking-tight ${
              availableBalance >= 0 ? 'text-slate-900 dark:text-white' : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {formatCurrency(availableBalance)}
          </h3>
          <div className="flex items-center gap-1 mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span>{availableBalance >= 0 ? 'Livre para investir e metas' : 'Déficit no período'}</span>
          </div>
        </div>

        {/* Card 4: Renda Comprometida */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all">
          <div className="flex justify-between items-start mb-1">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Renda Comprometida</p>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                committedPercentage <= 70
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              {committedPercentage <= 70 ? 'Ideal' : 'Alerta'}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {formatPercent(committedPercentage)}
          </h3>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                committedPercentage <= 70 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, committedPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main High Density Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Análise Inteligente (8 cols on XL) */}
        <div className="xl:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Análise Inteligente</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">O que seus números estão dizendo?</p>
              </div>
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-bold">
                IA Ativa
              </span>
            </div>

            {/* Smart summary */}
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mb-4">
              {insights.summary}
            </p>

            {/* Insight cards: Positive & Attention */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Pontos Positivos */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 rounded-2xl p-4 flex gap-3.5">
                <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-xs uppercase tracking-wider">
                    Ponto Positivo
                  </h4>
                  <ul className="space-y-1">
                    {insights.positivePoints.length > 0 ? (
                      insights.positivePoints.map((pt, i) => (
                        <li key={i} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          • {pt}
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-slate-600 dark:text-slate-400">
                        Lance seus dados para visualizar destaques.
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Pontos de Atenção */}
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60 rounded-2xl p-4 flex gap-3.5">
                <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-900 dark:text-amber-300 text-xs uppercase tracking-wider">
                    Ponto de Atenção
                  </h4>
                  <ul className="space-y-1">
                    {insights.attentionPoints.length > 0 ? (
                      insights.attentionPoints.map((pt, i) => (
                        <li key={i} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          • {pt}
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-slate-600 dark:text-slate-400">
                        Nenhum ponto crítico de atenção identificado.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Highlight Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block">
                Maior Categoria
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {topCategory.name} ({formatCurrency(topCategory.value)})
              </span>
            </div>

            <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block">
                Sugestão de Aporte
              </span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(Math.max(0, availableBalance * 0.5))}
              </span>
            </div>

            <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block">
                Reserva de Emergência
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {formatCurrency(emergencyFund.currentAmount || 0)} / {formatCurrency(emergencyFundTarget)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Distribuição de Gastos (4 cols on XL) */}
        <div className="xl:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Distribuição</h3>
              <span className="text-xs text-slate-400">Gastos por Categoria</span>
            </div>

            {/* Donut Chart */}
            <div className="relative flex justify-center items-center my-2 h-44">
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [formatCurrency(Number(val)), 'Valor']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-400 flex items-center justify-center">
                  Sem despesas cadastradas
                </div>
              )}
            </div>

            {/* Category breakdown list */}
            <div className="space-y-2 mt-4 max-h-48 overflow-y-auto pr-1">
              {categoryChartData.slice(0, 4).map((cat, idx) => {
                const pct = totalExpenses > 0 ? (cat.value / totalExpenses) * 100 : 0;
                return (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="truncate">{cat.name}</span>
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 shrink-0">
                      {formatPercent(pct, 0)} ({formatCurrency(cat.value)})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('expenses')}
            className="w-full mt-4 py-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
          >
            Ver Detalhes dos Gastos
          </button>
        </div>
      </div>

      {/* Section: "Seu mês em equilíbrio" */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Seu mês em equilíbrio
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl mt-0.5">
              Veja como sua renda está sendo distribuída, entenda seus principais gastos e descubra
              onde você pode fazer melhores escolhas com seu dinheiro.
            </p>
          </div>
          <button
            id="view-balance-org-btn"
            type="button"
            onClick={() => onNavigateTab('balance')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            Organizar saldo <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Breakdown pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Renda
            </span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalIncome)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Gastos Totais
            </span>
            <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
              {formatCurrency(totalExpenses)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Gastos Essenciais
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {formatCurrency(essentialExpenses)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Gastos Variáveis
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {formatCurrency(variableExpenses)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Saldo Disponível
            </span>
            <span
              className={`text-sm font-bold ${
                availableBalance >= 0
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {formatCurrency(availableBalance)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              % Comprometido
            </span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {formatPercent(committedPercentage)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Reserva Atual
            </span>
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(emergencyFund.currentAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Renda x Gastos x Saldo
            </h3>
            <p className="text-xs text-slate-400">Visão comparativa de fluxo de caixa do mês selecionado</p>
          </div>
          <span className="text-xs text-slate-400">Valores em R$</span>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(v) => `R$ ${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(val: any) => [formatCurrency(Number(val)), 'Total']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="valor" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
