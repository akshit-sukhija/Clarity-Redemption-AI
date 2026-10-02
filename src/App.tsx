import React, { useState } from 'react';
import { AppScreen, CalculationResult, ScenarioHistoryItem } from './types';
import { DEMO_FUND } from './data/fundData';
import { calculateRedemption } from './services/calculationEngine';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PortfolioScreen } from './components/PortfolioScreen';
import { FundDetailsScreen } from './components/FundDetailsScreen';
import { RedeemAmountScreen } from './components/RedeemAmountScreen';
import { RedemptionSnapshotScreen } from './components/RedemptionSnapshotScreen';
import { ComparisonView } from './components/ComparisonView';
import { ExplanationDrawer } from './components/ExplanationDrawer';
import { EndStateScreen } from './components/EndStateScreen';
import { TestFixtureModal } from './components/TestFixtureModal';
import { ExportRecordModal } from './components/ExportRecordModal';
import { StandaloneGlossaryModal } from './components/StandaloneGlossaryModal';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('portfolio');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [previousResult, setPreviousResult] = useState<CalculationResult | null>(null);

  // Initial session history items (Section 7: Start strictly EMPTY, no fake entries)
  const [scenarioHistory, setScenarioHistory] = useState<ScenarioHistoryItem[]>([]);

  // Explored Scenarios state tracked during session (start strictly empty)
  const [exploredScenarios, setExploredScenarios] = useState<number[]>([]);

  // Modals & Drawers state (Phase 3: Standalone Glossary separate from Analyst)
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

  // Navigate to Fund Details
  const handleViewFund = () => {
    setCurrentScreen('fund_details');
  };

  // Start Redemption
  const handleStartRedemption = () => {
    setCurrentScreen('enter_amount');
  };

  // Amount entered and proceed to Snapshot
  const handleProceedToSnapshot = (amount: number) => {
    try {
      const result = calculateRedemption(DEMO_FUND, amount);
      if (calculationResult && calculationResult.grossRedemptionValue !== amount) {
        setPreviousResult(calculationResult);
      }
      setSelectedAmount(amount);
      setCalculationResult(result);
      recordScenario(amount, result);

      // Track explored scenarios without duplication
      setExploredScenarios((prev) => {
        if (!prev.includes(amount)) {
          return [...prev, amount].sort((a, b) => a - b);
        }
        return prev;
      });

      setCurrentScreen('redemption_snapshot');
    } catch (err: any) {
      console.error(err?.message || 'Unable to calculate consequences for this amount.');
    }
  };

  // Live amount slider change on snapshot screen (instant recalculation)
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

  // Change amount action
  const handleChangeAmount = () => {
    setCurrentScreen('enter_amount');
  };

  // Amount chosen from comparison scenario or explored scenario chip
  const handleSelectAmountFromScenario = (amt: number) => {
    handleProceedToSnapshot(amt);
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
        onNavigateHome={() => setCurrentScreen('portfolio')}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentScreen === 'portfolio' && (
          <PortfolioScreen
            onViewFund={handleViewFund}
            onQuickExplore={handleProceedToSnapshot}
          />
        )}

        {currentScreen === 'fund_details' && (
          <FundDetailsScreen
            onBack={() => setCurrentScreen('portfolio')}
            onStartRedemption={handleStartRedemption}
          />
        )}

        {currentScreen === 'enter_amount' && (
          <RedeemAmountScreen
            onBack={() => setCurrentScreen('fund_details')}
            onProceed={handleProceedToSnapshot}
            initialAmount={selectedAmount}
          />
        )}

        {currentScreen === 'redemption_snapshot' && calculationResult && (
          <RedemptionSnapshotScreen
            result={calculationResult}
            previousResult={previousResult}
            onChangeAmount={handleChangeAmount}
            onOpenComparison={() => setIsComparisonOpen(true)}
            onOpenExplanationDrawer={() => setIsExplanationOpen(true)}
            onOpenExportRecord={() => setIsExportModalOpen(true)}
            onContinue={() => setCurrentScreen('prototype_end')}
            exploredScenarios={exploredScenarios}
            scenarioHistory={scenarioHistory}
            onSelectExploredScenario={handleSelectAmountFromScenario}
            onLiveAmountChange={handleLiveAmountChange}
          />
        )}

        {currentScreen === 'prototype_end' && calculationResult && (
          <EndStateScreen
            result={calculationResult}
            onReturnToSnapshot={() => setCurrentScreen('redemption_snapshot')}
            onStartNewScenario={() => {
              setSelectedAmount(null);
              setCalculationResult(null);
              setPreviousResult(null);
              setCurrentScreen('enter_amount');
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
            onChangeAmount={handleChangeAmount}
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

      {/* Standalone Canonical Glossary Reference (Phase 3 & Section O) */}
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
