import React from 'react';
import { CalculationResult } from '../types';
import { formatCurrency, formatUnits } from '../services/calculationEngine';
import { ArrowDown, Info } from 'lucide-react';

interface ConsequenceImpactChartProps {
  result: CalculationResult;
}

export const ConsequenceImpactChart: React.FC<ConsequenceImpactChartProps> = ({ result }) => {
  const gross = result.grossRedemptionValue;
  const exitLoad = result.exitLoadAmount;
  const stt = result.STTAmount;
  const proceeds = result.estimatedProceeds;

  const exitLoadPct = gross > 0 ? (exitLoad / gross) * 100 : 0;
  const sttPct = gross > 0 ? (stt / gross) * 100 : 0;
  const proceedsPct = gross > 0 ? (proceeds / gross) * 100 : 0;

  return (
    <div className="bg-[#FFFFFF] border border-[#DDD9D0] rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-[#DDD9D0]">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8D86] block">
            Deduction flow
          </span>
          <h3 className="text-sm font-bold text-[#1E211F]">
            From entered amount to estimated net proceeds
          </h3>
        </div>
        <span className="text-[11px] text-[#666861]">
          Derived from calculation engine
        </span>
      </div>

      {/* Visual Waterfall Steps */}
      <div className="space-y-2.5 font-mono text-xs">
        {/* Step 1: Gross Entered */}
        <div className="bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-5 h-5 rounded bg-[#DDD9D0] text-[#1E211F] font-bold flex items-center justify-center text-[10px]">
              1
            </span>
            <div>
              <span className="font-sans font-semibold text-xs text-[#1E211F] block">
                Gross redemption amount
              </span>
              <span className="text-[11px] text-[#666861] font-sans">
                {formatUnits(result.unitsRedeemed)} units × {formatCurrency(result.illustrativeNAV)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-[#1E211F]">
              {formatCurrency(gross)}
            </span>
            <span className="block text-[10px] text-[#8A8D86] font-sans">100.00%</span>
          </div>
        </div>

        {/* Down Arrow */}
        <div className="flex items-center justify-center -my-1 text-[#8A8D86]">
          <ArrowDown className="w-3.5 h-3.5" />
        </div>

        {/* Step 2: Exit Load */}
        <div className="bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-5 h-5 rounded bg-[#A66A16]/15 text-[#A66A16] font-bold flex items-center justify-center text-[10px]">
              2
            </span>
            <div>
              <span className="font-sans font-semibold text-xs text-[#1E211F] block">
                Exit load deduction
              </span>
              <span className="text-[11px] text-[#666861] font-sans">
                {exitLoad > 0
                  ? 'Demo rule: 1% charged on newer lot units held < 365 days'
                  : '0% charged (all units from older lot held > 365 days)'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-[#A66A16]">
              - {formatCurrency(exitLoad)}
            </span>
            <span className="block text-[10px] text-[#8A8D86] font-sans">
              {exitLoadPct.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Down Arrow */}
        <div className="flex items-center justify-center -my-1 text-[#8A8D86]">
          <ArrowDown className="w-3.5 h-3.5" />
        </div>

        {/* Step 3: STT */}
        <div className="bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-5 h-5 rounded bg-[#B65347]/15 text-[#B65347] font-bold flex items-center justify-center text-[10px]">
              3
            </span>
            <div>
              <span className="font-sans font-semibold text-xs text-[#1E211F] block">
                Securities Transaction Tax (STT)
              </span>
              <span className="text-[11px] text-[#666861] font-sans">
                Statutory 0.001% under Finance Act Section 98
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-[#B65347]">
              - {formatCurrency(stt)}
            </span>
            <span className="block text-[10px] text-[#8A8D86] font-sans">
              {sttPct.toFixed(4)}%
            </span>
          </div>
        </div>

        {/* Down Arrow */}
        <div className="flex items-center justify-center -my-1 text-[#8A8D86]">
          <ArrowDown className="w-3.5 h-3.5" />
        </div>

        {/* Step 4: Estimated Proceeds */}
        <div className="bg-[#247A5A]/5 border border-[#247A5A]/30 rounded-lg p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded bg-[#247A5A] text-white font-bold flex items-center justify-center text-xs">
              ✓
            </span>
            <div>
              <span className="font-sans font-bold text-sm text-[#1E211F] block">
                Estimated net proceeds
              </span>
              <span className="text-[11px] text-[#666861] font-sans">
                Demo assumption: indicative payout within 2 working days
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-[#247A5A]">
              {formatCurrency(proceeds)}
            </span>
            <span className="block text-[10px] text-[#666861] font-sans font-medium">
              {proceedsPct.toFixed(2)}% retained
            </span>
          </div>
        </div>
      </div>

      {/* Proportional Linear Ratio Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-[11px] text-[#666861] font-mono">
          <span>Net proceeds: {proceedsPct.toFixed(2)}%</span>
          <span>Deductions: {(exitLoadPct + sttPct).toFixed(2)}%</span>
        </div>
        <div className="h-2.5 w-full bg-[#E8E5DD] rounded-full overflow-hidden flex">
          <div
            style={{ width: `${proceedsPct}%` }}
            className="bg-[#247A5A] transition-all"
            title={`Net proceeds: ${formatCurrency(proceeds)}`}
          />
          <div
            style={{ width: `${exitLoadPct}%` }}
            className="bg-[#A66A16] transition-all"
            title={`Exit load: ${formatCurrency(exitLoad)}`}
          />
          <div
            style={{ width: `${sttPct}%` }}
            className="bg-[#B65347] transition-all"
            title={`STT: ${formatCurrency(stt)}`}
          />
        </div>
      </div>

      {/* Statutory Tax Exclusion Disclosure */}
      <div className="p-3 bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg flex items-start gap-2.5 text-xs text-[#666861]">
        <Info className="w-4 h-4 text-[#8A8D86] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#1E211F]">Capital gains tax:</strong> Capital gains tax is not calculated in this prototype.
          Applicable tax liability depends on your total capital gains and purchase costs across the financial year.
        </p>
      </div>
    </div>
  );
};
