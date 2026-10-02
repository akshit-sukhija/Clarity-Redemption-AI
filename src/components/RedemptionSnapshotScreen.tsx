import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Scale,
  Edit3,
  Clock,
  Sparkles,
  FileDown,
  History,
  ShieldAlert,
  Info,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronDown,
  ChevronUp,
  Percent,
  Receipt,
  PiggyBank,
  Check,
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
  const [showTrace, setShowTrace] = useState(false);
  const [showWhyDeductions, setShowWhyDeductions] = useState(false);
  const [showGuardrail, setShowGuardrail] = useState(false);
  const [selectedLotDetails, setSelectedLotDetails] = useState<'lot-a' | 'lot-b' | null>(null);

  // Requested Feature A: Scenario Net-Proceeds Trend Indicator (Section 9 & 13)
  const previousProceeds = previousResult && previousResult.grossRedemptionValue !== result.grossRedemptionValue
    ? previousResult.estimatedProceeds
    : null;

  const proceedsDifference = previousProceeds !== null
    ? result.estimatedProceeds - previousProceeds
    : null;

  const lotA = result.lotBreakdown.find((l) => l.lotId === 'lot-a');
  const lotB = result.lotBreakdown.find((l) => l.lotId === 'lot-b');

  // Lot capacities for visual bar (300 units vs 900 units = 1200 units)
  const lotATotalUnits = 300;
  const lotBTotalUnits = 900;
  const lotARedeemed = lotA ? lotA.unitsRedeemedFromLot : 0;
  const lotBRedeemed = lotB ? lotB.unitsRedeemedFromLot : 0;

  const lotAPct = Math.min(100, (lotARedeemed / lotATotalUnits) * 100);
  const lotBPct = Math.min(100, (lotBRedeemed / lotBTotalUnits) * 100);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && onLiveAmountChange) {
      onLiveAmountChange(val);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Top Breadcrumb & Action Utility Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#15233A] p-3.5 rounded-xl border border-[#26385A] shadow-sm">
        <button
          onClick={onChangeAmount}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Adjust redemption amount</span>
        </button>

        <div className="flex items-center gap-2.5">
          <span className="text-xs text-slate-400 hidden sm:inline">
            Scheme: <strong className="text-[#F5F7FA]">{DEMO_FUND.name}</strong>
          </span>
          <button
            onClick={onOpenExportRecord}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 rounded-lg transition-colors shadow-2xs"
            title="Download PDF, Export CSV or Print record"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-400" />
            <span>Export / Record</span>
          </button>
        </div>
      </div>

      {/* Interactive Scenario Explorer Bar (Live Amount Exploration) */}
      <div className="bg-[#15233A] text-white rounded-2xl p-5 sm:p-6 shadow-md border border-[#26385A] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
              Interactive Amount Explorer
            </span>
            <div className="text-lg font-bold text-[#F5F7FA] flex items-center gap-2 mt-0.5">
              <span>Redeeming:</span>
              <span className="text-2xl font-mono text-emerald-400 font-extrabold">
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
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white border border-blue-400 shadow-sm'
                      : 'bg-[#101B2E] text-slate-300 hover:bg-[#1A2C4A] hover:text-white border border-[#26385A]'
                  }`}
                >
                  {amt === DEMO_FUND.holdingValue ? 'FULL (₹1.82L)' : `₹${amt / 1000}K`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Range Slider */}
        <div className="space-y-1.5">
          <input
            type="range"
            min="5000"
            max={DEMO_FUND.holdingValue}
            step="1000"
            value={result.grossRedemptionValue}
            onChange={handleSliderChange}
            className="w-full h-2 bg-[#101B2E] rounded-lg appearance-none cursor-pointer accent-blue-500"
            aria-label="Interactive redemption amount slider"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Min: ₹5,000</span>
            <span className="text-amber-400 font-sans font-bold">
              Lot A 0% Load Boundary: ₹45,600
            </span>
            <span>Max: ₹1,82,400</span>
          </div>
        </div>

        {/* Session Scenarios Explored (Section 18) */}
        {scenarioHistory && scenarioHistory.length > 0 ? (
          <div className="pt-3 border-t border-[#26385A] space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1 text-[10px]">
              <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-blue-400" />
                Scenarios Explored (Current Session)
              </span>
              <span className="text-slate-500 italic">
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-blue-600 text-white border border-blue-400 font-bold shadow-xs'
                        : 'bg-[#101B2E] text-slate-300 hover:text-white hover:bg-[#1A2C4A] border border-[#26385A]'
                    }`}
                    title={`Net proceeds: ${formatCurrency(item.netProceeds)} · Deductions: ${formatCurrency(item.totalDeductions)}`}
                  >
                    <span>{formatCurrency(item.amount, 0)}</span>
                    <span className="text-[10px] text-slate-400 font-sans">• {item.timestamp}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : exploredScenarios.length > 0 ? (
          <div className="pt-3 border-t border-[#26385A] flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <History className="w-3 h-3 text-slate-400" />
              Explored in session:
            </span>
            {exploredScenarios.map((amt) => (
              <button
                key={amt}
                onClick={() => onSelectExploredScenario(amt)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  amt === result.grossRedemptionValue
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'bg-[#101B2E] text-slate-400 hover:text-white border border-[#26385A]'
                }`}
              >
                {formatCurrency(amt, 0)}
              </button>
            ))}
            <span className="text-[10px] text-slate-500 italic ml-auto font-sans">
              Exploration only · NOT transactions
            </span>
          </div>
        ) : null}
      </div>

      {/* PRIMARY RESULT HERO: WHAT THIS REDEMPTION MEANS */}
      <div className="bg-[#15233A] rounded-2xl border border-[#26385A] shadow-md overflow-hidden">
        {/* Hero Header Banner */}
        <div className="p-6 sm:p-7 border-b border-[#26385A]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 rounded border border-blue-400/30">
                  Redemption Snapshot
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs font-semibold text-slate-300">
                  As-of Demo Date: {DEMO_FUND.demoAsOfDate}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
                WHAT THIS REDEMPTION MEANS
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Derived deterministically from the canonical calculation result.
              </p>
            </div>

            {/* STRONGEST VISUAL ANCHOR: ESTIMATED PROCEEDS */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-5 shadow-sm md:text-right shrink-0 min-w-[270px] border border-emerald-400/30">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100 block">
                YOU MAY RECEIVE (NET PROCEEDS)
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight mt-1">
                {formatCurrency(result.estimatedProceeds)}
              </div>

              {/* Feature A: Scenario Net-Proceeds Trend Indicator (Section 9 & 13) */}
              {proceedsDifference !== null && (
                <div
                  className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/50 text-emerald-100 text-xs font-mono border border-emerald-300/30 shadow-2xs"
                  title="Scenario exploration delta vs immediately previous scenario in this session"
                >
                  {Math.abs(proceedsDifference) < 0.005 ? (
                    <span className="font-semibold">— Unchanged vs previous scenario</span>
                  ) : proceedsDifference > 0 ? (
                    <span className="font-semibold">
                      ↑ {formatCurrency(proceedsDifference)} vs previous scenario ({formatCurrency(previousResult!.grossRedemptionValue, 0)})
                    </span>
                  ) : (
                    <span className="font-semibold">
                      ↓ {formatCurrency(Math.abs(proceedsDifference))} vs previous scenario ({formatCurrency(previousResult!.grossRedemptionValue, 0)})
                    </span>
                  )}
                </div>
              )}

              <span className="text-[11px] text-emerald-100/90 block mt-1.5 font-medium">
                Estimated credit within 2 working days
              </span>
            </div>
          </div>

          {/* 4 Connected Consequence Pillars */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#26385A]">
            {/* Pillar 1: Entered */}
            <div className="bg-[#101B2E] border border-[#26385A] rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                YOU ENTERED
              </span>
              <div className="text-lg font-bold font-mono text-[#F5F7FA] mt-0.5">
                {formatCurrency(result.grossRedemptionValue)}
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Gross redemption amount
              </span>
            </div>

            {/* Pillar 2: Deductions */}
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                  DEDUCTED
                </span>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-400/30">
                  {result.totalDeductions > 0 ? 'Exit Load + STT' : 'STT Only'}
                </span>
              </div>
              <div className="text-lg font-bold font-mono text-amber-200 mt-0.5">
                {formatCurrency(result.totalDeductions)}
              </div>
              <span className="text-[10px] text-amber-300/80 block mt-0.5">
                Exit load {formatCurrency(result.exitLoadAmount)} · STT {formatCurrency(result.STTAmount)}
              </span>
            </div>

            {/* Pillar 3: Units Redeemed */}
            <div className="bg-blue-950/40 border border-blue-500/40 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider block">
                UNITS REDEEMED
              </span>
              <div className="text-lg font-bold font-mono text-blue-200 mt-0.5">
                {formatUnits(result.unitsRedeemed)}
              </div>
              <span className="text-[10px] text-blue-300/80 block mt-0.5">
                Gross ÷ Illustrative NAV (₹152)
              </span>
            </div>

            {/* Pillar 4: Remains Invested */}
            <div className="bg-slate-900 border border-[#26385A] rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                REMAINS INVESTED
              </span>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                {formatCurrency(result.remainingValueAtIllustrativeNAV)}
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                {formatUnits(result.remainingUnits)} units retained
              </span>
            </div>
          </div>
        </div>

        {/* VISUAL LOT ALLOCATION SECTION (Section 22) */}
        <div className="p-6 sm:p-7 border-b border-[#26385A] bg-[#101B2E]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-400" />
                VISUAL FIFO LOT ALLOCATION
              </span>
              <span className="text-xs text-slate-400">
                Older units are consumed first. Then the next lot is used.
              </span>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-300">
              Total Holding: 1,200.000 Units
            </span>
          </div>

          {/* Proportional Segmented Progress Bar */}
          <div className="space-y-2 mb-4">
            <div className="h-7 w-full bg-[#0D1626] rounded-xl overflow-hidden flex border border-[#26385A] shadow-inner">
              {/* Lot A segment (300 units = 25% of 1200) */}
              <div
                style={{ width: '25%' }}
                className="relative bg-blue-900 flex items-center justify-center text-[10px] font-bold text-white transition-all border-r border-[#26385A]"
                title={`Lot A: ${lotARedeemed.toFixed(3)} of 300 units liquidated`}
              >
                <div
                  style={{ width: `${lotAPct}%` }}
                  className="absolute inset-y-0 left-0 bg-blue-600 transition-all"
                />
                <span className="relative z-10 px-1 truncate font-mono">
                  Lot A (300 u) · {lotAPct.toFixed(0)}%
                </span>
              </div>

              {/* Lot B segment (900 units = 75% of 1200) */}
              <div
                style={{ width: '75%' }}
                className="relative bg-amber-950 flex items-center justify-center text-[10px] font-bold text-white transition-all"
                title={`Lot B: ${lotBRedeemed.toFixed(3)} of 900 units liquidated`}
              >
                <div
                  style={{ width: `${lotBPct}%` }}
                  className="absolute inset-y-0 left-0 bg-amber-600 transition-all"
                />
                <span className="relative z-10 px-1 truncate font-mono">
                  Lot B (900 u) · {lotBPct.toFixed(0)}% liquidated
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block" />
                Lot A: Allotted 2025-08-15 (412 days held · 0% Exit Load)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
                Lot B: Allotted 2026-03-01 (214 days held · 1% Exit Load)
              </span>
            </div>
          </div>

          {/* Interactive Lot Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Lot A Card */}
            <div
              onClick={() => setSelectedLotDetails(selectedLotDetails === 'lot-a' ? null : 'lot-a')}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                lotARedeemed > 0
                  ? 'bg-blue-950/40 border-blue-500/50 ring-1 ring-blue-500/30'
                  : 'bg-[#15233A] border-[#26385A]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="font-bold text-xs text-[#F5F7FA]">Lot A (Older Lot)</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded">
                  0% Exit Load
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">Units Liquidated</span>
                  <span className="font-bold text-[#F5F7FA]">{formatUnits(lotARedeemed)} / 300</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Gross Value</span>
                  <span className="font-bold text-[#F5F7FA]">
                    {formatCurrency(lotA ? lotA.redemptionValueFromLot : 0)}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Held 412 days. Exceeds 365-day exit-load window → ₹0 exit load.
              </p>
            </div>

            {/* Lot B Card */}
            <div
              onClick={() => setSelectedLotDetails(selectedLotDetails === 'lot-b' ? null : 'lot-b')}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                lotBRedeemed > 0
                  ? 'bg-amber-950/40 border-amber-500/50 ring-1 ring-amber-500/30'
                  : 'bg-[#15233A] border-[#26385A]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="font-bold text-xs text-[#F5F7FA]">Lot B (Newer Lot)</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                  lotBRedeemed > 0
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-[#101B2E] text-slate-400 border-[#26385A]'
                }`}>
                  1% Exit Load Applies
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">Units Liquidated</span>
                  <span className="font-bold text-[#F5F7FA]">{formatUnits(lotBRedeemed)} / 900</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Exit Load Charged</span>
                  <span className="font-bold text-amber-300">
                    {formatCurrency(result.exitLoadAmount)}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Held 214 days (within 365-day window) → 1% load applies to {formatCurrency(lotB ? lotB.redemptionValueFromLot : 0)}.
              </p>
            </div>
          </div>
        </div>

        {/* THREE CONSEQUENCE DOMAINS (Section 21) */}
        <div className="p-6 sm:p-7 border-b border-[#26385A] space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            THREE CONSEQUENCE DOMAINS
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Domain 1: What is redeemed */}
            <div className="bg-[#101B2E] p-4 rounded-xl border border-[#26385A]">
              <div className="flex items-center gap-1.5 font-bold text-blue-300 mb-2">
                <Receipt className="w-4 h-4 text-blue-400" />
                <span>1. What is Redeemed</span>
              </div>
              <div className="text-xl font-mono font-extrabold text-[#F5F7FA] mb-1">
                {formatUnits(result.unitsRedeemed)} units
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Represents {formatCurrency(result.grossRedemptionValue)} gross value converted at Illustrative NAV ₹152.00.
              </p>
            </div>

            {/* Domain 2: What is deducted */}
            <div className="bg-[#101B2E] p-4 rounded-xl border border-[#26385A]">
              <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-2">
                <Percent className="w-4 h-4 text-amber-400" />
                <span>2. What is Deducted</span>
              </div>
              <div className="text-xl font-mono font-extrabold text-amber-200 mb-1">
                {formatCurrency(result.totalDeductions)}
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Exit load {formatCurrency(result.exitLoadAmount)} (1% Lot B) + STT {formatCurrency(result.STTAmount)} (0.001% statutory).
              </p>
            </div>

            {/* Domain 3: What remains */}
            <div className="bg-[#101B2E] p-4 rounded-xl border border-[#26385A]">
              <div className="flex items-center gap-1.5 font-bold text-emerald-300 mb-2">
                <PiggyBank className="w-4 h-4 text-emerald-400" />
                <span>3. What Remains</span>
              </div>
              <div className="text-xl font-mono font-extrabold text-emerald-300 mb-1">
                {formatCurrency(result.remainingValueAtIllustrativeNAV)}
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {formatUnits(result.remainingUnits)} units remain invested at Illustrative NAV ₹152.00.
              </p>
            </div>
          </div>
        </div>

        {/* HONESTY GUARDRAIL & PROVENANCE (Section 30) */}
        <div className="p-6 sm:p-7 bg-[#101B2E] space-y-3.5 text-xs">
          {/* Why Am I Seeing This? */}
          <div className="bg-[#15233A] border border-[#26385A] p-4 rounded-xl text-slate-300">
            <strong className="text-[#F5F7FA] block mb-1">Why am I seeing this?</strong>
            You entered {formatCurrency(result.grossRedemptionValue)} for redemption from {DEMO_FUND.name}. Clarity unifies scheme exit loads and CBDT statutory STT (Section 98 Finance Act) into an unrounded consequence snapshot before you confirm.
          </div>

          {/* Honesty Guardrail Policy Card */}
          <div className="bg-[#15233A] border border-[#26385A] p-4 rounded-xl text-slate-300">
            <div className="flex items-center justify-between">
              <strong className="text-[#F5F7FA]">What Clarity will not do:</strong>
              <button
                onClick={() => setShowGuardrail(!showGuardrail)}
                className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                {showGuardrail ? 'Hide policy' : 'View guardrail policy'}
              </button>
            </div>
            <p className="mt-1 text-slate-400">
              Clarity will not tell you whether to redeem or hold. It shows factual consequences, verified deductions, and remaining holdings; the decision remains entirely yours.
            </p>

            {showGuardrail && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#26385A] text-[11px]">
                <div className="space-y-1 text-emerald-300">
                  <div className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    CLARITY WILL:
                  </div>
                  <div>• Show verified gross and net proceeds</div>
                  <div>• Calculate FIFO lot liquidation with precision</div>
                  <div>• Disclose official statutory rules & sources</div>
                  <div>• Allow neutral scenario comparison</div>
                </div>

                <div className="space-y-1 text-rose-300">
                  <div className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    CLARITY WILL NEVER:
                  </div>
                  <div>• Give Buy/Sell/Hold investment advice</div>
                  <div>• Predict NAV movement or market recovery</div>
                  <div>• Rank scenarios as "better" or "optimal"</div>
                  <div>• Execute transactions or deduct money</div>
                </div>
              </div>
            )}
          </div>

          {/* Payout & Tax Note */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#26385A] text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Illustrative payout window: within 2 working days (T+2 standard).</span>
            </div>
            <span>Capital gains tax is not included in this estimate.</span>
          </div>
        </div>
      </div>

      {/* SECTION 19: IMPACT WATERFALL CHART & CAPITAL GAINS TAX DISCLOSURE */}
      <ConsequenceImpactChart result={result} />

      {/* COMPACT DRILL-DOWN CONTROLS: TRACE | WHY */}
      <div className="space-y-4">
        <RuleTransparency result={result} defaultExpanded={showWhyDeductions} />
        <CalculationTrace result={result} defaultExpanded={showTrace} />
      </div>

      {/* Action Bar */}
      <div className="space-y-3 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={onOpenExplanationDrawer}
            className="py-3 px-3 text-xs font-bold text-[#F5F7FA] bg-[#15233A] hover:bg-[#1E2E4B] border border-[#26385A] rounded-xl transition-colors flex items-center justify-center gap-2 shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Clarity Analyst</span>
          </button>

          <button
            type="button"
            onClick={onOpenComparison}
            className="py-3 px-3 text-xs font-bold text-[#F5F7FA] bg-[#15233A] hover:bg-[#1E2E4B] border border-[#26385A] rounded-xl transition-colors flex items-center justify-center gap-2 shadow-2xs"
          >
            <Scale className="w-4 h-4 text-slate-400" />
            <span>Compare scenarios</span>
          </button>

          <button
            type="button"
            onClick={onChangeAmount}
            className="py-3 px-3 text-xs font-bold text-[#F5F7FA] bg-[#15233A] hover:bg-[#1E2E4B] border border-[#26385A] rounded-xl transition-colors flex items-center justify-center gap-2 shadow-2xs"
          >
            <Edit3 className="w-4 h-4 text-slate-400" />
            <span>Change amount</span>
          </button>
        </div>

        {/* Primary Continue Button */}
        <button
          type="button"
          onClick={onContinue}
          className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
