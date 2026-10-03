import { FundHolding, SchemeRules, RuleVerificationSource, GlossaryTerm } from '../types';

export const DEMO_AS_OF_DATE = '2026-10-01';

export const DEMO_FUND: FundHolding = {
  name: 'Northstar Equity Opportunities Fund',
  category: 'Equity-oriented mutual fund',
  plan: 'Direct · Growth',
  option: 'Growth',
  illustrativeNAV: 152.00,
  demoAsOfDate: DEMO_AS_OF_DATE,
  totalUnits: 1200.000,
  holdingValue: 182400.00, // 1,200 * 152
  lots: [
    {
      id: 'lot-a',
      name: 'Lot A (Older lot)',
      units: 300.000,
      allotmentDate: '2025-08-15',
      exitLoadEligible: false,
      exitLoadRate: 0.00,
      reason: 'Older than the illustrative 365-day exit-load window as of 2026-10-01',
    },
    {
      id: 'lot-b',
      name: 'Lot B (Newer lot)',
      units: 900.000,
      allotmentDate: '2026-03-01',
      exitLoadEligible: true,
      exitLoadRate: 0.01,
      reason: 'Within the illustrative 365-day exit-load window as of 2026-10-01',
    },
  ],
};

export const SCHEME_RULES: SchemeRules = {
  exitLoadWindowDays: 365,
  exitLoadRateWithinWindow: 0.01, // 1%
  exitLoadRateAfterWindow: 0.00, // 0%
  fifo: true,
  sttRate: 0.00001, // 0.001%
  payoutWindowDescription: 'Illustrative payout window: within 2 working days.',
  payoutClarification: 'Actual processing depends on the scheme and applicable processing rules.',
  taxDisclosure: 'Capital gains tax is not included in this prototype estimate.',
};

export const EXCLUDED_ITEMS: string[] = [
  'Capital gains tax (LTCG / STCG)',
  'Brokerage or exchange trading fees',
  'SEBI turnover fees',
  'Stamp duty on repurchase (applicable only on initial creation/purchase)',
];

export const STATIC_GLOSSARY: GlossaryTerm[] = [
  {
    term: 'Exit load',
    definition:
      'A fee charged by an AMC when mutual fund units are redeemed before a specified holding period (in this demo scheme, 1% if redeemed within 365 days of allotment; 0% thereafter).',
  },
  {
    term: 'STT (Securities Transaction Tax)',
    definition:
      'A statutory tax levied by the Government of India under Chapter VII of the Finance (No. 2) Act, 2004 on redemption of equity-oriented mutual fund units at 0.001% of the gross redemption value.',
  },
  {
    term: 'NAV (Net Asset Value)',
    definition:
      'The per-unit market value of the mutual fund scheme. In this prototype, a static Illustrative NAV of ₹152.00 is used for consequence calculations.',
  },
  {
    term: 'Units',
    definition:
      'The measure of ownership in a mutual fund scheme. The number of redeemed units is calculated as gross redemption value divided by the Illustrative NAV.',
  },
  {
    term: 'Redemption',
    definition:
      'The process of surrendering mutual fund units back to the fund house (AMC) in exchange for cash value based on the prevailing NAV minus applicable deductions.',
  },
  {
    term: 'Estimated proceeds',
    definition:
      'The estimated net amount credited to the investor after deducting applicable exit load and STT from the gross redemption value before capital gains taxes.',
  },
];

export const RULE_VERIFICATION_SOURCES: RuleVerificationSource[] = [
  {
    ruleName: 'Securities Transaction Tax (STT) on Mutual Fund Redemption',
    category: 'STT',
    sourceOrganization: 'Ministry of Finance / CBDT (Central Board of Direct Taxes)',
    sourceDocument: 'Section 98, Finance (No. 2) Act, 2004 (Item 4: Sale of units of an equity oriented fund to the Mutual Fund)',
    sourceDateVersion: 'Statutory Rate Schedule (Amended up to Finance Act 2024)',
    verificationStatus: 'VERIFIED_PRIMARY',
    applicabilityConditions: 'Applies to redemptions of equity-oriented mutual fund units at 0.001% of the gross redemption value.',
    summary:
      'STT of 0.001% is deducted by the AMC on equity-oriented fund redemptions and remitted to the government. This is a real statutory rate.',
  },
  {
    ruleName: 'Scheme Exit Load Structure',
    category: 'Exit Load',
    sourceOrganization: 'AMFI / Scheme Information Document (SID)',
    sourceDocument: 'SEBI (Mutual Funds) Regulations, 1996 · Reg 49(1) & Illustrative SID Format',
    sourceDateVersion: 'Prototype Scheme Specification',
    verificationStatus: 'ILLUSTRATIVE',
    applicabilityConditions:
      '1% exit load applies to units redeemed within 365 days of allotment; 0% applies to units held greater than 365 days.',
    summary:
      'Demo scheme rule: 1% within the defined holding period. Lot A (allotted 2025-08-15) is past 365 days as of 2026-10-01 (412 days held, 0% load). Lot B (allotted 2026-03-01) is within 365 days (214 days held, 1% load).',
  },
  {
    ruleName: 'FIFO Accounting Method for Unit Redemptions',
    category: 'FIFO Allocation',
    sourceOrganization: 'Income Tax Department & AMFI Operational Standards',
    sourceDocument: 'Income Tax Act 1961 (Section 45) & SEBI Operational Guidelines for Mutual Funds',
    sourceDateVersion: 'Standard industry convention',
    verificationStatus: 'VERIFIED_SECONDARY',
    applicabilityConditions: 'FIFO applied under this prototype scheme rule to determine which purchase lots are liquidated first.',
    summary:
      'Older units (Lot A) are fully redeemed before units from later purchases (Lot B) are touched.',
  },
  {
    ruleName: 'Equity Mutual Fund Payout Processing Window',
    category: 'Payout Timeline',
    sourceOrganization: 'SEBI (Securities and Exchange Board of India)',
    sourceDocument: 'SEBI Circular SEBI/HO/IMD/IMD-I DOF1/P/CIR/2022/161 (Settlement cycle reduction)',
    sourceDateVersion: 'Indicative processing timeline',
    verificationStatus: 'ILLUSTRATIVE',
    applicabilityConditions: 'Subject to cut-off timing, business days, and KYC compliance.',
    summary:
      'Indicative processing timeline; actual timing depends on scheme terms, applicable processing rules, cut-off timing, and business days.',
  },
];
