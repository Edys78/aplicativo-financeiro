/**
 * Financial Calculations Engine for Finance IA
 * Implements high-precision financial formulas, Brazilian currency formatting,
 * and reliable investment/emergency fund mathematics.
 */

export interface InvestmentSimulationResult {
  totalInvested: number;
  estimatedYield: number;
  estimatedTotal: number;
  monthlyRate: number;
  annualRate: number;
  evolutionByMonth: Array<{
    month: number;
    invested: number;
    yieldAmount: number;
    total: number;
  }>;
}

export interface ScenarioResult {
  years: number;
  months: number;
  totalInvested: number;
  estimatedYield: number;
  estimatedTotal: number;
}

/**
 * Format currency to Brazilian Real (BRL)
 * Example: 2200 -> "R$ 2.200,00"
 */
export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage (pt-BR)
 * Example: 51.6 -> "51,6%"
 */
export function formatPercent(value: number | undefined | null, decimals = 1): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0,0%';
  }
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value) + '%';
}

/**
 * Parse numeric input string safely (handles both commas and dots)
 */
export function parseCurrencyInput(value: string | number): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;
  // Clean R$, whitespace, etc.
  const cleaned = value.replace(/[R$\s.]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.max(0, num);
}

/**
 * Calculate available balance: renda_total - despesas_totais
 */
export function calculateBalance(totalIncome: number, totalExpenses: number): number {
  return totalIncome - totalExpenses;
}

/**
 * Calculate committed income percentage: despesas_totais / renda_total * 100
 */
export function calculateCommittedPercentage(totalIncome: number, totalExpenses: number): number {
  if (totalIncome <= 0) return totalExpenses > 0 ? 100 : 0;
  return (totalExpenses / totalIncome) * 100;
}

/**
 * Convert Annual Effective Rate to Monthly Effective Rate:
 * i_mensal = (1 + i_anual)^(1/12) - 1
 */
export function annualToMonthlyRate(annualRateDecimal: number): number {
  if (annualRateDecimal <= 0) return 0;
  return Math.pow(1 + annualRateDecimal, 1 / 12) - 1;
}

/**
 * Calculate CDI-equivalent effective annual rate
 * Example: cdiRate = 10.65% (0.1065), percentOfCdi = 120 -> 0.1065 * 1.20 = 0.1278 (12.78% a.a.)
 */
export function calculateCdiRateAnnual(cdiBaseRate: number, percentOfCdi: number): number {
  const cdiDecimal = cdiBaseRate / 100;
  return cdiDecimal * (percentOfCdi / 100);
}

/**
 * Investment compound interest simulation:
 * VF = VP * (1+i)^n + PMT * (((1+i)^n - 1) / i)
 */
export function simulateInvestment(
  initialAmount: number,
  monthlyContribution: number,
  months: number,
  annualRateDecimal: number
): InvestmentSimulationResult {
  const safeInitial = Math.max(0, initialAmount || 0);
  const safeMonthly = Math.max(0, monthlyContribution || 0);
  const safeMonths = Math.max(1, Math.round(months || 1));
  const monthlyRate = annualToMonthlyRate(annualRateDecimal);

  const evolutionByMonth: Array<{
    month: number;
    invested: number;
    yieldAmount: number;
    total: number;
  }> = [];

  let currentTotal = safeInitial;
  let currentInvested = safeInitial;

  evolutionByMonth.push({
    month: 0,
    invested: currentInvested,
    yieldAmount: 0,
    total: currentTotal,
  });

  for (let m = 1; m <= safeMonths; m++) {
    // Rendimento do montante anterior + novo aporte no início/fim do mês
    const interest = currentTotal * monthlyRate;
    currentTotal = currentTotal + interest + safeMonthly;
    currentInvested = currentInvested + safeMonthly;

    // We store intermediate months (at least every month or sampling for large periods)
    if (safeMonths <= 60 || m % Math.ceil(safeMonths / 60) === 0 || m === safeMonths) {
      evolutionByMonth.push({
        month: m,
        invested: currentInvested,
        yieldAmount: Math.max(0, currentTotal - currentInvested),
        total: currentTotal,
      });
    }
  }

  // Exact formulas for final values
  let finalTotal = 0;
  if (monthlyRate === 0) {
    finalTotal = safeInitial + safeMonthly * safeMonths;
  } else {
    const compoundFactor = Math.pow(1 + monthlyRate, safeMonths);
    const initialFutureValue = safeInitial * compoundFactor;
    const contributionsFutureValue = safeMonthly * ((compoundFactor - 1) / monthlyRate);
    finalTotal = initialFutureValue + contributionsFutureValue;
  }

  const totalInvested = safeInitial + safeMonthly * safeMonths;
  const estimatedYield = Math.max(0, finalTotal - totalInvested);

  return {
    totalInvested,
    estimatedYield,
    estimatedTotal: finalTotal,
    monthlyRate,
    annualRate: annualRateDecimal * 100,
    evolutionByMonth,
  };
}

/**
 * Generate standard comparative scenarios (1, 2, 5, 10 years)
 */
export function generateScenarios(
  initialAmount: number,
  monthlyContribution: number,
  annualRateDecimal: number
): ScenarioResult[] {
  const horizons = [
    { years: 1, months: 12 },
    { years: 2, months: 24 },
    { years: 5, months: 60 },
    { years: 10, months: 120 },
  ];

  return horizons.map((h) => {
    const sim = simulateInvestment(initialAmount, monthlyContribution, h.months, annualRateDecimal);
    return {
      years: h.years,
      months: h.months,
      totalInvested: sim.totalInvested,
      estimatedYield: sim.estimatedYield,
      estimatedTotal: sim.estimatedTotal,
    };
  });
}

/**
 * Reverse Calculator 1: "Quanto preciso investir por mês?"
 * PMT = (Target - Initial*(1+i)^n) / (((1+i)^n - 1) / i)
 */
export function calculateRequiredContribution(
  targetAmount: number,
  initialAmount: number,
  months: number,
  annualRateDecimal: number
): { requiredMonthly: number; totalInvested: number; estimatedYield: number } {
  const safeTarget = Math.max(0, targetAmount || 0);
  const safeInitial = Math.max(0, initialAmount || 0);
  const safeMonths = Math.max(1, Math.round(months || 1));
  const monthlyRate = annualToMonthlyRate(annualRateDecimal);

  if (monthlyRate === 0) {
    const remaining = Math.max(0, safeTarget - safeInitial);
    const pmt = remaining / safeMonths;
    return {
      requiredMonthly: pmt,
      totalInvested: safeInitial + pmt * safeMonths,
      estimatedYield: 0,
    };
  }

  const compoundFactor = Math.pow(1 + monthlyRate, safeMonths);
  const futureInitial = safeInitial * compoundFactor;
  const neededFromContributions = safeTarget - futureInitial;

  if (neededFromContributions <= 0) {
    return {
      requiredMonthly: 0,
      totalInvested: safeInitial,
      estimatedYield: futureInitial - safeInitial,
    };
  }

  const seriesFactor = (compoundFactor - 1) / monthlyRate;
  const requiredMonthly = neededFromContributions / seriesFactor;
  const totalInvested = safeInitial + requiredMonthly * safeMonths;
  const estimatedYield = Math.max(0, safeTarget - totalInvested);

  return {
    requiredMonthly: Math.max(0, requiredMonthly),
    totalInvested,
    estimatedYield,
  };
}

/**
 * Reverse Calculator 2: "Quanto tempo preciso?"
 * Calculates estimated months to reach target
 */
export function calculateRequiredTime(
  targetAmount: number,
  initialAmount: number,
  monthlyContribution: number,
  annualRateDecimal: number
): { months: number; years: number; totalInvested: number; estimatedYield: number; isPossible: boolean } {
  const safeTarget = Math.max(0, targetAmount || 0);
  const safeInitial = Math.max(0, initialAmount || 0);
  const safeMonthly = Math.max(0, monthlyContribution || 0);
  const monthlyRate = annualToMonthlyRate(annualRateDecimal);

  if (safeInitial >= safeTarget) {
    return {
      months: 0,
      years: 0,
      totalInvested: safeInitial,
      estimatedYield: 0,
      isPossible: true,
    };
  }

  if (safeMonthly <= 0 && monthlyRate <= 0) {
    return {
      months: 0,
      years: 0,
      totalInvested: safeInitial,
      estimatedYield: 0,
      isPossible: false,
    };
  }

  if (monthlyRate === 0) {
    const needed = safeTarget - safeInitial;
    const months = Math.ceil(needed / safeMonthly);
    return {
      months,
      years: Number((months / 12).toFixed(1)),
      totalInvested: safeInitial + safeMonthly * months,
      estimatedYield: 0,
      isPossible: true,
    };
  }

  // Formula: n = ln((VF*i + PMT) / (VP*i + PMT)) / ln(1+i)
  const numeratorTerm = safeTarget * monthlyRate + safeMonthly;
  const denominatorTerm = safeInitial * monthlyRate + safeMonthly;

  if (denominatorTerm <= 0 || numeratorTerm <= 0 || numeratorTerm <= denominatorTerm) {
    return {
      months: 0,
      years: 0,
      totalInvested: safeInitial,
      estimatedYield: 0,
      isPossible: false,
    };
  }

  const monthsExact = Math.log(numeratorTerm / denominatorTerm) / Math.log(1 + monthlyRate);
  const months = Math.ceil(monthsExact);
  const totalInvested = safeInitial + safeMonthly * months;
  const estimatedYield = Math.max(0, safeTarget - totalInvested);

  return {
    months,
    years: Number((months / 12).toFixed(1)),
    totalInvested,
    estimatedYield,
    isPossible: true && months > 0 && months <= 1200, // up to 100 years max
  };
}

export const calculateScenarios = generateScenarios;

export function calculateRequiredMonthlyContribution(
  targetAmount: number,
  initialAmount: number,
  months: number,
  annualRateDecimal: number
): number {
  return calculateRequiredContribution(targetAmount, initialAmount, months, annualRateDecimal).requiredMonthly;
}

export function calculateTimeToTarget(
  targetAmount: number,
  initialAmount: number,
  monthlyContribution: number,
  annualRateDecimal: number
): number {
  return calculateRequiredTime(targetAmount, initialAmount, monthlyContribution, annualRateDecimal).months;
}


/**
 * Generate intelligent non-judgmental insights based on real user numbers
 */
export function generateFinancialInsights(data: {
  totalIncome: number;
  totalExpenses: number;
  fixedExpenses: number;
  variableExpenses: number;
  essentialExpenses: number;
  availableBalance: number;
  committedPercentage: number;
  expensesByCategory: Record<string, number>;
  emergencyFundCurrent: number;
  emergencyFundTarget: number;
}): {
  summary: string;
  positivePoints: string[];
  attentionPoints: string[];
} {
  const {
    totalIncome,
    totalExpenses,
    availableBalance,
    committedPercentage,
    expensesByCategory,
    emergencyFundCurrent,
    emergencyFundTarget,
  } = data;

  const positivePoints: string[] = [];
  const attentionPoints: string[] = [];

  let summary = '';

  if (totalIncome === 0 && totalExpenses === 0) {
    summary = 'Cadastre sua renda e seus primeiros gastos para receber análises personalizadas da sua saúde financeira.';
    return { summary, positivePoints, attentionPoints };
  }

  if (totalIncome > 0) {
    summary = `Sua renda mensal registrada é de ${formatCurrency(totalIncome)} e seus gastos somam ${formatCurrency(totalExpenses)}. Atualmente, aproximadamente ${formatPercent(committedPercentage)} da sua renda está comprometida.`;
  } else {
    summary = `Seus gastos registrados somam ${formatCurrency(totalExpenses)}. Informe sua renda para acompanhar o percentual comprometido e o saldo disponível.`;
  }

  // Positives
  if (totalIncome > 0 && totalExpenses < totalIncome) {
    positivePoints.push(`Você está gastando menos do que recebe, gerando um saldo positivo de ${formatCurrency(availableBalance)}.`);
  }

  if (totalIncome > 0 && committedPercentage <= 60) {
    positivePoints.push('Sua renda comprometida está em um nível saudável (abaixo de 60%), permitindo maior margem para poupar e investir.');
  }

  if (emergencyFundTarget > 0 && emergencyFundCurrent >= emergencyFundTarget) {
    positivePoints.push('Parabéns! Sua meta de reserva de emergência já foi 100% atingida.');
  } else if (emergencyFundTarget > 0 && emergencyFundCurrent >= emergencyFundTarget * 0.5) {
    positivePoints.push(`Sua reserva de emergência já conta com mais de 50% da meta acumulada (${formatCurrency(emergencyFundCurrent)}).`);
  }

  if (positivePoints.length === 0 && totalIncome > 0 && totalExpenses <= totalIncome) {
    positivePoints.push('Suas despesas estão cobertas pelas suas receitas do mês.');
  }

  // Attention points
  if (totalIncome > 0 && totalExpenses > totalIncome) {
    attentionPoints.push(`Seus gastos no mês superam sua renda em ${formatCurrency(Math.abs(availableBalance))}. Avalie renegociar despesas fixas ou moderar gastos variáveis.`);
  } else if (totalIncome > 0 && committedPercentage > 80) {
    attentionPoints.push(`Aproximadamente ${formatPercent(committedPercentage)} da sua renda está comprometida. Uma margem de folga reduzida pode dificultar a criação da sua reserva.`);
  }

  // Category analysis
  if (totalIncome > 0) {
    for (const [category, amount] of Object.entries(expensesByCategory)) {
      const catPercent = (amount / totalIncome) * 100;
      if (catPercent >= 35 && category.toLowerCase() !== 'moradia') {
        attentionPoints.push(`Os gastos com "${category}" representam ${formatPercent(catPercent)} da sua renda (${formatCurrency(amount)}).`);
      } else if (catPercent >= 45 && category.toLowerCase() === 'moradia') {
        attentionPoints.push(`Os gastos com "Moradia" somam ${formatPercent(catPercent)} da renda. O recomendado por especialistas é manter entre 30% e 40%.`);
      }
    }
  }

  if (emergencyFundTarget > 0 && emergencyFundCurrent < emergencyFundTarget * 0.2) {
    attentionPoints.push('Sua reserva de emergência ainda está no início. Priorizar os primeiros meses de gastos essenciais traz tranquilidade para imprevistos.');
  }

  return { summary, positivePoints, attentionPoints };
}
