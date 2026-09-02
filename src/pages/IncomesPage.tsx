import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Calendar,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '../services/financialCalculations';
import { Income } from '../types';

interface IncomesPageProps {
  onOpenManualModal: (type: 'income', item?: Income) => void;
  onOpenVoice: () => void;
}

export const IncomesPage: React.FC<IncomesPageProps> = ({
  onOpenManualModal,
  onOpenVoice,
}) => {
  const {
    monthlyIncomes,
    totalIncome,
    deleteIncome,
    duplicateIncome,
  } = useFinancial();

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-500" />
            Minhas Rendas & Entradas
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cadastre seus salários, comissões, rendas extras e trabalhos freelance
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="voice-add-income-page-btn"
            type="button"
            onClick={onOpenVoice}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
          >
            🎙️ Adicionar por Voz
          </button>
          <button
            id="manual-add-income-page-btn"
            type="button"
            onClick={() => onOpenManualModal('income')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Nova Renda
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            Renda Total do Mês Selecionado
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalIncome)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Base de cálculo para distribuição do saldo e planejamento das despesas.
          </p>
        </div>

        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300 max-w-sm">
          <span className="font-bold flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-4 h-4" /> Dica de Planejamento:
          </span>
          Mantenha sua renda recorrente atualizada para que suas projeções mensais permaneçam precisas.
        </div>
      </div>

      {/* Incomes List */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        {monthlyIncomes.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <DollarSign className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Nenhuma renda cadastrada neste mês.
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Clique em "Nova Renda" ou utilize o comando por voz para adicionar seu salário ou fonte de receita.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {monthlyIncomes.map((income) => (
              <div
                key={income.id}
                className="p-4 sm:px-6 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {income.description}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium">
                        {income.category}
                      </span>
                      {income.recurring && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-medium">
                          Mensal (Recorrente)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {income.date}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    +{formatCurrency(income.amount)}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => duplicateIncome(income.id)}
                      className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Duplicar renda"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenManualModal('income', income)}
                      className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Editar renda"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteIncome(income.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Excluir renda"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
