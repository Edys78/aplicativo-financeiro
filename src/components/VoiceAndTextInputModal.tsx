import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Sparkles, Loader2, Volume2, HelpCircle, X } from 'lucide-react';
import { voiceService, VoiceState } from '../services/voiceService';
import { parseFinancialTextWithAI } from '../services/aiService';
import { ParsedMovementItem, MovementType } from '../types';
import { HumanConfirmationModal } from './HumanConfirmationModal';
import { useFinancial } from '../context/FinancialContext';

interface VoiceAndTextInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'voice' | 'text';
}

export const VoiceAndTextInputModal: React.FC<VoiceAndTextInputModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'text',
}) => {
  const { addIncome, addExpense } = useFinancial();
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');

  // Confirmation state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedMovementItem[]>([]);
  const [interpretedRawText, setInterpretedRawText] = useState('');

  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setLiveTranscript('');
      if (initialMode === 'voice') {
        startListening();
      } else {
        setTimeout(() => inputRef.current?.focus(), 150);
      }
    } else {
      voiceService.stop();
      setVoiceState('idle');
    }
  }, [isOpen, initialMode]);

  const startListening = () => {
    setErrorMessage(null);
    setLiveTranscript('');
    voiceService.start(
      (transcript, isFinal) => {
        setLiveTranscript(transcript);
        setInputText(transcript);
        if (isFinal) {
          // If final, user can still edit or send
        }
      },
      (error) => {
        setErrorMessage(error);
      },
      (state) => {
        setVoiceState(state);
      }
    );
  };

  const stopListening = () => {
    voiceService.stop();
    setVoiceState('idle');
  };

  const handleProcessInput = async (textToProcess?: string) => {
    const text = (textToProcess || inputText || liveTranscript).trim();
    if (!text) return;

    stopListening();
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await parseFinancialTextWithAI(text);
      const itemsToConfirm: ParsedMovementItem[] = [];

      const today = new Date().toISOString().split('T')[0];

      // Format extracted incomes
      if (result.income && Array.isArray(result.income)) {
        result.income.forEach((inc, idx) => {
          if (inc.amount > 0) {
            itemsToConfirm.push({
              id: 'inc_' + Date.now() + '_' + idx,
              movementType: 'income',
              description: inc.description || 'Salário / Renda',
              amount: inc.amount,
              category: inc.category || 'Salário',
              date: inc.date || today,
              recurring: inc.recurring ?? true,
            });
          }
        });
      }

      // Format extracted expenses
      if (result.expenses && Array.isArray(result.expenses)) {
        result.expenses.forEach((exp, idx) => {
          if (exp.amount > 0) {
            itemsToConfirm.push({
              id: 'exp_' + Date.now() + '_' + idx,
              movementType: 'expense',
              description: exp.description || 'Gasto',
              amount: exp.amount,
              category: exp.category || 'Outros',
              type: exp.type || 'variavel',
              date: exp.date || today,
              recurring: exp.recurring ?? (exp.type === 'fixo'),
            });
          }
        });
      }

      setInterpretedRawText(text);
      setParsedItems(itemsToConfirm);
      setShowConfirmation(true);
    } catch (err: any) {
      console.error('Error processing financial input:', err);
      setErrorMessage('Não consegui identificar todas as informações. Revise os dados abaixo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAll = (finalItems: ParsedMovementItem[]) => {
    finalItems.forEach((item) => {
      if (item.movementType === 'income') {
        addIncome({
          description: item.description,
          amount: item.amount,
          category: item.category,
          date: item.date,
          recurring: item.recurring,
        });
      } else {
        addExpense({
          description: item.description,
          amount: item.amount,
          category: item.category,
          type: item.type || 'variavel',
          date: item.date,
          recurring: item.recurring,
        });
      }
    });

    setShowConfirmation(false);
    setInputText('');
    setLiveTranscript('');
    onClose();
  };

  const examplePhrases = [
    'Meu salário é 2.200 reais, meu aluguel é 800 reais, minha água é 65 reais, minha luz é 70 reais e supermercado 200 reais.',
    'Recebi 3 mil de salário, paguei 900 de aluguel, 100 de luz e 250 no supermercado.',
    'Gastei 50 reais de Uber.',
    'Pago 100 de água, 150 de luz e 200 de supermercado.',
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Adicionar por Voz ou Texto
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fale ou digite naturalmente em português
                </p>
              </div>
            </div>
            <button
              id="close-voice-modal-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Voice status visualization */}
          <div className="flex flex-col items-center justify-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
            <div className="relative">
              {voiceState === 'listening' && (
                <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping"></div>
              )}
              <button
                id="toggle-mic-recording-btn"
                type="button"
                onClick={voiceState === 'listening' ? stopListening : startListening}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  voiceState === 'listening'
                    ? 'bg-rose-500 text-white shadow-rose-500/30 scale-105'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/30'
                }`}
              >
                {voiceState === 'listening' ? (
                  <MicOff className="w-7 h-7" />
                ) : (
                  <Mic className="w-7 h-7" />
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {voiceState === 'listening'
                  ? '🎙️ Ouvindo... Pode falar suas rendas ou gastos'
                  : 'Toque no microfone para falar'}
              </p>
              {liveTranscript && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 max-w-md px-4 italic">
                  "{liveTranscript}"
                </p>
              )}
            </div>
          </div>

          {/* Text Input area */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
              Ou digite sua mensagem:
            </label>
            <div className="relative">
              <textarea
                ref={inputRef}
                id="voice-text-input-field"
                rows={3}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ex: Meu salário é 2.200 reais, meu aluguel é 800 reais e supermercado 200..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleProcessInput();
                  }
                }}
              />
            </div>
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2">
              <span className="font-semibold">Aviso:</span> {errorMessage}
            </div>
          )}

          {/* Example suggestions */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              <HelpCircle className="w-3.5 h-3.5" /> Exemplos para testar com um clique:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {examplePhrases.map((phrase, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputText(phrase);
                    handleProcessInput(phrase);
                  }}
                  className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-colors border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 truncate max-w-full"
                >
                  "{phrase}"
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              id="cancel-voice-text-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Fechar
            </button>
            <button
              id="interpret-financial-input-btn"
              type="button"
              disabled={isProcessing || (!inputText.trim() && !liveTranscript.trim())}
              onClick={() => handleProcessInput()}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Interpretando com IA...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Interpretar e Confirmar
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Human Confirmation Modal */}
      <HumanConfirmationModal
        isOpen={showConfirmation}
        items={parsedItems}
        rawText={interpretedRawText}
        onConfirm={handleConfirmAll}
        onCancel={() => setShowConfirmation(false)}
      />
    </>
  );
};
