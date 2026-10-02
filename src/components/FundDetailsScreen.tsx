import React from 'react';
import { ArrowLeft, ArrowRight, Calendar, Info, Layers, ShieldCheck } from 'lucide-react';
import { DEMO_FUND } from '../data/fundData';
import { formatCurrency, formatUnits } from '../services/calculationEngine';

interface FundDetailsScreenProps {
  onBack: () => void;
  onStartRedemption: () => void;
}

export const FundDetailsScreen: React.FC<FundDetailsScreenProps> = ({
  onBack,
  onStartRedemption,
}) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-blue-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Intelligence Home
      </button>

      {/* Main Fund Card */}
      <div className="bg-[#15233A] border border-[#26385A] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-[#26385A] pb-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-500/20 text-blue-300 rounded border border-blue-400/30">
                {DEMO_FUND.category}
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs font-semibold text-slate-300">{DEMO_FUND.plan}</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 bg-[#101B2E] px-2.5 py-1 rounded border border-[#26385A]">
              Demo holding · illustrative data
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
            {DEMO_FUND.name}
          </h1>
        </div>

        {/* Primary Data Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-[#101B2E] border border-[#26385A] rounded-xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Value at illustrative NAV
            </span>
            <span className="text-2xl font-extrabold font-mono text-emerald-400 mt-1 block">
              {formatCurrency(DEMO_FUND.holdingValue)}
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block">
              1,200 units × ₹152.00
            </span>
          </div>

          <div className="p-4 bg-[#101B2E] border border-[#26385A] rounded-xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Units Held
            </span>
            <span className="text-2xl font-extrabold font-mono text-[#F5F7FA] mt-1 block">
              {formatUnits(DEMO_FUND.totalUnits)}
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Liquidated via FIFO sequence
            </span>
          </div>

          <div className="p-4 bg-[#101B2E] border border-[#26385A] rounded-xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Illustrative NAV
            </span>
            <span className="text-2xl font-extrabold font-mono text-blue-400 mt-1 block">
              {formatCurrency(DEMO_FUND.illustrativeNAV)}
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Static prototype scenario
            </span>
          </div>
        </div>

        {/* Purchase Lots Overview */}
        <div className="border-t border-[#26385A] pt-6 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Purchase Lots & Exit Load Status (2)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Fixed As-of Date: {DEMO_FUND.demoAsOfDate}
            </span>
          </div>

          <div className="space-y-3">
            {DEMO_FUND.lots.map((lot) => (
              <div
                key={lot.id}
                className="p-4 rounded-xl border border-[#26385A] bg-[#101B2E] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#F5F7FA]">{lot.name}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      lot.exitLoadEligible
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {lot.exitLoadEligible ? '1% Exit Load Applies' : '0% Exit Load (Held > 365 Days)'}
                    </span>
                  </div>
                  <div className="text-slate-400 text-xs mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Allotted: {lot.allotmentDate}
                    </span>
                    <span>•</span>
                    <span>{lot.reason}</span>
                  </div>
                </div>

                <div className="sm:text-right font-mono">
                  <div className="text-base font-extrabold text-[#F5F7FA]">
                    {formatUnits(lot.units)} units
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Gross value: {formatCurrency(lot.units * DEMO_FUND.illustrativeNAV)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-4 border-t border-[#26385A]">
          <button
            onClick={onStartRedemption}
            className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <span>Proceed to redemption amount entry</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
