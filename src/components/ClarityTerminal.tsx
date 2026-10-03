import React, { useState } from 'react';
import {
  Scale,
  FileDown,
  History,
  Layers,
  Sparkles,
  Info,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { CalculationResult, ScenarioHistoryItem } from '../types';
import { DEMO_FUND } from '../data/fundData';
import { formatCurrency, formatUnits } from '../services/calculationEngine';
import { MarketContextStrip } from './MarketContextStrip';
import { RelevantContextPanel } from './RelevantContextPanel';
import { RuleTransparency } from './RuleTransparency';
import { CalculationTrace } from './CalculationTrace';

interface ClarityTerminalProps {
  result: CalculationResult;
  previousResult?: CalculationResult | null;
  onLiveAmountChange: (amount: number) => void;
  onSelectExploredScenario: (amount: number) => void;
  onOpenComparison: () => void;
  onOpenExplanationDrawer: () => void;
  onOpenExportRecord: () => void;
  onOpenGlossary: (tab?: 'glossary' | 'rules') => void;
  onViewFund: () => void;
  onContinue: () => void;
  scenarioHistory: ScenarioHistoryItem[];
}

export const ClarityTerminal: React.FC<ClarityTerminalProps> = ({
  result,
  previousResult = null,
  onLiveAmountChange,
  onSelectExploredScenario,
  onOpenComparison,
  onOpenExplanationDrawer,
  onOpenExportRecord,
  onOpenGlossary,
  onViewFund,
  onContinue,
  scenarioHistory = [],
}) => {
  const [selectedLotDetails, setSelectedLotDetails] = useState<'lot-a' | 'lot-b' | null>(null);

  // Scenario net-proceeds trend delta vs previous scenario in session
  const previousProceeds =
    previousResult && previousResult.grossRedemptionValue !== result.grossRedemptionValue
      ? previousResult.estimatedProceeds
      : null;

  const proceedsDifference =
    previousProceeds !== null ? result.estimatedProceeds - previousProceeds : null;

  // Dynamically derived lot allocations
  const lotA = result.lotBreakdown.find((l) => l.lotId === 'lot-a');
  const lotB = result.lotBreakdown.find((l) => l.lotId === 'lot-b');

  const lotAConfig = DEMO_FUND.lots[0];
  const lotBConfig = DEMO_FUND.lots[1];
  const lotATotalUnits = lotAConfig?.units ?? 0;
  const lotBTotalUnits = lotBConfig?.units ?? 0;
  const totalHoldingUnits = DEMO_FUND.totalUnits;

  const lotARedeemed = lotA ? lotA.unitsRedeemedFromLot : 0;
  const lotBRedeemed = lotB ? lotB.unitsRedeemedFromLot : 0;

  const lotAPct = lotATotalUnits > 0 ? Math.min(100, (lotARedeemed / lotATotalUnits) * 100) : 0;
  const lotBPct = lotBTotalUnits > 0 ? Math.min(100, (lotBRedeemed / lotBTotalUnits) * 100) : 0;

  const lotABoundaryAmount = lotATotalUnits * result.illustrativeNAV;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onLiveAmountChange(val);
    }
  };

  const handleCustomAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    const num = parseFloat(rawVal);
    if (!isNaN(num)) {
      const clamped = Math.min(DEMO_FUND.holdingValue, Math.max(1000, num));
      onLiveAmountChange(clamped);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* DECISION CONTEXT HEADER (Section 24) */}
      <div className="bg-[#FFFFFF] border border-[#DDD9D0] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#247A5A] bg-[#247A5A]/10 px-2 py-0.5 rounded">
              Decision context
            </span>
            <span className="text-xs text-[#DDD9D0]">•</span>
            <span className="text-xs text-[#8A8D86]">Illustrative scenario · 01 Oct 2026</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E211F] font-sans">
            Redeem {formatCurrency(result.grossRedemptionValue, 0)} from {DEMO_FUND.name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#666861] pt-0.5">
            <span><strong>What Clarity shows:</strong> consequences + relevant context + evidence</span>
            <span className="text-[#DDD9D0] hidden sm:inline">•</span>
            <span className="text-[#8A8D86]"><strong>What Clarity does not do:</strong> recommend whether to redeem</span>
          </div>
        </div>

        {/* Global Terminal Utility Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => onOpenGlossary('rules')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1E211F] bg-[#FFFFFF] hover:bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg transition-colors cursor-pointer shadow-xs"
            title="Inspect scheme SID and statutory rules"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#247A5A]" />
            <span>Rules register</span>
          </button>

          <button
            onClick={onOpenComparison}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1E211F] bg-[#FFFFFF] hover:bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg transition-colors cursor-pointer shadow-xs"
            title="Compare benchmark redemption amounts side-by-side"
          >
            <Scale className="w-3.5 h-3.5 text-[#666861]" />
            <span>Compare</span>
          </button>

          <button
            onClick={onOpenExportRecord}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1E211F] bg-[#FFFFFF] hover:bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg transition-colors cursor-pointer shadow-xs"
            title="Export or print redemption snapshot record"
          >
            <FileDown className="w-3.5 h-3.5 text-[#666861]" />
            <span>Save snapshot</span>
          </button>
        </div>
      </div>

      {/* PRIMARY 3-COLUMN WORKSPACE: HOLDING (Col 1) | SNAPSHOT HERO (Col 2) | RELEVANT CONTEXT (Col 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ============================================================== */}
        {/* ZONE B: YOUR HOLDING (Col 1 - 3 cols) */}
        {/* ============================================================== */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[#FFFFFF] border border-[#DDD9D0] rounded-xl p-5 shadow-xs space-y-4">
            <div className="pb-3 border-b border-[#DDD9D0]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8D86] block">
                Zone B · Selected Holding
              </span>
              <h2 className="text-base font-bold text-[#1E211F] mt-0.5 leading-snug">
                {DEMO_FUND.name}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-xs text-[#666861]">
                <span>{DEMO_FUND.category}</span>
                <span>•</span>
                <span>{DEMO_FUND.plan}</span>
              </div>
            </div>

            {/* Total Holding Figures */}
            <div className="p-3.5 bg-[#F1EFE9] rounded-lg border border-[#DDD9D0] space-y-1 font-mono">
              <span className="text-[10px] text-[#8A8D86] font-sans block uppercase tracking-wider font-semibold">
                Holding Value at NAV
              </span>
              <span className="text-xl font-bold text-[#1E211F] block">
                {formatCurrency(DEMO_FUND.holdingValue)}
              </span>
              <span className="text-[11px] text-[#666861] block">
                {formatUnits(DEMO_FUND.totalUnits)} units @ {formatCurrency(DEMO_FUND.illustrativeNAV)}
              </span>
            </div>

            {/* Underlying Purchase Lots (FIFO) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1E211F] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#666861]" />
                  Purchase Lots (2)
                </span>
                <span className="text-[10px] text-[#8A8D86]">FIFO order</span>
              </div>

              {DEMO_FUND.lots.map((lot) => (
                <div
                  key={lot.id}
                  className="bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg p-3 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1E211F]">{lot.name}</span>
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-medium rounded ${
                        lot.exitLoadEligible
                          ? 'bg-[#A66A16]/10 text-[#A66A16] border border-[#A66A16]/20'
                          : 'bg-[#247A5A]/10 text-[#247A5A] border border-[#247A5A]/20'
                      }`}
                    >
                      {lot.exitLoadEligible ? '1% exit load' : '0% load (>365d)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline font-mono text-[11px] text-[#666861]">
                    <span>{formatUnits(lot.units)} units</span>
                    <span>{formatCurrency(lot.units * DEMO_FUND.illustrativeNAV)}</span>
                  </div>
                  <div className="text-[10px] text-[#8A8D86] font-sans">
                    Allotted {lot.allotmentDate} · {lot.reason}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#DDD9D0] flex items-center justify-between text-xs">
              <span className="text-[#8A8D86] text-[11px]">Illustrative NAV: ₹152.00</span>
              <button
                onClick={onViewFund}
                className="text-[#247A5A] hover:underline font-semibold flex items-center gap-1 cursor-pointer text-xs"
              >
                <span>Full prospectus</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ZONE C: REDEMPTION SNAPSHOT — THE PRODUCT HERO (Col 2 - 6 cols) */}
        {/* ============================================================== */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#FFFFFF] border border-[#DDD9D0] rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
            {/* Amount Input & Quick Exploration Controls */}
            <div className="space-y-3 pb-4 border-b border-[#DDD9D0]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8D86] block">
                    Zone C · Product Hero
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-semibold text-[#666861]">Amount to redeem:</span>
                    <span className="text-xl sm:text-2xl font-bold font-mono text-[#1E211F]">
                      {formatCurrency(result.grossRedemptionValue, 0)}
                    </span>
                  </div>
                </div>

                {/* Quick Benchmark Chips */}
                <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                  {[25000, 50000, 75000, DEMO_FUND.holdingValue].map((amt) => {
                    const isSelected = result.grossRedemptionValue === amt;
                    return (
                      <button
                        key={amt}
                        onClick={() => onLiveAmountChange(amt)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#247A5A] text-white shadow-xs'
                            : 'bg-[#F1EFE9] text-[#1E211F] hover:bg-[#E8E5DD] border border-[#DDD9D0]'
                        }`}
                      >
                        {amt === DEMO_FUND.holdingValue ? 'Full amount' : formatCurrency(amt, 0)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Range Slider for Instant Recalculation */}
              <div className="space-y-1.5">
                <input
                  type="range"
                  min="1000"
                  max={DEMO_FUND.holdingValue}
                  step="1000"
                  value={result.grossRedemptionValue}
                  onChange={handleSliderChange}
                  className="w-full cursor-pointer"
                  aria-label="Adjust redemption amount"
                />
                <div className="flex justify-between text-[11px] text-[#8A8D86] font-mono">
                  <span>Min: ₹1,000</span>
                  <span className="text-[#A66A16] font-sans font-medium text-[10px]">
                    Lot A 0% load boundary: {formatCurrency(lotABoundaryAmount, 0)}
                  </span>
                  <span>Max: {formatCurrency(DEMO_FUND.holdingValue, 0)}</span>
                </div>
              </div>
            </div>

            {/* Estimated Proceeds Hero Badge */}
            <div className="bg-[#247A5A] text-white rounded-xl p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-white/90 block">
                    Estimated Net Proceeds
                  </span>
                  <div className="text-3xl sm:text-4xl font-bold font-mono tracking-tight mt-1 text-white">
                    {formatCurrency(result.estimatedProceeds)}
                  </div>
                  <span className="text-[11px] text-white/80 block mt-1">
                    Indicative processing timeline; actual timing depends on scheme terms, cut-off timing, and business days
                  </span>
                </div>

                {/* Session Trend Delta */}
                {proceedsDifference !== null && (
                  <div className="bg-black/20 text-white rounded-lg px-3 py-2 text-xs font-mono self-start sm:self-auto text-right">
                    <span className="text-[10px] text-white/80 block font-sans">vs previous explored</span>
                    <span className="font-bold">
                      {Math.abs(proceedsDifference) < 0.005 ? (
                        '— Unchanged'
                      ) : proceedsDifference > 0 ? (
                        `↑ +${formatCurrency(proceedsDifference)}`
                      ) : (
                        `↓ -${formatCurrency(Math.abs(proceedsDifference))}`
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 4 Core Consequence Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Pillar 1: Amount entered */}
              <div className="bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg p-3">
                <span className="text-[10px] font-semibold text-[#8A8D86] uppercase tracking-wider block">
                  Amount entered
                </span>
                <div className="text-sm sm:text-base font-bold font-mono text-[#1E211F] mt-0.5">
                  {formatCurrency(result.grossRedemptionValue)}
                </div>
                <span className="text-[10px] text-[#666861] block mt-0.5">Gross requested</span>
              </div>

              {/* Pillar 2: Deductions */}
              <div className="bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg p-3">
                <span className="text-[10px] font-semibold text-[#8A8D86] uppercase tracking-wider block">
                  Deductions
                </span>
                <div className="text-sm sm:text-base font-bold font-mono text-[#A66A16] mt-0.5">
                  {formatCurrency(result.totalDeductions)}
                </div>
                <span className="text-[10px] text-[#666861] block mt-0.5">
                  Load {formatCurrency(result.exitLoadAmount)} · STT {formatCurrency(result.STTAmount)}
                </span>
              </div>

              {/* Pillar 3: Units Redeemed */}
              <div className="bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg p-3">
                <span className="text-[10px] font-semibold text-[#8A8D86] uppercase tracking-wider block">
                  Units redeemed
                </span>
                <div className="text-sm sm:text-base font-bold font-mono text-[#1E211F] mt-0.5">
                  {formatUnits(result.unitsRedeemed)}
                </div>
                <span className="text-[10px] text-[#666861] block mt-0.5">@ NAV {formatCurrency(result.illustrativeNAV)}</span>
              </div>

              {/* Pillar 4: Remains Invested */}
              <div className="bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg p-3">
                <span className="text-[10px] font-semibold text-[#8A8D86] uppercase tracking-wider block">
                  Remains invested
                </span>
                <div className="text-sm sm:text-base font-bold font-mono text-[#247A5A] mt-0.5">
                  {formatCurrency(result.remainingValueAtIllustrativeNAV)}
                </div>
                <span className="text-[10px] text-[#666861] block mt-0.5 font-mono">
                  {formatUnits(result.remainingUnits)} units
                </span>
              </div>
            </div>

            {/* Visual FIFO Allocation Segmented Progress Bar */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1E211F] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#666861]" />
                  FIFO lot consumption for this amount
                </span>
                <span className="text-[11px] font-mono text-[#8A8D86]">
                  {formatUnits(result.unitsRedeemed)} / {formatUnits(totalHoldingUnits)} units
                </span>
              </div>

              <div className="h-6 w-full bg-[#E8E5DD] rounded-lg overflow-hidden flex border border-[#DDD9D0]">
                {/* Lot A segment */}
                <div
                  style={{ width: `${(lotATotalUnits / totalHoldingUnits) * 100}%` }}
                  className="relative bg-[#DDD9D0] flex items-center justify-center text-[10px] font-semibold text-[#1E211F] transition-all border-r border-[#C4BFB5]"
                  title={`Lot A: ${formatUnits(lotARedeemed)} of ${formatUnits(lotATotalUnits)} units redeemed`}
                >
                  <div
                    style={{ width: `${lotAPct}%` }}
                    className="absolute inset-y-0 left-0 bg-[#247A5A] transition-all"
                  />
                  <span className={`relative z-10 px-1 truncate font-mono ${lotAPct > 50 ? 'text-white' : 'text-[#1E211F]'}`}>
                    Lot A ({formatUnits(lotATotalUnits)} u) · {lotAPct.toFixed(0)}%
                  </span>
                </div>

                {/* Lot B segment */}
                <div
                  style={{ width: `${(lotBTotalUnits / totalHoldingUnits) * 100}%` }}
                  className="relative bg-[#E8E5DD] flex items-center justify-center text-[10px] font-semibold text-[#1E211F] transition-all"
                  title={`Lot B: ${formatUnits(lotBRedeemed)} of ${formatUnits(lotBTotalUnits)} units redeemed`}
                >
                  <div
                    style={{ width: `${lotBPct}%` }}
                    className="absolute inset-y-0 left-0 bg-[#A66A16] transition-all"
                  />
                  <span className={`relative z-10 px-1 truncate font-mono ${lotBPct > 50 ? 'text-white' : 'text-[#1E211F]'}`}>
                    Lot B ({formatUnits(lotBTotalUnits)} u) · {lotBPct.toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between text-[11px] text-[#666861] gap-1 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-xs bg-[#247A5A] inline-block" />
                  Lot A: 412 days held (0% exit load)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-xs bg-[#A66A16] inline-block" />
                  Lot B: 214 days held (1% demo exit load)
                </span>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="pt-2 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={onOpenExplanationDrawer}
                  className="py-2.5 px-3 text-xs font-semibold text-[#1E211F] bg-[#FFFFFF] hover:bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-[#247A5A]" />
                  <span>Ask about this redemption</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenComparison}
                  className="py-2.5 px-3 text-xs font-semibold text-[#1E211F] bg-[#FFFFFF] hover:bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Scale className="w-4 h-4 text-[#666861]" />
                  <span>Compare consequences</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onContinue}
                className="w-full py-3 px-4 bg-[#247A5A] hover:bg-[#1D6349] text-white font-semibold text-xs sm:text-sm rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <span>Continue to review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ZONE D: RELEVANT CONTEXT FEED (Col 3 - 3 cols) */}
        {/* ============================================================== */}
        <div className="lg:col-span-3 space-y-4">
          <RelevantContextPanel />
        </div>
      </div>

      {/* LOWER 2-COLUMN WORKSPACE: SCENARIOS (Left) | WHY THIS NUMBER / EVIDENCE (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
        {/* ============================================================== */}
        {/* ZONE E: SCENARIO EXPLORER & SESSION HISTORY (6 cols) */}
        {/* ============================================================== */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#FFFFFF] border border-[#DDD9D0] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDD9D0]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8D86] block">
                  Zone E · Scenario Exploration
                </span>
                <h3 className="text-sm font-bold text-[#1E211F]">
                  Benchmark scenario comparison
                </h3>
              </div>
              <button
                onClick={onOpenComparison}
                className="text-xs font-semibold text-[#247A5A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Full comparison modal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Benchmark Scenarios Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#DDD9D0] text-[#8A8D86] text-[10px] uppercase tracking-wider font-sans">
                    <th className="pb-2 font-semibold">Amount</th>
                    <th className="pb-2 font-semibold text-right">Units</th>
                    <th className="pb-2 font-semibold text-right">Deductions</th>
                    <th className="pb-2 font-semibold text-right">Proceeds</th>
                    <th className="pb-2 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD9D0]/60">
                  {[
                    { amt: 25000, label: '₹25,000', note: 'Lot A only (0% load)' },
                    { amt: 50000, label: '₹50,000', note: 'Crosses into Lot B' },
                    { amt: 75000, label: '₹75,000', note: 'Higher Lot B share' },
                    { amt: DEMO_FUND.holdingValue, label: 'Full', note: '100% liquidated' },
                  ].map((item) => {
                    const isCurrent = result.grossRedemptionValue === item.amt;
                    // Compute basic row values
                    const units = item.amt / result.illustrativeNAV;
                    const lotAUnits = Math.min(300, units);
                    const lotBUnits = Math.max(0, units - 300);
                    const exitLoad = lotBUnits * result.illustrativeNAV * 0.01;
                    const stt = Math.round(item.amt * 0.00001 * 100) / 100;
                    const deductions = exitLoad + stt;
                    const proceeds = item.amt - deductions;

                    return (
                      <tr
                        key={item.amt}
                        className={`transition-colors ${
                          isCurrent ? 'bg-[#247A5A]/5 font-bold' : 'hover:bg-[#F1EFE9]'
                        }`}
                      >
                        <td className="py-2.5 font-bold text-[#1E211F]">
                          <div>{item.label}</div>
                          <div className="text-[10px] text-[#8A8D86] font-sans font-normal">{item.note}</div>
                        </td>
                        <td className="py-2.5 text-right text-[#666861]">{units.toFixed(3)}</td>
                        <td className="py-2.5 text-right text-[#A66A16]">{formatCurrency(deductions)}</td>
                        <td className="py-2.5 text-right text-[#247A5A]">{formatCurrency(proceeds)}</td>
                        <td className="py-2.5 text-right font-sans">
                          {isCurrent ? (
                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#247A5A] text-white rounded">
                              Active
                            </span>
                          ) : (
                            <button
                              onClick={() => onLiveAmountChange(item.amt)}
                              className="px-2 py-0.5 text-[10px] font-semibold bg-[#F1EFE9] text-[#1E211F] hover:bg-[#E8E5DD] rounded border border-[#DDD9D0] cursor-pointer"
                            >
                              Explore
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Session Explored Scenarios (Starts Strictly Empty, Section 30) */}
            <div className="pt-3 border-t border-[#DDD9D0] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8A8D86] font-semibold uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
                  <History className="w-3.5 h-3.5 text-[#666861]" />
                  Explored in this session ({scenarioHistory.length})
                </span>
                <span className="text-[10px] text-[#8A8D86]">
                  Session only · No transactions occur
                </span>
              </div>

              {scenarioHistory.length === 0 ? (
                <div className="p-3 bg-[#F1EFE9] rounded-lg border border-[#DDD9D0] text-center text-xs text-[#8A8D86]">
                  No additional scenarios explored yet. Use the slider or chips above to explore different amounts.
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-1.5">
                  {scenarioHistory.map((item) => {
                    const isActive = item.amount === result.grossRedemptionValue;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onSelectExploredScenario(item.amount)}
                        className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer ${
                          isActive
                            ? 'bg-[#247A5A] text-white font-bold'
                            : 'bg-[#F1EFE9] text-[#1E211F] hover:bg-[#E8E5DD] border border-[#DDD9D0]'
                        }`}
                        title={`Proceeds: ${formatCurrency(item.netProceeds)} · Deductions: ${formatCurrency(item.totalDeductions)}`}
                      >
                        <span>{formatCurrency(item.amount, 0)}</span>
                        <span className="text-[10px] opacity-75 font-sans">• {item.timestamp}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ZONE F: WHY THIS NUMBER? & EVIDENCE CHAIN (6 cols) */}
        {/* ============================================================== */}
        <div className="lg:col-span-6 space-y-4">
          <RuleTransparency result={result} defaultExpanded={false} />
          <CalculationTrace result={result} defaultExpanded={false} />

          <div className="bg-[#FFFFFF] border border-[#DDD9D0] rounded-xl p-4 shadow-xs flex items-center justify-between text-xs text-[#666861]">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#247A5A]" />
              <span>Reference canonical glossary or statutory circulars</span>
            </div>
            <button
              onClick={() => onOpenGlossary('rules')}
              className="text-[#247A5A] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Open rules register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* LEVEL 5: COMPACT SUPPORTING MARKET CONTEXT (Section 8 & 25) */}
      <div className="pt-2">
        <MarketContextStrip />
      </div>
    </div>
  );
};
