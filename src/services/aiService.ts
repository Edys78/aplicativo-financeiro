import { AIParseResponse, ChatMessage, Income, Expense, EmergencyFund, Investment, Goal } from '../types';
import { matchCategory } from './categoryService';
import { calculateBalance, calculateCommittedPercentage, formatCurrency, formatPercent, simulateInvestment, calculateCdiRateAnnual } from './financialCalculations';

export interface FinancialAssistantContext {
  totalIncome: number;
  totalExpenses: number;
  fixedExpenses: number;
  variableExpenses: number;
  availableBalance: number;
  committedPercentage: number;
  incomes: Income[];
  expenses: Expense[];
  emergencyFund: EmergencyFund;
  investments: Investment[];
  goals: Goal[];
  cdiRate: number;
  selicRate: number;
}

/**
 * Robust local heuristic parser that parses phrases in Brazilian Portuguese
 * e.g. "Meu salário é 2.200 reais, meu aluguel é 800 reais, minha água é 65 reais, minha luz é 70 reais e supermercado 200 reais."
 */
export function localFallbackParser(text: string): AIParseResponse {
  const clean = text.trim();
  const lower = clean.toLowerCase();

  const incomes: Array<{ description: string; amount: number; category: string; recurring: boolean; date: string }> = [];
  const expenses: Array<{ description: string; amount: number; category: string; type: 'fixo' | 'variavel'; recurring: boolean; date: string }> = [];

  const today = new Date().toISOString().split('T')[0];

  // Helper to extract numbers: "2.200", "2200", "2 mil e duzentos", "3 mil", "50", "65,50"
  function parseAmount(valStr: string): number {
    let s = valStr.toLowerCase().trim();
    if (s.includes('mil')) {
      const parts = s.split('mil');
      const thousands = parseFloat(parts[0].replace(/[^\d.,]/g, '').replace(',', '.')) || 1;
      const remainder = parts[1] ? parseFloat(parts[1].replace(/[^\d.,]/g, '').replace(',', '.')) || 0 : 0;
      return thousands * 1000 + remainder;
    }
    const num = parseFloat(s.replace(/[^\d,.]/g, '').replace(/\.(?=\d{3})/g, '').replace(',', '.'));
    return isNaN(num) ? 0 : num;
  }

  // Split clauses by commas, " e ", " mais ", " pagar ", " recebi ", semicolons
  const clauses = lower.split(/,|\se\s|\smais\s|;|\.|\n/).map((c) => c.trim()).filter(Boolean);

  for (const clause of clauses) {
    // Check for numbers in clause
    const match = clause.match(/(?:r\$\s*)?(\d+(?:[.,]\d+)?(?:\s*mil(?:\s*e\s*\d+)?)?)/i);
    if (!match || !match[1]) continue;

    const amount = parseAmount(match[1]);
    if (amount <= 0) continue;

    // Detect if Income
    const isIncome =
      clause.includes('salário') ||
      clause.includes('salario') ||
      clause.includes('recebi') ||
      clause.includes('renda') ||
      clause.includes('ganhei') ||
      clause.includes('freela') ||
      clause.includes('pagamento recebido');

    if (isIncome) {
      let desc = 'Salário';
      if (clause.includes('freela') || clause.includes('serviço')) desc = 'Freelance';
      else if (clause.includes('bônus') || clause.includes('bonus')) desc = 'Bônus';
      else if (clause.includes('venda')) desc = 'Venda';

      incomes.push({
        description: desc,
        amount,
        category: 'Salário',
        recurring: true,
        date: today,
      });
      continue;
    }

    // Detect if Expense
    let desc = 'Gasto';
    let cat = 'Outros';
    let type: 'fixo' | 'variavel' = 'variavel';

    if (clause.includes('aluguel') || clause.includes('aluguel')) {
      desc = 'Aluguel';
      cat = 'Moradia';
      type = 'fixo';
    } else if (clause.includes('água') || clause.includes('agua')) {
      desc = 'Água';
      cat = 'Água';
      type = 'fixo';
    } else if (clause.includes('luz') || clause.includes('energia')) {
      desc = 'Energia';
      cat = 'Energia';
      type = 'fixo';
    } else if (clause.includes('supermercado') || clause.includes('mercado') || clause.includes('compras no mercado')) {
      desc = 'Supermercado';
      cat = 'Alimentação';
      type = 'variavel';
    } else if (clause.includes('uber') || clause.includes('transporte') || clause.includes('gasolina')) {
      desc = clause.includes('uber') ? 'Uber' : 'Transporte';
      cat = 'Transporte';
      type = 'variavel';
    } else if (clause.includes('internet') || clause.includes('wifi')) {
      desc = 'Internet';
      cat = 'Internet';
      type = 'fixo';
    } else if (clause.includes('telefone') || clause.includes('celular')) {
      desc = 'Telefone';
      cat = 'Telefone';
      type = 'fixo';
    } else if (clause.includes('farmácia') || clause.includes('farmacia') || clause.includes('remédio')) {
      desc = 'Farmácia';
      cat = 'Saúde';
      type = 'variavel';
    } else if (clause.includes('netflix') || clause.includes('spotify') || clause.includes('streaming')) {
      desc = 'Streaming';
      cat = 'Assinaturas';
      type = 'fixo';
    } else {
      // Clean description
      const cleanedDesc = clause.replace(match[0], '').replace(/(gastei|paguei|meu|minha|de|no|na|com|reais|r\$)/g, '').trim();
      desc = cleanedDesc ? cleanedDesc.charAt(0).toUpperCase() + cleanedDesc.slice(1) : 'Despesa';
      cat = matchCategory(desc);
    }

    expenses.push({
      description: desc,
      amount,
      category: cat,
      type,
      recurring: type === 'fixo',
      date: today,
    });
  }

  // Detect query intents
  let intent = 'add_financial_items';
  if (lower.includes('quanto gastei') || lower.includes('meus gastos')) intent = 'query_expenses';
  else if (lower.includes('quanto tenho') || lower.includes('saldo')) intent = 'query_balance';
  else if (lower.includes('reserva')) intent = 'query_emergency_fund';
  else if (lower.includes('simule') || lower.includes('investir') || lower.includes('cdi')) intent = 'simulate_investment';

  return {
    intent,
    income: incomes,
    expenses,
    observation: incomes.length > 0 || expenses.length > 0 ? 'Itens identificados com sucesso.' : 'Revise as informações abaixo.',
    confidence: 0.9,
    rawText: text,
  };
}

/**
 * Call Server-Side Gemini endpoint to parse text/voice or fallback gracefully
 */
export async function parseFinancialTextWithAI(text: string): Promise<AIParseResponse> {
  try {
    const res = await fetch('/api/ai/parse-financial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        currentDate: new Date().toISOString().split('T')[0],
      }),
    });

    if (res.ok) {
      const data: AIParseResponse = await res.json();
      if ((data.income && data.income.length > 0) || (data.expenses && data.expenses.length > 0)) {
        return data;
      }
    }
  } catch (err) {
    console.warn('API call failed, executing local fallback parser:', err);
  }

  // Local fallback
  return localFallbackParser(text);
}

/**
 * Query Financial Assistant with Real Grounded User Data
 */
export async function askFinancialAssistant(
  question: string,
  context: FinancialAssistantContext,
  history: ChatMessage[]
): Promise<string> {
  try {
    const res = await fetch('/api/ai/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        financialContext: context,
        conversationHistory: history.slice(-6).map((m) => ({ role: m.role, text: m.text })),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.answer) {
        return data.answer;
      }
    }
  } catch (err) {
    console.warn('AI Assistant endpoint offline, answering via local financial reasoning engine:', err);
  }

  // Deterministic local reasoning engine strictly grounded on user numbers
  const q = question.toLowerCase();

  if (q.includes('quanto gastei') || q.includes('total de gastos') || q.includes('gastos do mês')) {
    if (context.expenses.length === 0) {
      return 'Você ainda não possui despesas cadastradas neste mês. Utilize o botão de microfone ou digite suas despesas para começar a acompanhar.';
    }
    return `Neste mês, seus gastos totais somam ${formatCurrency(context.totalExpenses)}, sendo ${formatCurrency(context.fixedExpenses)} em despesas fixas e ${formatCurrency(context.variableExpenses)} em despesas variáveis.`;
  }

  if (q.includes('maior gasto') || q.includes('gasto mais alto')) {
    if (context.expenses.length === 0) {
      return 'Você não possui gastos registrados para identificar o maior valor.';
    }
    const sorted = [...context.expenses].sort((a, b) => b.amount - a.amount);
    const top = sorted[0];
    return `Seu maior gasto registrado é "${top.description}" no valor de ${formatCurrency(top.amount)} (categoria: ${top.category}).`;
  }

  if (q.includes('quanto tenho disponível') || q.includes('saldo') || q.includes('disponível')) {
    if (context.totalIncome === 0 && context.totalExpenses === 0) {
      return 'Você ainda não cadastrou sua renda nem despesas. Informe sua renda e seus gastos para calcularmos seu saldo disponível.';
    }
    if (context.availableBalance >= 0) {
      return `Seu saldo disponível calculado é de ${formatCurrency(context.availableBalance)}. Ele é o resultado da sua renda total (${formatCurrency(context.totalIncome)}) menos seus gastos cadastrados (${formatCurrency(context.totalExpenses)}).`;
    } else {
      return `Atenção: seus gastos (${formatCurrency(context.totalExpenses)}) superam sua renda (${formatCurrency(context.totalIncome)}), resultando em um saldo negativo de ${formatCurrency(context.availableBalance)}.`;
    }
  }

  if (q.includes('alimentação') || q.includes('alimentacao') || q.includes('comida') || q.includes('mercado')) {
    const foodExpenses = context.expenses.filter((e) => e.category.toLowerCase().includes('aliment') || e.description.toLowerCase().includes('mercado'));
    const totalFood = foodExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    if (totalFood === 0) {
      return 'Você não possui gastos cadastrados na categoria Alimentação neste mês.';
    }
    const pct = context.totalIncome > 0 ? (totalFood / context.totalIncome) * 100 : 0;
    return `Você gastou ${formatCurrency(totalFood)} com alimentação neste mês${context.totalIncome > 0 ? ` (cerca de ${formatPercent(pct)} da sua renda)` : ''}.`;
  }

  if (q.includes('quanto posso separar para investir') || q.includes('quanto posso investir') || q.includes('poupar')) {
    if (context.availableBalance <= 0) {
      return `Atualmente seu saldo disponível é de ${formatCurrency(context.availableBalance)}. Recomendamos primeiro equilibrar as despesas ou buscar renda adicional para criar uma folga financeira.`;
    }
    const sugg50 = context.availableBalance * 0.5;
    return `Com base no seu saldo disponível de ${formatCurrency(context.availableBalance)}, uma estratégia equilibrada é destinar 50% (${formatCurrency(sugg50)}) para investimentos/reserva e manter o restante como margem de segurança e gastos flexíveis.`;
  }

  if (q.includes('reserva')) {
    const target = context.emergencyFund.essentialExpenses * context.emergencyFund.monthsTarget;
    if (context.emergencyFund.essentialExpenses <= 0) {
      return `Para calcular sua reserva de emergência, precisamos definir seus gastos essenciais mensais. Acesse a tela "Reserva de Emergência" para configurar sua meta.`;
    }
    const remaining = Math.max(0, target - context.emergencyFund.currentAmount);
    return `Sua meta de reserva é de ${formatCurrency(target)} (${context.emergencyFund.monthsTarget} meses de ${formatCurrency(context.emergencyFund.essentialExpenses)}). Você já tem ${formatCurrency(context.emergencyFund.currentAmount)} acumulado (faltam ${formatCurrency(remaining)}).`;
  }

  // General simulation query e.g. "500 reais por 5 anos a 120% do cdi"
  if (q.includes('ano') || q.includes('meses') || q.includes('simul')) {
    const annualRate = calculateCdiRateAnnual(context.cdiRate, 120);
    const sim = simulateInvestment(0, 500, 60, annualRate);
    return `Uma simulação de aporte mensal de R$ 500,00 durante 5 anos (60 meses) a 120% do CDI (${formatPercent(annualRate * 100, 2)} a.a.) projeta um total investido de ${formatCurrency(sim.totalInvested)}, com rendimento estimado de ${formatCurrency(sim.estimatedYield)}, totalizando aproximadamente ${formatCurrency(sim.estimatedTotal)}. (Nota: projeção matemática; não é garantia de rentabilidade).`;
  }

  return `Com base nos seus dados atuais: Renda de ${formatCurrency(context.totalIncome)}, Gastos de ${formatCurrency(context.totalExpenses)} e Saldo de ${formatCurrency(context.availableBalance)}. Como posso ajudar você a planejar suas metas, reserva ou investimentos?`;
}
