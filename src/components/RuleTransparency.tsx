import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, ArrowDown, FileText } from 'lucide-react';
import { CalculationResult } from '../types';
import { formatCurrency, formatUnits } from '../services/calculationEngine';

interface RuleTransparencyProps {
  result: CalculationResult;
  defaultExpanded?: boolean;
}

export const RuleTransparency: React.FC<RuleTransparencyProps> = ({
  result,
  defaultExpanded = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  const lotA = result.lotBreakdown.find((l) => l.lotId === 'lot-a');
  const lotB = result.lotBreakdown.find((l) => l.lotId === 'lot-b');

  return (
    <div className="border border-[#DDD9D0] rounded-xl bg-[#FFFFFF] overflow-hidden shadow-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between bg-[#FFFFFF] hover:bg-[#F1EFE9] transition-colors text-left cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-[#F1EFE9] border border-[#DDD9D0] flex items-center justify-center text-[#666861]">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-[#1E211F] block">
              Why this number?
            </span>
            <span className="text-xs text-[#666861]">
              Inspect the five-stage derivation: number → components → lot allocation → scheme rule → authority
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#247A5A]">
          <span>{isOpen ? 'Hide breakdown' : 'View breakdown'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-2 border-t border-[#DDD9D0] bg-[#FFFFFF] text-xs space-y-4">
          <div className="space-y-3 font-mono">
            {/* Step 1: NUMBER */}
            <div className="p-3.5 bg-[#F1EFE9] rounded-lg border border-[#DDD9D0] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8D86] font-sans block">
                  Stage 1 · Calculated deductions
                </span>
                <span className="font-sans font-semibold text-xs text-[#1E211F]">
                  Total deductions for this redemption
                </span>
              </div>
              <span className="text-lg font-bold font-mono text-[#A66A16]">
                {formatCurrency(result.totalDeductions)}
              </span>
            </div>

            <div className="flex justify-center -my-1 text-[#8A8D86]">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>

            {/* Step 2: COMPONENT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 bg-[#F1EFE9] rounded-lg border border-[#DDD9D0] flex justify-between items-center">
                <div>
                  <span className="font-sans font-semibold text-xs text-[#1E211F] block">Exit load</span>
                  <span className="text-[10px] text-[#666861] font-sans">Units held &lt; 365 days</span>
                </div>
                <span className="font-bold text-sm text-[#A66A16]">{formatCurrency(result.exitLoadAmount)}</span>
              </div>

              <div className="p-3 bg-[#F1EFE9] rounded-lg border border-[#DDD9D0] flex justify-between items-center">
                <div>
                  <span className="font-sans font-semibold text-xs text-[#1E211F] block">Statutory STT</span>
                  <span className="text-[10px] text-[#666861] font-sans">0.001% of gross redemption</span>
                </div>
                <span className="font-bold text-sm text-[#B65347]">{formatCurrency(result.STTAmount)}</span>
              </div>
            </div>

            <div className="flex justify-center -my-1 text-[#8A8D86]">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>

            {/* Step 3: LOT ALLOCATION */}
            <div className="p-3.5 bg-[#F1EFE9] rounded-lg border border-[#DDD9D0] space-y-1.5 font-sans text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8D86] block">
                Stage 3 · Lot allocation (FIFO)
              </span>
              <div className="text-[#1E211F] space-y-1">
                <div>
                  • <strong>Lot A (Older purchase): </strong>
                  {lotA ? `${formatUnits(lotA.unitsRedeemedFromLot)} units` : '0 units'} liquidated.
                  Held 412 days (&gt; 365 days) → <strong>0% exit load ({formatCurrency(0)})</strong>.
                </div>
                <div>
                  • <strong>Lot B (Newer purchase): </strong>
                  {lotB && lotB.unitsRedeemedFromLot > 0 ? (
                    <>
                      {formatUnits(lotB.unitsRedeemedFromLot)} units liquidated ({formatCurrency(lotB.redemptionValueFromLot)} gross).
                      Held 214 days (&lt; 365 days) → <strong>1% exit load ({formatCurrency(lotB.exitLoadAmount)})</strong>.
                    </>
                  ) : (
                    '0 units liquidated. Not reached under FIFO sequence.'
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center -my-1 text-[#8A8D86]">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>

            {/* Step 4 & 5: RULES AND SOURCES */}
            <div className="space-y-2 font-sans">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8D86] block">
                Stage 4 & 5 · Governing rules and sources
              </span>

              <div className="p-3 bg-[#F1EFE9] rounded-lg border border-[#DDD9D0] space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-[#1E211F]">
                  <FileText className="w-3.5 h-3.5 text-[#666861]" />
                  <span>Exit load rule: Demo Scheme Information Document (SID)</span>
                </div>
                <p className="text-[11px] text-[#666861]">
                  Demo scheme rule: 1% exit load on units redeemed within 365 days of allotment; 0% thereafter.
                </p>
                <div className="text-[10px] text-[#8A8D86]">
                  Status: Illustrative scheme specification.
                </div>
              </div>

              <div className="p-3 bg-[#F1EFE9] rounded-lg border border-[#DDD9D0] space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-[#1E211F]">
                  <FileText className="w-3.5 h-3.5 text-[#666861]" />
                  <span>Statutory STT: Central Board of Direct Taxes (CBDT)</span>
                </div>
                <p className="text-[11px] text-[#666861]">
                  Statutory 0.001% levied on gross equity mutual fund redemption value under Section 98, Finance (No. 2) Act, 2004.
                </p>
                <div className="text-[10px] text-[#247A5A] font-semibold">
                  Status: Verified statutory rate.
                </div>
              </div>
            </div>
          </div>

          {/* Tax Note */}
          <div className="p-3 bg-[#F1EFE9] rounded-lg border border-[#DDD9D0] text-xs text-[#666861]">
            <strong className="text-[#1E211F]">Tax note:</strong> Capital gains tax is not calculated in this prototype.
          </div>
        </div>
      )}
    </div>
  );
};
