export type MovementType = 'income' | 'expense';

export type ExpenseType = 'fixo' | 'variavel';

export type RateType = 'cdi_percent' | 'annual_effective' | 'monthly_fixed';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Income {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  recurring: boolean;
  createdAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: ExpenseType;
  date: string; // YYYY-MM-DD
  recurring: boolean;
  createdAt: string;
}

export interface Investment {
  id: string;
  description: string;
  initialAmount: number;
  monthlyContribution: number;
  rate: number; // e.g. 120 (% do CDI) or 10.65 (% ao ano)
  rateType: RateType;
  duration: number; // in months
  createdAt: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  createdAt: string;
}

export interface EmergencyFund {
  essentialExpenses: number;
  monthsTarget: number;
  currentAmount: number;
}

export interface FinancialSettings {
  currency: string;
  theme: ThemeMode;
  cdiRate: number; // Reference CDI rate %
  selicRate: number; // Reference Selic rate %
  lastRateUpdate: string;
  rateSource: string;
}

export interface BalanceDistribution {
  investmentsPercent: number;
  emergencyOrGoalsPercent: number;
  flexiblePercent: number;
}

export interface CategoryDef {
  id: string;
  name: string;
  iconName: string;
  color: string;
  isDefault: boolean;
  defaultType?: ExpenseType;
}

export interface ParsedMovementItem {
  id: string;
  movementType: MovementType;
  description: string;
  amount: number;
  category: string;
  type?: ExpenseType;
  date: string;
  recurring: boolean;
}

export interface AIParseResponse {
  intent: string;
  income?: Array<{
    description: string;
    amount: number;
    category?: string;
    recurring?: boolean;
    date?: string;
  }>;
  expenses?: Array<{
    description: string;
    amount: number;
    category?: string;
    type?: ExpenseType;
    recurring?: boolean;
    date?: string;
  }>;
  simulationParams?: {
    initialAmount?: number;
    monthlyContribution?: number;
    durationMonths?: number;
    ratePercentCdi?: number;
    targetAmount?: number;
  };
  observation?: string;
  confidence?: number;
  rawText?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  suggestions?: string[];
  structuredData?: any;
}

export interface MonthlyFinancialData {
  monthKey: string; // "YYYY-MM"
  monthLabel: string; // "Agosto 2026"
  totalIncome: number;
  totalExpenses: number;
  fixedExpenses: number;
  variableExpenses: number;
  essentialExpenses: number;
  availableBalance: number;
  committedPercentage: number;
  expensesByCategory: Record<string, number>;
}
