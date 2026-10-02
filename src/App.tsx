import React, { useState } from 'react';
import { AppScreen, CalculationResult } from './types';
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

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('portfolio');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);

  // Explored Scenarios state tracked during session per Section 14
  const [exploredScenarios, setExploredScenarios] = useState<number[]>([25000, 50000, 75000]);

  // Modals & Drawers state
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

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
      setSelectedAmount(amount);
      setCalculationResult(result);

      // Track explored scenarios without duplication
      setExploredScenarios((prev) => {
        if (!prev.includes(amount)) {
          return [...prev, amount].sort((a, b) => a - b);
        }
        return prev;
      });

      setCurrentScreen('redemption_snapshot');
    } catch (err: any) {
      alert(err.message || 'Unable to calculate consequences for this amount.');
    }
  };

  // Live amount slider change on snapshot screen (instant recalculation)
  const handleLiveAmountChange = (amount: number) => {
    try {
      const result = calculateRedemption(DEMO_FUND, amount);
      setSelectedAmount(amount);
      setCalculationResult(result);
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
    <div className="min-h-screen flex flex-col bg-[#F1F4F9] text-slate-900">
      {/* Global Header */}
      <Header
        activeScreen={currentScreen}
        onOpenTestFixtures={() => setIsTestModalOpen(true)}
        onOpenGlossary={() => setIsExplanationOpen(true)}
        onNavigateHome={() => setCurrentScreen('portfolio')}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentScreen === 'portfolio' && (
          <PortfolioScreen onViewFund={handleViewFund} />
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
            onChangeAmount={handleChangeAmount}
            onOpenComparison={() => setIsComparisonOpen(true)}
            onOpenExplanationDrawer={() => setIsExplanationOpen(true)}
            onOpenExportRecord={() => setIsExportModalOpen(true)}
            onContinue={() => setCurrentScreen('prototype_end')}
            exploredScenarios={exploredScenarios}
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
              setCurrentScreen('enter_amount');
            }}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer
        onOpenRules={() => setIsExplanationOpen(true)}
        onOpenGlossary={() => setIsExplanationOpen(true)}
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
          />

          <ExportRecordModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            result={calculationResult}
            fund={DEMO_FUND}
          />
        </>
      )}

      {/* Fallback if user opens glossary before calculating */}
      {!calculationResult && isExplanationOpen && (
        <ExplanationDrawer
          isOpen={isExplanationOpen}
          onClose={() => setIsExplanationOpen(false)}
          result={calculateRedemption(DEMO_FUND, 50000)}
          onChangeAmount={() => {
            setIsExplanationOpen(false);
            setCurrentScreen('enter_amount');
          }}
        />
      )}

      <TestFixtureModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
    </div>
  );
}
