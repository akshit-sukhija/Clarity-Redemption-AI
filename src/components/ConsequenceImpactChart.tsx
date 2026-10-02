import React from 'react';
import { CalculationResult } from '../types';
import { formatCurrency, formatUnits } from '../services/calculationEngine';
import { ArrowDown, Info, ShieldAlert, CheckCircle2 } from 'lucide-react';

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
    <div className="bg-[#15233A] border border-[#26385A] rounded-2xl p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#26385A]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
            Deduction Flow & Consequence Waterfall
          </span>
          <h3 className="text-base font-bold text-[#F5F7FA]">
            Impact Breakdown: From Entered Amount to Net Proceeds
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-[#101B2E] px-2.5 py-1 rounded border border-[#26385A]">
          100% Deterministic Engine Result
        </span>
      </div>

      {/* Visual Waterfall Steps */}
      <div className="space-y-3 font-mono text-xs">
        {/* Step 1: Gross Entered */}
        <div className="bg-[#101B2E] border border-[#26385A] rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-400/30 font-bold flex items-center justify-center text-[11px]">
              1
            </span>
            <div>
              <span className="font-sans font-bold text-sm text-[#F5F7FA] block">
                Gross Redemption Value
              </span>
              <span className="text-[11px] text-slate-400 font-sans">
                {formatUnits(result.unitsRedeemed)} units × ₹152.00 NAV
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-base font-extrabold text-[#F5F7FA]">
              {formatCurrency(gross)}
            </span>
            <span className="block text-[10px] text-slate-400 font-sans">100.00% of requested</span>
          </div>
        </div>

        {/* Down Arrow */}
        <div className="flex items-center justify-center -my-1 text-slate-500">
          <ArrowDown className="w-3.5 h-3.5" />
        </div>

        {/* Step 2: Exit Load */}
        <div className="bg-[#101B2E] border border-amber-500/30 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-400/30 font-bold flex items-center justify-center text-[11px]">
              2
            </span>
            <div>
              <span className="font-sans font-bold text-sm text-amber-200 block">
                Exit Load Deduction
              </span>
              <span className="text-[11px] text-slate-400 font-sans">
                {exitLoad > 0
                  ? '1.00% charged on Lot B units held < 365 days'
                  : '0.00% charged (all units from Lot A held > 365 days)'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-base font-extrabold text-amber-300">
              - {formatCurrency(exitLoad)}
            </span>
            <span className="block text-[10px] text-amber-400/80 font-sans">
              {exitLoadPct.toFixed(3)}% of gross
            </span>
          </div>
        </div>

        {/* Down Arrow */}
        <div className="flex items-center justify-center -my-1 text-slate-500">
          <ArrowDown className="w-3.5 h-3.5" />
        </div>

        {/* Step 3: STT */}
        <div className="bg-[#101B2E] border border-rose-500/30 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-400/30 font-bold flex items-center justify-center text-[11px]">
              3
            </span>
            <div>
              <span className="font-sans font-bold text-sm text-rose-200 block">
                Securities Transaction Tax (STT)
              </span>
              <span className="text-[11px] text-slate-400 font-sans">
                Statutory 0.001% on equity redemption (Sec. 98 Finance Act)
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-base font-extrabold text-rose-300">
              - {formatCurrency(stt)}
            </span>
            <span className="block text-[10px] text-rose-400/80 font-sans">
              {sttPct.toFixed(4)}% of gross
            </span>
          </div>
        </div>

        {/* Down Arrow */}
        <div className="flex items-center justify-center -my-1 text-slate-500">
          <ArrowDown className="w-3.5 h-3.5" />
        </div>

        {/* Step 4: Estimated Proceeds */}
        <div className="bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/50 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 font-bold flex items-center justify-center text-xs">
              ✓
            </span>
            <div>
              <span className="font-sans font-bold text-sm text-emerald-100 block">
                Estimated Net Proceeds
              </span>
              <span className="text-[11px] text-emerald-300/80 font-sans">
                Estimated credit to investor bank account within 2 working days
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-400">
              {formatCurrency(proceeds)}
            </span>
            <span className="block text-[10px] text-emerald-300 font-sans font-bold">
              {proceedsPct.toFixed(3)}% retained
            </span>
          </div>
        </div>
      </div>

      {/* Proportional Linear Ratio Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-[11px] text-slate-400 font-mono">
          <span>Net Proceeds: {proceedsPct.toFixed(2)}%</span>
          <span>Total Deductions: {(exitLoadPct + sttPct).toFixed(2)}%</span>
        </div>
        <div className="h-3 w-full bg-[#101B2E] rounded-full overflow-hidden flex border border-[#26385A]">
          <div
            style={{ width: `${proceedsPct}%` }}
            className="bg-emerald-500 transition-all duration-300"
            title={`Net Proceeds: ${formatCurrency(proceeds)}`}
          />
          <div
            style={{ width: `${exitLoadPct}%` }}
            className="bg-amber-500 transition-all duration-300"
            title={`Exit Load: ${formatCurrency(exitLoad)}`}
          />
          <div
            style={{ width: `${sttPct}%` }}
            className="bg-rose-500 transition-all duration-300"
            title={`STT: ${formatCurrency(stt)}`}
          />
        </div>
      </div>

      {/* Mandatory Statutory Tax Exclusion Disclosure (Section 19 & 26) */}
      <div className="p-3 bg-[#101B2E] border border-blue-500/30 rounded-xl flex items-start gap-2.5 text-xs">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-slate-300 space-y-0.5">
          <span className="font-bold text-[#F5F7FA] block">
            Capital Gains Tax Disclosure:
          </span>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Capital-gains tax (LTCG / STCG) is <strong>not included</strong> in this prototype calculation. Tax liability depends on your comprehensive financial year capital gains and acquisition costs; never assume net proceeds equal post-tax proceeds.
          </p>
        </div>
      </div>
    </div>
  );
};
