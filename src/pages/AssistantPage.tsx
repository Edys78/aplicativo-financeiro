import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Sparkles,
  User,
  Trash2,
  Loader2,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { askFinancialAssistant, FinancialAssistantContext } from '../services/aiService';
import { voiceService } from '../services/voiceService';

export const AssistantPage: React.FC = () => {
  const {
    incomes,
    expenses,
    emergencyFund,
    investments,
    goals,
    totalIncome,
    totalExpenses,
    fixedExpenses,
    variableExpenses,
    availableBalance,
    committedPercentage,
    settings,
    chatMessages,
    addChatMessage,
    clearChat,
  } = useFinancial();

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoading]);

  const financialContext: FinancialAssistantContext = {
    totalIncome,
    totalExpenses,
    fixedExpenses,
    variableExpenses,
    availableBalance,
    committedPercentage,
    incomes,
    expenses,
    emergencyFund,
    investments,
    goals,
    cdiRate: settings.cdiRate || 10.65,
    selicRate: settings.selicRate || 10.75,
  };

  const handleSend = async (queryText?: string) => {
    const text = (queryText || inputQuery).trim();
    if (!text || isLoading) return;

    setInputQuery('');
    voiceService.stop();
    setIsListening(false);

    // Add user message
    addChatMessage({
      role: 'user',
      text,
    });

    setIsLoading(true);

    try {
      const answer = await askFinancialAssistant(text, financialContext, chatMessages);
      addChatMessage({
        role: 'assistant',
        text: answer,
      });
    } catch (err) {
      console.error('Chatbot error:', err);
      addChatMessage({
        role: 'assistant',
        text: 'Desculpe, ocorreu um erro temporário ao processar sua pergunta. Por favor, tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      voiceService.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      voiceService.start(
        (transcript, isFinal) => {
          setInputQuery(transcript);
          if (isFinal) {
            handleSend(transcript);
          }
        },
        (error) => {
          console.warn('Voice error in assistant:', error);
          setIsListening(false);
        },
        (state) => {
          if (state === 'idle' || state === 'error') setIsListening(false);
        }
      );
    }
  };

  const suggestedQuestions = [
    'Quanto gastei este mês?',
    'Qual meu maior gasto?',
    'Quanto tenho disponível?',
    'Quanto posso separar para investir?',
    'Como está minha reserva de emergência?',
    'Simule 500 reais por 5 anos a 120% do CDI',
  ];

  return (
    <div className="space-y-4 animate-fade-in pb-12 flex flex-col h-[calc(100vh-12rem)] max-h-[850px]">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-emerald-500" />
            Assistente Financeiro IA
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tire dúvidas, peça orientações ou simulações baseadas nos seus números reais
          </p>
        </div>

        {chatMessages.length > 0 && (
          <button
            id="clear-chat-btn"
            type="button"
            onClick={clearChat}
            className="px-3 py-1.5 text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Limpar Conversa
          </button>
        )}
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Como posso ajudar seu planejamento hoje?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Você pode perguntar sobre seus gastos, saldo disponível, reserva de emergência ou pedir simulações de investimento.
              </p>
            </div>

            {/* Suggestions */}
            <div className="w-full space-y-2 pt-2">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block text-left">
                Sugestões de perguntas:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(q)}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-colors"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {chatMessages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      isUser
                        ? 'bg-slate-800 text-white dark:bg-slate-700'
                        : 'bg-emerald-600 text-white shadow-xs'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200/50 dark:border-slate-700/50'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span
                      className={`text-[10px] block mt-1 text-right ${
                        isUser ? 'text-emerald-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 text-xs text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Analisando seus dados financeiros...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="shrink-0 space-y-2">
        {chatMessages.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {suggestedQuestions.slice(0, 3).map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 whitespace-nowrap text-[11px] shrink-0 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Voice toggle */}
          <button
            id="assistant-voice-btn"
            type="button"
            onClick={toggleVoice}
            className={`p-3 rounded-xl transition-all ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600'
            }`}
            title={isListening ? 'Parar gravação' : 'Falar por voz'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <div className="relative flex-1">
            <input
              id="assistant-input-field"
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Digite sua dúvida financeira (ex: quanto sobrou este mês?)..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-12"
            />
            <button
              id="assistant-send-btn"
              type="button"
              disabled={isLoading || !inputQuery.trim()}
              onClick={() => handleSend()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
