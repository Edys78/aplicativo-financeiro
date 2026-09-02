import React, { useState } from 'react';
import { ParsedMovementItem, ExpenseType, MovementType } from '../types';
import { formatCurrency } from '../services/financialCalculations';
import { DEFAULT_CATEGORIES, INCOME_CATEGORIES } from '../services/categoryService';
import { Check, Edit2, Trash2, X, AlertCircle, Plus, Sparkles } from 'lucide-react';

interface HumanConfirmationModalProps {
  isOpen: boolean;
  items: ParsedMovementItem[];
  rawText?: string;
  onConfirm: (finalItems: ParsedMovementItem[]) => void;
  onCancel: () => void;
}

export const HumanConfirmationModal: React.FC<HumanConfirmationModalProps> = ({
  isOpen,
  items: initialItems,
  rawText,
  onConfirm,
  onCancel,
}) => {
  const [items, setItems] = useState<ParsedMovementItem[]>(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Sync when initialItems changes
  React.useEffect(() => {
    setItems(initialItems);
    setEditingId(null);
  }, [initialItems]);

  if (!isOpen) return null;

  const handleUpdateItem = (id: string, field: keyof ParsedMovementItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddNewItem = (type: MovementType) => {
    const newItem: ParsedMovementItem = {
      id: 'item_' + Date.now(),
      movementType: type,
      description: type === 'income' ? 'Nova Renda' : 'Novo Gasto',
      amount: 100,
      category: type === 'income' ? 'Salário' : 'Outros',
      type: 'variavel',
      date: new Date().toISOString().split('T')[0],
      recurring: false,
    };
    setItems((prev) => [...prev, newItem]);
    setEditingId(newItem.id);
  };

  const incomeItems = items.filter((i) => i.movementType === 'income');
  const expenseItems = items.filter((i) => i.movementType === 'expense');

  const totalIncome = incomeItems.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalExpense = expenseItems.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Encontrei estas informações
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Revise e confirme antes de salvar no seu planejamento
              </p>
            </div>
          </div>
          <button
            id="close-confirmation-modal-btn"
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {rawText && (
            <div className="p-3.5 bg-slate-100/70 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Texto interpretado:</span> "{rawText}"
            </div>
          )}

          {items.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                Nenhum valor foi identificado com clareza.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Você pode adicionar manualmente uma renda ou despesa usando os botões abaixo.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  id="add-manual-income-confirm-btn"
                  onClick={() => handleAddNewItem('income')}
                  className="px-3.5 py-2 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  + Adicionar Renda
                </button>
                <button
                  id="add-manual-expense-confirm-btn"
                  onClick={() => handleAddNewItem('expense')}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-lg hover:bg-rose-100 transition-colors"
                >
                  + Adicionar Despesa
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Rendas Section */}
              {incomeItems.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Renda ({incomeItems.length}) — Total: {formatCurrency(totalIncome)}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {incomeItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        isEditing={editingId === item.id}
                        onToggleEdit={() => setEditingId(editingId === item.id ? null : item.id)}
                        onUpdate={(field, val) => handleUpdateItem(item.id, field, val)}
                        onRemove={() => handleRemoveItem(item.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Despesas Section */}
              {expenseItems.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      Despesas ({expenseItems.length}) — Total: {formatCurrency(totalExpense)}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {expenseItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        isEditing={editingId === item.id}
                        onToggleEdit={() => setEditingId(editingId === item.id ? null : item.id)}
                        onUpdate={(field, val) => handleUpdateItem(item.id, field, val)}
                        onRemove={() => handleRemoveItem(item.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Quick Add helper buttons */}
          {items.length > 0 && (
            <div className="pt-2 flex items-center gap-2 text-xs">
              <button
                id="add-extra-income-btn"
                type="button"
                onClick={() => handleAddNewItem('income')}
                className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Incluir mais uma renda
              </button>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button
                id="add-extra-expense-btn"
                type="button"
                onClick={() => handleAddNewItem('expense')}
                className="flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Incluir mais um gasto
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            id="cancel-confirmation-btn"
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              id="confirm-all-items-btn"
              type="button"
              disabled={items.length === 0}
              onClick={() => onConfirm(items)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Confirmar tudo ({items.length} {items.length === 1 ? 'item' : 'itens'})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ItemCardProps {
  item: ParsedMovementItem;
  isEditing: boolean;
  onToggleEdit: () => void;
  onUpdate: (field: keyof ParsedMovementItem, value: any) => void;
  onRemove: () => void;
}

const ItemCard: React.FC<ItemCardProps> = ({
  item,
  isEditing,
  onToggleEdit,
  onUpdate,
  onRemove,
}) => {
  const isIncome = item.movementType === 'income';

  return (
    <div
      className={`rounded-xl border transition-all p-3.5 ${
        isEditing
          ? 'border-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-sm'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {!isEditing ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
                {item.description || 'Sem descrição'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                {item.category}
              </span>
              {!isIncome && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                    item.type === 'fixo'
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                  }`}
                >
                  {item.type || 'Variável'}
                </span>
              )}
              {item.recurring && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-medium">
                  Mensal
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Data: {item.date}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`font-bold text-sm sm:text-base ${
                isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {formatCurrency(item.amount)}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onToggleEdit}
                className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Editar item"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Remover item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Edit Mode Form */
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Descrição
              </label>
              <input
                type="text"
                value={item.description}
                onChange={(e) => onUpdate('description', e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={item.amount}
                onChange={(e) => onUpdate('amount', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Categoria
              </label>
              <select
                value={item.category}
                onChange={(e) => onUpdate('category', e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {isIncome
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

            {!isIncome && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Tipo
                </label>
                <select
                  value={item.type || 'variavel'}
                  onChange={(e) => onUpdate('type', e.target.value as ExpenseType)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="fixo">Fixo</option>
                  <option value="variavel">Variável</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Data
              </label>
              <input
                type="date"
                value={item.date}
                onChange={(e) => onUpdate('date', e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={item.recurring}
                onChange={(e) => onUpdate('recurring', e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              Repete todo mês (Recorrente)
            </label>

            <button
              type="button"
              onClick={onToggleEdit}
              className="px-3 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Concluir edição
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
