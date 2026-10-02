import React from 'react';
import { ArrowLeft, FileCheck2, RefreshCw } from 'lucide-react';
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
      <div className="bg-[#15233A] border border-[#26385A] rounded-3xl p-8 sm:p-10 shadow-md text-center space-y-6">
        {/* Verification Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto border border-blue-400/30 shadow-2xs">
          <FileCheck2 className="w-7 h-7" />
        </div>

        {/* Primary Notice Texts per Section 37 */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block mb-1">
            Consequence Review Complete
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
            You've reviewed the consequences.
          </h1>
          <p className="text-sm font-bold text-slate-300 mt-2">
            This prototype ends before transaction confirmation.
          </p>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed mt-2">
            In a real investment app, the next step would depend on the platform's regulated order-review and confirmation flow.
          </p>
        </div>

        {/* Consequence Summary Capsule */}
        <div className="bg-[#101B2E] border border-[#26385A] rounded-2xl p-5 max-w-md mx-auto text-left text-xs space-y-3">
          <div className="font-bold text-[#F5F7FA] pb-2 border-b border-[#26385A] flex justify-between items-center">
            <span>Reviewed Scenario</span>
            <span className="font-mono text-base text-blue-400">{formatCurrency(result.grossRedemptionValue)}</span>
          </div>

          <div className="space-y-2 text-slate-300">
            <div className="flex justify-between">
              <span>Estimated net proceeds:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {formatCurrency(result.estimatedProceeds)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total deductions (Exit load + STT):</span>
              <span className="font-mono font-bold text-amber-300">
                {formatCurrency(result.totalDeductions)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Remaining units:</span>
              <span className="font-mono font-semibold text-[#F5F7FA]">
                {formatUnits(result.remainingUnits)} units
              </span>
            </div>
            <div className="flex justify-between">
              <span>Remaining holding value:</span>
              <span className="font-mono font-semibold text-[#F5F7FA]">
                {formatCurrency(result.remainingValueAtIllustrativeNAV)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onReturnToSnapshot}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to snapshot</span>
          </button>

          <button
            onClick={onStartNewScenario}
            className="w-full sm:w-auto px-6 py-3 bg-[#101B2E] hover:bg-[#1A2C4A] text-slate-300 border border-[#26385A] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Test another amount</span>
          </button>
        </div>
      </div>
    </div>
  );
};
