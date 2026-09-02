import React, { useState } from 'react';
import {
  Target,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency, formatPercent } from '../services/financialCalculations';
import { Goal } from '../types';

interface GoalsPageProps {
  onOpenManualModal: (type: 'goal', item?: Goal) => void;
}

export const GoalsPage: React.FC<GoalsPageProps> = ({ onOpenManualModal }) => {
  const { goals, deleteGoal, updateGoal } = useFinancial();

  // Helper to calculate months until deadline
  const getMonthsUntil = (deadlineStr?: string) => {
    if (!deadlineStr) return 12;
    const now = new Date();
    const target = new Date(deadlineStr);
    const months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
    return Math.max(1, months);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-amber-500" />
            Objetivos Financeiros
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Acompanhe o progresso das suas conquistas: viagens, compras planejadas, cursos e sonhos
          </p>
        </div>

        <button
          id="add-goal-page-btn"
          type="button"
          onClick={() => onOpenManualModal('goal')}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Novo Objetivo
        </button>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-12 text-center space-y-3">
          <Target className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Você ainda não possui objetivos cadastrados.
          </p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Defina uma meta (ex: Viagem de Férias, Carro Novo, Especialização) para acompanhar o ritmo necessário de economia mensal.
          </p>
          <button
            type="button"
            onClick={() => onOpenManualModal('goal')}
            className="px-4 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl hover:bg-amber-100 transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Criar Meu Primeiro Objetivo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const target = goal.targetAmount || 1;
            const current = goal.currentAmount || 0;
            const progress = Math.min(100, (current / target) * 100);
            const remaining = Math.max(0, target - current);
            const monthsLeft = getMonthsUntil(goal.deadline);
            const neededPerMonth = remaining > 0 ? remaining / monthsLeft : 0;
            const isCompleted = current >= target;

            return (
              <div
                key={goal.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {goal.name}
                      </h3>
                      {goal.deadline && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" /> Meta para: {goal.deadline} ({monthsLeft} meses)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onOpenManualModal('goal', goal)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Editar objetivo"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteGoal(goal.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Excluir objetivo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">
                      {formatCurrency(current)} de {formatCurrency(target)}
                    </span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      {formatPercent(progress, 0)}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Status & Plan calculation */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
                  {isCompleted ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Objetivo Alcançado! Parabéns!
                    </span>
                  ) : (
                    <>
                      <span className="text-slate-500 dark:text-slate-400">
                        Faltam <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(remaining)}</strong>
                      </span>
                      <span className="text-amber-700 dark:text-amber-300 font-semibold">
                        ~{formatCurrency(neededPerMonth)} / mês
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
