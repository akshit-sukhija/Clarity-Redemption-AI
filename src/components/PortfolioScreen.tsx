import React from 'react';
import { ArrowRight, Layers, TrendingUp, ShieldCheck, Activity, Info, Calendar, AlertCircle } from 'lucide-react';
import { DEMO_FUND } from '../data/fundData';
import { formatCurrency, formatUnits } from '../services/calculationEngine';

interface PortfolioScreenProps {
  onViewFund: () => void;
  onQuickExplore?: (amount: number) => void;
}

export const PortfolioScreen: React.FC<PortfolioScreenProps> = ({ onViewFund, onQuickExplore }) => {
  // P2: Contextual Market Pulse benchmarks (strictly isolated from calculations)
  const marketBenchmarks = [
    { name: 'NIFTY 50', val: '24,850.30', chg: '+0.35%', up: true },
    { name: 'SENSEX', val: '81,220.15', chg: '+0.28%', up: true },
    { name: 'INDIA VIX', val: '13.40', chg: '-1.10%', up: false },
    { name: 'USD / INR', val: '83.95', chg: '+0.05%', up: true },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* P2: COMPACT MARKET PULSE (Strictly isolated from calculations) */}
      <div className="bg-[#15233A] border border-[#26385A] rounded-xl p-3 sm:px-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-[#26385A]/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              MARKET PULSE
            </span>
            <span className="text-[10px] text-slate-400 bg-[#101B2E] px-2 py-0.5 rounded border border-[#26385A]">
              Benchmark snapshot as of 2026-10-01 demo date
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            Contextual reference · Does not alter scheme NAV or calculations
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          {marketBenchmarks.map((item) => (
            <div key={item.name} className="bg-[#101B2E] p-2 rounded-lg border border-[#26385A]/70 flex items-center justify-between">
              <span className="text-slate-400 font-sans text-[11px]">{item.name}</span>
              <div className="text-right">
                <span className="text-[#F5F7FA] font-bold block">{item.val}</span>
                <span className={`text-[10px] ${item.up ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {item.chg}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Welcome / Mission Banner */}
      <div className="bg-gradient-to-r from-[#15233A] to-[#1A2C4A] border border-[#26385A] rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 rounded border border-blue-400/30">
                Decision Intelligence
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-300">Mutual Fund Redemption Layer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F7FA]">
              Understand what ₹X means before you redeem.
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Consolidates gross entered amount, net proceeds, FIFO lot liquidation, scheme exit loads, and statutory STT into one neutral pre-confirmation view.
            </p>
          </div>

          <button
            onClick={onViewFund}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0"
          >
            <span>Review a redemption</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MAIN INTELLIGENCE SURFACE (2 Columns on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Your Holding & Lot Architecture (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#15233A] border border-[#26385A] rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#26385A]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Active Holding
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-[#F5F7FA] mt-0.5">
                  {DEMO_FUND.name}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-300">
                  <span className="px-2 py-0.5 bg-[#101B2E] rounded text-slate-300 font-medium border border-[#26385A]">
                    {DEMO_FUND.category}
                  </span>
                  <span>•</span>
                  <span>{DEMO_FUND.plan}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Holding Value
                </span>
                <span className="text-2xl font-extrabold font-mono text-emerald-400 block mt-0.5">
                  {formatCurrency(DEMO_FUND.holdingValue)}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  1,200.000 u @ ₹152.00
                </span>
              </div>
            </div>

            {/* Holding Purchase Lots (FIFO Structure) */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                Underlying Purchase Lots (2 Lots Available)
              </span>

              {DEMO_FUND.lots.map((lot) => (
                <div
                  key={lot.id}
                  className="bg-[#101B2E] border border-[#26385A] rounded-xl p-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#F5F7FA]">{lot.name}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        lot.exitLoadEligible
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {lot.exitLoadEligible ? '1% Exit Load' : '0% Exit Load (Held > 365 Days)'}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] mt-1 flex items-center gap-2">
                      <span>Allotted: {lot.allotmentDate}</span>
                      <span>•</span>
                      <span>{lot.reason}</span>
                    </div>
                  </div>

                  <div className="sm:text-right font-mono">
                    <span className="text-sm font-bold text-[#F5F7FA] block">
                      {formatUnits(lot.units)} units
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatCurrency(lot.units * DEMO_FUND.illustrativeNAV)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-[#26385A] flex justify-between items-center text-xs">
              <span className="text-slate-400">
                FIFO Accounting: Lot A liquidated first, then Lot B.
              </span>
              <button
                onClick={onViewFund}
                className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-colors"
              >
                <span>View fund details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Relevant Context & "Why am I seeing this?" (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick Scenario Exploration Box */}
          <div className="bg-[#15233A] border border-[#26385A] rounded-2xl p-5 shadow-sm space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block">
              Quick Scenario Review
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Explore how specific redemption amounts impact exit loads, statutory STT, and remaining units:
            </p>

            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              {[
                { label: '₹25,000', amt: 25000, desc: 'Lot A only (0% load)' },
                { label: '₹50,000', amt: 50000, desc: 'Crosses into Lot B' },
                { label: '₹75,000', amt: 75000, desc: 'Higher Lot B share' },
                { label: 'Full (₹1.82L)', amt: 182400, desc: 'Complete liquidation' },
              ].map((item) => (
                <button
                  key={item.amt}
                  onClick={() => {
                    if (onQuickExplore) {
                      onQuickExplore(item.amt);
                    } else {
                      onViewFund();
                    }
                  }}
                  className="bg-[#101B2E] hover:bg-[#1A2C4A] p-2.5 rounded-xl border border-[#26385A] text-left transition-all group"
                >
                  <span className="font-bold text-[#F5F7FA] group-hover:text-blue-300 block">
                    {item.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* "Why am I seeing this?" Card */}
          <div className="bg-[#15233A] border border-[#26385A] rounded-2xl p-5 shadow-sm text-xs space-y-2 text-slate-300">
            <div className="flex items-center gap-1.5 font-bold text-[#F5F7FA]">
              <Info className="w-4 h-4 text-blue-400" />
              <span>Why am I seeing this?</span>
            </div>
            <p className="leading-relaxed text-slate-400">
              When retail investors redeem, digital platforms often show only the gross input. Clarity previews unrounded statutory deductions (CBDT STT 0.001%) and scheme exit loads so you understand the exact net credited amount.
            </p>
          </div>

          {/* Honesty Guardrail Teaser */}
          <div className="bg-[#101B2E] border border-[#26385A] rounded-2xl p-4 text-xs text-slate-400 space-y-1">
            <span className="font-bold text-slate-300 block">Clarity Core Principle:</span>
            <p>
              "Show the consequences. Explain the evidence. Leave the decision to the investor."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
