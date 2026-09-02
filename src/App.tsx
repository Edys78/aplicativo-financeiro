import React, { useState } from 'react';
import { FinancialProvider } from './context/FinancialContext';
import { Navbar } from './components/Navbar';
import { Sidebar, PageTab } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { FloatingActionButton } from './components/FloatingActionButton';
import { VoiceAndTextInputModal } from './components/VoiceAndTextInputModal';
import { ManualItemModal, ModalItemType } from './components/ManualItemModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { IncomesPage } from './pages/IncomesPage';
import { BalanceOrganizationPage } from './pages/BalanceOrganizationPage';
import { EmergencyFundPage } from './pages/EmergencyFundPage';
import { InvestmentsPage } from './pages/InvestmentsPage';
import { GoalsPage } from './pages/GoalsPage';
import { AssistantPage } from './pages/AssistantPage';
import { HistoryPage } from './pages/HistoryPage';
import { PrivacyPage } from './pages/PrivacyPage';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PageTab>('dashboard');

  // Modal States
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualModalType, setManualModalType] = useState<ModalItemType>('expense');
  const [manualEditingItem, setManualEditingItem] = useState<any>(null);

  const handleOpenManualModal = (type: ModalItemType, item?: any) => {
    setManualModalType(type);
    setManualEditingItem(item || null);
    setIsManualModalOpen(true);
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            onOpenVoice={() => setIsVoiceOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        );
      case 'expenses':
        return (
          <ExpensesPage
            onOpenVoice={() => setIsVoiceOpen(true)}
            onOpenManualModal={(type, item) => handleOpenManualModal(type, item)}
          />
        );
      case 'incomes':
        return (
          <IncomesPage
            onOpenVoice={() => setIsVoiceOpen(true)}
            onOpenManualModal={(type, item) => handleOpenManualModal(type, item)}
          />
        );
      case 'balance':
        return <BalanceOrganizationPage />;
      case 'emergency':
        return <EmergencyFundPage />;
      case 'investments':
        return <InvestmentsPage />;
      case 'goals':
        return (
          <GoalsPage
            onOpenManualModal={(type, item) => handleOpenManualModal(type, item)}
          />
        );
      case 'assistant':
        return <AssistantPage />;
      case 'history':
        return <HistoryPage />;
      case 'privacy':
        return <PrivacyPage />;
      default:
        return (
          <DashboardPage
            onOpenVoice={() => setIsVoiceOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onOpenVoiceInput={() => setIsVoiceOpen(true)}
        onNavigateToPrivacy={() => setActiveTab('privacy')}
      />

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Desktop Sidebar */}
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          {renderActivePage()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Floating Action Button (Quick Add) */}
      <FloatingActionButton
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenManualModal={(type) => handleOpenManualModal(type)}
      />

      {/* Voice and Text NLP Input Modal */}
      <VoiceAndTextInputModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />

      {/* Direct Manual Add / Edit Modal */}
      <ManualItemModal
        isOpen={isManualModalOpen}
        onClose={() => {
          setIsManualModalOpen(false);
          setManualEditingItem(null);
        }}
        type={manualModalType}
        editingItem={manualEditingItem}
      />
    </div>
  );
};

export default function App() {
  return (
    <FinancialProvider>
      <AppContent />
    </FinancialProvider>
  );
}
