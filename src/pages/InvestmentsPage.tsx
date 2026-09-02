import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Calculator,
  Info,
  Calendar,
  DollarSign,
  Percent,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import {
  formatCurrency,
  formatPercent,
  calculateCdiRateAnnual,
  simulateInvestment,
  calculateScenarios,
  calculateRequiredMonthlyContribution,
  calculateTimeToTarget,
} from '../services/financialCalculations';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const InvestmentsPage: React.FC = () => {
  const { settings, updateSettings, availableBalance } = useFinancial();

  // Primary Simulator States
  const [initialAmount, setInitialAmount] = useState<string>('1000');
  const [monthlyContribution, setMonthlyContribution] = useState<string>('300');
  const [cdiPercent, setCdiPercent] = useState<string>('120');
  const [durationMonths, setDurationMonths] = useState<number>(36);

  // Reverse Calculator States
  const [reverseTarget, setReverseTarget] = useState<string>('50000');
  const [reverseMonths, setReverseMonths] = useState<number>(60);
  const [reverseInitial, setReverseInitial] = useState<string>('5000');
  const [reverseMonthlyCap, setReverseMonthlyCap] = useState<string>('500');

  // Rate override
  const [cdiRate, setCdiRate] = useState<string>(String(settings.cdiRate || 10.65));
  const numCdiRate = parseFloat(cdiRate) || 10.65;
  const numCdiPercent = parseFloat(cdiPercent) || 120;
  const annualEffectiveRate = calculateCdiRateAnnual(numCdiRate, numCdiPercent);

  // Calculate Primary Simulation
  const numInitial = parseFloat(initialAmount) || 0;
  const numMonthly = parseFloat(monthlyContribution) || 0;

  const simulation = useMemo(() => {
    return simulateInvestment(numInitial, numMonthly, durationMonths, annualEffectiveRate);
  }, [numInitial, numMonthly, durationMonths, annualEffectiveRate]);

  // Scenarios (1, 2, 5, 10 years)
  const scenarios = useMemo(() => {
    return calculateScenarios(numInitial, numMonthly, annualEffectiveRate);
  }, [numInitial, numMonthly, annualEffectiveRate]);

  // Chart data for evolution over time
  const chartData = useMemo(() => {
    const points: Array<{ mes: number; label: string; investido: number; total: number; rendimento: number }> = [];
    const step = Math.max(1, Math.floor(durationMonths / 12));

    for (let m = 1; m <= durationMonths; m += step) {
      const res = simulateInvestment(numInitial, numMonthly, m, annualEffectiveRate);
      points.push({
        mes: m,
        label: `${m}m`,
        investido: res.totalInvested,
        total: res.estimatedTotal,
        rendimento: res.estimatedYield,
      });
    }

    // Ensure last month is included
    if (points.length === 0 || points[points.length - 1].mes !== durationMonths) {
      const finalRes = simulateInvestment(numInitial, numMonthly, durationMonths, annualEffectiveRate);
      points.push({
        mes: durationMonths,
        label: `${durationMonths}m`,
        investido: finalRes.totalInvested,
        total: finalRes.estimatedTotal,
        rendimento: finalRes.estimatedYield,
      });
    }

    return points;
  }, [numInitial, numMonthly, durationMonths, annualEffectiveRate]);

  // Reverse Calculations
  const numReverseTarget = parseFloat(reverseTarget) || 50000;
  const numReverseInitial = parseFloat(reverseInitial) || 0;
  const numReverseMonthlyCap = parseFloat(reverseMonthlyCap) || 500;

  const requiredMonthly = useMemo(() => {
    return calculateRequiredMonthlyContribution(
      numReverseTarget,
      numReverseInitial,
      reverseMonths,
      annualEffectiveRate
    );
  }, [numReverseTarget, numReverseInitial, reverseMonths, annualEffectiveRate]);

  const requiredMonthsToTarget = useMemo(() => {
    return calculateTimeToTarget(
      numReverseTarget,
      numReverseInitial,
      numReverseMonthlyCap,
      annualEffectiveRate
    );
  }, [numReverseTarget, numReverseInitial, numReverseMonthlyCap, annualEffectiveRate]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-teal-500" />
            Investimentos & Simulações CDI
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Projeções matemáticas com juros compostos baseadas na taxa de mercado
          </p>
        </div>

        {/* Economic Rates Badge */}
        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">TAXA CDI</span>
            <span className="font-bold text-slate-900 dark:text-white">{numCdiRate.toFixed(2)}% a.a.</span>
          </div>
          <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">TAXA SELIC</span>
            <span className="font-bold text-slate-900 dark:text-white">{settings.selicRate?.toFixed(2)}% a.a.</span>
          </div>
        </div>
      </div>

      {/* 120% CDI Simulator Main Hero Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-tr from-slate-900 via-teal-950 to-slate-900 text-white shadow-xl space-y-6 border border-teal-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Projeção em {cdiPercent}% do CDI ({formatPercent(annualEffectiveRate * 100, 2)} a.a.)
            </span>
            <p className="text-3xl sm:text-4xl font-extrabold mt-1">
              {formatCurrency(simulation.estimatedTotal)}
            </p>
            <p className="text-xs text-slate-300 mt-1">
              Total acumulado em {durationMonths} meses ({Math.floor(durationMonths / 12)} anos e {durationMonths % 12} meses)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl">
              <span className="text-[10px] text-slate-300 block">Total Investido</span>
              <span className="text-sm font-bold text-white">
                {formatCurrency(simulation.totalInvested)}
              </span>
            </div>
            <div className="bg-emerald-500/20 backdrop-blur-md p-3 rounded-xl border border-emerald-500/30">
              <span className="text-[10px] text-emerald-300 block">Rendimento Estimado</span>
              <span className="text-sm font-bold text-emerald-400">
                +{formatCurrency(simulation.estimatedYield)}
              </span>
            </div>
          </div>
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-800">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Aporte Inicial (R$)
            </label>
            <input
              id="sim-initial-amount-input"
              type="number"
              step="50"
              min="0"
              value={initialAmount}
              onChange={(e) => setInitialAmount(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-300">
                Aporte Mensal (R$)
              </label>
              {availableBalance > 0 && (
                <button
                  type="button"
                  onClick={() => setMonthlyContribution(String(Math.floor(availableBalance * 0.5)))}
                  className="text-[10px] text-teal-400 hover:underline"
                >
                  Usar 50% do saldo ({formatCurrency(availableBalance * 0.5)})
                </button>
              )}
            </div>
            <input
              id="sim-monthly-contribution-input"
              type="number"
              step="50"
              min="0"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Rentabilidade (% do CDI)
            </label>
            <input
              id="sim-cdi-percent-input"
              type="number"
              step="1"
              min="10"
              value={cdiPercent}
              onChange={(e) => setCdiPercent(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Prazo em Meses: {durationMonths}m ({Math.round(durationMonths / 12)} anos)
            </label>
            <input
              id="sim-duration-months-range"
              type="range"
              min="6"
              max="120"
              step="6"
              value={durationMonths}
              onChange={(e) => setDurationMonths(parseInt(e.target.value, 10))}
              className="w-full accent-teal-400 cursor-pointer mt-2"
            />
          </div>
        </div>
      </div>

      {/* Chart: Growth over time */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Evolução do Patrimônio ao Longo dos Meses
          </h2>
          <span className="text-xs text-slate-400">Total Investido x Saldo Final</span>
        </div>

        <div className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
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
              <Line
                type="monotone"
                dataKey="total"
                name="Total Acumulado com Juros"
                stroke="#14B8A6"
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="investido"
                name="Valor Investido do Bolso"
                stroke="#94A3B8"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Preset Scenarios: 1, 2, 5, 10 years */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Cenários Comparativos no Tempo
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarios.map((sc) => (
            <div
              key={sc.years}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  {sc.years} {sc.years === 1 ? 'Ano' : 'Anos'} ({sc.months} meses)
                </span>
                <Calendar className="w-4 h-4 text-slate-400" />
              </div>

              <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(sc.estimatedTotal)}
              </p>

              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5 border-t border-slate-100 dark:border-slate-800 pt-2">
                <div className="flex justify-between">
                  <span>Investido:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {formatCurrency(sc.totalInvested)}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Juros gerados:</span>
                  <span className="font-bold">+{formatCurrency(sc.estimatedYield)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calculadora Reversa (Reverse Calculator) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Calculadora Reversa de Investimentos
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Descubra quanto precisa guardar por mês ou quanto tempo levará para atingir sua meta
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Option A: Quanto preciso por mês? */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              1. Para atingir uma meta em prazo fixo:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Meta Desejada (R$)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={reverseTarget}
                  onChange={(e) => setReverseTarget(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Prazo Desejado (meses)
                </label>
                <input
                  type="number"
                  min="3"
                  value={reverseMonths}
                  onChange={(e) => setReverseMonths(parseInt(e.target.value, 10) || 12)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                />
              </div>
            </div>

            <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 rounded-xl">
              <span className="text-[11px] text-teal-800 dark:text-teal-300 block">
                Você precisará investir mensalmente:
              </span>
              <span className="text-lg font-extrabold text-teal-700 dark:text-teal-400">
                {formatCurrency(requiredMonthly)} / mês
              </span>
            </div>
          </div>

          {/* Option B: Quanto tempo levarei? */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              2. Com um aporte mensal fixo, quanto tempo leva?
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Meta Desejada (R$)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={reverseTarget}
                  onChange={(e) => setReverseTarget(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Posso investir por mês (R$)
                </label>
                <input
                  type="number"
                  step="50"
                  value={reverseMonthlyCap}
                  onChange={(e) => setReverseMonthlyCap(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                />
              </div>
            </div>

            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl">
              <span className="text-[11px] text-indigo-800 dark:text-indigo-300 block">
                Tempo estimado para atingir a meta:
              </span>
              <span className="text-lg font-extrabold text-indigo-700 dark:text-indigo-400">
                {requiredMonthsToTarget} meses ({Math.floor(requiredMonthsToTarget / 12)} anos e{' '}
                {requiredMonthsToTarget % 12}m)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Educational CDI vs Selic Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-teal-500" />
          Entenda as Taxas de Mercado (CDI e Selic)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">O que é a Taxa Selic?</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              É a taxa básica de juros da economia brasileira, definida pelo Banco Central (Copom). Serve como referência para todas as outras taxas do país.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">O que é o CDI?</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              É a taxa praticada nos empréstimos diários entre bancos. Ela acompanha a Selic bem de perto (geralmente cerca de 0,10% abaixo da Selic). Um CDB de 120% do CDI rende 20% a mais que a taxa CDI padrão.
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
        <span className="font-bold block">Aviso Legal & Transparência:</span>
        <p className="leading-relaxed">
          Esta simulação utiliza modelos matemáticos de juros compostos com tributação teórica. Rentabilidade passada não representa garantia de rentabilidade futura. O valor real resgatado pode variar conforme a tributação do Imposto de Renda (tabela regressiva) e as oscilações da taxa CDI vigente ao longo do período.
        </p>
      </div>
    </div>
  );
};
