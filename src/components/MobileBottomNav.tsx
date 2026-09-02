import React from 'react';
import { LayoutDashboard, Receipt, Wallet, TrendingUp, Bot } from 'lucide-react';
import { PageTab } from './Sidebar';

interface MobileBottomNavProps {
  activeTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onSelectTab }) => {
  const mainItems: Array<{ id: PageTab; label: string; icon: any }> = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'expenses', label: 'Gastos', icon: Receipt },
    { id: 'incomes', label: 'Rendas', icon: Wallet },
    { id: 'investments', label: 'Investir', icon: TrendingUp },
    { id: 'assistant', label: 'Assistente', icon: Bot },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 transition-colors">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
