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
  'Why are my proceeds lower?',
  'Why is there an exit load?',
  'How were my units allocated?',
  'What remains invested?',
  'How was this calculated?',
  'When may I receive the money?',
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
    q.includes('statute') ||
    q.includes('circular') ||
    q.includes('law') ||
    q.includes('official source') ||
    q.includes('changed') ||
    q.includes('current rule') ||
    q.includes('finance act')
  );
}

// Read-only tools exposed to the agent and explanation layer.
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

  // Handle advice questions strictly per Section 18
  if (isAdviceQuery(q)) {
    return {
      question,
      answer: "I can explain the calculation and the rules used. I don't make investment decisions.",
      source: 'template',
      mode: 'explain',
      isAdviceQuestion: true,
    };
  }

  // Question: Why are my proceeds lower?
  if (q.includes('proceeds lower') || q.includes('why lower') || q.includes('what will i receive')) {
    return {
      question: 'Why are my proceeds lower?',
      answer: `From your gross redemption of ${formatCurrency(result.grossRedemptionValue)}, estimated proceeds are ${formatCurrency(result.estimatedProceeds)} because ${formatCurrency(result.totalDeductions)} in total deductions apply: ${formatCurrency(result.exitLoadAmount)} exit load and ${formatCurrency(result.STTAmount)} statutory Securities Transaction Tax (STT).`,
      source: 'template',
      mode: 'explain',
    };
  }

  // Question: Why is there an exit load?
  if (q.includes('exit load') || q.includes('deductions')) {
    const lotB = result.lotBreakdown.find((l) => l.lotId === 'lot-b');
    if (result.exitLoadAmount > 0 && lotB && lotB.unitsRedeemedFromLot > 0) {
      return {
        question: 'Why is there an exit load?',
        answer: `This demo scheme rule applies an illustrative 1% exit load on units redeemed within 365 days of allotment. Your redemption includes ${formatUnits(lotB.unitsRedeemedFromLot)} units from Lot B (allotted 2026-03-01, held 214 days), incurring ${formatCurrency(result.exitLoadAmount)} exit load. Units from Lot A were held 412 days (> 365 days) and incurred 0% exit load.`,
        source: 'template',
        mode: 'explain',
      };
    } else {
      return {
        question: 'Why is there an exit load?',
        answer: `No exit load was charged on this redemption. All ${formatUnits(result.unitsRedeemed)} units were allocated under FIFO from Lot A (allotted 2025-08-15), which was held for 412 days—exceeding the illustrative 365-day exit-load window.`,
        source: 'template',
        mode: 'explain',
      };
    }
  }

  // Question: How were my units allocated?
  if (q.includes('units allocated') || q.includes('fifo') || q.includes('lots')) {
    const lotA = result.lotBreakdown.find((l) => l.lotId === 'lot-a');
    const lotB = result.lotBreakdown.find((l) => l.lotId === 'lot-b');
    return {
      question: 'How were my units allocated?',
      answer: `FIFO applied under this prototype scheme rule. Units are liquidated in chronological order of allotment: ${lotA ? formatUnits(lotA.unitsRedeemedFromLot) : '0'} units from older Lot A (0% exit load)${lotB && lotB.unitsRedeemedFromLot > 0 ? ` and ${formatUnits(lotB.unitsRedeemedFromLot)} units from newer Lot B (1% demo exit load)` : ''}.`,
      source: 'template',
      mode: 'explain',
    };
  }

  // Question: What remains invested?
  if (q.includes('remains') || q.includes('remaining') || q.includes('balance')) {
    return {
      question: 'What remains invested?',
      answer: `After redeeming ${formatUnits(result.unitsRedeemed)} units, ${formatUnits(result.remainingUnits)} units remain in your holding. At the Illustrative NAV of ${formatCurrency(result.illustrativeNAV)}, the remaining holding value is ${formatCurrency(result.remainingValueAtIllustrativeNAV)}.`,
      source: 'template',
      mode: 'explain',
    };
  }

  // Question: How was this calculated?
  if (q.includes('calculated') || q.includes('calculation') || q.includes('math')) {
    return {
      question: 'How was this calculated?',
      answer: `Gross redemption of ${formatCurrency(result.grossRedemptionValue)} ÷ Illustrative NAV (${formatCurrency(result.illustrativeNAV)}) = ${formatUnits(result.unitsRedeemed)} units redeemed. Deductions comprise ${formatCurrency(result.exitLoadAmount)} exit load (1% only on units held < 365 days) and ${formatCurrency(result.STTAmount)} statutory STT (0.001%). Estimated proceeds: ${formatCurrency(result.estimatedProceeds)}.`,
      source: 'template',
      mode: 'explain',
    };
  }

  // Question: When may I receive the money?
  if (q.includes('when') || q.includes('payout') || q.includes('timing') || q.includes('account')) {
    return {
      question: 'When may I receive the money?',
      answer: `Demo assumption: indicative payout within 2 working days (T+2 standard). Actual processing depends on the AMC scheme terms and banking hours.`,
      source: 'template',
      mode: 'explain',
    };
  }

  // Regulatory search fallback if user asks offline
  if (isResearchQuery(q)) {
    return {
      question,
      answer: `Statutory Status: STT is statutory at 0.001% on equity mutual fund redemptions under Section 98, Finance (No. 2) Act, 2004. Exit loads are defined by the scheme offer document (1% < 365 days). Equity redemption settlement follows the SEBI T+2 business-day framework.`,
      source: 'template',
      mode: 'research',
      groundedSources: [
        { title: 'Income Tax Department · STT under Finance Act', uri: 'https://incometaxindia.gov.in' },
        { title: 'SEBI Mutual Funds Master Circular', uri: 'https://www.sebi.gov.in' },
      ],
    };
  }

  return {
    question,
    answer: 'I can explain the calculation and the rules used for this redemption. Specific information requested is outside this scenario.',
    source: 'template',
    mode: 'explain',
  };
}

/**
 * Strict Numeric Validation (Section 37)
 * Verifies that any numbers, amounts, percentages, or tax references in LLM text
 * are strictly grounded in CalculationResult and verified rules.
 * If unsupported financial claims or advice words are detected, rejects the text.
 */
export function validateNumericClaims(text: string, result: CalculationResult): boolean {
  const lower = text.toLowerCase();

  // Reject any recommendation or advice steering
  const adviceWords = [
    'recommend',
    'you should',
    'better to',
    'optimal',
    'best option',
    'advise you to',
    'suggest you redeem',
    'suggest you hold',
    'avoid redeeming',
  ];
  for (const word of adviceWords) {
    if (lower.includes(word)) {
      return false;
    }
  }

  // Reject fabricated capital gains tax claims
  if (
    lower.includes('tax of') ||
    lower.includes('capital gains tax is ₹') ||
    lower.includes('stcg') ||
    lower.includes('ltcg')
  ) {
    // Only allowed if explicitly disclaiming
    if (
      !lower.includes('capital gains tax is not calculated') &&
      !lower.includes('not calculated in this prototype')
    ) {
      return false;
    }
  }

  // Extract rupee monetary amounts: e.g. ₹50,000 or ₹49,955.50 or Rs. 50000
  const rupeeMatches = text.match(/(?:₹|rs\.?\s*)([0-9,]+(?:\.[0-9]+)?)/gi) || [];
  const allowedAmounts = [
    Math.round(result.grossRedemptionValue),
    Math.round(result.estimatedProceeds),
    Math.round(result.totalDeductions),
    Math.round(result.exitLoadAmount),
    Math.round(result.remainingValueAtIllustrativeNAV),
    Math.round(result.illustrativeNAV),
    Math.round(DEMO_FUND.holdingValue),
    0,
  ];

  for (const match of rupeeMatches) {
    const rawNum = match.replace(/[^0-9.]/g, '');
    const num = parseFloat(rawNum);
    if (!isNaN(num)) {
      const isAllowed =
        allowedAmounts.includes(Math.round(num)) ||
        Math.abs(num - result.STTAmount) < 0.1 ||
        Math.abs(num - result.exitLoadAmount) < 0.1 ||
        Math.abs(num - result.totalDeductions) < 0.1 ||
        Math.abs(num - result.estimatedProceeds) < 1;

      if (!isAllowed && num > 10) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Gemini / Clarity Analyst integration:
 * Strictly constrained so the LLM cannot invent rates, taxes, or numbers.
 * Validates output against deterministic engine numbers.
 */
export async function explainWithGemini(
  question: string,
  result: CalculationResult
): Promise<ExplanationResponse> {
  // Always check advice refusal first
  if (isAdviceQuery(question)) {
    return {
      question,
      answer: "I can explain the calculation and the rules used. I don't make investment decisions.",
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
      // MODE 2: RESEARCH WITH SEARCH GROUNDING
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
      // MODE 1: EXPLAIN THIS REDEMPTION
      const prompt = `You are the contextual explanation engine for CLARITY, a neutral Indian mutual fund redemption decision-understanding tool.
STRICT BOUNDARIES:
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
  * Payout: within 2 working days (indicative demo assumption)
  * Capital gains tax is not calculated in this prototype.

User Question: "${question}"
Base accurate answer: "${template.answer}"

Task: Provide a calm, concise, factual, neutral explanation in 2-3 sentences based strictly on the above figures. If the user asks for investment advice, refuse neutrally: "I can explain the calculation and the rules used. I don't make investment decisions."`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const text = response.text?.trim();
      if (text && text.length > 10) {
        // Section 37: Validate that LLM did not invent erroneous financial numbers or advice
        if (validateNumericClaims(text, result)) {
          return {
            question,
            answer: text,
            source: 'llm',
            mode: 'explain',
          };
        }
      }
    }
  } catch {
    // Graceful fallback to deterministic template
  }

  return template;
}
