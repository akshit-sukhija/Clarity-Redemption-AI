import React from 'react';
import { ArrowRight, Layers, Info } from 'lucide-react';
import { DEMO_FUND } from '../data/fundData';
import { formatCurrency, formatUnits } from '../services/calculationEngine';

interface PortfolioScreenProps {
  onViewFund: () => void;
  onQuickExplore?: (amount: number) => void;
}

export const PortfolioScreen: React.FC<PortfolioScreenProps> = ({ onViewFund, onQuickExplore }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Editorial Hero Banner */}
      <div className="bg-[#FFFFFF] border border-[#DDD9D0] rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <span className="inline-block text-[11px] font-semibold tracking-wider uppercase text-[#666861]">
              Mutual fund redemption
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E211F] font-sans">
              Understand the consequences before you redeem.
            </h1>
            <p className="text-sm text-[#666861] leading-relaxed">
              Before submitting a redemption request, review estimated net proceeds, statutory STT,
              applicable scheme exit loads, and your remaining invested balance.
            </p>
          </div>

          <button
            onClick={onViewFund}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#247A5A] hover:bg-[#1D6349] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <span>Review a redemption</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Holding & Lot Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#FFFFFF] border border-[#DDD9D0] rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-start justify-between pb-4 border-b border-[#DDD9D0]">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8D86] block">
                  Active scheme holding
                </span>
                <h2 className="text-lg font-bold text-[#1E211F] mt-1">
                  {DEMO_FUND.name}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-xs text-[#666861]">
                  <span>{DEMO_FUND.category}</span>
                  <span>•</span>
                  <span>{DEMO_FUND.plan}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8D86] block">
                  Holding value
                </span>
                <span className="text-xl font-bold font-mono text-[#1E211F] block mt-0.5">
                  {formatCurrency(DEMO_FUND.holdingValue)}
                </span>
                <span className="text-[11px] text-[#8A8D86] font-mono">
                  {formatUnits(DEMO_FUND.totalUnits)} units @ {formatCurrency(DEMO_FUND.illustrativeNAV)}
                </span>
              </div>
            </div>

            {/* Underlying Lots */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1E211F] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#666861]" />
                  Purchase lots in this holding
                </span>
                <span className="text-[11px] text-[#8A8D86]">
                  FIFO allocation applied
                </span>
              </div>

              {DEMO_FUND.lots.map((lot) => (
                <div
                  key={lot.id}
                  className="bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#1E211F]">{lot.name}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                        lot.exitLoadEligible
                          ? 'bg-[#A66A16]/10 text-[#A66A16] border border-[#A66A16]/20'
                          : 'bg-[#247A5A]/10 text-[#247A5A] border border-[#247A5A]/20'
                      }`}>
                        {lot.exitLoadEligible ? '1% demo exit load' : '0% load (held > 365 days)'}
                      </span>
                    </div>
                    <div className="text-[#8A8D86] text-[11px]">
                      Allotted {lot.allotmentDate} · {lot.reason}
                    </div>
                  </div>

                  <div className="sm:text-right font-mono">
                    <span className="text-xs font-bold text-[#1E211F] block">
                      {formatUnits(lot.units)} units
                    </span>
                    <span className="text-[11px] text-[#666861]">
                      {formatCurrency(lot.units * DEMO_FUND.illustrativeNAV)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between items-center text-xs text-[#666861]">
              <span>Demo scenario date: {DEMO_FUND.demoAsOfDate}</span>
              <button
                onClick={onViewFund}
                className="text-[#247A5A] hover:underline font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View scheme details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Decision principle and quick exploration (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick Scenario Options */}
          <div className="bg-[#FFFFFF] border border-[#DDD9D0] rounded-xl p-5 shadow-xs space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8A8D86] block">
              Sample redemption scenarios
            </span>
            <p className="text-xs text-[#666861] leading-relaxed">
              Select an amount to explore its specific deduction breakdown and remaining balance:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {[
                { label: '₹25,000', amt: 25000, desc: 'Lot A only (0% load)' },
                { label: '₹50,000', amt: 50000, desc: 'Crosses into Lot B' },
                { label: '₹75,000', amt: 75000, desc: 'Higher Lot B share' },
                { label: 'Full redemption', amt: DEMO_FUND.holdingValue, desc: 'All units liquidated' },
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
                  className="bg-[#F1EFE9] hover:bg-[#E8E5DD] p-2.5 rounded-lg border border-[#DDD9D0] text-left transition-colors cursor-pointer"
                >
                  <span className="font-bold text-[#1E211F] block text-xs">
                    {item.label}
                  </span>
                  <span className="text-[10px] text-[#666861] font-sans block mt-0.5">
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Core Principle Card */}
          <div className="bg-[#FFFFFF] border border-[#DDD9D0] rounded-xl p-5 shadow-xs text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-[#1E211F]">
              <Info className="w-4 h-4 text-[#247A5A]" />
              <span>Clarity core principle</span>
            </div>
            <p className="leading-relaxed text-[#666861]">
              Show the consequences. Do not tell the investor what decision to make.
              Clarity is not a financial advisor and does not recommend buying, selling, or redeeming.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
