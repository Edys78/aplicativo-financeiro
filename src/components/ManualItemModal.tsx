import React, { useState, useEffect } from 'react';
import { X, Plus, DollarSign, Calendar, Tag, Layers, RefreshCw, Target, TrendingUp } from 'lucide-react';
import { Expense, Income, Investment, Goal, ExpenseType, RateType } from '../types';
import { DEFAULT_CATEGORIES, INCOME_CATEGORIES } from '../services/categoryService';
import { useFinancial } from '../context/FinancialContext';

export type ModalItemType = 'income' | 'expense' | 'investment' | 'goal';

interface ManualItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ModalItemType;
  editingItem?: any;
}

export const ManualItemModal: React.FC<ManualItemModalProps> = ({
  isOpen,
  onClose,
  type,
  editingItem,
}) => {
  const { addIncome, updateIncome, addExpense, updateExpense, addInvestment, addGoal, updateGoal } = useFinancial();

  // Form states
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [expenseType, setExpenseType] = useState<ExpenseType>('fixo');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [recurring, setRecurring] = useState(false);

  // Investment specific
  const [initialAmount, setInitialAmount] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [rate, setRate] = useState('120');
  const [rateType, setRateType] = useState<RateType>('cdi_percent');
  const [duration, setDuration] = useState('24');

  // Goal specific
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (editingItem) {
      setDescription(editingItem.description || editingItem.name || '');
      setAmount(editingItem.amount ? String(editingItem.amount) : '');
      setCategory(editingItem.category || (type === 'income' ? 'Salário' : 'Moradia'));
      setExpenseType(editingItem.type || 'fixo');
      setDate(editingItem.date || new Date().toISOString().split('T')[0]);
      setRecurring(Boolean(editingItem.recurring));

      if (type === 'investment') {
        setInitialAmount(String(editingItem.initialAmount || '0'));
        setMonthlyContribution(String(editingItem.monthlyContribution || '0'));
        setRate(String(editingItem.rate || '120'));
        setRateType(editingItem.rateType || 'cdi_percent');
        setDuration(String(editingItem.duration || '24'));
      }

      if (type === 'goal') {
        setTargetAmount(String(editingItem.targetAmount || ''));
        setCurrentAmount(String(editingItem.currentAmount || '0'));
        setDeadline(editingItem.deadline || '');
      }
    } else {
      setDescription('');
      setAmount('');
      setCategory(type === 'income' ? 'Salário' : 'Moradia');
      setExpenseType('fixo');
      setDate(new Date().toISOString().split('T')[0]);
      setRecurring(type === 'income' || expenseType === 'fixo');
      setInitialAmount('1000');
      setMonthlyContribution('200');
      setRate('120');
      setRateType('cdi_percent');
      setDuration('24');
      setTargetAmount('5000');
      setCurrentAmount('500');
      setDeadline('');
    }
  }, [editingItem, type, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'income') {
      const numAmount = parseFloat(amount) || 0;
      if (numAmount <= 0) return;

      if (editingItem?.id) {
        updateIncome(editingItem.id, {
          description: description.trim() || 'Renda',
          amount: numAmount,
          category,
          date,
          recurring,
        });
      } else {
        addIncome({
          description: description.trim() || 'Renda',
          amount: numAmount,
          category,
          date,
          recurring,
        });
      }
    } else if (type === 'expense') {
      const numAmount = parseFloat(amount) || 0;
      if (numAmount <= 0) return;

      if (editingItem?.id) {
        updateExpense(editingItem.id, {
          description: description.trim() || 'Despesa',
          amount: numAmount,
          category,
          type: expenseType,
          date,
          recurring,
        });
      } else {
        addExpense({
          description: description.trim() || 'Despesa',
          amount: numAmount,
          category,
          type: expenseType,
          date,
          recurring,
        });
      }
    } else if (type === 'investment') {
      addInvestment({
        description: description.trim() || 'Simulação de Investimento',
        initialAmount: parseFloat(initialAmount) || 0,
        monthlyContribution: parseFloat(monthlyContribution) || 0,
        rate: parseFloat(rate) || 120,
        rateType,
        duration: parseInt(duration, 10) || 12,
      });
    } else if (type === 'goal') {
      const numTarget = parseFloat(targetAmount) || 0;
      if (numTarget <= 0) return;

      if (editingItem?.id) {
        updateGoal(editingItem.id, {
          name: description.trim() || 'Objetivo',
          targetAmount: numTarget,
          currentAmount: parseFloat(currentAmount) || 0,
          deadline: deadline || new Date().toISOString().split('T')[0],
        });
      } else {
        addGoal({
          name: description.trim() || 'Objetivo',
          targetAmount: numTarget,
          currentAmount: parseFloat(currentAmount) || 0,
          deadline: deadline || new Date().toISOString().split('T')[0],
        });
      }
    }

    onClose();
  };

  const getTitle = () => {
    if (editingItem) return `Editar ${type === 'income' ? 'Renda' : type === 'expense' ? 'Gasto' : type === 'investment' ? 'Investimento' : 'Objetivo'}`;
    switch (type) {
      case 'income':
        return 'Adicionar Renda';
      case 'expense':
        return 'Adicionar Gasto';
      case 'investment':
        return 'Adicionar Investimento';
      case 'goal':
        return 'Novo Objetivo Financeiro';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            {type === 'income' && <DollarSign className="w-5 h-5 text-emerald-500" />}
            {type === 'expense' && <DollarSign className="w-5 h-5 text-rose-500" />}
            {type === 'investment' && <TrendingUp className="w-5 h-5 text-indigo-500" />}
            {type === 'goal' && <Target className="w-5 h-5 text-amber-500" />}
            {getTitle()}
          </h2>
          <button
            id="close-manual-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {type === 'goal' ? 'Nome do Objetivo' : 'Descrição'} *
            </label>
            <input
              id="manual-item-desc-input"
              type="text"
              required
              placeholder={type === 'income' ? 'Ex: Salário, Freelance' : type === 'expense' ? 'Ex: Aluguel, Supermercado' : type === 'goal' ? 'Ex: Viagem de Férias' : 'Ex: CDB 120% CDI'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Income & Expense Fields */}
          {(type === 'income' || type === 'expense') && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Valor (R$) *
                  </label>
                  <input
                    id="manual-item-amount-input"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Categoria
                  </label>
                  <select
                    id="manual-item-cat-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {type === 'income'
                      ? INCOME_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))
                      : DEFAULT_CATEGORIES.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {type === 'expense' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Tipo de Gasto
                    </label>
                    <select
                      id="manual-item-type-select"
                      value={expenseType}
                      onChange={(e) => setExpenseType(e.target.value as ExpenseType)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="fixo">Fixo (Aluguel, Luz, Internet...)</option>
                      <option value="variavel">Variável (Supermercado, Lazer...)</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Data
                  </label>
                  <input
                    id="manual-item-date-input"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    id="manual-item-recurring-check"
                    type="checkbox"
                    checked={recurring}
                    onChange={(e) => setRecurring(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  Repetir mensalmente (recorrente no planejamento)
                </label>
              </div>
            </>
          )}

          {/* Investment Fields */}
          {type === 'investment' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Valor Inicial (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Aporte Mensal (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Rentabilidade (% do CDI)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Prazo (meses)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="600"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Goal Fields */}
          {type === 'goal' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Meta Financeira (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Valor Já Acumulado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Data Limite Desejada
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              id="cancel-manual-item-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              id="save-manual-item-btn"
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Salvar Informação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
