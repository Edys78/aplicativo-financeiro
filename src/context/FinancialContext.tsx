import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Income,
  Expense,
  Investment,
  Goal,
  EmergencyFund,
  FinancialSettings,
  BalanceDistribution,
  ChatMessage,
  CategoryDef,
  ThemeMode,
} from '../types';
import { storageService } from '../services/storageService';
import {
  calculateBalance,
  calculateCommittedPercentage,
} from '../services/financialCalculations';

interface FinancialContextType {
  incomes: Income[];
  expenses: Expense[];
  investments: Investment[];
  goals: Goal[];
  emergencyFund: EmergencyFund;
  balanceDistribution: BalanceDistribution;
  settings: FinancialSettings;
  categories: CategoryDef[];
  chatMessages: ChatMessage[];
  selectedMonth: string; // "YYYY-MM"
  setSelectedMonth: (month: string) => void;
  availableMonths: string[];

  // Computed for current selected month
  monthlyIncomes: Income[];
  monthlyExpenses: Expense[];
  totalIncome: number;
  totalExpenses: number;
  fixedExpenses: number;
  variableExpenses: number;
  essentialExpenses: number;
  availableBalance: number;
  committedPercentage: number;
  expensesByCategory: Record<string, number>;
  emergencyFundTarget: number;
  emergencyFundProgress: number;

  // Actions
  addIncome: (income: Omit<Income, 'id' | 'createdAt'>) => Income;
  updateIncome: (id: string, updated: Partial<Income>) => void;
  deleteIncome: (id: string) => void;
  duplicateIncome: (id: string) => void;

  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Expense;
  updateExpense: (id: string, updated: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  duplicateExpense: (id: string) => void;

  addInvestment: (inv: Omit<Investment, 'id' | 'createdAt'>) => Investment;
  deleteInvestment: (id: string) => void;

  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => Goal;
  updateGoal: (id: string, updated: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  updateEmergencyFund: (fund: EmergencyFund) => void;
  updateBalanceDistribution: (dist: BalanceDistribution) => void;
  updateSettings: (settings: Partial<FinancialSettings>) => void;
  setTheme: (theme: ThemeMode) => void;
  addCustomCategory: (cat: Omit<CategoryDef, 'id' | 'isDefault'>) => CategoryDef;

  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;

  loadDemoData: () => void;
  clearAllData: () => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incomes, setIncomes] = useState<Income[]>(() => storageService.getIncomes());
  const [expenses, setExpenses] = useState<Expense[]>(() => storageService.getExpenses());
  const [investments, setInvestments] = useState<Investment[]>(() => storageService.getInvestments());
  const [goals, setGoals] = useState<Goal[]>(() => storageService.getGoals());
  const [emergencyFund, setEmergencyFund] = useState<EmergencyFund>(() => storageService.getEmergencyFund());
  const [balanceDistribution, setBalanceDistribution] = useState<BalanceDistribution>(() => storageService.getBalanceDistribution());
  const [settings, setSettings] = useState<FinancialSettings>(() => storageService.getSettings());
  const [categories, setCategories] = useState<CategoryDef[]>(() => storageService.getCategories());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => storageService.getChatMessages());

  // Current active month in "YYYY-MM"
  const currentMonthKey = new Date().toISOString().substring(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);

  // Fetch economic rates from server on startup
  useEffect(() => {
    fetch('/api/economic-rates')
      .then((res) => res.json())
      .then((data) => {
        if (data.cdi && data.selic) {
          setSettings((prev) => {
            const updated = {
              ...prev,
              cdiRate: data.cdi,
              selicRate: data.selic,
              lastRateUpdate: data.referenceDate || prev.lastRateUpdate,
              rateSource: data.source || prev.rateSource,
            };
            storageService.saveSettings(updated);
            return updated;
          });
        }
      })
      .catch((err) => console.warn('Could not fetch economic rates:', err));
  }, []);

  // Theme synchronization
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Compute available months from incomes, expenses, plus current month
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    set.add(currentMonthKey);

    incomes.forEach((i) => {
      if (i.date) set.add(i.date.substring(0, 7));
    });
    expenses.forEach((e) => {
      if (e.date) set.add(e.date.substring(0, 7));
    });

    return Array.from(set).sort().reverse();
  }, [incomes, expenses, currentMonthKey]);

  // Filter items by selectedMonth or recurring items
  const monthlyIncomes = useMemo(() => {
    return incomes.filter((i) => (i.date && i.date.startsWith(selectedMonth)) || i.recurring);
  }, [incomes, selectedMonth]);

  const monthlyExpenses = useMemo(() => {
    return expenses.filter((e) => (e.date && e.date.startsWith(selectedMonth)) || e.recurring);
  }, [expenses, selectedMonth]);

  // Computations
  const totalIncome = useMemo(() => {
    return monthlyIncomes.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [monthlyIncomes]);

  const totalExpenses = useMemo(() => {
    return monthlyExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [monthlyExpenses]);

  const fixedExpenses = useMemo(() => {
    return monthlyExpenses
      .filter((e) => e.type === 'fixo')
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [monthlyExpenses]);

  const variableExpenses = useMemo(() => {
    return monthlyExpenses
      .filter((e) => e.type === 'variavel')
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [monthlyExpenses]);

  // Essential expenses (fixed expenses or essential categories)
  const essentialExpenses = useMemo(() => {
    const essential = monthlyExpenses
      .filter(
        (e) =>
          e.type === 'fixo' ||
          ['moradia', 'alimentação', 'água', 'energia', 'saúde', 'internet', 'transporte'].includes(
            e.category.toLowerCase()
          )
      )
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);
    return essential || fixedExpenses || totalExpenses;
  }, [monthlyExpenses, fixedExpenses, totalExpenses]);

  const availableBalance = useMemo(() => {
    return calculateBalance(totalIncome, totalExpenses);
  }, [totalIncome, totalExpenses]);

  const committedPercentage = useMemo(() => {
    return calculateCommittedPercentage(totalIncome, totalExpenses);
  }, [totalIncome, totalExpenses]);

  const expensesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    monthlyExpenses.forEach((e) => {
      const cat = e.category || 'Outros';
      map[cat] = (map[cat] || 0) + (e.amount || 0);
    });
    return map;
  }, [monthlyExpenses]);

  const emergencyFundTarget = useMemo(() => {
    const baseEssential = emergencyFund.essentialExpenses > 0 ? emergencyFund.essentialExpenses : essentialExpenses;
    return baseEssential * (emergencyFund.monthsTarget || 6);
  }, [emergencyFund, essentialExpenses]);

  const emergencyFundProgress = useMemo(() => {
    if (emergencyFundTarget <= 0) return 0;
    return Math.min(100, (emergencyFund.currentAmount / emergencyFundTarget) * 100);
  }, [emergencyFund.currentAmount, emergencyFundTarget]);

  // CRUD Actions
  const addIncome = (incomeData: Omit<Income, 'id' | 'createdAt'>) => {
    const created = storageService.addIncome(incomeData);
    setIncomes(storageService.getIncomes());
    return created;
  };

  const updateIncome = (id: string, updated: Partial<Income>) => {
    storageService.updateIncome(id, updated);
    setIncomes(storageService.getIncomes());
  };

  const deleteIncome = (id: string) => {
    storageService.deleteIncome(id);
    setIncomes(storageService.getIncomes());
  };

  const duplicateIncome = (id: string) => {
    storageService.duplicateIncome(id);
    setIncomes(storageService.getIncomes());
  };

  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const created = storageService.addExpense(expenseData);
    setExpenses(storageService.getExpenses());
    return created;
  };

  const updateExpense = (id: string, updated: Partial<Expense>) => {
    storageService.updateExpense(id, updated);
    setExpenses(storageService.getExpenses());
  };

  const deleteExpense = (id: string) => {
    storageService.deleteExpense(id);
    setExpenses(storageService.getExpenses());
  };

  const duplicateExpense = (id: string) => {
    storageService.duplicateExpense(id);
    setExpenses(storageService.getExpenses());
  };

  const addInvestment = (invData: Omit<Investment, 'id' | 'createdAt'>) => {
    const created = storageService.addInvestment(invData);
    setInvestments(storageService.getInvestments());
    return created;
  };

  const deleteInvestment = (id: string) => {
    storageService.deleteInvestment(id);
    setInvestments(storageService.getInvestments());
  };

  const addGoal = (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    const created = storageService.addGoal(goalData);
    setGoals(storageService.getGoals());
    return created;
  };

  const updateGoal = (id: string, updated: Partial<Goal>) => {
    storageService.updateGoal(id, updated);
    setGoals(storageService.getGoals());
  };

  const deleteGoal = (id: string) => {
    storageService.deleteGoal(id);
    setGoals(storageService.getGoals());
  };

  const updateEmergencyFund = (fund: EmergencyFund) => {
    storageService.saveEmergencyFund(fund);
    setEmergencyFund(fund);
  };

  const updateBalanceDistribution = (dist: BalanceDistribution) => {
    storageService.saveBalanceDistribution(dist);
    setBalanceDistribution(dist);
  };

  const updateSettings = (partial: Partial<FinancialSettings>) => {
    const next = { ...settings, ...partial };
    storageService.saveSettings(next);
    setSettings(next);
  };

  const setTheme = (theme: ThemeMode) => {
    updateSettings({ theme });
  };

  const addCustomCategory = (catData: Omit<CategoryDef, 'id' | 'isDefault'>) => {
    const created = storageService.addCustomCategory(catData);
    setCategories(storageService.getCategories());
    return created;
  };

  const addChatMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    const updated = [...chatMessages, newMsg];
    setChatMessages(updated);
    storageService.saveChatMessages(updated);
  };

  const clearChat = () => {
    storageService.saveChatMessages([]);
    setChatMessages([]);
  };

  const loadDemoData = () => {
    storageService.loadDemoData();
    setIncomes(storageService.getIncomes());
    setExpenses(storageService.getExpenses());
    setGoals(storageService.getGoals());
    setInvestments(storageService.getInvestments());
    setEmergencyFund(storageService.getEmergencyFund());
  };

  const clearAllData = () => {
    storageService.clearAllData();
    setIncomes([]);
    setExpenses([]);
    setInvestments([]);
    setGoals([]);
    setEmergencyFund(storageService.getEmergencyFund());
    setBalanceDistribution(storageService.getBalanceDistribution());
    setChatMessages([]);
  };

  return (
    <FinancialContext.Provider
      value={{
        incomes,
        expenses,
        investments,
        goals,
        emergencyFund,
        balanceDistribution,
        settings,
        categories,
        chatMessages,
        selectedMonth,
        setSelectedMonth,
        availableMonths,

        monthlyIncomes,
        monthlyExpenses,
        totalIncome,
        totalExpenses,
        fixedExpenses,
        variableExpenses,
        essentialExpenses,
        availableBalance,
        committedPercentage,
        expensesByCategory,
        emergencyFundTarget,
        emergencyFundProgress,

        addIncome,
        updateIncome,
        deleteIncome,
        duplicateIncome,

        addExpense,
        updateExpense,
        deleteExpense,
        duplicateExpense,

        addInvestment,
        deleteInvestment,

        addGoal,
        updateGoal,
        deleteGoal,

        updateEmergencyFund,
        updateBalanceDistribution,
        updateSettings,
        setTheme,
        addCustomCategory,

        addChatMessage,
        clearChat,

        loadDemoData,
        clearAllData,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = (): FinancialContextType => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
