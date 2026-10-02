import React, { useState } from 'react';
import { X, Sparkles, BookOpen, ShieldCheck, CornerDownRight, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { CalculationResult } from '../types';
import {
  CURATED_QUESTIONS,
  COMMON_ADVICE_QUERIES,
  explainWithGemini,
  getTemplateExplanation,
  ExplanationResponse,
} from '../services/geminiExplanation';
import { STATIC_GLOSSARY, RULE_VERIFICATION_SOURCES } from '../data/fundData';
import { formatCurrency, formatUnits } from '../services/calculationEngine';

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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-white">CLARITY ANALYST</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40">
                Contextual Decision Layer
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
        <div className="flex border-b border-slate-200 px-6 bg-slate-50 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('explain')}
            className={`py-3 px-3 font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'explain'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            EXPLAIN
          </button>
          <button
            onClick={() => setActiveTab('calculation')}
            className={`py-3 px-3 font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'calculation'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            CALCULATION
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-3 px-3 font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'evidence'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            EVIDENCE
          </button>
          <button
            onClick={() => setActiveTab('glossary')}
            className={`py-3 px-3 font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'glossary'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
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
              <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-950 leading-relaxed">
                <span className="font-bold text-blue-900 block mb-1">
                  Plain-Language Consequence Explanation
                </span>
                The Clarity Analyst interprets the calculated consequences of your {formatCurrency(result.grossRedemptionValue)} redemption without making investment recommendations.
              </div>

              {/* Curated Question Buttons */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2.5">
                  Select a Curated Question:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CURATED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleAskQuestion(q)}
                      className={`text-left p-3.5 rounded-xl border-2 text-xs font-bold transition-all ${
                        selectedQuestion === q
                          ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
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
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">
                    Non-Advisory Neutrality
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {COMMON_ADVICE_QUERIES.slice(0, 3).map((query) => (
                    <button
                      key={query}
                      onClick={() => handleAskQuestion(query)}
                      className="px-3 py-1 text-xs rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-medium transition-colors capitalize"
                    >
                      "{query}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Answer Card */}
              {selectedQuestion && (
                <div className="p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <CornerDownRight className="w-4 h-4 text-blue-600" />
                      <span>{selectedQuestion}</span>
                    </div>
                    {currentResponse?.source === 'llm' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        <Sparkles className="w-3 h-3 text-blue-600" />
                        Grounded
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {isLoading ? 'Retrieving grounded explanation...' : currentResponse?.answer}
                  </p>

                  {/* If advice question was asked, provide neutral actions */}
                  {currentResponse?.isAdviceQuestion && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                      <button
                        onClick={onClose}
                        className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
                      >
                        View consequences
                      </button>
                      <button
                        onClick={() => {
                          onClose();
                          onChangeAmount();
                        }}
                        className="px-3 py-1.5 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
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
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                <strong className="text-slate-900 block mb-1">Deterministic Calculation Path</strong>
                Derived in sequence with unrounded full precision:
              </div>

              <div className="space-y-2.5 font-mono">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="font-sans font-bold text-slate-900">01 · Units Redeemed</div>
                  <div className="text-slate-600 mt-1">
                    ₹{result.grossRedemptionValue.toLocaleString('en-IN')} ÷ ₹{result.illustrativeNAV.toFixed(2)} = {result.unitsRedeemed.toFixed(3)} units
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="font-sans font-bold text-slate-900">02 · Lot Allocation & Exit Load</div>
                  <div className="text-slate-600 mt-1">
                    Lot A: {result.lotBreakdown.find((l) => l.lotId === 'lot-a')?.unitsRedeemedFromLot.toFixed(3)} units (412 days held) → 0% load = ₹0.00
                  </div>
                  {result.lotBreakdown.find((l) => l.lotId === 'lot-b')?.unitsRedeemedFromLot ? (
                    <div className="text-amber-800 mt-1 font-bold">
                      Lot B: {result.lotBreakdown.find((l) => l.lotId === 'lot-b')?.unitsRedeemedFromLot.toFixed(3)} units (214 days held) → 1% load = ₹{result.exitLoadAmount.toFixed(2)}
                    </div>
                  ) : null}
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="font-sans font-bold text-slate-900">03 · Statutory STT (0.001%)</div>
                  <div className="text-slate-600 mt-1">
                    ₹{result.grossRedemptionValue.toLocaleString('en-IN')} × 0.001% = ₹{result.STTAmount.toFixed(2)}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="font-sans font-bold text-slate-900">04 · Estimated Proceeds</div>
                  <div className="text-emerald-700 font-bold mt-1">
                    ₹{result.grossRedemptionValue.toLocaleString('en-IN')} − ₹{result.exitLoadAmount.toFixed(2)} − ₹{result.STTAmount.toFixed(2)} = ₹{result.estimatedProceeds.toFixed(2)}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="font-sans font-bold text-slate-900">05 · Remaining Holding Value</div>
                  <div className="text-slate-600 mt-1">
                    {result.remainingUnits.toFixed(3)} units × ₹{result.illustrativeNAV.toFixed(2)} = ₹{result.remainingValueAtIllustrativeNAV.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EVIDENCE */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Approved Evidence & Regulatory Authority</span>
                </div>
                Every financial rule applied in this prototype is mapped directly to authoritative statutory citations or verified scheme documentation.
              </div>

              <div className="space-y-3">
                {RULE_VERIFICATION_SOURCES.map((source) => (
                  <div key={source.ruleName} className="p-4 bg-white rounded-2xl border-2 border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {source.category}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-900 rounded">
                        {source.verificationStatus}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 mb-2">{source.ruleName}</h4>

                    <div className="space-y-1.5 text-[11px] text-slate-600">
                      <div>
                        <strong className="text-slate-800">Authority: </strong>
                        {source.sourceOrganization}
                      </div>
                      <div>
                        <strong className="text-slate-800">Statutory Document: </strong>
                        {source.sourceDocument}
                      </div>
                      <div>
                        <strong className="text-slate-800">Scope: </strong>
                        {source.applicabilityConditions}
                      </div>
                    </div>

                    <p className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500 italic">
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
              <p className="text-xs text-slate-600">
                Definitions approved under the CLARITY master specification. Concise, neutral, and without speculative assertions.
              </p>
              <div className="space-y-3">
                {STATIC_GLOSSARY.map((item) => (
                  <div key={item.term} className="p-4 bg-white rounded-xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-900 mb-1">{item.term}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">Single Source of Truth: Deterministic Rules</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
