import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  PieChart,
  ShieldAlert,
  TrendingUp,
  Target,
  Bot,
  History,
  ShieldCheck,
  DollarSign,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency, formatPercent } from '../services/financialCalculations';

export type PageTab =
  | 'dashboard'
  | 'expenses'
  | 'incomes'
  | 'balance'
  | 'emergency'
  | 'investments'
  | 'goals'
  | 'assistant'
  | 'history'
  | 'privacy';

interface SidebarProps {
  activeTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { emergencyFund, emergencyFundTarget, emergencyFundProgress } = useFinancial();

  const navItems: Array<{ id: PageTab; label: string; icon: any; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Gastos', icon: Receipt },
    { id: 'incomes', label: 'Rendas', icon: Wallet },
    { id: 'balance', label: 'Organizar Saldo', icon: PieChart },
    { id: 'emergency', label: 'Reserva de Emergência', icon: ShieldAlert },
    { id: 'investments', label: 'Investimentos', icon: TrendingUp },
    { id: 'goals', label: 'Objetivos', icon: Target },
    { id: 'assistant', label: 'Assistente IA', icon: Bot, badge: 'IA' },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'privacy', label: 'Privacidade & Dados', icon: ShieldCheck },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 shrink-0 transition-colors">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-xs">
          <DollarSign className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Finance <span className="text-emerald-600">IA</span>
          </span>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-sm transition-colors ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Status da Reserva Widget (High Density Theme) */}
      <div
        onClick={() => onSelectTab('emergency')}
        className="mt-auto p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors"
      >
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
          Status da Reserva
        </p>
        <div className="flex justify-between items-center text-sm mb-1.5">
          <span className="font-medium text-slate-600 dark:text-slate-300">
            {formatPercent(emergencyFundProgress, 0)} Concluído
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
            {formatCurrency(emergencyFund.currentAmount || 0)}
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, emergencyFundProgress)}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
          Meta: {formatCurrency(emergencyFundTarget)}
        </p>
      </div>
    </aside>
  );
};
