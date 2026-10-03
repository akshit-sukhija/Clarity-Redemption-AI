import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calculator, ArrowDown } from 'lucide-react';
import { CalculationResult } from '../types';
import { DEMO_FUND } from '../data/fundData';
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

  const lotAConfig = DEMO_FUND.lots[0];
  const lotBConfig = DEMO_FUND.lots[1];

  const stages = [
    {
      step: '1',
      title: 'Amount entered',
      value: formatCurrency(result.grossRedemptionValue),
      detail: 'Starting gross redemption value entered by user.',
    },
    {
      step: '2',
      title: 'Units redeemed',
      value: `${formatUnits(result.unitsRedeemed)} units`,
      detail: `${formatCurrency(result.grossRedemptionValue)} ÷ ${formatCurrency(result.illustrativeNAV)} (Illustrative NAV)`,
    },
    {
      step: '3',
      title: 'Lots used (FIFO)',
      value: `${lotA ? formatUnits(lotA.unitsRedeemedFromLot) : '0'} (Lot A)${lotB && lotB.unitsRedeemedFromLot > 0 ? ` + ${formatUnits(lotB.unitsRedeemedFromLot)} (Lot B)` : ''}`,
      detail: `Lot A (${formatUnits(lotAConfig?.units ?? 0)} units allotted ${lotAConfig?.allotmentDate ?? ''}) liquidated first under FIFO. ${lotB && lotB.unitsRedeemedFromLot > 0 ? `Remaining ${formatUnits(lotB.unitsRedeemedFromLot)} units from Lot B.` : 'Lot B untouched.'}`,
    },
    {
      step: '4',
      title: 'Exit load',
      value: formatCurrency(result.exitLoadAmount),
      detail: result.exitLoadAmount > 0
        ? `1% demo scheme rule applied to Lot B units held < 365 days (${formatCurrency(lotB?.redemptionValueFromLot ?? 0)} gross).`
        : '0% exit load. All redeemed units from Lot A held > 365 days.',
    },
    {
      step: '5',
      title: 'Securities Transaction Tax (STT)',
      value: formatCurrency(result.STTAmount),
      detail: `Statutory 0.001% of gross redemption (${formatCurrency(result.grossRedemptionValue)}) under Finance Act Section 98.`,
    },
    {
      step: '6',
      title: 'Estimated proceeds',
      value: formatCurrency(result.estimatedProceeds),
      detail: `${formatCurrency(result.grossRedemptionValue)} gross − ${formatCurrency(result.totalDeductions)} deductions. Indicative processing timeline; actual timing depends on scheme terms, cut-off timing, and business days.`,
    },
    {
      step: '7',
      title: 'Remaining units & value',
      value: `${formatUnits(result.remainingUnits)} units (${formatCurrency(result.remainingValueAtIllustrativeNAV)})`,
      detail: `${formatUnits(result.remainingUnits)} units remaining × ${formatCurrency(result.illustrativeNAV)}. Total holding invariant: ${formatUnits(result.unitsRedeemed)} + ${formatUnits(result.remainingUnits)} = ${formatUnits(DEMO_FUND.totalUnits)}.`,
    },
  ];

  return (
    <div className="border border-[#DDD9D0] rounded-xl bg-[#FFFFFF] overflow-hidden shadow-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between bg-[#FFFFFF] hover:bg-[#F1EFE9] transition-colors text-left cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-[#F1EFE9] border border-[#DDD9D0] flex items-center justify-center text-[#666861]">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-[#1E211F] block">
              How this was calculated
            </span>
            <span className="text-xs text-[#666861]">
              7-step deterministic calculation trace derived by the engine
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#247A5A]">
          <span>{isOpen ? 'Hide trace' : 'View trace'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-2 border-t border-[#DDD9D0] bg-[#FFFFFF] text-xs space-y-2">
          {stages.map((stage, idx) => (
            <React.Fragment key={stage.step}>
              <div className="p-3 bg-[#F1EFE9] rounded-lg border border-[#DDD9D0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded bg-[#DDD9D0] text-[#1E211F] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {stage.step}
                  </span>
                  <div>
                    <span className="font-semibold text-xs text-[#1E211F] block">
                      {stage.title}
                    </span>
                    <span className="text-[11px] text-[#666861] block mt-0.5 leading-relaxed">
                      {stage.detail}
                    </span>
                  </div>
                </div>

                <div className="sm:text-right font-mono shrink-0 pl-7 sm:pl-0">
                  <span className="text-xs font-bold text-[#1E211F]">
                    {stage.value}
                  </span>
                </div>
              </div>

              {idx < stages.length - 1 && (
                <div className="flex justify-center -my-1 text-[#8A8D86]">
                  <ArrowDown className="w-3 h-3" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
