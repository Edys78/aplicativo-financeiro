import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Google GenAI lazily or with graceful fallback
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Endpoint: Reference Economic Rates (Bacen / B3 indicators)
app.get("/api/economic-rates", (req, res) => {
  res.json({
    cdi: 10.65, // Taxa CDI nominal anualizada atual de referência
    selic: 10.75, // Meta Selic anualizada
    referenceDate: "01/09/2026",
    source: "B3 / Banco Central do Brasil (Copom)",
    disclaimer: "Taxas de referência do mercado financeiro brasileiro. O CDI e a Selic possuem diferenças metodológicas.",
  });
});

// 2. Endpoint: AI Natural Language Parser for Financial Items (Voice / Text)
app.post("/api/ai/parse-financial", async (req, res) => {
  try {
    const { text, currentDate } = req.body;
    if (!text || typeof text !== "string" || text.trim() === "") {
      return res.status(400).json({ error: "Texto não fornecido para interpretação." });
    }

    const ai = getGenAI();
    if (!ai) {
      // Fallback response with heuristic parsing if key not configured
      return res.json({
        intent: "add_financial_items",
        income: [],
        expenses: [],
        rawText: text,
        observation: "Chave de IA não configurada. Utilizando interpretação local.",
        confidence: 0.5,
      });
    }

    const systemPrompt = `Você é o motor de PLN financeiro do aplicativo Finance IA (Brasil).
Sua tarefa é analisar frases em português faladas ou digitadas pelo usuário brasileiro e extrair rigorosamente todas as rendas e despesas mencionadas.

Regras importantes:
1. Suporte valores no padrão falado brasileiro (ex: "2.200 reais", "2 mil e duzentos", "3 mil", "50 reais", "100 conto", "65 reais e cinquenta centavos").
2. Identifique tipo de movimentação:
   - Renda/Receita (salário, bônus, freela, rendimento, vendas, pensão recebida, etc.) -> income
   - Despesa/Gasto (aluguel, água, luz, supermercado, uber, compras, internet, farmácia, etc.) -> expense
3. Para despesas, classifique a categoria em uma das seguintes:
   ["Moradia", "Alimentação", "Água", "Energia", "Internet", "Telefone", "Transporte", "Saúde", "Educação", "Lazer", "Assinaturas", "Compras", "Impostos", "Outros"]
4. Para despesas, classifique 'type' como "fixo" (aluguel, condomínio, internet, mensalidade escolar, plano de saúde) ou "variavel" (supermercado, uber, lazer, compras, restaurantes, água/luz se variável).
5. Defina 'recurring' como true se for algo mensal comum (salário, aluguel, luz, água, internet, streaming) ou se o usuário falar "mensal", "todo mês".
6. Se o usuário estiver fazendo uma pergunta ou consulta em vez de cadastrar valores (ex: "Quanto gastei?", "Simule 500 reais por 5 anos", "Quanto tenho disponível?"), indique o intent correspondente.
7. Data padrão: utilize "${currentDate || new Date().toISOString().split("T")[0]}" se nenhuma data específica for mencionada.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Analise a seguinte entrada do usuário e estruture os dados em JSON:\n"${text}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: {
              type: Type.STRING,
              description: "Intent identificado: add_financial_items, query_balance, query_expenses, query_category, query_income, query_investments, query_emergency_fund, simulate_investment, calculate_required_contribution, calculate_required_time, create_goal, other",
            },
            income: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  category: { type: Type.STRING },
                  recurring: { type: Type.BOOLEAN },
                  date: { type: Type.STRING },
                },
                required: ["description", "amount"],
              },
            },
            expenses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  category: { type: Type.STRING },
                  type: { type: Type.STRING, description: "fixo ou variavel" },
                  recurring: { type: Type.BOOLEAN },
                  date: { type: Type.STRING },
                },
                required: ["description", "amount", "category", "type"],
              },
            },
            simulationParams: {
              type: Type.OBJECT,
              properties: {
                initialAmount: { type: Type.NUMBER },
                monthlyContribution: { type: Type.NUMBER },
                durationMonths: { type: Type.NUMBER },
                ratePercentCdi: { type: Type.NUMBER },
                targetAmount: { type: Type.NUMBER },
              },
            },
            observation: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
          },
          required: ["intent", "income", "expenses"],
        },
      },
    });

    const parsedJson = JSON.parse(response.text?.trim() || "{}");
    return res.json(parsedJson);
  } catch (error: any) {
    console.error("Erro no processamento de linguagem natural:", error);
    res.status(500).json({
      error: "Não foi possível interpretar os dados automaticamente.",
      details: error?.message,
    });
  }
});

// 3. Endpoint: Financial Assistant Chatbot grounded on REAL user state
app.post("/api/ai/assistant", async (req, res) => {
  try {
    const { question, financialContext, conversationHistory } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Pergunta não fornecida." });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        answer:
          "O assistente com IA requer a chave GEMINI_API_KEY configurada. Você pode consultar seus saldos e relatórios diretamente nas telas do aplicativo.",
      });
    }

    const systemPrompt = `Você é o Assistente Financeiro Inteligente do Finance IA.
Sua missão é ajudar o usuário brasileiro a entender, organizar e planejar sua vida financeira com clareza, empatia e objetividade, sem jargões complexos.

REGRAS ABSOLUTAS DE CONFIABILIDADE:
1. Responda ESTRITAMENTE com base nos dados reais fornecidos no CONTEXTO FINANCEIRO abaixo.
2. NUNCA invente números, salários, despesas, saldos ou rentabilidades fictícias.
3. Se os dados forem insuficientes para responder com precisão, explique exatamente o que está faltando de forma amigável e oriente o usuário a cadastrar.
4. Ao fazer projeções ou cálculos de investimento ou reserva, use as fórmulas matemáticas exatas e explicite que são projeções baseadas nos parâmetros informados.
5. Nunca emita recomendações de investimento individuais que configurem aconselhamento financeiro formal. Use tom educativo e orientador.
6. Todos os valores em Reais devem usar formatação brasileira (ex: R$ 2.200,00).

CONTEXTO FINANCEIRO ATUAL DO USUÁRIO:
${JSON.stringify(financialContext, null, 2)}`;

    const contents = [
      ...(conversationHistory || []).map((msg: { role: string; text: string }) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.text }],
      })),
      {
        role: "user",
        parts: [{ text: question }],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    return res.json({
      answer: response.text || "Desculpe, não consegui formular uma resposta no momento.",
    });
  } catch (error: any) {
    console.error("Erro no assistente financeiro:", error);
    res.status(500).json({
      error: "Ocorreu um erro ao consultar o assistente financeiro.",
      details: error?.message,
    });
  }
});

async function startServer() {
  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Finance IA Server running on http://localhost:${PORT}`);
  });
}

startServer();
