import { CalculationResult } from '../types';
import { formatCurrency, formatUnits } from './calculationEngine';
import { GoogleGenAI } from '@google/genai';

export interface ExplanationResponse {
  question: string;
  answer: string;
  source: 'template' | 'llm';
  isAdviceQuestion?: boolean;
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
      isAdviceQuestion: true,
    };
  }

  // Question 1: What will I receive?
  if (q.includes('what will i receive') || q.includes('receive')) {
    return {
      question: 'What will I receive?',
      answer: `From your gross redemption of ${formatCurrency(result.grossRedemptionValue)}, you may receive an estimated ${formatCurrency(result.estimatedProceeds)} after deducting ${formatCurrency(result.exitLoadAmount)} exit load and ${formatCurrency(result.STTAmount)} Securities Transaction Tax (STT).`,
      source: 'template',
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
      };
    } else {
      return {
        question: 'Why is there an exit load?',
        answer: `No exit load was charged on this redemption. All ${formatUnits(result.unitsRedeemed)} units were allocated under FIFO from Lot A (allotted 2025-08-15), which has been held for 412 days—well past the illustrative 365-day exit-load window.`,
        source: 'template',
      };
    }
  }

  // Question 3: What remains invested?
  if (q.includes('remains') || q.includes('remaining') || q.includes('balance')) {
    return {
      question: 'What remains invested?',
      answer: `After this redemption of ${formatUnits(result.unitsRedeemed)} units, ${formatUnits(result.remainingUnits)} units remain in your holding. At the Illustrative NAV of ${formatCurrency(result.illustrativeNAV)}, the remaining holding value is ${formatCurrency(result.remainingValueAtIllustrativeNAV)}. Note that actual remaining value fluctuates with NAV movements.`,
      source: 'template',
    };
  }

  // Question 4: How was this calculated?
  if (q.includes('calculated') || q.includes('calculation') || q.includes('math')) {
    return {
      question: 'How was this calculated?',
      answer: `Gross redemption of ${formatCurrency(result.grossRedemptionValue)} divided by Illustrative NAV (${formatCurrency(result.illustrativeNAV)}) equals ${formatUnits(result.unitsRedeemed)} units redeemed. Units are liquidated in First-In-First-Out (FIFO) sequence. Deductions comprise ${formatCurrency(result.exitLoadAmount)} exit load (1% only on units held < 365 days) and ${formatCurrency(result.STTAmount)} statutory STT (0.001%). Estimated proceeds are ${formatCurrency(result.estimatedProceeds)}.`,
      source: 'template',
    };
  }

  // Question 5: When may I receive the money?
  if (q.includes('when') || q.includes('payout') || q.includes('timing') || q.includes('account')) {
    return {
      question: 'When may I receive the money?',
      answer: `Illustrative payout window: within 2 working days. Actual processing depends on the scheme and applicable processing rules.`,
      source: 'template',
    };
  }

  // Default fallback if unknown
  return {
    question,
    answer: 'That information is not included in this prototype scenario.',
    source: 'template',
  };
}

/**
 * Optional LLM rephrase or explanation layer.
 * Strictly constrained so the LLM cannot invent rates, taxes, or numbers.
 * Falls back safely to template on any error or missing key.
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
      isAdviceQuestion: true,
    };
  }

  const template = getTemplateExplanation(question, result);

  const apiKey = process.env.GEMINI_API_KEY || (typeof window !== 'undefined' ? (window as any).GEMINI_API_KEY : '');
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return template;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
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
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text?.trim();
    if (text && text.length > 10) {
      return {
        question,
        answer: text,
        source: 'llm',
      };
    }
  } catch {
    // Graceful fallback per Section 44: LLM FAILURE HANDLING
  }

  return template;
}
