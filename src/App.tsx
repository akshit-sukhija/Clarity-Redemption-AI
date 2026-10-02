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

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('portfolio');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);

  // Initial session history items (Section 18)
  const [scenarioHistory, setScenarioHistory] = useState<ScenarioHistoryItem[]>([
    {
      id: 'scen-init-1',
      amount: 25000,
      timestamp: '08:30 AM',
      netProceeds: 24999.75,
      totalDeductions: 0.25,
      unitsRedeemed: 164.474,
    },
    {
      id: 'scen-init-2',
      amount: 50000,
      timestamp: '08:35 AM',
      netProceeds: 49955.50,
      totalDeductions: 44.50,
      unitsRedeemed: 328.947,
    },
    {
      id: 'scen-init-3',
      amount: 75000,
      timestamp: '08:40 AM',
      netProceeds: 74705.25,
      totalDeductions: 294.75,
      unitsRedeemed: 493.421,
    },
  ]);

  // Explored Scenarios state tracked during session per Section 14
  const [exploredScenarios, setExploredScenarios] = useState<number[]>([25000, 50000, 75000]);

  // Modals & Drawers state
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Records a scenario in the session exploration history without consecutive duplicates
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
      return [...prev.slice(-7), item];
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
      alert(err.message || 'Unable to calculate consequences for this amount.');
    }
  };

  // Live amount slider change on snapshot screen (instant recalculation)
  const handleLiveAmountChange = (amount: number) => {
    try {
      const result = calculateRedemption(DEMO_FUND, amount);
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
    <div className="min-h-screen flex flex-col bg-[#0D1626] text-[#F5F7FA]">
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
