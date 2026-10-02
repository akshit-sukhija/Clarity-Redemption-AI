import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, ShieldAlert, ArrowDown, CheckCircle2, FileText } from 'lucide-react';
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
    <div className="border border-[#26385A] rounded-2xl bg-[#15233A] overflow-hidden shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-[#15233A] hover:bg-[#1A2C4A] transition-colors text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-[#F5F7FA] block">
              Why This Number? (Evidence Trail)
            </span>
            <span className="text-xs text-slate-400">
              Interactive evidence trail: Number → Component → Lot → Rule → Source
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
          <span>{isOpen ? 'Collapse Trail' : 'Inspect Trail'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 pt-3 border-t border-[#26385A] bg-[#101B2E] text-xs space-y-4">
          <div className="bg-[#15233A] rounded-xl border border-[#26385A] p-5 space-y-4 shadow-sm">
            {/* Step 1: NUMBER */}
            <div className="flex items-center justify-between pb-3 border-b border-[#26385A]">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-blue-600 text-white">
                  01 · Number
                </span>
                <span className="font-bold text-[#F5F7FA]">Total Deductions Calculated</span>
              </div>
              <span className="text-2xl font-extrabold font-mono text-amber-300">
                {formatCurrency(result.totalDeductions)}
              </span>
            </div>

            <div className="flex justify-center -my-2 text-slate-600">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Step 2: COMPONENT */}
            <div className="pb-3 border-b border-[#26385A] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                02 · Statutory & Scheme Components
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                <div className="p-3 bg-[#101B2E] rounded-xl border border-amber-500/30 flex justify-between items-center">
                  <div>
                    <span className="font-sans font-bold text-amber-300 block">Exit Load (Scheme Rule)</span>
                    <span className="text-[10px] text-slate-400 font-sans">Units held &lt; 365 days</span>
                  </div>
                  <span className="font-extrabold text-base text-amber-200">{formatCurrency(result.exitLoadAmount)}</span>
                </div>
                <div className="p-3 bg-[#101B2E] rounded-xl border border-blue-500/30 flex justify-between items-center">
                  <div>
                    <span className="font-sans font-bold text-blue-300 block">STT (Statutory Tax)</span>
                    <span className="text-[10px] text-slate-400 font-sans">0.001% on Gross Repurchase</span>
                  </div>
                  <span className="font-extrabold text-base text-blue-200">{formatCurrency(result.STTAmount)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center -my-2 text-slate-600">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Step 3: LOT */}
            <div className="pb-3 border-b border-[#26385A] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                03 · Affected Purchase Lots (FIFO)
              </span>
              <div className="p-3 bg-[#101B2E] rounded-xl border border-[#26385A] text-slate-300 space-y-1.5 leading-relaxed">
                <div>
                  • <strong>Lot A (Older): </strong>
                  {lotA ? `${lotA.unitsRedeemedFromLot.toFixed(3)} units` : '0 units'} liquidated. Held 412 days (&gt; 365-day exit window) → <strong>0% Exit Load (₹0.00)</strong>.
                </div>
                <div>
                  • <strong>Lot B (Newer): </strong>
                  {lotB && lotB.unitsRedeemedFromLot > 0 ? (
                    <>
                      {lotB.unitsRedeemedFromLot.toFixed(3)} units liquidated ({formatCurrency(lotB.redemptionValueFromLot)} gross). Held 214 days (within 365 days) → <strong>1% Exit Load ({formatCurrency(lotB.exitLoadAmount)})</strong>.
                    </>
                  ) : (
                    '0 units liquidated. Not reached under FIFO sequence.'
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center -my-2 text-slate-600">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Step 4 & 5: RULE & SOURCE */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                04 & 05 · Applicable Scheme Rules & Statutory Sources
              </span>

              <div className="p-3 bg-[#101B2E] rounded-xl border border-[#26385A] space-y-1 text-slate-300">
                <div className="flex items-center gap-1.5 font-bold text-[#F5F7FA]">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Exit Load Rule: SID (Scheme Information Document)</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  "1% exit load applies to units redeemed within 365 days of allotment. Units redeemed after 365 days have 0% exit load."
                </p>
                <div className="text-[10px] text-slate-500 font-semibold">
                  Source: SEBI (Mutual Funds) Regulations, 1996 · Reg 49(1) & Scheme SID.
                </div>
              </div>

              <div className="p-3 bg-[#101B2E] rounded-xl border border-[#26385A] space-y-1 text-slate-300">
                <div className="flex items-center gap-1.5 font-bold text-[#F5F7FA]">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>STT Statutory Rule: Central Board of Direct Taxes (CBDT)</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  "STT of 0.001% applies to equity-oriented mutual-fund redemption value."
                </p>
                <div className="text-[10px] text-slate-500 font-semibold">
                  Source: Section 98, Finance (No. 2) Act, 2004 (Statutory Repurchase Schedule).
                </div>
              </div>
            </div>
          </div>

          {/* Tax Disclosure */}
          <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-500/40 text-amber-200 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div className="text-[11px] leading-relaxed">
              <strong className="font-bold">Tax Note: </strong>
              Capital gains tax is not included in this prototype estimate.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
