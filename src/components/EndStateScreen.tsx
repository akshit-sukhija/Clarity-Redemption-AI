import React from 'react';
import { ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react';
import { CalculationResult } from '../types';
import { formatCurrency, formatUnits } from '../services/calculationEngine';

interface EndStateScreenProps {
  result: CalculationResult;
  onReturnToSnapshot: () => void;
  onStartNewScenario: () => void;
}

export const EndStateScreen: React.FC<EndStateScreenProps> = ({
  result,
  onReturnToSnapshot,
  onStartNewScenario,
}) => {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-[#FFFFFF] border border-[#DDD9D0] rounded-xl p-8 sm:p-10 shadow-xs text-center space-y-6">
        {/* Verification Icon */}
        <div className="w-12 h-12 rounded-full bg-[#247A5A]/10 text-[#247A5A] flex items-center justify-center mx-auto border border-[#247A5A]/20">
          <CheckCircle2 className="w-6 h-6" />
        </div>

        {/* Notice */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8D86] block">
            Consequence review complete
          </span>
          <h1 className="text-2xl font-bold text-[#1E211F] tracking-tight">
            You've reviewed the consequences.
          </h1>
          <p className="text-sm font-semibold text-[#1E211F] pt-1">
            This prototype ends before transaction confirmation.
          </p>
          <p className="text-xs text-[#666861] max-w-md mx-auto leading-relaxed pt-1">
            In a regulated mutual-fund platform, the next step would depend on your platform's order-review,
            mandate verification, and settlement authorization.
          </p>
        </div>

        {/* Consequence Capsule */}
        <div className="bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg p-5 max-w-md mx-auto text-left text-xs space-y-2.5">
          <div className="font-semibold text-[#1E211F] pb-2 border-b border-[#DDD9D0] flex justify-between items-center">
            <span>Reviewed amount</span>
            <span className="font-mono text-sm font-bold text-[#1E211F]">
              {formatCurrency(result.grossRedemptionValue)}
            </span>
          </div>

          <div className="space-y-1.5 text-[#666861]">
            <div className="flex justify-between items-center">
              <span>Estimated net proceeds:</span>
              <span className="font-mono font-bold text-[#247A5A] text-sm">
                {formatCurrency(result.estimatedProceeds)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total deductions:</span>
              <span className="font-mono font-semibold text-[#A66A16]">
                {formatCurrency(result.totalDeductions)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Remaining units:</span>
              <span className="font-mono text-[#1E211F]">
                {formatUnits(result.remainingUnits)} units
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Remaining holding value:</span>
              <span className="font-mono text-[#1E211F]">
                {formatCurrency(result.remainingValueAtIllustrativeNAV)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onReturnToSnapshot}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#247A5A] hover:bg-[#1D6349] text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to snapshot</span>
          </button>

          <button
            onClick={onStartNewScenario}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#FFFFFF] hover:bg-[#F1EFE9] text-[#1E211F] border border-[#DDD9D0] rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#666861]" />
            <span>Explore another amount</span>
          </button>
        </div>
      </div>
    </div>
  );
};
