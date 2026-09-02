import React, { useState } from 'react';
import { Sparkles, Mic, Sun, Moon, Laptop, Calendar, ShieldCheck, Database, Search } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { parseFinancialTextWithAI } from '../services/aiService';

interface NavbarProps {
  onOpenVoiceInput: () => void;
  onNavigateToPrivacy: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenVoiceInput, onNavigateToPrivacy }) => {
  const {
    settings,
    setTheme,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    loadDemoData,
    incomes,
    expenses,
    addIncome,
    addExpense,
  } = useFinancial();
  const [quickInput, setQuickInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper to format "YYYY-MM" to readable "Mês YYYY"
  const formatMonthLabel = (mKey: string) => {
    try {
      const [year, month] = mKey.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      const label = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      return label.charAt(0).toUpperCase() + label.slice(1);
    } catch {
      return mKey;
    }
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) {
      onOpenVoiceInput();
      return;
    }

    try {
      setIsProcessing(true);
      const parsed = await parseFinancialTextWithAI(quickInput);

      if (parsed.income && parsed.income.length > 0) {
        parsed.income.forEach((inc) => {
          addIncome({
            description: inc.description,
            amount: inc.amount,
            category: inc.category || 'Salário',
            recurring: !!inc.recurring,
            date: inc.date || new Date().toISOString().split('T')[0],
          });
        });
      }

      if (parsed.expenses && parsed.expenses.length > 0) {
        parsed.expenses.forEach((exp) => {
          addExpense({
            description: exp.description,
            amount: exp.amount,
            category: exp.category || 'Outros',
            type: exp.type || 'variavel',
            recurring: !!exp.recurring,
            date: exp.date || new Date().toISOString().split('T')[0],
          });
        });
      }

      setQuickInput('');
    } catch (err) {
      console.error('Erro ao processar texto:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const hasNoData = incomes.length === 0 && expenses.length === 0;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Mobile Brand / Icon for small screens */}
        <div className="flex lg:hidden items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
            F
          </div>
          <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
            Finance <span className="text-emerald-600">IA</span>
          </span>
        </div>

        {/* Center: High Density Natural Language Bar */}
        <form
          onSubmit={handleQuickSubmit}
          className="flex-1 max-w-2xl relative flex items-center hidden sm:flex"
        >
          <div className="relative w-full">
            <input
              id="header-natural-input"
              type="text"
              value={quickInput}
              disabled={isProcessing}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder={isProcessing ? "Interpretando dados..." : "Digite ou fale: 'Recebi 3500 de salário e paguei 900 de aluguel'..."}
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-2 pl-10 pr-12 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-60"
            />
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="button"
              onClick={onOpenVoiceInput}
              aria-label="Gravar áudio com IA"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Month Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 mr-1.5" />
            <select
              id="global-month-selector"
              aria-label="Selecionar Mês de Referência"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {availableMonths.map((mKey) => (
                <option key={mKey} value={mKey} className="bg-white dark:bg-slate-900">
                  {formatMonthLabel(mKey)}
                </option>
              ))}
            </select>
          </div>

          {hasNoData && (
            <button
              id="load-demo-data-btn"
              type="button"
              onClick={loadDemoData}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 transition-colors"
              title="Carregar dados de demonstração para testar todas as telas"
            >
              <Database className="w-3.5 h-3.5" />
              Dados Exemplo
            </button>
          )}

          {/* Quick Voice trigger for mobile */}
          <button
            id="navbar-voice-trigger-btn"
            type="button"
            onClick={onOpenVoiceInput}
            className="sm:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-sm transition-all"
            title="Falar ou digitar movimentação"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Theme Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              id="theme-light-btn"
              type="button"
              aria-label="Modo Claro"
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-lg transition-colors ${
                settings.theme === 'light'
                  ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              id="theme-dark-btn"
              type="button"
              aria-label="Modo Escuro"
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-lg transition-colors ${
                settings.theme === 'dark'
                  ? 'bg-white dark:bg-slate-700 text-indigo-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              id="theme-system-btn"
              type="button"
              aria-label="Modo Automático"
              onClick={() => setTheme('system')}
              className={`p-1.5 rounded-lg transition-colors ${
                settings.theme === 'system'
                  ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User Profile Badge */}
          <button
            id="navbar-privacy-btn"
            type="button"
            onClick={onNavigateToPrivacy}
            className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center hover:ring-2 hover:ring-emerald-400 transition-all"
            title="Meu Perfil & Privacidade"
          >
            IA
          </button>
        </div>
      </div>
    </header>
  );
};
