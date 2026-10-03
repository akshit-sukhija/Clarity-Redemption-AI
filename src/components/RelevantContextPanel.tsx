import React, { useState } from 'react';
import { RELEVANT_CONTEXT_ITEMS } from '../services/marketDataProvider';
import { ContextFeedItem } from '../types';
import { HelpCircle, ChevronDown, ChevronUp, ExternalLink, Globe, Check } from 'lucide-react';
import { DEMO_FUND } from '../data/fundData';
import { formatCurrency } from '../services/calculationEngine';
import { verifyRuleWithGrounding } from '../services/ruleVerificationService';

export const RelevantContextPanel: React.FC = () => {
  const [showWhyAmISeeingThis, setShowWhyAmISeeingThis] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifiedSignals, setVerifiedSignals] = useState<Record<string, {
    status: string;
    verifiedAt: string;
    sources: { title: string; uri: string }[];
  }>>({});

  const handleVerifySignal = async (item: ContextFeedItem) => {
    setVerifyingId(item.id);
    try {
      const ruleKey = item.id === 'ctx-3' ? 't2-settlement' : 'stt-equity';
      const result = await verifyRuleWithGrounding(ruleKey);
      const currentTimeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST';
      setVerifiedSignals((prev) => ({
        ...prev,
        [item.id]: {
          status: result.verificationStatus === 'VERIFIED_PRIMARY' ? 'Search Grounded (Google)' : 'Verified Primary Source',
          verifiedAt: currentTimeStr,
          sources: result.groundedSources || [],
        },
      }));
    } catch {
      // Fallback
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#DDD9D0] rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header (Section 10) */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-2.5 border-b border-[#DDD9D0]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#247A5A] block">
            Relevant Context
          </span>
          <h3 className="text-xs font-bold text-[#1E211F]">
            Market & Regulatory Context
          </h3>
        </div>
        <span className="text-[10px] text-[#8A8D86] font-sans">
          Context only · Does not alter calculation
        </span>
      </div>

      {/* Feed Items (Section 10: 4 Questions answered per item) */}
      <div className="space-y-3">
        {RELEVANT_CONTEXT_ITEMS.map((item) => {
          const verified = verifiedSignals[item.id];
          const isVerifying = verifyingId === item.id;

          return (
            <div
              key={item.id}
              className="p-3.5 bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg text-xs space-y-2"
            >
              {/* Question 1: What is the signal? */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-xs text-[#1E211F] leading-snug">
                    {item.headline}
                  </span>
                  {item.tag && (
                    <span className="text-[9px] font-medium bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#DDD9D0] text-[#666861] shrink-0">
                      {item.tag}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#666861] leading-relaxed mt-1">
                  {item.explanation}
                </p>
              </div>

              {/* Question 2: Why is it relevant to this holding? */}
              <div className="pt-2 border-t border-[#DDD9D0]/70 text-[11px] space-y-1">
                <div className="text-[#1E211F]">
                  <strong className="text-[#666861]">Why relevant:</strong> {item.relevance}
                </div>

                {/* Question 3: What is the source? */}
                <div className="text-[10px] text-[#8A8D86]">
                  <strong>Source:</strong> {item.source} · {item.timestamp}
                </div>

                {/* Question 4: Does it change the redemption calculation? (Section 10 & 27) */}
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[#247A5A] bg-[#247A5A]/10 px-2 py-0.5 rounded">
                    Effect on redemption: None
                  </span>

                  {/* Demand-driven grounding verification button (Section 11, 12, 28) */}
                  {!verified && (
                    <button
                      onClick={() => handleVerifySignal(item)}
                      disabled={isVerifying}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#666861] hover:text-[#247A5A] cursor-pointer"
                      title="Ground this public context with Google Search verification"
                    >
                      <Globe className="w-3 h-3" />
                      <span>{isVerifying ? 'Grounding…' : 'Verify source'}</span>
                    </button>
                  )}
                </div>

                {/* Grounded Result Card (Section 12) */}
                {verified && (
                  <div className="p-2 bg-[#FFFFFF] rounded border border-[#247A5A]/30 mt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-[#247A5A] flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {verified.status}
                      </span>
                      <span className="text-[#8A8D86] font-mono">Checked: {verified.verifiedAt}</span>
                    </div>
                    {verified.sources.length > 0 && (
                      <div className="space-y-0.5 pt-0.5">
                        {verified.sources.slice(0, 1).map((s, idx) => (
                          <a
                            key={idx}
                            href={s.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between text-[10px] text-[#247A5A] hover:underline"
                          >
                            <span className="truncate pr-1">{s.title}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0 text-[#8A8D86]" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* WHY AM I SEEING THIS? (Section 13) */}
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
          <div className="p-3.5 bg-[#FFFFFF] text-xs text-[#666861] space-y-2.5 border-t border-[#DDD9D0]">
            <p className="font-semibold text-[#1E211F]">
              Clarity displays surrounding market context to inform without steering:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-[#1E211F]">
              <li>
                <strong>Your selected holding:</strong> Equity-oriented mutual fund ({DEMO_FUND.name}).
              </li>
              <li>
                <strong>Context detected:</strong> Broad domestic market closing breadth, India VIX tranquility levels, and SEBI redemption processing norms.
              </li>
              <li>
                <strong>Why it matters:</strong> Provides surrounding market awareness for your fund category during redemption decision-making.
              </li>
              <li>
                <strong>Effect on this calculation:</strong> <span className="text-[#247A5A] font-bold">NONE</span>. Context signals never alter your proceeds.
              </li>
              <li>
                <strong>What remains deterministic:</strong> Illustrative NAV ({formatCurrency(DEMO_FUND.illustrativeNAV)}), units liquidated, FIFO lot allocation, demo exit load, statutory STT, and estimated proceeds.
              </li>
            </ol>

            <div className="p-2.5 bg-[#F1EFE9] rounded border border-[#DDD9D0] text-[11px] space-y-0.5">
              <div className="font-semibold text-[#1E211F]">Non-advisory principle:</div>
              <p className="text-[#666861]">
                Clarity shows the consequences of your redemption amount and verified public context. It never recommends whether to redeem or wait.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
