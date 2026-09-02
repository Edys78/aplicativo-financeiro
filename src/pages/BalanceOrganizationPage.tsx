import React, { useState } from 'react';
import {
  PieChart,
  TrendingUp,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  AlertCircle,
  Check,
  RefreshCw,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency, formatPercent } from '../services/financialCalculations';

export const BalanceOrganizationPage: React.FC = () => {
  const {
    availableBalance,
    balanceDistribution,
    updateBalanceDistribution,
  } = useFinancial();

  const [investPct, setInvestPct] = useState(balanceDistribution.investmentsPercent);
  const [emergencyPct, setEmergencyPct] = useState(balanceDistribution.emergencyOrGoalsPercent);
  const [flexiblePct, setFlexiblePct] = useState(balanceDistribution.flexiblePercent);
  const [isSaved, setIsSaved] = useState(false);

  const totalPct = investPct + emergencyPct + flexiblePct;
  const isValid = totalPct === 100;

  // Real amounts based on available balance
  const balanceSafe = Math.max(0, availableBalance);
  const investAmount = (balanceSafe * investPct) / 100;
  const emergencyAmount = (balanceSafe * emergencyPct) / 100;
  const flexibleAmount = (balanceSafe * flexiblePct) / 100;

  const handleSave = () => {
    if (!isValid) return;
    updateBalanceDistribution({
      investmentsPercent: investPct,
      emergencyOrGoalsPercent: emergencyPct,
      flexiblePercent: flexiblePct,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset503020 = () => {
    setInvestPct(50);
    setEmergencyPct(30);
    setFlexiblePct(20);
  };

  const handleReset702010 = () => {
    setInvestPct(40);
    setEmergencyPct(40);
    setFlexiblePct(20);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <PieChart className="w-6 h-6 text-indigo-500" />
          Como Organizar Seu Saldo
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Distribua a sobra do seu mês de forma inteligente e personalizada
        </p>
      </div>

      {/* Available Balance Highlight */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wider block">
            Saldo Disponível para Distribuição
          </span>
          <p className="text-3xl font-extrabold text-white mt-1">
            {formatCurrency(availableBalance)}
          </p>
          <p className="text-xs text-slate-300 mt-1">
            {availableBalance > 0
              ? 'Valor líquido livre após quitar todas as despesas cadastradas do mês.'
              : 'Dica: quando sua renda superar suas despesas, o valor excedente será distribuído aqui.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset503020}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
          >
            Padrão 50 / 30 / 20
          </button>
          <button
            type="button"
            onClick={handleReset702010}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
          >
            Foco em Reserva 40 / 40 / 20
          </button>
        </div>
      </div>

      {/* Distribution Sliders */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Ajustar Porcentagens
          </h2>
          <div
            className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
              isValid
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
            }`}
          >
            {isValid ? (
              <>
                <Check className="w-3.5 h-3.5" /> Total: 100% (Válido)
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5" /> Total: {totalPct}% (Deve somar 100%)
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* 1. Investimentos */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Investimentos (Construção de Patrimônio)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Aplicações em CDB 120% do CDI, Tesouro Direto ou Renda Fixa
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 block">
                  {formatPercent(investPct, 0)}
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {formatCurrency(investAmount)}
                </span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={investPct}
              onChange={(e) => setInvestPct(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* 2. Reserva ou Objetivos */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Reserva de Emergência / Metas Específicas
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Segurança para imprevistos e projetos com data marcada
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 block">
                  {formatPercent(emergencyPct, 0)}
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {formatCurrency(emergencyAmount)}
                </span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={emergencyPct}
              onChange={(e) => setEmergencyPct(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* 3. Gastos Flexíveis */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Gastos Flexíveis & Lazer Planejado
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Liberdade para compras pessoais sem culpa e sem comprometer o futuro
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400 block">
                  {formatPercent(flexiblePct, 0)}
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {formatCurrency(flexibleAmount)}
                </span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={flexiblePct}
              onChange={(e) => setFlexiblePct(parseInt(e.target.value, 10))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="pt-2 flex items-center justify-end">
          <button
            id="save-balance-distribution-btn"
            type="button"
            disabled={!isValid}
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" /> Distribuição Salva!
              </>
            ) : (
              <>Salvar Minha Estratégia</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
