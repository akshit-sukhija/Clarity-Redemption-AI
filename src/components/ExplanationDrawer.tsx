import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Search,
  ArrowRight,
  Info,
} from 'lucide-react';
import { CalculationResult, LiveGroundingVerification } from '../types';
import {
  CURATED_QUESTIONS,
  COMMON_ADVICE_QUERIES,
  chatWithClarityAnalyst,
  explainWithGemini,
  getTemplateExplanation,
  ExplanationResponse,
} from '../services/geminiExplanation';
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
  onOpenGlossary?: () => void;
}

interface ChatTurn {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: 'template' | 'llm' | 'grounded_search';
  mode?: 'explain' | 'research';
  groundedSources?: { title: string; uri: string }[];
  searchQueries?: string[];
  isAdviceQuestion?: boolean;
}

export const ExplanationDrawer: React.FC<ExplanationDrawerProps> = ({
  isOpen,
  onClose,
  result,
  onChangeAmount,
  onOpenGlossary,
}) => {
  // Tabs: explain (chat), calculation, evidence (Section 18: No duplicated glossary in Analyst)
  const [activeTab, setActiveTab] = useState<'explain' | 'calculation' | 'evidence'>('explain');
  const [customInput, setCustomInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = React.useRef<HTMLDivElement>(null);

  // Multi-turn chat message thread
  const [messages, setMessages] = useState<ChatTurn[]>(() => [
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hello. I am Ask Clarity. I can explain the consequences of your ${formatCurrency(result.grossRedemptionValue)} redemption scenario, how units were allocated under FIFO, applicable demo exit loads, statutory STT, or surrounding market context. What would you like to understand?`,
      timestamp: 'Initial context',
      mode: 'explain',
      source: 'template',
    },
  ]);

  // Live Grounding Verification State for Evidence Tab
  const [selectedRuleId, setSelectedRuleId] = useState<string>('stt-equity');
  const [verificationResult, setVerificationResult] = useState<LiveGroundingVerification | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Accessible keyboard Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (activeTab === 'explain') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab, isLoading]);

  if (!isOpen) return null;

  const handleAskQuestion = async (q: string) => {
    if (!q.trim() || isLoading) return;

    const userMsg: ChatTurn = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Build conversation history for multi-turn model
      const historyTurns = messages
        .filter((m) => m.id !== 'msg-welcome')
        .map((m) => ({
          role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
          text: m.text,
        }));

      const res: ExplanationResponse = await chatWithClarityAnalyst(historyTurns, q.trim(), result);

      const assistantMsg: ChatTurn = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: res.source,
        mode: res.mode,
        groundedSources: res.groundedSources,
        searchQueries: res.searchQueries,
        isAdviceQuestion: res.isAdviceQuestion,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const fallback = getTemplateExplanation(q.trim(), result);
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: fallback.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'template',
          mode: fallback.mode,
        },
      ]);
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="relative w-full max-w-lg bg-[#FFFFFF] text-[#1E211F] h-full shadow-lg flex flex-col border-l border-[#DDD9D0]">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-[#DDD9D0] flex items-center justify-between bg-[#FFFFFF]">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#247A5A] block">
              Decision Explanation
            </span>
            <h2 className="text-lg font-bold text-[#1E211F]">
              Ask Clarity
            </h2>
            <p className="text-xs text-[#666861] mt-0.5">
              Explain this redemption, its rules, or the context around it.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#666861] hover:text-[#1E211F] hover:bg-[#F1EFE9] rounded-lg transition-colors cursor-pointer"
            aria-label="Close explanation drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#DDD9D0] px-6 bg-[#FFFFFF] text-xs">
          <button
            onClick={() => setActiveTab('explain')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'explain'
                ? 'border-[#247A5A] text-[#247A5A]'
                : 'border-transparent text-[#666861] hover:text-[#1E211F]'
            }`}
          >
            Explain
          </button>
          <button
            onClick={() => setActiveTab('calculation')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'calculation'
                ? 'border-[#247A5A] text-[#247A5A]'
                : 'border-transparent text-[#666861] hover:text-[#1E211F]'
            }`}
          >
            Calculation
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'evidence'
                ? 'border-[#247A5A] text-[#247A5A]'
                : 'border-transparent text-[#666861] hover:text-[#1E211F]'
            }`}
          >
            Evidence & rules
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: EXPLAIN */}
          {activeTab === 'explain' && (
            <div className="space-y-5">
              {/* Question Input */}
              <div>
                <label htmlFor="analyst-query-input" className="text-xs font-semibold text-[#1E211F] block mb-1.5">
                  Ask a question or research a rule:
                </label>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (customInput.trim()) {
                      handleAskQuestion(customInput.trim());
                      setCustomInput('');
                    }
                  }}
                  className="flex gap-2"
                >
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#8A8D86] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="analyst-query-input"
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="e.g. Why are my proceeds lower?"
                      className="w-full bg-[#FFFFFF] border border-[#DDD9D0] rounded-lg pl-9 pr-3 py-2 text-xs text-[#1E211F] placeholder-[#8A8D86] focus:outline-none focus:border-[#247A5A] transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!customInput.trim() || isLoading}
                    className="px-3.5 py-2 bg-[#247A5A] hover:bg-[#1D6349] disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {isLoading ? 'Thinking...' : 'Ask'}
                  </button>
                </form>
              </div>

              {/* Curated Questions */}
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8D86] block mb-2">
                  Frequently asked about this redemption:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CURATED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleAskQuestion(q)}
                      disabled={isLoading}
                      className="text-left p-3 rounded-lg border border-[#DDD9D0] bg-[#F1EFE9] hover:bg-[#E8E5DD] text-[#1E211F] text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advice Guardrail Policy Note */}
              <div className="p-3 bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg text-xs text-[#666861]">
                <div className="flex items-center gap-1.5 font-semibold text-[#1E211F] mb-1">
                  <Info className="w-3.5 h-3.5 text-[#666861]" />
                  <span>Non-advisory guardrail:</span>
                </div>
                <p>
                  "I can explain the calculation and the rules used. I don't make investment decisions."
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {COMMON_ADVICE_QUERIES.slice(0, 3).map((query) => (
                    <button
                      key={query}
                      onClick={() => handleAskQuestion(query)}
                      className="px-2 py-0.5 text-[10px] rounded bg-[#FFFFFF] border border-[#DDD9D0] text-[#666861] hover:text-[#1E211F] cursor-pointer"
                    >
                      "{query}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Multi-Turn Conversation Thread (Section 38, 39, 40) */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-colors ${
                      msg.sender === 'user'
                        ? 'bg-[#F1EFE9] border-[#DDD9D0] ml-6'
                        : 'bg-[#FFFFFF] border-[#DDD9D0] mr-2 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-1 border-b border-[#DDD9D0]/60">
                      <span className="font-bold text-[#1E211F]">
                        {msg.sender === 'user' ? 'You' : 'Ask Clarity'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {msg.sender === 'assistant' && (
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-[#247A5A]/10 text-[#247A5A]">
                            {msg.source === 'grounded_search' && (msg.groundedSources?.length ?? 0) > 0
                              ? 'Search grounded (Google)'
                              : msg.mode === 'research'
                              ? 'Prototype source reference'
                              : 'Scenario explanation'}
                          </span>
                        )}
                        <span className="text-[10px] text-[#8A8D86] font-mono">{msg.timestamp}</span>
                      </div>
                    </div>

                    <p className="text-[#1E211F] leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                    {/* Verified Grounded Source Links (Honest: Only when available) */}
                    {msg.groundedSources && msg.groundedSources.length > 0 && (
                      <div className="pt-2 border-t border-[#DDD9D0] space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8D86] block">
                          Verified Statutory Sources:
                        </span>
                        {msg.groundedSources.map((s, idx) => (
                          <a
                            key={idx}
                            href={s.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-1.5 rounded bg-[#F1EFE9] border border-[#DDD9D0] text-[11px] text-[#247A5A] hover:underline"
                          >
                            <span className="truncate pr-2">{s.title}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 text-[#8A8D86]" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="p-3 bg-[#FFFFFF] border border-[#DDD9D0] rounded-xl text-xs text-[#8A8D86] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#247A5A] animate-pulse" />
                    <span>Clarity Analyst is analyzing consequences...</span>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* Link to Standalone Glossary */}
              {onOpenGlossary && (
                <div className="p-3 bg-[#FFFFFF] border border-[#DDD9D0] rounded-lg flex items-center justify-between text-xs text-[#666861]">
                  <span>Need definitions of financial terms?</span>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenGlossary();
                    }}
                    className="text-[#247A5A] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Open glossary</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CALCULATION */}
          {activeTab === 'calculation' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-[#F1EFE9] rounded-lg border border-[#DDD9D0] font-sans text-[#666861]">
                <strong>Deterministic derivation sequence</strong> for {formatCurrency(result.grossRedemptionValue)}:
              </div>

              <div className="p-3 bg-[#F1EFE9] rounded-lg border border-[#DDD9D0] space-y-0.5">
                <span className="font-sans font-bold text-[#1E211F] block">01 · Units Redeemed</span>
                <span className="text-[#666861]">
                  {formatCurrency(result.grossRedemptionValue)} ÷ {formatCurrency(result.illustrativeNAV)} = {formatUnits(result.unitsRedeemed)} units
                </span>
              </div>

              <div className="p-3 bg-[#F1EFE9] rounded-lg border border-[#DDD9D0] space-y-0.5">
                <span className="font-sans font-bold text-[#A66A16] block">02 · Lot Allocation & Exit Load</span>
                <span className="text-[#666861] block">
                  Lot A: {formatUnits(result.lotBreakdown.find((l) => l.lotId === 'lot-a')?.unitsRedeemedFromLot ?? 0)} units (412 days held) → 0% exit load
                </span>
                {result.lotBreakdown.find((l) => l.lotId === 'lot-b')?.unitsRedeemedFromLot ? (
                  <span className="text-[#A66A16] font-semibold block">
                    Lot B: {formatUnits(result.lotBreakdown.find((l) => l.lotId === 'lot-b')?.unitsRedeemedFromLot ?? 0)} units (214 days held) → 1% exit load = {formatCurrency(result.exitLoadAmount)}
                  </span>
                ) : null}
              </div>

              <div className="p-3 bg-[#F1EFE9] rounded-lg border border-[#DDD9D0] space-y-0.5">
                <span className="font-sans font-bold text-[#B65347] block">03 · Statutory STT (0.001%)</span>
                <span className="text-[#666861]">
                  {formatCurrency(result.grossRedemptionValue)} × 0.001% = {formatCurrency(result.STTAmount)}
                </span>
              </div>

              <div className="p-3 bg-[#247A5A]/10 rounded-lg border border-[#247A5A]/30 space-y-0.5">
                <span className="font-sans font-bold text-[#247A5A] block">04 · Estimated Net Proceeds</span>
                <span className="text-[#247A5A] font-bold">
                  {formatCurrency(result.grossRedemptionValue)} − {formatCurrency(result.totalDeductions)} = {formatCurrency(result.estimatedProceeds)}
                </span>
              </div>

              <div className="p-3 bg-[#F1EFE9] rounded-lg border border-[#DDD9D0] space-y-0.5">
                <span className="font-sans font-bold text-[#1E211F] block">05 · Remaining Holding</span>
                <span className="text-[#666861]">
                  {formatUnits(result.remainingUnits)} units × {formatCurrency(result.illustrativeNAV)} = {formatCurrency(result.remainingValueAtIllustrativeNAV)}
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: EVIDENCE & RULES */}
          {activeTab === 'evidence' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg text-[#666861]">
                <div className="flex items-center gap-1.5 font-bold text-[#1E211F] mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#247A5A]" />
                  <span>Approved statutory and scheme rules</span>
                </div>
                All calculation rules in Clarity are mapped to official statutes or scheme documentation.
              </div>

              {/* Verifiable Rule List */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8D86] block">
                  Select a rule to verify:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {getVerifiableRuleList().map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleTriggerGroundingVerification(r.id)}
                      className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                        selectedRuleId === r.id
                          ? 'border-[#247A5A] bg-[#247A5A]/10 text-[#247A5A] font-semibold'
                          : 'border-[#DDD9D0] bg-[#F1EFE9] text-[#1E211F] hover:bg-[#E8E5DD]'
                      }`}
                    >
                      <span className="block font-bold text-xs">{r.name}</span>
                      <span className="text-[10px] text-[#8A8D86] block mt-0.5">{r.category}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Verification Result Display */}
              {verificationResult && (
                <div className="p-4 bg-[#F1EFE9] rounded-xl border border-[#DDD9D0] space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#DDD9D0]">
                    <span className="font-bold text-[#1E211F]">{verificationResult.ruleName}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#247A5A]/10 text-[#247A5A]">
                      {verificationResult.verificationStatus}
                    </span>
                  </div>

                  <p className="text-xs text-[#1E211F] leading-relaxed">
                    {verificationResult.summary}
                  </p>

                  <div className="text-[11px] text-[#666861] space-y-0.5">
                    <div><strong>Statute:</strong> {verificationResult.statutoryAct}</div>
                    <div><strong>Authority:</strong> {verificationResult.regulatoryBody}</div>
                  </div>

                  {verificationResult.groundedSources.length > 0 && (
                    <div className="pt-2 border-t border-[#DDD9D0] space-y-1">
                      <span className="text-[10px] font-bold text-[#8A8D86] uppercase block">Official source links:</span>
                      {verificationResult.groundedSources.map((s, idx) => (
                        <a
                          key={idx}
                          href={s.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-1.5 rounded bg-[#FFFFFF] border border-[#DDD9D0] text-xs text-[#247A5A] hover:underline"
                        >
                          <span className="truncate pr-2">{s.title}</span>
                          <ExternalLink className="w-3 h-3 text-[#8A8D86]" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
