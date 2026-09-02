import React, { useState } from 'react';
import { Plus, Mic, DollarSign, Receipt, TrendingUp, Target, X } from 'lucide-react';
import { ModalItemType } from './ManualItemModal';

interface FloatingActionButtonProps {
  onOpenVoice: () => void;
  onOpenManualModal: (type: ModalItemType) => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onOpenVoice,
  onOpenManualModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 lg:bottom-8 right-5 sm:right-8 z-40">
      {/* Sub menu items */}
      {isOpen && (
        <div className="flex flex-col items-end gap-2.5 mb-3 animate-fade-in">
          <button
            id="fab-voice-btn"
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenVoice();
            }}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-transform hover:scale-105 text-xs font-semibold"
          >
            <span>🎙️ Falar com assistente</span>
            <Mic className="w-4 h-4" />
          </button>

          <button
            id="fab-add-expense-btn"
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenManualModal('expense');
            }}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-700 shadow-lg hover:bg-rose-50 dark:hover:bg-slate-700 transition-transform hover:scale-105 text-xs font-semibold"
          >
            <span>Adicionar gasto</span>
            <Receipt className="w-4 h-4" />
          </button>

          <button
            id="fab-add-income-btn"
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenManualModal('income');
            }}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 shadow-lg hover:bg-emerald-50 dark:hover:bg-slate-700 transition-transform hover:scale-105 text-xs font-semibold"
          >
            <span>Adicionar renda</span>
            <DollarSign className="w-4 h-4" />
          </button>

          <button
            id="fab-add-invest-btn"
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenManualModal('investment');
            }}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 shadow-lg hover:bg-indigo-50 dark:hover:bg-slate-700 transition-transform hover:scale-105 text-xs font-semibold"
          >
            <span>Adicionar investimento</span>
            <TrendingUp className="w-4 h-4" />
          </button>

          <button
            id="fab-add-goal-btn"
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenManualModal('goal');
            }}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-700 shadow-lg hover:bg-amber-50 dark:hover:bg-slate-700 transition-transform hover:scale-105 text-xs font-semibold"
          >
            <span>Criar objetivo</span>
            <Target className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Action trigger */}
      <button
        id="main-fab-toggle-btn"
        type="button"
        aria-label="Ações Rápidas"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all duration-200 ${
          isOpen
            ? 'bg-slate-800 dark:bg-slate-700 rotate-45'
            : 'bg-emerald-600 hover:bg-emerald-700 hover:scale-105 active:scale-95 shadow-emerald-600/30'
        }`}
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
};
