import React from 'react';
import { ArrowRight, Layers, TrendingUp, ShieldCheck } from 'lucide-react';
import { DEMO_FUND } from '../data/fundData';
import { formatCurrency, formatUnits } from '../services/calculationEngine';

interface PortfolioScreenProps {
  onViewFund: () => void;
}

export const PortfolioScreen: React.FC<PortfolioScreenProps> = ({ onViewFund }) => {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 space-y-6">
      {/* Portfolio Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block mb-1">
              My Investment Portfolio
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Mutual Fund Holdings
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Inspect current holdings and explore redemption consequences under deterministic scheme rules.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 text-right font-mono">
            <span className="text-[10px] uppercase text-slate-400 font-sans block">Total Portfolio Value</span>
            <span className="text-2xl font-extrabold text-emerald-400 block mt-0.5">
              {formatCurrency(DEMO_FUND.holdingValue)}
            </span>
            <span className="text-[10px] text-slate-400 font-sans">At Illustrative NAV ₹152.00</span>
          </div>
        </div>
      </div>

      {/* Holding Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          <span>Active Holdings (1 Fund)</span>
          <span>FIFO Lot Management Active</span>
        </div>

        {/* Single Holding Card per Specification */}
        <div
          onClick={onViewFund}
          className="group relative bg-white border-2 border-slate-200 hover:border-blue-500 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-md">
                  {DEMO_FUND.category}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-600">
                  {DEMO_FUND.plan}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-2 group-hover:text-blue-600 transition-colors">
                {DEMO_FUND.name}
              </h2>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs">
                <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Units Held</span>
                  <span className="font-mono font-bold text-slate-900">{formatUnits(DEMO_FUND.totalUnits)}</span>
                </div>
                <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Illustrative NAV</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(DEMO_FUND.illustrativeNAV)}</span>
                </div>
                <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Purchase Lots</span>
                  <span className="font-semibold text-slate-900">2 Lots (FIFO)</span>
                </div>
              </div>
            </div>

            <div className="sm:text-right flex sm:flex-col justify-between items-baseline sm:items-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Holding Value</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 mt-1">
                {formatCurrency(DEMO_FUND.holdingValue)}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Allotted across Lot A (Aug 2025) and Lot B (Mar 2026)
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewFund();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 group-hover:bg-blue-600 rounded-xl transition-all shadow-2xs"
            >
              <span>View fund details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
