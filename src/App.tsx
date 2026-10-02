import React, { useState } from 'react';
import { AppScreen, CalculationResult, ScenarioHistoryItem } from './types';
import { DEMO_FUND } from './data/fundData';
import { calculateRedemption } from './services/calculationEngine';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ClarityTerminal } from './components/ClarityTerminal';
import { PortfolioScreen } from './components/PortfolioScreen';
import { FundDetailsScreen } from './components/FundDetailsScreen';
import { RedeemAmountScreen } from './components/RedeemAmountScreen';
import { ComparisonView } from './components/ComparisonView';
import { ExplanationDrawer } from './components/ExplanationDrawer';
import { EndStateScreen } from './components/EndStateScreen';
import { TestFixtureModal } from './components/TestFixtureModal';
import { ExportRecordModal } from './components/ExportRecordModal';
import { StandaloneGlossaryModal } from './components/StandaloneGlossaryModal';

export default function App() {
  // Screen 1 is the Decision-Context Terminal (Anchor-inspired IA)
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('terminal');
  const [selectedAmount, setSelectedAmount] = useState<number>(50000);
  const [calculationResult, setCalculationResult] = useState<CalculationResult>(() =>
    calculateRedemption(DEMO_FUND, 50000)
  );
  const [previousResult, setPreviousResult] = useState<CalculationResult | null>(null);

  // Initial session history items (Section 30: Start strictly EMPTY, no fake entries)
  const [scenarioHistory, setScenarioHistory] = useState<ScenarioHistoryItem[]>([]);

  // Modals & Drawers state
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [glossaryInitialTab, setGlossaryInitialTab] = useState<'glossary' | 'rules'>('glossary');

  // Records a scenario in the session exploration history without consecutive duplicates (max 10)
  const recordScenario = (amount: number, res: CalculationResult) => {
    setScenarioHistory((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].amount === amount) {
        return prev;
      }
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const item: ScenarioHistoryItem = {
        id: `scen-${Date.now()}-${amount}`,
        amount,
        timestamp: timeStr,
        netProceeds: res.estimatedProceeds,
        totalDeductions: res.totalDeductions,
        unitsRedeemed: res.unitsRedeemed,
      };
      return [...prev.slice(-9), item];
    });
  };

  // Live amount slider change on terminal (instant recalculation)
  const handleLiveAmountChange = (amount: number) => {
    try {
      const result = calculateRedemption(DEMO_FUND, amount);
      if (calculationResult && calculationResult.grossRedemptionValue !== amount) {
        setPreviousResult(calculationResult);
      }
      setSelectedAmount(amount);
      setCalculationResult(result);
      recordScenario(amount, result);
    } catch {
      // Ignore boundary errors during live drag
    }
  };

  // Amount chosen from scenario explorer or history chip
  const handleSelectAmountFromScenario = (amt: number) => {
    handleLiveAmountChange(amt);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#1E211F]">
      {/* Global Header */}
      <Header
        activeScreen={currentScreen}
        onOpenGlossary={() => {
          setGlossaryInitialTab('glossary');
          setIsGlossaryOpen(true);
        }}
        onNavigateHome={() => setCurrentScreen('terminal')}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {(currentScreen === 'terminal' || currentScreen === 'redemption_snapshot') && (
          <ClarityTerminal
            result={calculationResult}
            previousResult={previousResult}
            onLiveAmountChange={handleLiveAmountChange}
            onSelectExploredScenario={handleSelectAmountFromScenario}
            onOpenComparison={() => setIsComparisonOpen(true)}
            onOpenExplanationDrawer={() => setIsExplanationOpen(true)}
            onOpenExportRecord={() => setIsExportModalOpen(true)}
            onOpenGlossary={(tab = 'glossary') => {
              setGlossaryInitialTab(tab);
              setIsGlossaryOpen(true);
            }}
            onViewFund={() => setCurrentScreen('fund_details')}
            onContinue={() => setCurrentScreen('prototype_end')}
            scenarioHistory={scenarioHistory}
          />
        )}

        {currentScreen === 'portfolio' && (
          <PortfolioScreen
            onViewFund={() => setCurrentScreen('fund_details')}
            onQuickExplore={(amt) => {
              handleLiveAmountChange(amt);
              setCurrentScreen('terminal');
            }}
          />
        )}

        {currentScreen === 'fund_details' && (
          <FundDetailsScreen
            onBack={() => setCurrentScreen('terminal')}
            onStartRedemption={() => setCurrentScreen('terminal')}
          />
        )}

        {currentScreen === 'enter_amount' && (
          <RedeemAmountScreen
            onBack={() => setCurrentScreen('terminal')}
            onProceed={(amt) => {
              handleLiveAmountChange(amt);
              setCurrentScreen('terminal');
            }}
            initialAmount={selectedAmount}
          />
        )}

        {currentScreen === 'prototype_end' && calculationResult && (
          <EndStateScreen
            result={calculationResult}
            onReturnToSnapshot={() => setCurrentScreen('terminal')}
            onStartNewScenario={() => {
              setSelectedAmount(50000);
              setCalculationResult(calculateRedemption(DEMO_FUND, 50000));
              setPreviousResult(null);
              setCurrentScreen('terminal');
            }}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer
        onOpenRules={() => {
          setGlossaryInitialTab('rules');
          setIsGlossaryOpen(true);
        }}
        onOpenGlossary={() => {
          setGlossaryInitialTab('glossary');
          setIsGlossaryOpen(true);
        }}
        onOpenDiagnostics={() => setIsTestModalOpen(true)}
      />

      {/* Overlay Modals & Drawers */}
      {calculationResult && (
        <>
          <ComparisonView
            isOpen={isComparisonOpen}
            onClose={() => setIsComparisonOpen(false)}
            currentAmount={calculationResult.grossRedemptionValue}
            onSelectAmount={handleSelectAmountFromScenario}
          />

          <ExplanationDrawer
            isOpen={isExplanationOpen}
            onClose={() => setIsExplanationOpen(false)}
            result={calculationResult}
            onChangeAmount={() => setCurrentScreen('terminal')}
            onOpenGlossary={() => {
              setGlossaryInitialTab('glossary');
              setIsGlossaryOpen(true);
            }}
          />

          <ExportRecordModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            result={calculationResult}
            fund={DEMO_FUND}
          />
        </>
      )}

      {/* Standalone Canonical Glossary Reference */}
      <StandaloneGlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        initialTab={glossaryInitialTab}
      />

      {/* Automated Financial Verification Modal */}
      <TestFixtureModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
    </div>
  );
}
