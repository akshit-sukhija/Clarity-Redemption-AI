import React, { useState } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  ShieldCheck,
  CornerDownRight,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  RefreshCw,
} from 'lucide-react';
import { CalculationResult, LiveGroundingVerification } from '../types';
import {
  CURATED_QUESTIONS,
  COMMON_ADVICE_QUERIES,
  explainWithGemini,
  getTemplateExplanation,
  ExplanationResponse,
} from '../services/geminiExplanation';
import { STATIC_GLOSSARY, RULE_VERIFICATION_SOURCES } from '../data/fundData';
import { formatCurrency, formatUnits } from '../services/calculationEngine';
import {
  verifyRuleWithGrounding,
  getVerifiableRuleList,
} from '../services/ruleVerificationService';

interface ExplanationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  result: CalculationResult;
  onChangeAmount: () => void;
}

export const ExplanationDrawer: React.FC<ExplanationDrawerProps> = ({
  isOpen,
  onClose,
  result,
  onChangeAmount,
}) => {
  // Tabs representing EXPLAIN, CALCULATION, EVIDENCE, plus GLOSSARY
  const [activeTab, setActiveTab] = useState<'explain' | 'calculation' | 'evidence' | 'glossary'>('explain');
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [currentResponse, setCurrentResponse] = useState<ExplanationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Live Grounding Verification State (Section 7 & 8)
  const [selectedRuleId, setSelectedRuleId] = useState<string>('stt-equity');
  const [verificationResult, setVerificationResult] = useState<LiveGroundingVerification | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleAskQuestion = async (q: string) => {
    setSelectedQuestion(q);
    setIsLoading(true);

    try {
      const immediate = getTemplateExplanation(q, result);
      setCurrentResponse(immediate);

      const enhanced = await explainWithGemini(q, result);
      setCurrentResponse(enhanced);
    } catch {
      setCurrentResponse(getTemplateExplanation(q, result));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerGroundingVerification = async (ruleId: string) => {
    setSelectedRuleId(ruleId);
    setIsVerifying(true);
    try {
      const res = await verifyRuleWithGrounding(ruleId);
      setVerificationResult(res);
    } catch {
      // Fallback handled inside service
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="relative w-full max-w-xl bg-[#15233A] text-[#F5F7FA] h-full shadow-2xl flex flex-col border-l border-[#26385A]">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-[#26385A] flex items-center justify-between bg-[#101B2E]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-[#F5F7FA]">CLARITY ANALYST</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40">
                Decision Intelligence Layer
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ask about this redemption. Grounded strictly in your active {formatCurrency(result.grossRedemptionValue)} scenario.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="Close analyst drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#26385A] px-6 bg-[#101B2E] overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('explain')}
            className={`py-3 px-3 font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'explain'
                ? 'border-blue-500 text-blue-400 bg-[#15233A]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            EXPLAIN
          </button>
          <button
            onClick={() => setActiveTab('calculation')}
            className={`py-3 px-3 font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'calculation'
                ? 'border-blue-500 text-blue-400 bg-[#15233A]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            CALCULATION
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-3 px-3 font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'evidence'
                ? 'border-blue-500 text-blue-400 bg-[#15233A]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            EVIDENCE & GROUNDING
          </button>
          <button
            onClick={() => setActiveTab('glossary')}
            className={`py-3 px-3 font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'glossary'
                ? 'border-blue-500 text-blue-400 bg-[#15233A]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            GLOSSARY
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: EXPLAIN */}
          {activeTab === 'explain' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-400/30 text-xs text-blue-200 leading-relaxed">
                <span className="font-bold text-[#F5F7FA] block mb-1">
                  Plain-Language Consequence Explanation
                </span>
                The Clarity Analyst interprets the calculated consequences of your {formatCurrency(result.grossRedemptionValue)} redemption without making investment recommendations.
              </div>

              {/* Curated Question Buttons */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                  Select a Curated Question:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CURATED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleAskQuestion(q)}
                      className={`text-left p-3.5 rounded-xl border text-xs font-bold transition-all ${
                        selectedQuestion === q
                          ? 'border-blue-500 bg-blue-600 text-white shadow-xs'
                          : 'border-[#26385A] bg-[#101B2E] hover:border-slate-500 text-slate-200'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advice Guardrail Testing */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Advice Guardrail Policy Test
                  </span>
                  <span className="text-[10px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded font-bold border border-amber-500/30">
                    Non-Advisory Neutrality
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {COMMON_ADVICE_QUERIES.slice(0, 3).map((query) => (
                    <button
                      key={query}
                      onClick={() => handleAskQuestion(query)}
                      className="px-3 py-1 text-xs rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium transition-colors capitalize"
                    >
                      "{query}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Answer Card */}
              {selectedQuestion && (
                <div className="p-5 bg-[#101B2E] rounded-2xl border border-[#26385A] shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-[#26385A]">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#F5F7FA]">
                      <CornerDownRight className="w-4 h-4 text-blue-400" />
                      <span>{selectedQuestion}</span>
                    </div>
                    {currentResponse?.source === 'llm' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-400/30">
                        <Sparkles className="w-3 h-3 text-blue-400" />
                        Grounded AI
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {isLoading ? 'Retrieving grounded explanation...' : currentResponse?.answer}
                  </p>

                  {/* If advice question was asked, provide neutral actions */}
                  {currentResponse?.isAdviceQuestion && (
                    <div className="mt-3 pt-3 border-t border-[#26385A] flex flex-wrap gap-2">
                      <button
                        onClick={onClose}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-500 transition-colors"
                      >
                        View consequences
                      </button>
                      <button
                        onClick={() => {
                          onClose();
                          onChangeAmount();
                        }}
                        className="px-3 py-1.5 bg-[#15233A] text-slate-300 border border-[#26385A] rounded-lg text-xs font-bold hover:bg-[#1E2E4B] transition-colors"
                      >
                        Change amount
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CALCULATION */}
          {activeTab === 'calculation' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-[#101B2E] rounded-xl border border-[#26385A] text-slate-300">
                <strong className="text-[#F5F7FA] block mb-1">Deterministic Calculation Path</strong>
                Derived in sequence with unrounded full internal precision:
              </div>

              <div className="space-y-2.5 font-mono">
                <div className="p-3.5 bg-[#101B2E] rounded-xl border border-[#26385A]">
                  <div className="font-sans font-bold text-blue-300">01 · Units Redeemed</div>
                  <div className="text-slate-300 mt-1">
                    {formatCurrency(result.grossRedemptionValue)} ÷ ₹{result.illustrativeNAV.toFixed(2)} = {result.unitsRedeemed.toFixed(3)} units
                  </div>
                </div>

                <div className="p-3.5 bg-[#101B2E] rounded-xl border border-[#26385A]">
                  <div className="font-sans font-bold text-amber-300">02 · Lot Allocation & Exit Load</div>
                  <div className="text-slate-300 mt-1">
                    Lot A: {result.lotBreakdown.find((l) => l.lotId === 'lot-a')?.unitsRedeemedFromLot.toFixed(3)} units (412 days held) → 0% load = ₹0.00
                  </div>
                  {result.lotBreakdown.find((l) => l.lotId === 'lot-b')?.unitsRedeemedFromLot ? (
                    <div className="text-amber-300 mt-1 font-bold">
                      Lot B: {result.lotBreakdown.find((l) => l.lotId === 'lot-b')?.unitsRedeemedFromLot.toFixed(3)} units (214 days held) → 1% load = {formatCurrency(result.exitLoadAmount)}
                    </div>
                  ) : null}
                </div>

                <div className="p-3.5 bg-[#101B2E] rounded-xl border border-[#26385A]">
                  <div className="font-sans font-bold text-rose-300">03 · Statutory STT (0.001%)</div>
                  <div className="text-slate-300 mt-1">
                    {formatCurrency(result.grossRedemptionValue)} × 0.001% = {formatCurrency(result.STTAmount)}
                  </div>
                </div>

                <div className="p-3.5 bg-[#101B2E] rounded-xl border border-emerald-500/40">
                  <div className="font-sans font-bold text-emerald-300">04 · Estimated Proceeds</div>
                  <div className="text-emerald-400 font-bold mt-1">
                    {formatCurrency(result.grossRedemptionValue)} − {formatCurrency(result.exitLoadAmount)} − {formatCurrency(result.STTAmount)} = {formatCurrency(result.estimatedProceeds)}
                  </div>
                </div>

                <div className="p-3.5 bg-[#101B2E] rounded-xl border border-[#26385A]">
                  <div className="font-sans font-bold text-slate-300">05 · Remaining Holding Value</div>
                  <div className="text-slate-400 mt-1">
                    {result.remainingUnits.toFixed(3)} units × ₹{result.illustrativeNAV.toFixed(2)} = {formatCurrency(result.remainingValueAtIllustrativeNAV)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EVIDENCE & GROUNDING */}
          {activeTab === 'evidence' && (
            <div className="space-y-5 text-xs">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-200">
                <div className="flex items-center gap-1.5 font-bold mb-1 text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Approved Evidence & Regulatory Authority</span>
                </div>
                Every financial rule applied in this prototype is mapped directly to authoritative statutory citations or verified scheme documentation.
              </div>

              {/* Live Regulatory Grounding Verifier (Section 7 & 8) */}
              <div className="p-4 bg-[#101B2E] border border-blue-500/40 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-blue-400" />
                    Verify Rule with Live Regulatory Grounding
                  </span>
                  <span className="text-[10px] text-slate-400">SEBI · AMFI · CBDT</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {getVerifiableRuleList().map((rule) => (
                    <button
                      key={rule.id}
                      onClick={() => handleTriggerGroundingVerification(rule.id)}
                      disabled={isVerifying}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 ${
                        selectedRuleId === rule.id
                          ? 'bg-blue-600 text-white border border-blue-400'
                          : 'bg-[#15233A] text-slate-300 hover:text-white border border-[#26385A]'
                      }`}
                    >
                      {rule.name}
                    </button>
                  ))}
                </div>

                {isVerifying && (
                  <div className="p-3 bg-[#15233A] rounded-xl border border-[#26385A] text-slate-300 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                    <span>Verifying rule against official regulatory records...</span>
                  </div>
                )}

                {verificationResult && !isVerifying && (
                  <div className="p-4 bg-[#15233A] rounded-xl border border-[#26385A] space-y-2 text-slate-300">
                    <div className="flex items-center justify-between pb-2 border-b border-[#26385A]">
                      <span className="font-bold text-[#F5F7FA]">{verificationResult.ruleName}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded">
                        {verificationResult.verificationStatus}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300 space-y-1">
                      <div>
                        <strong className="text-slate-400">Authority: </strong>
                        {verificationResult.regulatoryBody}
                      </div>
                      <div>
                        <strong className="text-slate-400">Statutory Citation: </strong>
                        {verificationResult.statutoryAct}
                      </div>
                      <div>
                        <strong className="text-slate-400">Summary: </strong>
                        {verificationResult.summary}
                      </div>
                    </div>

                    {verificationResult.groundedSources.length > 0 && (
                      <div className="pt-2 border-t border-[#26385A] space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Official Citations & Sources:
                        </span>
                        {verificationResult.groundedSources.map((s, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-blue-400 hover:underline">
                            <ExternalLink className="w-3 h-3 text-blue-400 shrink-0" />
                            <span>{s.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pre-Verified Statutory Sources */}
              <div className="space-y-3">
                {RULE_VERIFICATION_SOURCES.map((source) => (
                  <div key={source.ruleName} className="p-4 bg-[#101B2E] rounded-2xl border border-[#26385A]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {source.category}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded">
                        {source.verificationStatus}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#F5F7FA] mb-2">{source.ruleName}</h4>

                    <div className="space-y-1 text-[11px] text-slate-300">
                      <div>
                        <strong className="text-slate-400">Authority: </strong>
                        {source.sourceOrganization}
                      </div>
                      <div>
                        <strong className="text-slate-400">Statutory Document: </strong>
                        {source.sourceDocument}
                      </div>
                      <div>
                        <strong className="text-slate-400">Scope: </strong>
                        {source.applicabilityConditions}
                      </div>
                    </div>

                    <p className="mt-2.5 pt-2 border-t border-[#26385A] text-[11px] text-slate-400 italic">
                      {source.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: GLOSSARY */}
          {activeTab === 'glossary' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Definitions approved under the CLARITY master specification. Concise, neutral, and without speculative assertions.
              </p>
              <div className="space-y-3">
                {STATIC_GLOSSARY.map((item) => (
                  <div key={item.term} className="p-4 bg-[#101B2E] rounded-xl border border-[#26385A]">
                    <h4 className="text-xs font-bold text-[#F5F7FA] mb-1">{item.term}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-4 border-t border-[#26385A] bg-[#101B2E] flex items-center justify-between text-xs">
          <span className="text-slate-400">Single Source of Truth: Deterministic Rules</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
