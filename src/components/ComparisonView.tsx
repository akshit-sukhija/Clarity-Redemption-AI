import React from 'react';
import { X, Check, ArrowRight, Scale, CheckCircle2 } from 'lucide-react';
import { DEMO_FUND } from '../data/fundData';
import { calculateRedemption, formatCurrency, formatUnits } from '../services/calculationEngine';

interface ComparisonViewProps {
  isOpen: boolean;
  onClose: () => void;
  currentAmount: number;
  onSelectAmount: (amt: number) => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  isOpen,
  onClose,
  currentAmount,
  onSelectAmount,
}) => {
  if (!isOpen) return null;

  // The 4 core benchmark scenarios + custom amount if different
  const benchmarkAmounts = [25000, 50000, 75000, DEMO_FUND.holdingValue];
  const amounts = [...benchmarkAmounts];
  if (!amounts.includes(currentAmount) && currentAmount > 0 && currentAmount < DEMO_FUND.holdingValue) {
    amounts.push(currentAmount);
    amounts.sort((a, b) => a - b);
  }

  const comparisonData = amounts.map((amt) => {
    return {
      amount: amt,
      isCurrent: amt === currentAmount,
      isFull: amt === DEMO_FUND.holdingValue,
      data: calculateRedemption(DEMO_FUND, amt),
    };
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl bg-[#15233A] rounded-3xl shadow-2xl border border-[#26385A] overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#26385A] flex items-center justify-between bg-[#101B2E] text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                Neutral Scenario Comparison
              </span>
              <h2 className="text-lg font-bold text-[#F5F7FA]">
                Compare Redemption Amounts Side-by-Side
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="Close comparison view"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Required Neutral Framing Notice */}
        <div className="px-6 pt-4 pb-2 bg-[#15233A] border-b border-[#26385A]">
          <p className="text-xs text-slate-300 bg-[#101B2E] p-3 rounded-xl border border-[#26385A] font-medium leading-relaxed">
            "The main difference is how the selected amount changes the units redeemed, applicable exit load and remaining holding."
          </p>
        </div>

        {/* Structured Comparison Grid */}
        <div className="flex-1 overflow-x-auto p-6 bg-[#0D1626]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-[700px] lg:min-w-0">
            {comparisonData.map(({ amount, isCurrent, isFull, data }) => (
              <div
                key={amount}
                className={`rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                  isCurrent
                    ? 'border-blue-500 bg-[#15233A] shadow-md ring-1 ring-blue-500/50'
                    : 'border-[#26385A] bg-[#101B2E] hover:border-slate-600'
                }`}
              >
                <div>
                  {/* Amount Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#26385A]">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {isFull ? 'Full Redemption' : 'Gross Amount'}
                      </span>
                      <div className="text-2xl font-extrabold font-mono text-[#F5F7FA] mt-0.5">
                        {formatCurrency(amount, 0)}
                      </div>
                    </div>
                    {isCurrent ? (
                      <span className="px-2.5 py-1 text-[10px] font-bold bg-blue-600 text-white rounded-md flex items-center gap-1 shadow-2xs">
                        <Check className="w-3 h-3" />
                        Current
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-500">
                        Scenario
                      </span>
                    )}
                  </div>

                  {/* Core Metrics Comparison Stack */}
                  <div className="space-y-3.5 py-4 text-xs">
                    <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                        Estimated Net Proceeds
                      </span>
                      <span className="text-lg font-bold font-mono text-emerald-200 block mt-0.5">
                        {formatCurrency(data.estimatedProceeds)}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-[#26385A]/60">
                        <span className="text-slate-400">Exit Load</span>
                        <span className={`font-mono font-bold ${data.exitLoadAmount > 0 ? 'text-amber-300' : 'text-slate-300'}`}>
                          {formatCurrency(data.exitLoadAmount)}
                          <span className="text-[10px] text-slate-500 font-normal ml-1">
                            {data.exitLoadAmount > 0 ? '(1% Lot B)' : '(0%)'}
                          </span>
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-[#26385A]/60">
                        <span className="text-slate-400">STT (0.001%)</span>
                        <span className="font-mono font-medium text-slate-200">
                          {formatCurrency(data.STTAmount)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-[#26385A]/60">
                        <span className="text-slate-400">Units Redeemed</span>
                        <span className="font-mono font-bold text-slate-200">
                          {formatUnits(data.unitsRedeemed)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-[#26385A]/60">
                        <span className="text-slate-400">Units Remaining</span>
                        <span className="font-mono font-bold text-slate-200">
                          {formatUnits(data.remainingUnits)}
                        </span>
                      </div>

                      <div className="pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Remaining Holding Value
                        </span>
                        <span className="font-mono font-bold text-sm text-emerald-400 block mt-0.5">
                          {formatCurrency(data.remainingValueAtIllustrativeNAV)}
                        </span>
                        <span className="text-[10px] text-slate-500">At Illustrative NAV ₹152</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scenario Selector Button */}
                <div className="pt-3 border-t border-[#26385A] mt-2">
                  {!isCurrent ? (
                    <button
                      onClick={() => {
                        onSelectAmount(amount);
                        onClose();
                      }}
                      className="w-full py-2.5 px-3 text-xs font-bold text-slate-200 bg-[#15233A] hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-[#26385A] shadow-2xs"
                    >
                      Select {formatCurrency(amount, 0)}
                    </button>
                  ) : (
                    <div className="py-2 text-center text-xs font-bold text-blue-300 bg-blue-500/20 border border-blue-400/30 rounded-xl">
                      Currently Viewing
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#26385A] bg-[#101B2E] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <span>All scenarios calculated deterministically from the same purchase lots and rules.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
