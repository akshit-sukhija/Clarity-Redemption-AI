export interface PurchaseLot {
  id: string;
  name: string;
  units: number;
  allotmentDate: string; // YYYY-MM-DD
  exitLoadEligible: boolean;
  exitLoadRate: number; // e.g. 0.01 for 1%
  reason: string;
}

export interface FundHolding {
  name: string;
  category: string;
  plan: string;
  option: string;
  illustrativeNAV: number; // ₹152.00
  demoAsOfDate: string; // 2026-10-01
  totalUnits: number; // 1,200.000
  holdingValue: number; // ₹1,82,400.00
  lots: PurchaseLot[];
}

export interface SchemeRules {
  exitLoadWindowDays: number; // 365
  exitLoadRateWithinWindow: number; // 0.01 (1%)
  exitLoadRateAfterWindow: number; // 0.00 (0%)
  fifo: boolean; // true
  sttRate: number; // 0.00001 (0.001%)
  payoutWindowDescription: string; // "Illustrative payout window: within 2 working days."
  payoutClarification: string; // "Actual processing depends on the scheme and applicable processing rules."
  taxDisclosure: string; // "Capital gains tax is not included in this prototype estimate."
}

export interface LotRedemptionBreakdown {
  lotId: string;
  lotName: string;
  allotmentDate: string;
  isEligibleForExitLoad: boolean;
  unitsHeldInLot: number;
  unitsRedeemedFromLot: number;
  unitsRemainingInLot: number;
  redemptionValueFromLot: number;
  applicableExitLoadRate: number;
  exitLoadAmount: number;
}

export interface CalculationTraceStep {
  label: string;
  formula: string;
  result: string;
  note?: string;
}

export interface CalculationResult {
  inputAmount: number;
  grossRedemptionValue: number;
  illustrativeNAV: number;
  totalUnits: number;
  unitsRedeemed: number;
  remainingUnits: number;
  remainingValueAtIllustrativeNAV: number;
  lotBreakdown: LotRedemptionBreakdown[];
  exitLoadApplicable: boolean;
  exitLoadRate: number;
  exitLoadAmount: number;
  STTApplicable: boolean;
  STTRate: number;
  STTAmount: number;
  totalDeductions: number;
  estimatedProceeds: number;
  payoutWindow: string;
  excludedItems: string[];
  calculationTrace: CalculationTraceStep[];
}

export interface RuleVerificationSource {
  ruleName: string;
  category: 'Exit Load' | 'STT' | 'FIFO Allocation' | 'NAV Pricing' | 'Payout Timeline';
  sourceOrganization: string;
  sourceDocument: string;
  sourceDateVersion?: string;
  verificationStatus: 'VERIFIED' | 'VALIDATION REQUIRED';
  applicabilityConditions: string;
  summary: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export type AppScreen =
  | 'portfolio'
  | 'fund_details'
  | 'enter_amount'
  | 'redemption_snapshot'
  | 'prototype_end';
