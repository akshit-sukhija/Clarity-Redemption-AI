import { FundHolding, CalculationResult, LotRedemptionBreakdown, CalculationTraceStep } from '../types';
import { DEMO_FUND, SCHEME_RULES, EXCLUDED_ITEMS } from '../data/fundData';

/**
 * Calculates days between two date strings (YYYY-MM-DD).
 */
export function getDaysBetweenDates(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Deterministic Financial Calculation Engine for Mutual Fund Redemption.
 * 
 * Strict specifications:
 * 1. unitsRedeemed = grossRedemptionValue / illustrativeNAV (full internal precision).
 * 2. FIFO redemption across purchase lots.
 * 3. Exit load calculated at lot level based on allotmentDate + demoAsOfDate + exitLoadWindowDays.
 * 4. STT calculated from gross redemption value at 0.001% (statutory rate).
 * 5. estimatedProceeds = grossRedemptionValue - applicableExitLoad - applicableSTT.
 * 6. remainingUnits = totalUnits - unitsRedeemed.
 * 7. remainingHoldingValue = remainingUnits * illustrativeNAV.
 * 8. Rounding strictly at presentation layer.
 */
export function calculateRedemption(
  fund: FundHolding = DEMO_FUND,
  grossRedemptionValue: number,
  asOfDate: string = fund.demoAsOfDate
): CalculationResult {
  if (typeof grossRedemptionValue !== 'number' || isNaN(grossRedemptionValue)) {
    throw new Error('Invalid redemption amount: input must be a valid number.');
  }

  if (grossRedemptionValue <= 0) {
    throw new Error('Redemption amount must be greater than zero.');
  }

  if (grossRedemptionValue > fund.holdingValue + 0.0001) {
    throw new Error('Redemption amount cannot exceed available holding value.');
  }

  const illustrativeNAV = fund.illustrativeNAV;
  const totalUnits = fund.totalUnits;

  // Unrounded units redeemed
  const unitsRedeemed = grossRedemptionValue / illustrativeNAV;

  // Track remaining units to allocate across lots (FIFO)
  let unitsLeftToAllocate = unitsRedeemed;
  let totalExitLoad = 0;
  const lotBreakdown: LotRedemptionBreakdown[] = [];

  for (const lot of fund.lots) {
    const daysHeld = getDaysBetweenDates(lot.allotmentDate, asOfDate);
    const isExitLoadEligible = daysHeld <= SCHEME_RULES.exitLoadWindowDays;
    const applicableRate = isExitLoadEligible ? SCHEME_RULES.exitLoadRateWithinWindow : SCHEME_RULES.exitLoadRateAfterWindow;

    const unitsRedeemedFromLot = Math.min(unitsLeftToAllocate, lot.units);
    const unitsRemainingInLot = Math.max(0, lot.units - unitsRedeemedFromLot);
    const redemptionValueFromLot = unitsRedeemedFromLot * illustrativeNAV;
    const exitLoadForLot = redemptionValueFromLot * applicableRate;

    totalExitLoad += exitLoadForLot;
    unitsLeftToAllocate = Math.max(0, unitsLeftToAllocate - unitsRedeemedFromLot);

    lotBreakdown.push({
      lotId: lot.id,
      lotName: lot.name,
      allotmentDate: lot.allotmentDate,
      isEligibleForExitLoad: isExitLoadEligible,
      unitsHeldInLot: lot.units,
      unitsRedeemedFromLot,
      unitsRemainingInLot,
      redemptionValueFromLot,
      applicableExitLoadRate: applicableRate,
      exitLoadAmount: exitLoadForLot,
    });
  }

  // STT at 0.001% on gross redemption value
  const sttAmount = grossRedemptionValue * SCHEME_RULES.sttRate;

  // Total deductions
  const totalDeductions = totalExitLoad + sttAmount;

  // Estimated proceeds
  const estimatedProceeds = grossRedemptionValue - totalDeductions;

  // Remaining holding
  const remainingUnits = Math.max(0, totalUnits - unitsRedeemed);
  const remainingValueAtIllustrativeNAV = remainingUnits * illustrativeNAV;

  // Calculation trace steps for the "How was this calculated?" section
  const lotA = lotBreakdown.find((l) => l.lotId === 'lot-a');
  const lotB = lotBreakdown.find((l) => l.lotId === 'lot-b');

  const calculationTrace: CalculationTraceStep[] = [
    {
      label: 'REDEMPTION AMOUNT',
      formula: 'Gross redemption value entered',
      result: `₹${formatIndianNumber(grossRedemptionValue, 2)}`,
    },
    {
      label: 'UNITS REDEEMED',
      formula: `₹${formatIndianNumber(grossRedemptionValue, 2)} ÷ ₹${illustrativeNAV.toFixed(2)}`,
      result: `${unitsRedeemed.toFixed(3)} units`,
      note: `Exact internal precision: ${unitsRedeemed}`,
    },
    {
      label: 'LOT ALLOCATION (FIFO)',
      formula: 'Oldest units redeemed first',
      result: `${lotA ? lotA.unitsRedeemedFromLot.toFixed(3) : '0.000'} units from older lot${
        lotB && lotB.unitsRedeemedFromLot > 0 ? `, ${lotB.unitsRedeemedFromLot.toFixed(3)} units from newer lot` : ''
      }`,
    },
    {
      label: 'EXIT LOAD',
      formula: `Older lot (412 days held) → 0% · Newer lot (214 days held) → 1%`,
      result: `₹${formatIndianNumber(totalExitLoad, 2)}`,
      note:
        totalExitLoad > 0
          ? `1% applied only to ₹${formatIndianNumber(lotB?.redemptionValueFromLot || 0, 2)} from eligible Lot B`
          : 'All units redeemed from older lot held > 365 days',
    },
    {
      label: 'STT (Securities Transaction Tax)',
      formula: `₹${formatIndianNumber(grossRedemptionValue, 2)} × 0.001%`,
      result: `₹${formatIndianNumber(sttAmount, 2)}`,
      note: 'Real regulatory rate on equity-oriented fund redemption',
    },
    {
      label: 'ESTIMATED PROCEEDS',
      formula: `₹${formatIndianNumber(grossRedemptionValue, 2)} − ₹${formatIndianNumber(totalExitLoad, 2)} (Exit Load) − ₹${formatIndianNumber(sttAmount, 2)} (STT)`,
      result: `₹${formatIndianNumber(estimatedProceeds, 2)}`,
    },
    {
      label: 'REMAINING HOLDING',
      formula: `${remainingUnits.toFixed(3)} units × ₹${illustrativeNAV.toFixed(2)}`,
      result: `₹${formatIndianNumber(remainingValueAtIllustrativeNAV, 2)}`,
      note: 'Derived from remaining units × Illustrative NAV',
    },
  ];

  return {
    inputAmount: grossRedemptionValue,
    grossRedemptionValue,
    illustrativeNAV,
    totalUnits,
    unitsRedeemed,
    remainingUnits,
    remainingValueAtIllustrativeNAV,
    lotBreakdown,
    exitLoadApplicable: totalExitLoad > 0,
    exitLoadRate: SCHEME_RULES.exitLoadRateWithinWindow,
    exitLoadAmount: totalExitLoad,
    STTApplicable: true,
    STTRate: SCHEME_RULES.sttRate,
    STTAmount: sttAmount,
    totalDeductions,
    estimatedProceeds,
    payoutWindow: SCHEME_RULES.payoutWindowDescription,
    excludedItems: EXCLUDED_ITEMS,
    calculationTrace,
  };
}

/**
 * Format numbers using Indian numbering standard (e.g., 1,82,400.00).
 */
export function formatIndianNumber(value: number, decimals: number = 2): string {
  if (isNaN(value)) return '0.00';
  const rounded = value.toFixed(decimals);
  const parts = rounded.split('.');
  let integerPart = parts[0];
  const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

  const isNegative = integerPart.startsWith('-');
  if (isNegative) integerPart = integerPart.substring(1);

  // Indian numbering: last 3 digits, then groups of 2 digits
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  return (isNegative ? '-' : '') + formattedInteger + decimalPart;
}

/**
 * Helper to format currency for UI presentation.
 */
export function formatCurrency(value: number, decimals: number = 2): string {
  return `₹${formatIndianNumber(value, decimals)}`;
}

/**
 * Helper to format units to 3 decimal places for UI presentation.
 */
export function formatUnits(value: number): string {
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
}
