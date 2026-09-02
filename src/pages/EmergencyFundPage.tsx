import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Save,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency, formatPercent } from '../services/financialCalculations';

export const EmergencyFundPage: React.FC = () => {
  const {
    emergencyFund,
    updateEmergencyFund,
    essentialExpenses,
    totalExpenses,
  } = useFinancial();

  const [monthsTarget, setMonthsTarget] = useState<number>(emergencyFund.monthsTarget || 6);
  const [essentialCost, setEssentialCost] = useState<string>(
    String(emergencyFund.essentialExpenses || essentialExpenses || totalExpenses || 1000)
  );
  const [currentAmount, setCurrentAmount] = useState<string>(
    String(emergencyFund.currentAmount || 0)
  );
  const [savedNotice, setSavedNotice] = useState(false);

  const numEssential = parseFloat(essentialCost) || 0;
  const numCurrent = parseFloat(currentAmount) || 0;
  const targetTotal = numEssential * monthsTarget;
  const remaining = Math.max(0, targetTotal - numCurrent);
  const progressPercent = targetTotal > 0 ? Math.min(100, (numCurrent / targetTotal) * 100) : 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmergencyFund({
      essentialExpenses: numEssential,
      monthsTarget,
      currentAmount: numCurrent,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleUseCurrentEssential = () => {
    setEssentialCost(String(essentialExpenses || totalExpenses));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-amber-500" />
          Reserva de Emergência
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Sua rede de proteção contra imprevistos, despesas médicas ou perda de renda
        </p>
      </div>

      {/* Main Target & Progress Dashboard */}
      <div className="p-6 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
              Meta Total da Reserva ({monthsTarget} meses)
            </span>
            <p className="text-3xl sm:text-4xl font-black mt-1">
              {formatCurrency(targetTotal)}
            </p>
            <p className="text-xs text-amber-100 mt-1">
              Base: {formatCurrency(numEssential)} de gastos essenciais/mês
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-md px-4 py-3 rounded-xl text-right">
            <span className="text-xs text-amber-100 block">Valor Já Guardado</span>
            <span className="text-xl font-bold">{formatCurrency(numCurrent)}</span>
            <span className="text-xs text-amber-200 block mt-0.5">
              Faltam {formatCurrency(remaining)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-100">
            <span>Progresso da Reserva</span>
            <span>{formatPercent(progressPercent, 1)}</span>
          </div>
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Configurar Parâmetros da Reserva
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Essential Expenses */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Gastos Essenciais Mensais (R$)
                </label>
                {essentialExpenses > 0 && (
                  <button
                    type="button"
                    onClick={handleUseCurrentEssential}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                  >
                    Usar do mês ({formatCurrency(essentialExpenses)})
                  </button>
                )}
              </div>
              <input
                id="emergency-essential-cost-input"
                type="number"
                step="0.01"
                min="0"
                required
                value={essentialCost}
                onChange={(e) => setEssentialCost(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
              />
            </div>

            {/* Current Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Quanto Você Já Tem Guardado (R$)
              </label>
              <input
                id="emergency-current-amount-input"
                type="number"
                step="0.01"
                min="0"
                required
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
              />
            </div>
          </div>

          {/* Months Target Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Tamanho Desejado da Reserva
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { months: 3, label: '3 Meses', desc: 'Para quem tem renda muito estável / CLT consolidada' },
                { months: 6, label: '6 Meses (Recomendado)', desc: 'Equilíbrio ideal entre segurança e liquidez' },
                { months: 12, label: '12 Meses', desc: 'Autônomos, freelancers e empreendedores' },
              ].map((opt) => (
                <button
                  key={opt.months}
                  type="button"
                  onClick={() => setMonthsTarget(opt.months)}
                  className={`p-3.5 rounded-xl text-left border transition-all ${
                    monthsTarget === opt.months
                      ? 'border-amber-500 bg-amber-50/30 dark:bg-amber-950/30 text-slate-900 dark:text-white ring-2 ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold block">{opt.label}</span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block leading-tight">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              id="save-emergency-fund-btn"
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/20 transition-all flex items-center gap-2"
            >
              {savedNotice ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Configuração Salva!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Salvar Meta da Reserva
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Practical Guide */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Onde Guardar a Reserva de Emergência?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">1. Liquidez Diária</span>
            <p className="text-[11px] text-slate-400">
              O dinheiro deve estar disponível para resgate imediato a qualquer dia e horário.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">2. Baixo Risco (100% a 120% CDI)</span>
            <p className="text-[11px] text-slate-400">
              CDBs com garantia do FGC ou Tesouro Selic que rendem mais que a poupança sem oscilações bruscas.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">3. Não Misturar</span>
            <p className="text-[11px] text-slate-400">
              Mantenha o valor separado da sua conta corrente diária para evitar gastar em impulsos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
