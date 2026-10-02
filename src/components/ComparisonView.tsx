import React from 'react';
import { X, Check, Scale } from 'lucide-react';
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

  // 4 core benchmark scenarios + custom amount if different
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl bg-[#FFFFFF] rounded-xl shadow-lg border border-[#DDD9D0] overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#DDD9D0] flex items-center justify-between bg-[#FFFFFF]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#F1EFE9] border border-[#DDD9D0] flex items-center justify-center text-[#666861]">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8D86] block">
                Scenario exploration
              </span>
              <h2 className="text-lg font-bold text-[#1E211F]">
                Compare redemption consequences
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#666861] hover:text-[#1E211F] hover:bg-[#F1EFE9] rounded-lg transition-colors cursor-pointer"
            aria-label="Close comparison view"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Neutral Framing Notice */}
        <div className="px-6 py-3 bg-[#F1EFE9] border-b border-[#DDD9D0] text-xs text-[#666861]">
          The main difference across amounts is how units are liquidated, which exit loads apply under FIFO, and what holding value remains.
        </div>

        {/* Structured Comparison Grid */}
        <div className="flex-1 overflow-x-auto p-6 bg-[#FFFFFF]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-[700px] lg:min-w-0">
            {comparisonData.map(({ amount, isCurrent, isFull, data }) => (
              <div
                key={amount}
                className={`rounded-lg border p-4 flex flex-col justify-between transition-colors ${
                  isCurrent
                    ? 'border-[#247A5A] bg-[#247A5A]/5'
                    : 'border-[#DDD9D0] bg-[#F1EFE9]'
                }`}
              >
                <div>
                  {/* Amount Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#DDD9D0]">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8A8D86] block">
                        {isFull ? 'Full redemption' : 'Gross amount'}
                      </span>
                      <div className="text-xl font-bold font-mono text-[#1E211F] mt-0.5">
                        {formatCurrency(amount, 0)}
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#247A5A] text-white rounded flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Current
                      </span>
                    )}
                  </div>

                  {/* Core Metrics */}
                  <div className="space-y-3 py-3 text-xs">
                    <div className="p-2.5 bg-[#FFFFFF] rounded border border-[#DDD9D0]">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8A8D86] block">
                        Estimated net proceeds
                      </span>
                      <span className="text-base font-bold font-mono text-[#247A5A] block mt-0.5">
                        {formatCurrency(data.estimatedProceeds)}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#666861]">
                      <div className="flex justify-between items-center py-0.5 border-b border-[#DDD9D0]/60">
                        <span>Exit load:</span>
                        <span className={`font-mono font-semibold ${data.exitLoadAmount > 0 ? 'text-[#A66A16]' : 'text-[#1E211F]'}`}>
                          {formatCurrency(data.exitLoadAmount)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-0.5 border-b border-[#DDD9D0]/60">
                        <span>STT (0.001%):</span>
                        <span className="font-mono text-[#1E211F]">
                          {formatCurrency(data.STTAmount)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-0.5 border-b border-[#DDD9D0]/60">
                        <span>Units redeemed:</span>
                        <span className="font-mono text-[#1E211F]">
                          {formatUnits(data.unitsRedeemed)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-0.5 border-b border-[#DDD9D0]/60">
                        <span>Units remaining:</span>
                        <span className="font-mono text-[#1E211F]">
                          {formatUnits(data.remainingUnits)}
                        </span>
                      </div>

                      <div className="pt-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8A8D86] block">
                          Remaining holding value
                        </span>
                        <span className="font-mono font-bold text-xs text-[#1E211F] block mt-0.5">
                          {formatCurrency(data.remainingValueAtIllustrativeNAV)}
                        </span>
                        <span className="text-[10px] text-[#8A8D86]">@ {formatCurrency(data.illustrativeNAV)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scenario Selector Button */}
                <div className="pt-3 border-t border-[#DDD9D0] mt-2">
                  {!isCurrent ? (
                    <button
                      onClick={() => {
                        onSelectAmount(amount);
                        onClose();
                      }}
                      className="w-full py-2 px-3 text-xs font-semibold text-[#1E211F] bg-[#FFFFFF] hover:bg-[#E8E5DD] rounded border border-[#DDD9D0] transition-colors cursor-pointer"
                    >
                      Explore {formatCurrency(amount, 0)}
                    </button>
                  ) : (
                    <div className="py-1.5 text-center text-xs font-medium text-[#247A5A]">
                      Active scenario
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#DDD9D0] bg-[#FFFFFF] flex flex-wrap items-center justify-between gap-3 text-xs text-[#666861]">
          <span>Derived deterministically using the same purchase lots and rules.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#247A5A] hover:bg-[#1D6349] text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
