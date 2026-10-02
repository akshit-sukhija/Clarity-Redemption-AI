import { CalculationResult, ScenarioHistoryItem, RuleVerificationSource } from '../types';
import { formatCurrency, formatUnits, calculateRedemption } from './calculationEngine';
import { DEMO_FUND, RULE_VERIFICATION_SOURCES, STATIC_GLOSSARY } from '../data/fundData';
import { GoogleGenAI } from '@google/genai';

export interface ExplanationResponse {
  question: string;
  answer: string;
  source: 'template' | 'llm' | 'grounded_search';
  mode?: 'explain' | 'research';
  isAdviceQuestion?: boolean;
  groundedSources?: { title: string; uri: string }[];
  searchQueries?: string[];
}

export const CURATED_QUESTIONS = [
  'What will I receive?',
  'Why is there an exit load?',
  'What remains invested?',
  'How was this calculated?',
  'When may I receive the money?',
  'Why these deductions?',
] as const;

export const COMMON_ADVICE_QUERIES = [
  'should i redeem?',
  'should i sell?',
  'is this a good time to redeem?',
  'how much should i redeem?',
  'will the market recover?',
  'should i wait?',
];

/**
 * Checks if a query is an advice question requiring neutral refusal.
 */
export function isAdviceQuery(query: string): boolean {
  const normalized = query.toLowerCase().trim();
  return COMMON_ADVICE_QUERIES.some((q) => normalized.includes(q.replace('?', '')));
}

/**
 * Checks if a query is a research or regulatory inquiry (Mode 2)
 */
export function isResearchQuery(query: string): boolean {
  const q = query.toLowerCase().trim();
  return (
    q.includes('sebi') ||
    q.includes('amfi') ||
    q.includes('rule') ||
    q.includes('statute') ||
    q.includes('regulation') ||
    q.includes('circular') ||
    q.includes('law') ||
    q.includes('official') ||
    q.includes('source') ||
    q.includes('changed') ||
    q.includes('current rule') ||
    q.includes('tax rate') ||
    q.includes('income tax act') ||
    q.includes('finance act') ||
    q.includes('payout timeline')
  );
}

// ============================================================
// SECTION 53 F: CONTROLLED APPLICATION TOOLS
// Read-only tools exposed to the agent and explanation layer.
// Never mutate calculations, constants, or user state.
// ============================================================
export const applicationTools = {
  getCurrentRedemptionResult: (result: CalculationResult) => result,
  getScenarioResult: (amount: number) => calculateRedemption(DEMO_FUND, amount),
  getApprovedRule: (ruleIdentifier: string): RuleVerificationSource | undefined =>
    RULE_VERIFICATION_SOURCES.find(
      (r) =>
        r.ruleName.toLowerCase().includes(ruleIdentifier.toLowerCase()) ||
        r.category.toLowerCase().includes(ruleIdentifier.toLowerCase())
    ),
  getEvidence: (ruleIdentifier: string) => {
    const rule = RULE_VERIFICATION_SOURCES.find(
      (r) =>
        r.ruleName.toLowerCase().includes(ruleIdentifier.toLowerCase()) ||
        r.category.toLowerCase().includes(ruleIdentifier.toLowerCase())
    );
    return rule
      ? {
          ruleName: rule.ruleName,
          sourceDocument: rule.sourceDocument,
          sourceOrganization: rule.sourceOrganization,
          status: rule.verificationStatus,
        }
      : null;
  },
  getMarketContext: () => ({
    benchmark: 'NIFTY 50',
    nav: DEMO_FUND.illustrativeNAV,
    status: 'ILLUSTRATIVE_STABLE',
    date: DEMO_FUND.demoAsOfDate,
  }),
  getScenarioHistory: (history?: ScenarioHistoryItem[]) => history || [],
};

/**
 * Generates deterministic template explanation directly grounded in the calculation result.
 */
export function getTemplateExplanation(
  question: string,
  result: CalculationResult
): ExplanationResponse {
  const q = question.toLowerCase().trim();

  // Handle advice questions strictly
  if (isAdviceQuery(q)) {
    return {
      question,
      answer:
        'I can explain the transaction consequences, but this prototype does not recommend whether or how much you should redeem.',
      source: 'template',
      mode: 'explain',
      isAdviceQuestion: true,
    };
  }

  // Question 1: What will I receive?
  if (q.includes('what will i receive') || q.includes('receive')) {
    return {
      question: 'What will I receive?',
      answer: `From your gross redemption of ${formatCurrency(result.grossRedemptionValue)}, you may receive an estimated ${formatCurrency(result.estimatedProceeds)} after deducting ${formatCurrency(result.exitLoadAmount)} exit load and ${formatCurrency(result.STTAmount)} Securities Transaction Tax (STT).`,
      source: 'template',
      mode: 'explain',
    };
  }

  // Question 2: Why is there an exit load?
  if (q.includes('exit load') || q.includes('deductions')) {
    const lotB = result.lotBreakdown.find((l) => l.lotId === 'lot-b');
    if (result.exitLoadAmount > 0 && lotB && lotB.unitsRedeemedFromLot > 0) {
      return {
        question: 'Why is there an exit load?',
        answer: `This demo fund uses an illustrative 1% exit-load rule for units redeemed within 365 days of allotment. Your redemption includes ${formatUnits(lotB.unitsRedeemedFromLot)} units from that eligible lot (Lot B, allotted 2026-03-01), resulting in an estimated ${formatCurrency(result.exitLoadAmount)} exit load. Units redeemed from Lot A (allotted 2025-08-15) were held >365 days and incurred 0% exit load.`,
        source: 'template',
        mode: 'explain',
      };
    } else {
      return {
        question: 'Why is there an exit load?',
        answer: `No exit load was charged on this redemption. All ${formatUnits(result.unitsRedeemed)} units were allocated under FIFO from Lot A (allotted 2025-08-15), which has been held for 412 days—well past the illustrative 365-day exit-load window.`,
        source: 'template',
        mode: 'explain',
      };
    }
  }

  // Question 3: What remains invested?
  if (q.includes('remains') || q.includes('remaining') || q.includes('balance')) {
    return {
      question: 'What remains invested?',
      answer: `After this redemption of ${formatUnits(result.unitsRedeemed)} units, ${formatUnits(result.remainingUnits)} units remain in your holding. At the Illustrative NAV of ${formatCurrency(result.illustrativeNAV)}, the remaining holding value is ${formatCurrency(result.remainingValueAtIllustrativeNAV)}. Note that actual remaining value fluctuates with NAV movements.`,
      source: 'template',
      mode: 'explain',
    };
  }

  // Question 4: How was this calculated?
  if (q.includes('calculated') || q.includes('calculation') || q.includes('math')) {
    return {
      question: 'How was this calculated?',
      answer: `Gross redemption of ${formatCurrency(result.grossRedemptionValue)} divided by Illustrative NAV (${formatCurrency(result.illustrativeNAV)}) equals ${formatUnits(result.unitsRedeemed)} units redeemed. Units are liquidated in First-In-First-Out (FIFO) sequence. Deductions comprise ${formatCurrency(result.exitLoadAmount)} exit load (1% only on units held < 365 days) and ${formatCurrency(result.STTAmount)} statutory STT (0.001%). Estimated proceeds are ${formatCurrency(result.estimatedProceeds)}.`,
      source: 'template',
      mode: 'explain',
    };
  }

  // Question 5: When may I receive the money?
  if (q.includes('when') || q.includes('payout') || q.includes('timing') || q.includes('account')) {
    return {
      question: 'When may I receive the money?',
      answer: `Illustrative payout window: within 2 working days (T+2 settlement under SEBI circular). Actual processing depends on the scheme and bank operating hours.`,
      source: 'template',
      mode: 'explain',
    };
  }

  // Fallback research answer if user asks regulatory question offline
  if (isResearchQuery(q)) {
    return {
      question,
      answer: `Authoritative Statutory Status: STT is statutory at 0.001% under Finance (No. 2) Act Section 98. Exit loads are defined by the scheme SID (1% < 365 days). Equity redemption settlement follows the SEBI T+2 business-day mandate. All values are governed by official AMFI/SEBI frameworks.`,
      source: 'template',
      mode: 'research',
      groundedSources: [
        { title: 'SEBI Mutual Funds Master Circular', uri: 'https://www.sebi.gov.in' },
        { title: 'AMFI India Regulatory Corner', uri: 'https://www.amfiindia.com' },
      ],
    };
  }

  // Default fallback if unknown
  return {
    question,
    answer: 'That information is not included in this prototype scenario.',
    source: 'template',
    mode: 'explain',
  };
}

/**
 * Gemini / Clarity Analyst integration:
 * MODE 1: Explain This Redemption (deterministic result + approved rules)
 * MODE 2: Research / Current Information (Google Search grounding with citations)
 * Strictly constrained so the LLM cannot invent rates, taxes, or numbers.
 */
export async function explainWithGemini(
  question: string,
  result: CalculationResult
): Promise<ExplanationResponse> {
  // Always check advice refusal first
  if (isAdviceQuery(question)) {
    return {
      question,
      answer:
        'I can explain the transaction consequences, but this prototype does not recommend whether or how much you should redeem.',
      source: 'template',
      mode: 'explain',
      isAdviceQuestion: true,
    };
  }

  const template = getTemplateExplanation(question, result);

  const apiKey =
    (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_GEMINI_API_KEY) ||
    (typeof window !== 'undefined' ? (window as any).GEMINI_API_KEY : '') ||
    '';

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return template;
  }

  const isResearch = isResearchQuery(question);

  try {
    const ai = new GoogleGenAI({ apiKey });

    if (isResearch) {
      // MODE 2: RESEARCH / CURRENT REGULATORY INFORMATION WITH GOOGLE SEARCH GROUNDING
      const researchPrompt = `You are the research and compliance layer for CLARITY, an Indian mutual fund decision-intelligence tool.
Research query: "${question}"
Scheme context: Indian equity mutual fund (Northstar Equity Opportunities Fund).
Current prototype parameters:
- STT: 0.001% on redemption (Finance Act 2004 Sec 98)
- Exit Load: 1.00% if redeemed <= 365 days; 0% after 365 days
- Settlement: T+2 business days (SEBI Circular)

Task: Use Google Search Grounding to verify the official regulatory rule under SEBI, AMFI, or Ministry of Finance.
Provide a concise, 2-3 sentence factual statement with exact statutory provisions.
Do NOT give investment advice. Strictly state verified regulatory facts.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: researchPrompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const candidate = response.candidates?.[0];
      const groundingMetadata = candidate?.groundingMetadata as any;
      const webSearchQueries: string[] = groundingMetadata?.webSearchQueries || [];

      const groundedSources: { title: string; uri: string }[] = [];
      if (groundingMetadata?.groundingChunks) {
        for (const chunk of groundingMetadata.groundingChunks) {
          if (chunk.web?.title && chunk.web?.uri) {
            groundedSources.push({
              title: chunk.web.title,
              uri: chunk.web.uri,
            });
          }
        }
      }

      const text = response.text?.trim();
      if (text && text.length > 10) {
        return {
          question,
          answer: text,
          source: 'grounded_search',
          mode: 'research',
          groundedSources: groundedSources.length > 0 ? groundedSources : template.groundedSources,
          searchQueries: webSearchQueries,
        };
      }
    } else {
      // MODE 1: EXPLAIN THIS REDEMPTION (GROUNDED IN DETERMINISTIC RESULT)
      const prompt = `You are the contextual explanation engine for CLARITY, a neutral Indian mutual fund redemption decision-understanding tool.
STRICT BOUNDARY:
- Do NOT give financial advice, buy/sell/hold advice, or recommend redeeming/not redeeming.
- Do NOT invent or alter any financial figures, rates, taxes, or dates.
- Use ONLY the following verified transaction consequence data:
  * Gross Redemption: ₹${result.grossRedemptionValue}
  * Units Redeemed: ${result.unitsRedeemed.toFixed(3)}
  * Illustrative NAV: ₹${result.illustrativeNAV}
  * Exit Load: ₹${result.exitLoadAmount.toFixed(2)} (${result.exitLoadAmount > 0 ? '1% on Lot B' : '0% (all from Lot A)'})
  * STT: ₹${result.STTAmount.toFixed(2)} (0.001%)
  * Estimated Proceeds: ₹${result.estimatedProceeds.toFixed(2)}
  * Remaining Units: ${result.remainingUnits.toFixed(3)}
  * Remaining Value: ₹${result.remainingValueAtIllustrativeNAV.toFixed(2)}
  * Payout: within 2 working days (illustrative)
  * Capital gains tax is excluded from this prototype estimate.

User Question: "${question}"
Base accurate answer: "${template.answer}"

Task: Provide a calm, concise, factual, neutral explanation in 2-3 sentences based strictly on the above figures. If the user asks for investment advice, refuse neutrally.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const text = response.text?.trim();
      if (text && text.length > 10) {
        return {
          question,
          answer: text,
          source: 'llm',
          mode: 'explain',
        };
      }
    }
  } catch {
    // Graceful fallback per Section 44 & Section 53: ZERO FAILURE DISRUPTION
  }

  return template;
}
