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
} from '../types';
import { DEFAULT_CATEGORIES } from './categoryService';

const STORAGE_KEYS = {
  INCOMES: 'finance_ia_incomes_v1',
  EXPENSES: 'finance_ia_expenses_v1',
  INVESTMENTS: 'finance_ia_investments_v1',
  GOALS: 'finance_ia_goals_v1',
  EMERGENCY_FUND: 'finance_ia_emergency_fund_v1',
  BALANCE_DISTRIBUTION: 'finance_ia_balance_distribution_v1',
  SETTINGS: 'finance_ia_settings_v1',
  CUSTOM_CATEGORIES: 'finance_ia_custom_categories_v1',
  CHAT_MESSAGES: 'finance_ia_chat_messages_v1',
  ONBOARDING_COMPLETED: 'finance_ia_onboarding_completed_v1',
};

const DEFAULT_SETTINGS: FinancialSettings = {
  currency: 'BRL',
  theme: 'system',
  cdiRate: 10.65,
  selicRate: 10.75,
  lastRateUpdate: '01/09/2026',
  rateSource: 'B3 / Banco Central do Brasil',
};

const DEFAULT_EMERGENCY_FUND: EmergencyFund = {
  essentialExpenses: 0,
  monthsTarget: 6,
  currentAmount: 0,
};

const DEFAULT_BALANCE_DISTRIBUTION: BalanceDistribution = {
  investmentsPercent: 50,
  emergencyOrGoalsPercent: 30,
  flexiblePercent: 20,
};

// Storage Service Class provides clean abstraction
class StorageService {
  // Incomes
  getIncomes(): Income[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INCOMES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveIncomes(incomes: Income[]): void {
    localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes));
  }

  addIncome(income: Omit<Income, 'id' | 'createdAt'>): Income {
    const incomes = this.getIncomes();
    const newIncome: Income = {
      ...income,
      id: 'inc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
    };
    incomes.unshift(newIncome);
    this.saveIncomes(incomes);
    return newIncome;
  }

  updateIncome(id: string, updated: Partial<Income>): Income | null {
    const incomes = this.getIncomes();
    const index = incomes.findIndex((i) => i.id === id);
    if (index === -1) return null;
    incomes[index] = { ...incomes[index], ...updated };
    this.saveIncomes(incomes);
    return incomes[index];
  }

  deleteIncome(id: string): void {
    const incomes = this.getIncomes().filter((i) => i.id !== id);
    this.saveIncomes(incomes);
  }

  duplicateIncome(id: string): Income | null {
    const incomes = this.getIncomes();
    const found = incomes.find((i) => i.id === id);
    if (!found) return null;
    return this.addIncome({
      description: `${found.description} (Cópia)`,
      amount: found.amount,
      category: found.category,
      date: new Date().toISOString().split('T')[0],
      recurring: found.recurring,
    });
  }

  // Expenses
  getExpenses(): Expense[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveExpenses(expenses: Expense[]): void {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }

  addExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Expense {
    const expenses = this.getExpenses();
    const newExpense: Expense = {
      ...expense,
      id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
    };
    expenses.unshift(newExpense);
    this.saveExpenses(expenses);
    return newExpense;
  }

  updateExpense(id: string, updated: Partial<Expense>): Expense | null {
    const expenses = this.getExpenses();
    const index = expenses.findIndex((e) => e.id === id);
    if (index === -1) return null;
    expenses[index] = { ...expenses[index], ...updated };
    this.saveExpenses(expenses);
    return expenses[index];
  }

  deleteExpense(id: string): void {
    const expenses = this.getExpenses().filter((e) => e.id !== id);
    this.saveExpenses(expenses);
  }

  duplicateExpense(id: string): Expense | null {
    const expenses = this.getExpenses();
    const found = expenses.find((e) => e.id === id);
    if (!found) return null;
    return this.addExpense({
      description: `${found.description} (Cópia)`,
      amount: found.amount,
      category: found.category,
      type: found.type,
      date: new Date().toISOString().split('T')[0],
      recurring: found.recurring,
    });
  }

  // Investments
  getInvestments(): Investment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INVESTMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveInvestments(investments: Investment[]): void {
    localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(investments));
  }

  addInvestment(inv: Omit<Investment, 'id' | 'createdAt'>): Investment {
    const investments = this.getInvestments();
    const newInv: Investment = {
      ...inv,
      id: 'inv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
    };
    investments.unshift(newInv);
    this.saveInvestments(investments);
    return newInv;
  }

  deleteInvestment(id: string): void {
    const investments = this.getInvestments().filter((i) => i.id !== id);
    this.saveInvestments(investments);
  }

  // Goals
  getGoals(): Goal[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GOALS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveGoals(goals: Goal[]): void {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }

  addGoal(goal: Omit<Goal, 'id' | 'createdAt'>): Goal {
    const goals = this.getGoals();
    const newGoal: Goal = {
      ...goal,
      id: 'goal_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
    };
    goals.unshift(newGoal);
    this.saveGoals(goals);
    return newGoal;
  }

  updateGoal(id: string, updated: Partial<Goal>): Goal | null {
    const goals = this.getGoals();
    const index = goals.findIndex((g) => g.id === id);
    if (index === -1) return null;
    goals[index] = { ...goals[index], ...updated };
    this.saveGoals(goals);
    return goals[index];
  }

  deleteGoal(id: string): void {
    const goals = this.getGoals().filter((g) => g.id !== id);
    this.saveGoals(goals);
  }

  // Emergency Fund
  getEmergencyFund(): EmergencyFund {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EMERGENCY_FUND);
      return data ? JSON.parse(data) : DEFAULT_EMERGENCY_FUND;
    } catch {
      return DEFAULT_EMERGENCY_FUND;
    }
  }

  saveEmergencyFund(fund: EmergencyFund): void {
    localStorage.setItem(STORAGE_KEYS.EMERGENCY_FUND, JSON.stringify(fund));
  }

  // Balance Distribution
  getBalanceDistribution(): BalanceDistribution {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BALANCE_DISTRIBUTION);
      return data ? JSON.parse(data) : DEFAULT_BALANCE_DISTRIBUTION;
    } catch {
      return DEFAULT_BALANCE_DISTRIBUTION;
    }
  }

  saveBalanceDistribution(dist: BalanceDistribution): void {
    localStorage.setItem(STORAGE_KEYS.BALANCE_DISTRIBUTION, JSON.stringify(dist));
  }

  // Settings
  getSettings(): FinancialSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  saveSettings(settings: FinancialSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // Categories
  getCategories(): CategoryDef[] {
    try {
      const custom = localStorage.getItem(STORAGE_KEYS.CUSTOM_CATEGORIES);
      const parsedCustom: CategoryDef[] = custom ? JSON.parse(custom) : [];
      return [...DEFAULT_CATEGORIES, ...parsedCustom];
    } catch {
      return DEFAULT_CATEGORIES;
    }
  }

  addCustomCategory(cat: Omit<CategoryDef, 'id' | 'isDefault'>): CategoryDef {
    const custom = localStorage.getItem(STORAGE_KEYS.CUSTOM_CATEGORIES);
    const parsed: CategoryDef[] = custom ? JSON.parse(custom) : [];
    const newCat: CategoryDef = {
      ...cat,
      id: 'custom_' + Date.now(),
      isDefault: false,
    };
    parsed.push(newCat);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_CATEGORIES, JSON.stringify(parsed));
    return newCat;
  }

  // Chat history
  getChatMessages(): ChatMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveChatMessages(messages: ChatMessage[]): void {
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(messages));
  }

  // Onboarding status
  isOnboardingCompleted(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === 'true';
  }

  setOnboardingCompleted(completed = true): void {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, completed ? 'true' : 'false');
  }

  // Reset all data for Privacy
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  }

  // Load sample demonstration data
  loadDemoData(): void {
    const today = new Date().toISOString().split('T')[0];
    const demoIncomes: Income[] = [
      {
        id: 'inc_demo_1',
        description: 'Salário Mensal',
        amount: 3200,
        category: 'Salário',
        date: today,
        recurring: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'inc_demo_2',
        description: 'Projeto Freelance',
        amount: 800,
        category: 'Freelance / Serviços',
        date: today,
        recurring: false,
        createdAt: new Date().toISOString(),
      },
    ];

    const demoExpenses: Expense[] = [
      {
        id: 'exp_demo_1',
        description: 'Aluguel do Apartamento',
        amount: 900,
        category: 'Moradia',
        type: 'fixo',
        date: today,
        recurring: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'exp_demo_2',
        description: 'Supermercado Mensal',
        amount: 350,
        category: 'Alimentação',
        type: 'variavel',
        date: today,
        recurring: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'exp_demo_3',
        description: 'Conta de Luz / Energia',
        amount: 110,
        category: 'Energia',
        type: 'fixo',
        date: today,
        recurring: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'exp_demo_4',
        description: 'Conta de Água',
        amount: 65,
        category: 'Água',
        type: 'fixo',
        date: today,
        recurring: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'exp_demo_5',
        description: 'Internet Fibra Óptica',
        amount: 99.9,
        category: 'Internet',
        type: 'fixo',
        date: today,
        recurring: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'exp_demo_6',
        description: 'Aplicativo de Transporte (Uber)',
        amount: 85,
        category: 'Transporte',
        type: 'variavel',
        date: today,
        recurring: false,
        createdAt: new Date().toISOString(),
      },
    ];

    const demoGoals: Goal[] = [
      {
        id: 'goal_demo_1',
        name: 'Viagem de Férias',
        targetAmount: 3000,
        currentAmount: 1200,
        deadline: '2026-12-31',
        createdAt: new Date().toISOString(),
      },
    ];

    const demoInvestments: Investment[] = [
      {
        id: 'inv_demo_1',
        description: 'CDB 120% do CDI - Reserva Rendendo',
        initialAmount: 2000,
        monthlyContribution: 300,
        rate: 120,
        rateType: 'cdi_percent',
        duration: 24,
        createdAt: new Date().toISOString(),
      },
    ];

    this.saveIncomes(demoIncomes);
    this.saveExpenses(demoExpenses);
    this.saveGoals(demoGoals);
    this.saveInvestments(demoInvestments);
    this.saveEmergencyFund({
      essentialExpenses: 1174.9,
      monthsTarget: 6,
      currentAmount: 1500,
    });
    this.setOnboardingCompleted(true);
  }
}

export const storageService = new StorageService();
