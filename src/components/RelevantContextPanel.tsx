import React, { useState } from 'react';
import { RELEVANT_CONTEXT_ITEMS } from '../services/marketDataProvider';
import { Info, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { DEMO_FUND } from '../data/fundData';
import { formatCurrency } from '../services/calculationEngine';

export const RelevantContextPanel: React.FC = () => {
  const [showWhyAmISeeingThis, setShowWhyAmISeeingThis] = useState(false);

  return (
    <div className="bg-[#FFFFFF] border border-[#DDD9D0] rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#DDD9D0]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8D86] block">
            Zone D · Context feed
          </span>
          <h3 className="text-xs font-bold text-[#1E211F]">
            Relevant market context
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[#8A8D86]">
          Static demo snapshot
        </span>
      </div>

      {/* Feed Items */}
      <div className="space-y-3">
        {RELEVANT_CONTEXT_ITEMS.map((item) => (
          <div
            key={item.id}
            className="p-3 bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg text-xs space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-[#1E211F] leading-snug">
                {item.headline}
              </span>
              {item.tag && (
                <span className="text-[9px] font-medium bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#DDD9D0] text-[#666861] shrink-0 ml-2">
                  {item.tag}
                </span>
              )}
            </div>

            <p className="text-[11px] text-[#666861] leading-relaxed">
              {item.explanation}
            </p>

            <div className="pt-1 border-t border-[#DDD9D0]/70 flex flex-col gap-0.5 text-[10px] text-[#8A8D86]">
              <div><strong>Why shown:</strong> {item.relevance}</div>
              <div className="text-[#A66A16]"><strong>Boundary:</strong> {item.impactNote}</div>
              <div>Source: {item.source} · {item.timestamp}</div>
            </div>
          </div>
        ))}
      </div>

      {/* WHY AM I SEEING THIS? (Section 15) */}
      <div className="border border-[#DDD9D0] rounded-lg bg-[#FFFFFF] overflow-hidden">
        <button
          onClick={() => setShowWhyAmISeeingThis(!showWhyAmISeeingThis)}
          className="w-full px-3.5 py-2.5 bg-[#F1EFE9] hover:bg-[#E8E5DD] flex items-center justify-between text-xs font-semibold text-[#1E211F] transition-colors cursor-pointer"
          aria-expanded={showWhyAmISeeingThis}
        >
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#247A5A]" />
            <span>Why am I seeing this context?</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#247A5A]">
            <span>{showWhyAmISeeingThis ? 'Hide' : 'Explain'}</span>
            {showWhyAmISeeingThis ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {showWhyAmISeeingThis && (
          <div className="p-3.5 bg-[#FFFFFF] text-xs text-[#666861] space-y-2 border-t border-[#DDD9D0]">
            <p className="font-semibold text-[#1E211F]">
              This contextual feed is displayed because:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li>Your holding is equity-oriented ({DEMO_FUND.name}).</li>
              <li>NIFTY 50 and SENSEX reflect overall domestic stock market conditions.</li>
              <li>India VIX monitors near-term market volatility expectations.</li>
              <li>These are reference signals to aid situational awareness.</li>
            </ul>

            <div className="p-2.5 bg-[#F1EFE9] rounded border border-[#DDD9D0] text-[11px] space-y-1">
              <div className="font-semibold text-[#1E211F]">Crucial boundary:</div>
              <p>
                These market context signals <strong>do NOT alter</strong> your redemption calculation.
                Redemption consequences are derived strictly from the Illustrative NAV ({formatCurrency(DEMO_FUND.illustrativeNAV)})
                and approved prototype scheme FIFO rules.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
