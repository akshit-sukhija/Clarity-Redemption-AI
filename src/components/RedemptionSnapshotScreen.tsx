import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Scale,
  Edit3,
  FileDown,
  History,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { CalculationResult, ScenarioHistoryItem } from '../types';
import { DEMO_FUND } from '../data/fundData';
import { formatCurrency, formatUnits } from '../services/calculationEngine';
import { CalculationTrace } from './CalculationTrace';
import { RuleTransparency } from './RuleTransparency';
import { ConsequenceImpactChart } from './ConsequenceImpactChart';

interface RedemptionSnapshotScreenProps {
  result: CalculationResult;
  previousResult?: CalculationResult | null;
  onChangeAmount: () => void;
  onOpenComparison: () => void;
  onOpenExplanationDrawer: () => void;
  onOpenExportRecord: () => void;
  onContinue: () => void;
  exploredScenarios?: number[];
  scenarioHistory?: ScenarioHistoryItem[];
  onSelectExploredScenario: (amount: number) => void;
  onLiveAmountChange?: (amount: number) => void;
}

export const RedemptionSnapshotScreen: React.FC<RedemptionSnapshotScreenProps> = ({
  result,
  previousResult = null,
  onChangeAmount,
  onOpenComparison,
  onOpenExplanationDrawer,
  onOpenExportRecord,
  onContinue,
  exploredScenarios = [],
  scenarioHistory = [],
  onSelectExploredScenario,
  onLiveAmountChange,
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
    if (!isNaN(val) && onLiveAmountChange) {
      onLiveAmountChange(val);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Top Breadcrumb & Action Utility Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FFFFFF] p-3.5 rounded-xl border border-[#DDD9D0] shadow-xs">
        <button
          onClick={onChangeAmount}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#666861] hover:text-[#1E211F] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Change redemption amount</span>
        </button>

        <div className="flex items-center gap-2.5">
          <span className="text-xs text-[#8A8D86] hidden sm:inline">
            Scheme: <strong className="text-[#1E211F]">{DEMO_FUND.name}</strong>
          </span>
          <button
            onClick={onOpenExportRecord}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1E211F] hover:bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg transition-colors cursor-pointer"
            title="Save or export redemption snapshot"
          >
            <FileDown className="w-3.5 h-3.5 text-[#666861]" />
            <span>Save snapshot</span>
          </button>
        </div>
      </div>

      {/* Interactive Scenario Explorer Bar */}
      <div className="bg-[#FFFFFF] rounded-xl p-5 sm:p-6 shadow-xs border border-[#DDD9D0] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8D86] block">
              Redemption amount
            </span>
            <div className="text-lg font-bold text-[#1E211F] flex items-center gap-2 mt-0.5">
              <span>Selected:</span>
              <span className="text-2xl font-mono text-[#247A5A] font-bold">
                {formatCurrency(result.grossRedemptionValue, 0)}
              </span>
            </div>
          </div>

          {/* Quick Scenario Shortcuts */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            {[25000, 50000, 75000, DEMO_FUND.holdingValue].map((amt) => {
              const isSelected = result.grossRedemptionValue === amt;
              return (
                <button
                  key={amt}
                  onClick={() => onLiveAmountChange && onLiveAmountChange(amt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#247A5A] text-white'
                      : 'bg-[#F1EFE9] text-[#1E211F] hover:bg-[#E8E5DD] border border-[#DDD9D0]'
                  }`}
                >
                  {amt === DEMO_FUND.holdingValue ? 'Full amount' : formatCurrency(amt, 0)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Range Slider */}
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
            <span className="text-[#A66A16] font-sans font-medium">
              Lot A 0% load boundary: {formatCurrency(lotABoundaryAmount, 0)}
            </span>
            <span>Max: {formatCurrency(DEMO_FUND.holdingValue, 0)}</span>
          </div>
        </div>

        {/* Scenarios Explored in Session */}
        {scenarioHistory && scenarioHistory.length > 0 && (
          <div className="pt-3 border-t border-[#DDD9D0] space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
              <span className="text-[#8A8D86] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-[#666861]" />
                Explored in this session
              </span>
              <span className="text-[#8A8D86]">
                Session exploration only · No transactions occur
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
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
          </div>
        )}
      </div>

      {/* PRODUCT HERO: REDEMPTION SNAPSHOT */}
      <div className="bg-[#FFFFFF] rounded-xl border border-[#DDD9D0] shadow-xs overflow-hidden">
        {/* Header Block */}
        <div className="p-6 sm:p-7 border-b border-[#DDD9D0]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8D86]">
                  Redemption snapshot
                </span>
                <span className="text-xs text-[#DDD9D0]">•</span>
                <span className="text-xs text-[#666861]">
                  Scenario date: {DEMO_FUND.demoAsOfDate}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1E211F] tracking-tight">
                Consequence summary
              </h1>
              <p className="text-xs sm:text-sm text-[#666861] mt-1">
                Pre-confirmation overview for {formatCurrency(result.grossRedemptionValue)} gross redemption.
              </p>
            </div>

            {/* Estimated Proceeds Hero Badge */}
            <div className="bg-[#247A5A] text-white rounded-xl p-5 shadow-xs md:text-right shrink-0 min-w-[260px]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/90 block">
                Estimated net proceeds
              </span>
              <div className="text-3xl sm:text-4xl font-bold font-mono tracking-tight mt-1">
                {formatCurrency(result.estimatedProceeds)}
              </div>

              {/* Delta vs Previous Scenario */}
              {proceedsDifference !== null && (
                <div
                  className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-black/20 text-white text-xs font-mono"
                  title="Difference compared to previous scenario explored in this session"
                >
                  {Math.abs(proceedsDifference) < 0.005 ? (
                    <span>— Unchanged vs previous</span>
                  ) : proceedsDifference > 0 ? (
                    <span>↑ +{formatCurrency(proceedsDifference)} vs previous</span>
                  ) : (
                    <span>↓ -{formatCurrency(Math.abs(proceedsDifference))} vs previous</span>
                  )}
                </div>
              )}

              <span className="text-[11px] text-white/80 block mt-1.5">
                Indicative processing timeline; actual timing depends on scheme terms, cut-off timing, and business days
              </span>
            </div>
          </div>

          {/* 4 Consequence Pillars */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#DDD9D0]">
            {/* Pillar 1: Entered */}
            <div className="bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg p-3.5">
              <span className="text-[11px] font-semibold text-[#8A8D86] uppercase tracking-wider block">
                Amount entered
              </span>
              <div className="text-lg font-bold font-mono text-[#1E211F] mt-0.5">
                {formatCurrency(result.grossRedemptionValue)}
              </div>
              <span className="text-[11px] text-[#666861] block mt-0.5">
                Gross redemption requested
              </span>
            </div>

            {/* Pillar 2: Deductions */}
            <div className="bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#8A8D86] uppercase tracking-wider block">
                  Total deductions
                </span>
              </div>
              <div className="text-lg font-bold font-mono text-[#A66A16] mt-0.5">
                {formatCurrency(result.totalDeductions)}
              </div>
              <span className="text-[11px] text-[#666861] block mt-0.5">
                Exit load {formatCurrency(result.exitLoadAmount)} · STT {formatCurrency(result.STTAmount)}
              </span>
            </div>

            {/* Pillar 3: Units Redeemed */}
            <div className="bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg p-3.5">
              <span className="text-[11px] font-semibold text-[#8A8D86] uppercase tracking-wider block">
                Units redeemed
              </span>
              <div className="text-lg font-bold font-mono text-[#1E211F] mt-0.5">
                {formatUnits(result.unitsRedeemed)}
              </div>
              <span className="text-[11px] text-[#666861] block mt-0.5">
                At Illustrative NAV {formatCurrency(result.illustrativeNAV)}
              </span>
            </div>

            {/* Pillar 4: Remains Invested */}
            <div className="bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg p-3.5">
              <span className="text-[11px] font-semibold text-[#8A8D86] uppercase tracking-wider block">
                What remains invested
              </span>
              <div className="text-lg font-bold font-mono text-[#247A5A] mt-0.5">
                {formatCurrency(result.remainingValueAtIllustrativeNAV)}
              </div>
              <span className="text-[11px] text-[#666861] block mt-0.5 font-mono">
                {formatUnits(result.remainingUnits)} units retained
              </span>
            </div>
          </div>
        </div>

        {/* VISUAL FIFO LOT ALLOCATION */}
        <div className="p-6 sm:p-7 border-b border-[#DDD9D0] bg-[#FFFFFF] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E211F] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#666861]" />
                FIFO purchase lot allocation
              </span>
              <span className="text-xs text-[#666861]">
                FIFO applied under this prototype scheme rule. Older units are consumed first.
              </span>
            </div>
            <span className="text-xs font-mono text-[#8A8D86]">
              Total holding: {formatUnits(totalHoldingUnits)} units
            </span>
          </div>

          {/* Segmented Progress Bar */}
          <div className="space-y-2">
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
                <span className="w-2.5 h-2.5 rounded-xs bg-[#247A5A] inline-block" />
                Lot A: Allotted {lotAConfig?.allotmentDate} (412 days held · 0% exit load)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#A66A16] inline-block" />
                Lot B: Allotted {lotBConfig?.allotmentDate} (214 days held · 1% demo exit load)
              </span>
            </div>
          </div>

          {/* Interactive Lot Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Lot A Card */}
            <div
              onClick={() => setSelectedLotDetails(selectedLotDetails === 'lot-a' ? null : 'lot-a')}
              className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                lotARedeemed > 0
                  ? 'bg-[#F1EFE9] border-[#247A5A]/50'
                  : 'bg-[#FFFFFF] border-[#DDD9D0]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-[#1E211F]">Lot A (Older lot)</span>
                <span className="px-2 py-0.5 text-[10px] font-medium bg-[#247A5A]/10 text-[#247A5A] border border-[#247A5A]/20 rounded">
                  0% exit load
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-[#8A8D86] block">Units redeemed</span>
                  <span className="font-bold text-[#1E211F]">
                    {formatUnits(lotARedeemed)} / {formatUnits(lotATotalUnits)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8A8D86] block">Gross value</span>
                  <span className="font-bold text-[#1E211F]">
                    {formatCurrency(lotA ? lotA.redemptionValueFromLot : 0)}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-[#666861] mt-2">
                Held 412 days. Exceeds 365-day exit-load window → ₹0 exit load.
              </p>
            </div>

            {/* Lot B Card */}
            <div
              onClick={() => setSelectedLotDetails(selectedLotDetails === 'lot-b' ? null : 'lot-b')}
              className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                lotBRedeemed > 0
                  ? 'bg-[#F1EFE9] border-[#A66A16]/50'
                  : 'bg-[#FFFFFF] border-[#DDD9D0]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-[#1E211F]">Lot B (Newer lot)</span>
                <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                  lotBRedeemed > 0
                    ? 'bg-[#A66A16]/10 text-[#A66A16] border border-[#A66A16]/20'
                    : 'bg-[#F1EFE9] text-[#8A8D86] border border-[#DDD9D0]'
                }`}>
                  1% demo exit load
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-[#8A8D86] block">Units redeemed</span>
                  <span className="font-bold text-[#1E211F]">
                    {formatUnits(lotBRedeemed)} / {formatUnits(lotBTotalUnits)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8A8D86] block">Exit load charged</span>
                  <span className="font-bold text-[#A66A16]">
                    {formatCurrency(result.exitLoadAmount)}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-[#666861] mt-2">
                This prototype uses a 1% exit-load rule for the newer lot held &lt; 365 days.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* IMPACT WATERFALL CHART */}
      <ConsequenceImpactChart result={result} />

      {/* PROGRESSIVE DISCLOSURE DRILL-DOWNS: TRACE & WHY THIS NUMBER */}
      <div className="space-y-4">
        <RuleTransparency result={result} defaultExpanded={false} />
        <CalculationTrace result={result} defaultExpanded={false} />
      </div>

      {/* ACTION BAR */}
      <div className="space-y-3 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={onOpenExplanationDrawer}
            className="py-3 px-3 text-xs font-semibold text-[#1E211F] bg-[#FFFFFF] hover:bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-[#247A5A]" />
            <span>Ask about this redemption</span>
          </button>

          <button
            type="button"
            onClick={onOpenComparison}
            className="py-3 px-3 text-xs font-semibold text-[#1E211F] bg-[#FFFFFF] hover:bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Scale className="w-4 h-4 text-[#666861]" />
            <span>Compare consequences</span>
          </button>

          <button
            type="button"
            onClick={onChangeAmount}
            className="py-3 px-3 text-xs font-semibold text-[#1E211F] bg-[#FFFFFF] hover:bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Edit3 className="w-4 h-4 text-[#666861]" />
            <span>Change amount</span>
          </button>
        </div>

        {/* Primary Continue Button */}
        <button
          type="button"
          onClick={onContinue}
          className="w-full py-3.5 px-4 bg-[#247A5A] hover:bg-[#1D6349] text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
