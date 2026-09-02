import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Database,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

export const PrivacyPage: React.FC = () => {
  const { incomes, expenses, investments, goals, emergencyFund, clearAllData } = useFinancial();
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleExportData = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      appName: 'Finance IA',
      version: '1.0.0',
      data: {
        incomes,
        expenses,
        investments,
        goals,
        emergencyFund,
      },
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance_ia_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setSuccessMessage('Backup exportado com sucesso para seu dispositivo.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleReset = () => {
    clearAllData();
    setShowConfirmReset(false);
    setSuccessMessage('Todos os dados foram apagados com segurança.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
          Privacidade & Gerenciamento de Dados
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Transparência total sobre o armazenamento e segurança das suas finanças
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMessage}
        </div>
      )}

      {/* Security Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Armazenamento Seguro
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Seus dados financeiros permanecem sob seu controle, armazenados localmente e criptografados em trânsito.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Confirmação Humana
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            A inteligência artificial nunca grava nada automaticamente sem que você revise e clique em confirmar.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Portabilidade Total
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Você pode exportar todas as suas movimentações em formato JSON e apagá-las a qualquer momento.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Ações de Gerenciamento
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Exportar Backup</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Baixe um arquivo com todos os seus registros
              </p>
            </div>
            <button
              id="export-data-btn"
              type="button"
              onClick={handleExportData}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" /> Exportar
            </button>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-rose-700 dark:text-rose-400">Apagar Todos os Dados</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Remove permanentemente todos os registros
              </p>
            </div>
            <button
              id="open-reset-confirm-btn"
              type="button"
              onClick={() => setShowConfirmReset(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" /> Apagar Tudo
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Deseja realmente apagar tudo?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Esta ação apagará permanentemente todas as suas rendas, gastos, investimentos simulados, objetivos e histórico de conversas do assistente.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                id="confirm-delete-all-btn"
                type="button"
                onClick={handleReset}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20"
              >
                Sim, Apagar Tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
