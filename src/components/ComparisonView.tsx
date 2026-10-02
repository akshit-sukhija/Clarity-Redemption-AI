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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400 flex items-center justify-center text-blue-300">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                Neutral Scenario Engine
              </span>
              <h2 className="text-lg font-bold text-white">
                Compare Redemption Scenarios
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
        <div className="px-6 pt-5 pb-2 bg-slate-50 border-b border-slate-200">
          <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 font-medium">
            "The main difference is how the selected amount changes the units redeemed, applicable exit load and remaining holding."
          </p>
        </div>

        {/* Structured Comparison Grid */}
        <div className="flex-1 overflow-x-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-[700px] lg:min-w-0">
            {comparisonData.map(({ amount, isCurrent, isFull, data }) => (
              <div
                key={amount}
                className={`rounded-2xl border-2 transition-all p-5 flex flex-col justify-between ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-50/40 shadow-sm ring-1 ring-blue-500'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Amount Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {isFull ? 'Full Redemption' : 'Gross Amount'}
                      </span>
                      <div className="text-2xl font-extrabold font-mono text-slate-900 mt-0.5">
                        {formatCurrency(amount, 0)}
                      </div>
                    </div>
                    {isCurrent ? (
                      <span className="px-2.5 py-1 text-[10px] font-bold bg-blue-600 text-white rounded-md flex items-center gap-1 shadow-2xs">
                        <Check className="w-3 h-3" />
                        Current
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400">
                        Scenario
                      </span>
                    )}
                  </div>

                  {/* Core Metrics Comparison Stack */}
                  <div className="space-y-3.5 py-4 text-xs">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                        Estimated Net Proceeds
                      </span>
                      <span className="text-lg font-bold font-mono text-emerald-950 block mt-0.5">
                        {formatCurrency(data.estimatedProceeds)}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-500">Exit Load</span>
                        <span className={`font-mono font-bold ${data.exitLoadAmount > 0 ? 'text-amber-800' : 'text-slate-700'}`}>
                          {formatCurrency(data.exitLoadAmount)}
                          <span className="text-[10px] text-slate-400 font-normal ml-1">
                            {data.exitLoadAmount > 0 ? '(1% Lot B)' : '(0%)'}
                          </span>
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-500">STT (0.001%)</span>
                        <span className="font-mono font-medium text-slate-800">
                          {formatCurrency(data.STTAmount)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-500">Units Redeemed</span>
                        <span className="font-mono font-bold text-slate-800">
                          {formatUnits(data.unitsRedeemed)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-500">Units Remaining</span>
                        <span className="font-mono font-bold text-slate-800">
                          {formatUnits(data.remainingUnits)}
                        </span>
                      </div>

                      <div className="pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                          Remaining Holding Value
                        </span>
                        <span className="font-mono font-bold text-sm text-slate-900 block mt-0.5">
                          {formatCurrency(data.remainingValueAtIllustrativeNAV)}
                        </span>
                        <span className="text-[10px] text-slate-400">At Illustrative NAV ₹152</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scenario Selector Button */}
                <div className="pt-3 border-t border-slate-200 mt-2">
                  {!isCurrent ? (
                    <button
                      onClick={() => {
                        onSelectAmount(amount);
                        onClose();
                      }}
                      className="w-full py-2.5 px-3 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-2xs"
                    >
                      Select {formatCurrency(amount, 0)}
                    </button>
                  ) : (
                    <div className="py-2 text-center text-xs font-bold text-blue-700 bg-blue-100/60 rounded-xl">
                      Currently Viewing
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span>All scenarios calculated deterministically from the same purchase lots and rules.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
