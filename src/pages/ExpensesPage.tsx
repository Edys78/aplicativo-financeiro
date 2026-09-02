import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  Plus,
  Trash2,
  Edit2,
  Copy,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '../services/financialCalculations';
import { Expense } from '../types';
import { getCategoryColor } from '../services/categoryService';

interface ExpensesPageProps {
  onOpenManualModal: (type: 'expense', item?: Expense) => void;
  onOpenVoice: () => void;
}

export const ExpensesPage: React.FC<ExpensesPageProps> = ({
  onOpenManualModal,
  onOpenVoice,
}) => {
  const {
    monthlyExpenses,
    totalExpenses,
    fixedExpenses,
    variableExpenses,
    deleteExpense,
    duplicateExpense,
    categories,
  } = useFinancial();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedType, setSelectedType] = useState<'ALL' | 'fixo' | 'variavel'>('ALL');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    let list = [...monthlyExpenses];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'ALL') {
      list = list.filter((e) => e.category === selectedCategory);
    }

    if (selectedType !== 'ALL') {
      list = list.filter((e) => e.type === selectedType);
    }

    list.sort((a, b) => {
      if (sortBy === 'date_desc') return b.date.localeCompare(a.date);
      if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
      if (sortBy === 'amount_desc') return b.amount - a.amount;
      if (sortBy === 'amount_asc') return a.amount - b.amount;
      return 0;
    });

    return list;
  }, [monthlyExpenses, searchQuery, selectedCategory, selectedType, sortBy]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-rose-500" />
            Controle de Gastos
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organize, filtre e categorize suas despesas fixas e variáveis
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="voice-add-expense-page-btn"
            type="button"
            onClick={onOpenVoice}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
          >
            🎙️ Adicionar por Voz
          </button>
          <button
            id="manual-add-expense-page-btn"
            type="button"
            onClick={() => onOpenManualModal('expense')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Novo Gasto
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Total em Gastos
          </span>
          <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(totalExpenses)}
          </p>
          <span className="text-[11px] text-slate-400">
            {monthlyExpenses.length} lançamentos no mês
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Despesas Fixas
          </span>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {formatCurrency(fixedExpenses)}
          </p>
          <span className="text-[11px] text-blue-500 font-medium">
            Aluguel, contas essenciais e assinaturas
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Despesas Variáveis
          </span>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {formatCurrency(variableExpenses)}
          </p>
          <span className="text-[11px] text-amber-500 font-medium">
            Supermercado, lazer, transporte pontual
          </span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search text */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="expense-search-input"
              type="text"
              placeholder="Buscar gasto por nome ou categoria..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              id="expense-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="ALL">Todas as categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <select
            id="expense-type-filter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="ALL">Todos os tipos (Fixo e Variável)</option>
            <option value="fixo">Apenas Fixos</option>
            <option value="variavel">Apenas Variáveis</option>
          </select>

          {/* Sort order */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              id="expense-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="date_desc">Mais recentes primeiro</option>
              <option value="date_asc">Mais antigos primeiro</option>
              <option value="amount_desc">Maior valor primeiro</option>
              <option value="amount_asc">Menor valor primeiro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expenses List / Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Nenhuma despesa encontrada.
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'ALL' || selectedType !== 'ALL'
                ? 'Tente alterar os filtros de busca para visualizar outros registros.'
                : 'Toque no botão "Novo Gasto" ou use o microfone para adicionar seu primeiro lançamento.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredExpenses.map((expense) => {
              const catColor = getCategoryColor(expense.category);
              return (
                <div
                  key={expense.id}
                  className="p-4 sm:px-6 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 text-xs shadow-xs"
                      style={{ backgroundColor: catColor }}
                    >
                      {expense.category.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {expense.description}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                          {expense.category}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            expense.type === 'fixo'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                          }`}
                        >
                          {expense.type}
                        </span>
                        {expense.recurring && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-medium">
                            Mensal
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {expense.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                      {formatCurrency(expense.amount)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => duplicateExpense(expense.id)}
                        className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Duplicar gasto"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenManualModal('expense', expense)}
                        className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Editar gasto"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteExpense(expense.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Excluir gasto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
