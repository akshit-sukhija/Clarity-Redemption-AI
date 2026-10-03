import React from 'react';
import { ArrowLeft, ArrowRight, Layers, ShieldCheck, Info } from 'lucide-react';
import { DEMO_FUND, SCHEME_RULES } from '../data/fundData';
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
      {/* Back link */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#666861] hover:text-[#1E211F] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to portfolio overview
      </button>

      {/* Main Fund Card */}
      <div className="bg-[#FFFFFF] border border-[#DDD9D0] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-[#DDD9D0] pb-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-medium bg-[#F1EFE9] text-[#666861] rounded border border-[#DDD9D0]">
                {DEMO_FUND.category}
              </span>
              <span className="text-xs text-[#8A8D86]">•</span>
              <span className="text-xs text-[#666861]">{DEMO_FUND.plan}</span>
            </div>
            <span className="text-[11px] text-[#8A8D86]">
              As-of scenario date: {DEMO_FUND.demoAsOfDate}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E211F] tracking-tight">
            {DEMO_FUND.name}
          </h1>
        </div>

        {/* Primary Data Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg">
            <span className="text-[11px] font-semibold text-[#8A8D86] uppercase tracking-wider block">
              Value at illustrative NAV
            </span>
            <span className="text-2xl font-bold font-mono text-[#1E211F] mt-1 block">
              {formatCurrency(DEMO_FUND.holdingValue)}
            </span>
            <span className="text-[11px] text-[#666861] mt-1 block font-mono">
              {formatUnits(DEMO_FUND.totalUnits)} units × {formatCurrency(DEMO_FUND.illustrativeNAV)}
            </span>
          </div>

          <div className="p-4 bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg">
            <span className="text-[11px] font-semibold text-[#8A8D86] uppercase tracking-wider block">
              Total units held
            </span>
            <span className="text-2xl font-bold font-mono text-[#1E211F] mt-1 block">
              {formatUnits(DEMO_FUND.totalUnits)}
            </span>
            <span className="text-[11px] text-[#666861] mt-1 block">
              Liquidated in FIFO sequence
            </span>
          </div>

          <div className="p-4 bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg">
            <span className="text-[11px] font-semibold text-[#8A8D86] uppercase tracking-wider block">
              Illustrative NAV
            </span>
            <span className="text-2xl font-bold font-mono text-[#1E211F] mt-1 block">
              {formatCurrency(DEMO_FUND.illustrativeNAV)}
            </span>
            <span className="text-[11px] text-[#666861] mt-1 block">
              Static demo scenario rate
            </span>
          </div>
        </div>

        {/* Purchase Lots Overview */}
        <div className="border-t border-[#DDD9D0] pt-6 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#666861]" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1E211F]">
                Purchase lots in holding ({DEMO_FUND.lots.length})
              </h2>
            </div>
            <span className="text-xs text-[#8A8D86]">
              Redemption follows FIFO order
            </span>
          </div>

          <div className="space-y-2.5">
            {DEMO_FUND.lots.map((lot) => (
              <div
                key={lot.id}
                className="bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1E211F]">{lot.name}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                      lot.exitLoadEligible
                        ? 'bg-[#A66A16]/10 text-[#A66A16] border border-[#A66A16]/20'
                        : 'bg-[#247A5A]/10 text-[#247A5A] border border-[#247A5A]/20'
                    }`}>
                      {lot.exitLoadEligible ? '1% demo exit load' : '0% load (held > 365 days)'}
                    </span>
                  </div>
                  <p className="text-[#666861] mt-1">
                    Allotment: {lot.allotmentDate} · {lot.reason}
                  </p>
                </div>

                <div className="sm:text-right font-mono">
                  <span className="font-bold text-sm text-[#1E211F] block">
                    {formatUnits(lot.units)} units
                  </span>
                  <span className="text-[#8A8D86] text-[11px]">
                    {formatCurrency(lot.units * DEMO_FUND.illustrativeNAV)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheme Rules Summary */}
        <div className="bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg p-4 text-xs space-y-2 text-[#666861]">
          <span className="font-semibold text-[#1E211F] block">
            Applicable scheme and statutory rules:
          </span>
          <ul className="list-disc list-inside space-y-1">
            <li>FIFO allocation applied under this prototype scheme rule.</li>
            <li>Demo scheme rule: 1% exit load on units redeemed within 365 days; 0% thereafter.</li>
            <li>Statutory STT of 0.001% levied on gross redemption value under Finance Act Section 98.</li>
            <li>Indicative processing timeline; actual timing depends on scheme terms, cut-off timing, and business days.</li>
            <li>Capital gains tax is not calculated in this prototype.</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs text-[#8A8D86]">
            No financial transaction will be executed in this prototype.
          </span>
          <button
            onClick={onStartRedemption}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#247A5A] hover:bg-[#1D6349] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Proceed to enter amount</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
