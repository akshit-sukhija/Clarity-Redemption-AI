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
import { CalculationResult } from '../types';
import { DEMO_FUND, SCHEME_RULES } from '../data/fundData';
import { formatCurrency, formatUnits } from '../services/calculationEngine';
import { CalculationTrace } from './CalculationTrace';
import { RuleTransparency } from './RuleTransparency';

interface RedemptionSnapshotScreenProps {
  result: CalculationResult;
  onChangeAmount: () => void;
  onOpenComparison: () => void;
  onOpenExplanationDrawer: () => void;
  onOpenExportRecord: () => void;
  onContinue: () => void;
  exploredScenarios: number[];
  onSelectExploredScenario: (amount: number) => void;
  onLiveAmountChange?: (amount: number) => void;
}

export const RedemptionSnapshotScreen: React.FC<RedemptionSnapshotScreenProps> = ({
  result,
  onChangeAmount,
  onOpenComparison,
  onOpenExplanationDrawer,
  onOpenExportRecord,
  onContinue,
  exploredScenarios,
  onSelectExploredScenario,
  onLiveAmountChange,
}) => {
  const [showTrace, setShowTrace] = useState(false);
  const [showWhyDeductions, setShowWhyDeductions] = useState(false);
  const [showGuardrail, setShowGuardrail] = useState(false);
  const [selectedLotDetails, setSelectedLotDetails] = useState<'lot-a' | 'lot-b' | null>(null);

  const lotA = result.lotBreakdown.find((l) => l.lotId === 'lot-a');
  const lotB = result.lotBreakdown.find((l) => l.lotId === 'lot-b');

  // Lot capacities for visual bar (300 units vs 900 units)
  const lotATotalUnits = 300;
  const lotBTotalUnits = 900;
  const lotARedeemed = lotA ? lotA.unitsRedeemedFromLot : 0;
  const lotBRedeemed = lotB ? lotB.unitsRedeemedFromLot : 0;

  const lotAPct = (lotARedeemed / lotATotalUnits) * 100;
  const lotBPct = (lotBRedeemed / lotBTotalUnits) * 100;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && onLiveAmountChange) {
      onLiveAmountChange(val);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Top Breadcrumb & Action Utility Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <button
          onClick={onChangeAmount}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Change amount manually</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 hidden sm:inline">
            Holding: <strong className="text-slate-800">{DEMO_FUND.name}</strong>
          </span>
          <button
            onClick={onOpenExportRecord}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shadow-2xs"
            title="Download PDF, Export CSV or Print record"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-600" />
            <span>Export / Record</span>
          </button>
        </div>
      </div>

      {/* Interactive Scenario Explorer Bar (Live Amount Exploration) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block">
              Interactive Amount Explorer
            </span>
            <div className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
              <span>Selected Redemption:</span>
              <span className="text-2xl font-mono text-emerald-400 font-extrabold">
                {formatCurrency(result.grossRedemptionValue, 0)}
              </span>
            </div>
          </div>

          {/* Quick Scenario Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[25000, 50000, 75000, 182400].map((amt) => {
              const isSelected = result.grossRedemptionValue === amt;
              return (
                <button
                  key={amt}
                  onClick={() => onLiveAmountChange && onLiveAmountChange(amt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    isSelected
                      ? 'bg-blue-500 text-white ring-2 ring-blue-300 shadow-xs'
                      : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  {amt === 182400 ? 'FULL (₹1.82L)' : `₹${amt / 1000}K`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Range Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min="5000"
            max={DEMO_FUND.holdingValue}
            step="1000"
            value={result.grossRedemptionValue}
            onChange={handleSliderChange}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            aria-label="Interactive redemption amount slider"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>Min: ₹5,000</span>
            <span className="text-amber-400">
              Lot A Boundary: ₹45,600 (0% Exit Load Limit)
            </span>
            <span>Max: ₹1,82,400</span>
          </div>
        </div>

        {/* Session Scenarios Explored Chips */}
        {exploredScenarios.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
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
                    : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                {formatCurrency(amt, 0)}
              </button>
            ))}
            <span className="text-[10px] text-slate-500 italic ml-auto">
              Exploration only · NOT transactions
            </span>
          </div>
        )}
      </div>

      {/* PRIMARY HERO CARD: WHAT THIS REDEMPTION MEANS */}
      <div className="bg-white rounded-2xl border-2 border-slate-200/90 shadow-md overflow-hidden">
        {/* Hero Header Banner */}
        <div className="bg-gradient-to-b from-slate-50 to-white p-6 sm:p-7 border-b border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 rounded-md">
                  Redemption Snapshot
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-600">
                  Fixed As-of Date: 2026-10-01
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                WHAT THIS REDEMPTION MEANS
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Review the exact net payout, lot liquidation, and scheme deductions before proceeding.
              </p>
            </div>

            {/* STRONGEST VISUAL ANCHOR: ESTIMATED PROCEEDS */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-2xl p-5 shadow-sm md:text-right shrink-0 min-w-[240px]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100 block">
                YOU MAY RECEIVE (NET PROCEEDS)
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight mt-1">
                {formatCurrency(result.estimatedProceeds)}
              </div>
              <span className="text-[11px] text-emerald-100/90 block mt-1 font-medium">
                Credited to bank within 2 working days
              </span>
            </div>
          </div>

          {/* 4 Connected Consequence Pillars */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-200">
            {/* Pillar 1: Entered */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                YOU ENTERED
              </span>
              <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                {formatCurrency(result.grossRedemptionValue)}
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Gross redemption amount
              </span>
            </div>

            {/* Pillar 2: Deductions */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                  DEDUCTED
                </span>
                <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded">
                  {result.totalDeductions > 0 ? 'Exit Load + STT' : 'STT Only'}
                </span>
              </div>
              <div className="text-lg font-bold font-mono text-amber-900 mt-0.5">
                {formatCurrency(result.totalDeductions)}
              </div>
              <span className="text-[10px] text-amber-700 block mt-0.5">
                Exit load {formatCurrency(result.exitLoadAmount)} · STT {formatCurrency(result.STTAmount)}
              </span>
            </div>

            {/* Pillar 3: Units Redeemed */}
            <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                UNITS REDEEMED
              </span>
              <div className="text-lg font-bold font-mono text-blue-900 mt-0.5">
                {formatUnits(result.unitsRedeemed)}
              </div>
              <span className="text-[10px] text-blue-600 block mt-0.5">
                Gross ÷ Illustrative NAV (₹152)
              </span>
            </div>

            {/* Pillar 4: Remains Invested */}
            <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-3.5">
              <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block">
                REMAINS INVESTED
              </span>
              <div className="text-lg font-bold font-mono text-indigo-900 mt-0.5">
                {formatCurrency(result.remainingValueAtIllustrativeNAV)}
              </div>
              <span className="text-[10px] text-indigo-600 block mt-0.5 font-mono">
                {formatUnits(result.remainingUnits)} units retained
              </span>
            </div>
          </div>
        </div>

        {/* VISUAL LOT ALLOCATION SECTION (Section 13) */}
        <div className="p-6 sm:p-7 border-b border-slate-200 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                VISUAL LOT ALLOCATION (FIFO SEQUENCE)
              </span>
              <span className="text-xs text-slate-500">
                Older units are liquidated first before touching newer exit-load eligible units.
              </span>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-700">
              Total Holding: 1,200.000 Units
            </span>
          </div>

          {/* Visual Stacked Proportional Bar */}
          <div className="mb-4">
            <div className="h-6 w-full bg-slate-200 rounded-lg overflow-hidden flex shadow-inner">
              {/* Lot A portion (300 units = 25% of total 1200) */}
              <div
                style={{ width: '25%' }}
                className="relative bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white transition-all border-r border-white/40"
                title={`Lot A: ${lotARedeemed.toFixed(3)} of 300 units liquidated`}
              >
                <div
                  style={{ width: `${lotAPct}%` }}
                  className="absolute inset-y-0 left-0 bg-blue-800 opacity-90 transition-all"
                />
                <span className="relative z-10 px-1 truncate">
                  Lot A (300 u) · {lotAPct.toFixed(0)}%
                </span>
              </div>

              {/* Lot B portion (900 units = 75% of total 1200) */}
              <div
                style={{ width: '75%' }}
                className="relative bg-amber-500 flex items-center justify-center text-[10px] font-bold text-white transition-all"
                title={`Lot B: ${lotBRedeemed.toFixed(3)} of 900 units liquidated`}
              >
                <div
                  style={{ width: `${lotBPct}%` }}
                  className="absolute inset-y-0 left-0 bg-amber-700 opacity-90 transition-all"
                />
                <span className="relative z-10 px-1 truncate">
                  Lot B (900 u) · {lotBPct.toFixed(0)}% liquidated
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block" />
                Lot A (0% Exit Load, 412 days held)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
                Lot B (1% Exit Load, 214 days held)
              </span>
            </div>
          </div>

          {/* Interactive Lot Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {/* Lot A Card */}
            <div
              onClick={() => setSelectedLotDetails(selectedLotDetails === 'lot-a' ? null : 'lot-a')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                lotARedeemed > 0
                  ? 'bg-blue-50/60 border-blue-300 ring-1 ring-blue-300'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="font-bold text-xs text-slate-900">Lot A (Older Purchase)</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
                  0% Exit Load
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono mt-2">
                <div>
                  <span className="text-[10px] text-slate-500 block">Units Liquidated</span>
                  <span className="font-bold text-slate-900">{formatUnits(lotARedeemed)} / 300</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Gross Value</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(lotA ? lotA.redemptionValueFromLot : 0)}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Allotted 2025-08-15 (412 days held). Exceeds 365-day exit-load window → ₹0 exit load.
              </p>
            </div>

            {/* Lot B Card */}
            <div
              onClick={() => setSelectedLotDetails(selectedLotDetails === 'lot-b' ? null : 'lot-b')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                lotBRedeemed > 0
                  ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="font-bold text-xs text-slate-900">Lot B (Newer Purchase)</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                  lotBRedeemed > 0 ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-600'
                }`}>
                  1% Exit Load Applies
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono mt-2">
                <div>
                  <span className="text-[10px] text-slate-500 block">Units Liquidated</span>
                  <span className="font-bold text-slate-900">{formatUnits(lotBRedeemed)} / 900</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Exit Load Charged</span>
                  <span className="font-bold text-amber-900">
                    {formatCurrency(result.exitLoadAmount)}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Allotted 2026-03-01 (214 days held). Within 365 days → 1% load on {formatCurrency(lotB ? lotB.redemptionValueFromLot : 0)}.
              </p>
            </div>
          </div>
        </div>

        {/* THREE-CONSEQUENCE CONNECTED CARDS (Section 16) */}
        <div className="p-6 sm:p-7 border-b border-slate-200 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            THREE CONSEQUENCE DOMAINS
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Domain 1: What is redeemed */}
            <div className="bg-gradient-to-b from-blue-50/50 to-white p-4 rounded-xl border border-blue-200 shadow-2xs">
              <div className="flex items-center gap-1.5 font-bold text-blue-900 mb-2">
                <Receipt className="w-4 h-4 text-blue-600" />
                <span>1. What is Redeemed</span>
              </div>
              <div className="text-xl font-mono font-extrabold text-blue-950 mb-1">
                {formatUnits(result.unitsRedeemed)} units
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Represents {formatCurrency(result.grossRedemptionValue)} gross value converted at Illustrative NAV ₹152.00.
              </p>
            </div>

            {/* Domain 2: What is deducted */}
            <div className="bg-gradient-to-b from-amber-50/50 to-white p-4 rounded-xl border border-amber-200 shadow-2xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-2">
                <Percent className="w-4 h-4 text-amber-600" />
                <span>2. What is Deducted</span>
              </div>
              <div className="text-xl font-mono font-extrabold text-amber-950 mb-1">
                {formatCurrency(result.totalDeductions)}
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Comprises {formatCurrency(result.exitLoadAmount)} exit load (1% on Lot B) and {formatCurrency(result.STTAmount)} statutory STT (0.001%).
              </p>
            </div>

            {/* Domain 3: What remains */}
            <div className="bg-gradient-to-b from-emerald-50/50 to-white p-4 rounded-xl border border-emerald-200 shadow-2xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-2">
                <PiggyBank className="w-4 h-4 text-emerald-600" />
                <span>3. What Remains</span>
              </div>
              <div className="text-xl font-mono font-extrabold text-emerald-950 mb-1">
                {formatCurrency(result.remainingValueAtIllustrativeNAV)}
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {formatUnits(result.remainingUnits)} units remain invested and will continue compounding at prevailing NAV.
              </p>
            </div>
          </div>
        </div>

        {/* HONESTY GUARDRAIL & PROVENANCE FOOTER */}
        <div className="p-6 sm:p-7 bg-slate-50 space-y-3.5 text-xs">
          {/* Why Am I Seeing This? */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl text-slate-600">
            <strong className="text-slate-900 block mb-1">Why am I seeing this?</strong>
            You selected to redeem {formatCurrency(result.grossRedemptionValue)} from {DEMO_FUND.name}. This preview calculates unrounded deductions (CBDT statutory STT and scheme SID exit loads) so you see the exact net amount credited before deciding.
          </div>

          {/* Honesty Guardrail Policy Card */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl text-slate-600">
            <div className="flex items-center justify-between">
              <strong className="text-slate-900">What Clarity will not do:</strong>
              <button
                onClick={() => setShowGuardrail(!showGuardrail)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                {showGuardrail ? 'Hide details' : 'View honesty guardrails'}
              </button>
            </div>
            <p className="mt-1">
              Clarity will not tell you whether to redeem or hold. It shows factual consequences, deductions, and remaining holdings; the decision remains entirely yours.
            </p>

            {showGuardrail && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100 text-[11px]">
                <div className="space-y-1 text-emerald-800">
                  <div className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    CLARITY WILL:
                  </div>
                  <div>• Show verified gross and net proceeds</div>
                  <div>• Calculate FIFO lot liquidation with precision</div>
                  <div>• Disclose official statutory rules & sources</div>
                </div>

                <div className="space-y-1 text-rose-800">
                  <div className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    CLARITY WILL NEVER:
                  </div>
                  <div>• Give Buy/Sell/Hold investment advice</div>
                  <div>• Predict NAV movement or market recovery</div>
                  <div>• Rank scenarios as "better" or "optimal"</div>
                </div>
              </div>
            )}
          </div>

          {/* Payout & Tax Note */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Illustrative payout window: within 2 working days (T+2 cycle).</span>
            </div>
            <span>Capital gains tax is not included in this estimate.</span>
          </div>
        </div>
      </div>

      {/* Expandable Technical Trace & Deductions Inspector */}
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
            className="py-3 px-3 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Clarity Analyst</span>
          </button>

          <button
            type="button"
            onClick={onOpenComparison}
            className="py-3 px-3 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-2xs"
          >
            <Scale className="w-4 h-4 text-slate-600" />
            <span>Compare scenarios</span>
          </button>

          <button
            type="button"
            onClick={onChangeAmount}
            className="py-3 px-3 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-2xs"
          >
            <Edit3 className="w-4 h-4 text-slate-600" />
            <span>Change amount</span>
          </button>
        </div>

        {/* Primary Continue Button */}
        <button
          type="button"
          onClick={onContinue}
          className="w-full py-4 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
