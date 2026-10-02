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
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Portfolio
      </button>

      {/* Main Fund Card */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="border-b border-slate-200 pb-5 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-md">
                {DEMO_FUND.category}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600">{DEMO_FUND.plan}</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Demo holding · illustrative data
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {DEMO_FUND.name}
          </h1>
        </div>

        {/* Primary Data Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-4 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl shadow-2xs">
            <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block">
              Value at illustrative NAV
            </span>
            <span className="text-2xl font-extrabold font-mono text-white mt-1 block">
              {formatCurrency(DEMO_FUND.holdingValue)}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">
              1,200 units × ₹152.00
            </span>
          </div>

          <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
              Total Units Held
            </span>
            <span className="text-2xl font-extrabold font-mono text-blue-950 mt-1 block">
              {formatUnits(DEMO_FUND.totalUnits)}
            </span>
            <span className="text-[10px] text-blue-600 mt-1 block">
              Liquidated via FIFO
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              Illustrative NAV
            </span>
            <span className="text-2xl font-extrabold font-mono text-slate-900 mt-1 block">
              {formatCurrency(DEMO_FUND.illustrativeNAV)}
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Static prototype scenario
            </span>
          </div>
        </div>

        {/* Purchase Lots Overview */}
        <div className="border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Purchase Lots & Exit Load Status (2)
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Demo Date: {DEMO_FUND.demoAsOfDate}
            </span>
          </div>

          <div className="space-y-3">
            {DEMO_FUND.lots.map((lot) => (
              <div
                key={lot.id}
                className={`p-4 rounded-xl border-2 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  lot.exitLoadEligible
                    ? 'bg-amber-50/60 border-amber-200'
                    : 'bg-blue-50/60 border-blue-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{lot.name}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      lot.exitLoadEligible ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {lot.exitLoadEligible ? '1% Exit Load Applies' : '0% Exit Load (Held > 365 Days)'}
                    </span>
                  </div>
                  <div className="text-slate-600 text-xs mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Allotted: {lot.allotmentDate}
                    </span>
                    <span>•</span>
                    <span>{lot.reason}</span>
                  </div>
                </div>

                <div className="sm:text-right font-mono">
                  <div className="text-base font-extrabold text-slate-900">
                    {formatUnits(lot.units)} units
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Gross value: {formatCurrency(lot.units * DEMO_FUND.illustrativeNAV)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-8 pt-5 border-t border-slate-200">
          <button
            onClick={onStartRedemption}
            className="w-full py-4 px-4 bg-slate-900 hover:bg-blue-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
          >
            <span>Start redemption</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
