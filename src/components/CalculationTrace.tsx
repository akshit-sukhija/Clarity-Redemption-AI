import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Calculator,
  ArrowDown,
  Coins,
  Split,
  Layers,
  Percent,
  CheckCircle2,
  PiggyBank,
} from 'lucide-react';
import { CalculationResult } from '../types';
import { formatCurrency, formatUnits } from '../services/calculationEngine';

interface CalculationTraceProps {
  result: CalculationResult;
  defaultExpanded?: boolean;
}

export const CalculationTrace: React.FC<CalculationTraceProps> = ({
  result,
  defaultExpanded = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  const lotA = result.lotBreakdown.find((l) => l.lotId === 'lot-a');
  const lotB = result.lotBreakdown.find((l) => l.lotId === 'lot-b');

  const pipelineStages = [
    {
      num: '01',
      title: 'REDEMPTION AMOUNT',
      icon: Coins,
      badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
      value: formatCurrency(result.grossRedemptionValue),
      formula: 'Gross redemption value entered by user',
      description: 'The starting gross value of units selected for liquidation before applicable statutory deductions.',
    },
    {
      num: '02',
      title: 'UNITS REDEEMED',
      icon: Split,
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40',
      value: `${formatUnits(result.unitsRedeemed)} units`,
      formula: `Gross (${formatCurrency(result.grossRedemptionValue)}) ÷ Illustrative NAV (₹${result.illustrativeNAV.toFixed(2)})`,
      description: `Exact unrounded internal precision: ${result.unitsRedeemed}. Rounded only at presentation.`,
    },
    {
      num: '03',
      title: 'FIFO LOT ALLOCATION',
      icon: Layers,
      badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
      value: `${lotA ? formatUnits(lotA.unitsRedeemedFromLot) : '0'} (Lot A) ${lotB && lotB.unitsRedeemedFromLot > 0 ? `+ ${formatUnits(lotB.unitsRedeemedFromLot)} (Lot B)` : ''}`,
      formula: 'First-In, First-Out sequence across purchase lots',
      description: `Lot A (300 units allotted 2025-08-15) exhausted first. ${lotB && lotB.unitsRedeemedFromLot > 0 ? `Remaining ${formatUnits(lotB.unitsRedeemedFromLot)} units liquidated from Lot B.` : 'Lot B untouched.'}`,
    },
    {
      num: '04',
      title: 'APPLICABLE DEDUCTIONS',
      icon: Percent,
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
      value: formatCurrency(result.totalDeductions),
      formula: `Exit Load (${formatCurrency(result.exitLoadAmount)}) + STT (${formatCurrency(result.STTAmount)})`,
      description: `Exit Load: 1% applied only to units from Lot B held < 365 days. STT: 0.001% statutory rate under Finance Act Section 98.`,
    },
    {
      num: '05',
      title: 'ESTIMATED PROCEEDS',
      icon: CheckCircle2,
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
      value: formatCurrency(result.estimatedProceeds),
      formula: `Gross (${formatCurrency(result.grossRedemptionValue)}) − Total Deductions (${formatCurrency(result.totalDeductions)})`,
      description: 'The net proceeds credited to your bank account within the illustrative 2-working-day processing cycle.',
    },
    {
      num: '06',
      title: 'REMAINING HOLDING',
      icon: PiggyBank,
      badgeBg: 'bg-slate-700 text-slate-300 border-slate-600',
      value: `${formatCurrency(result.remainingValueAtIllustrativeNAV)}`,
      formula: `Remaining Units (${formatUnits(result.remainingUnits)}) × Illustrative NAV (₹${result.illustrativeNAV.toFixed(2)})`,
      description: `${formatUnits(result.remainingUnits)} units remain invested. Derived directly from remaining units × Illustrative NAV.`,
    },
  ];

  return (
    <div className="border border-[#26385A] rounded-2xl bg-[#15233A] overflow-hidden shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-[#15233A] hover:bg-[#1A2C4A] transition-colors text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-[#F5F7FA] block">
              Decision Trace (Stages 01 – 06)
            </span>
            <span className="text-xs text-slate-400">
              Interactive step-by-step arithmetic pipeline
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
          <span>{isOpen ? 'Collapse Pipeline' : 'Inspect Pipeline'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 pt-3 border-t border-[#26385A] bg-[#101B2E] text-xs space-y-4">
          {/* Visual Step-by-Step Sequence */}
          <div className="space-y-3">
            {pipelineStages.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <div key={stage.num} className="relative">
                  <div className="p-4 bg-[#15233A] rounded-xl border border-[#26385A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#101B2E] border border-[#26385A] flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded border ${stage.badgeBg}`}>
                            {stage.num} · {stage.title}
                          </span>
                        </div>
                        <div className="font-mono text-xs text-slate-200 font-semibold">
                          {stage.formula}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {stage.description}
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0 font-mono pl-11 sm:pl-0">
                      <span className="text-base font-extrabold text-[#F5F7FA] block">
                        {stage.value}
                      </span>
                    </div>
                  </div>

                  {idx < pipelineStages.length - 1 && (
                    <div className="flex justify-center my-1 text-slate-600">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Lot Breakdown Table */}
          <div className="mt-6 pt-4 border-t border-[#26385A]">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
              Lot Level Allocation Table (FIFO)
            </span>
            <div className="overflow-x-auto bg-[#15233A] rounded-xl border border-[#26385A]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#101B2E] border-b border-[#26385A] text-slate-400">
                  <tr>
                    <th className="p-3 font-semibold">Purchase Lot</th>
                    <th className="p-3 font-semibold">Allotment Date</th>
                    <th className="p-3 font-semibold text-right">Units Liquidated</th>
                    <th className="p-3 font-semibold text-right">Gross Value</th>
                    <th className="p-3 font-semibold text-right">Exit Load Rate</th>
                    <th className="p-3 font-semibold text-right">Exit Load Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#26385A] font-mono">
                  {result.lotBreakdown.map((lot) => (
                    <tr key={lot.lotId} className="hover:bg-[#1A2C4A]">
                      <td className="p-3 font-sans font-bold text-[#F5F7FA]">
                        {lot.lotName}
                      </td>
                      <td className="p-3 text-slate-400">{lot.allotmentDate}</td>
                      <td className="p-3 text-right text-[#F5F7FA] font-bold">
                        {formatUnits(lot.unitsRedeemedFromLot)}
                      </td>
                      <td className="p-3 text-right text-[#F5F7FA]">
                        {formatCurrency(lot.redemptionValueFromLot)}
                      </td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          lot.applicableExitLoadRate > 0
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {lot.applicableExitLoadRate > 0
                            ? `${(lot.applicableExitLoadRate * 100).toFixed(0)}%`
                            : '0%'}
                        </span>
                      </td>
                      <td className="p-3 text-right font-extrabold text-[#F5F7FA]">
                        {formatCurrency(lot.exitLoadAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
