import { CalculationResult, FundHolding } from '../types';
import { formatCurrency, formatUnits, formatIndianNumber } from './calculationEngine';

/**
 * Builds standard CSV content from the exact calculation result object.
 * Strictly avoids recalculation; uses values directly from the result object.
 */
export function generateSnapshotCSV(result: CalculationResult, fund: FundHolding): string {
  const rows: string[][] = [];

  // Header Section
  rows.push(['CLARITY · MUTUAL FUND REDEMPTION SNAPSHOT']);
  rows.push(['SIMULATION MODE · ILLUSTRATIVE DATA']);
  rows.push(['Generated At', new Date().toISOString()]);
  rows.push(['Fixed Demo As-Of Date', fund.demoAsOfDate]);
  rows.push([]);

  // Fund Identification
  rows.push(['FUND DETAILS']);
  rows.push(['Scheme Name', fund.name]);
  rows.push(['Category', fund.category]);
  rows.push(['Plan & Option', `${fund.plan} · ${fund.option}`]);
  rows.push(['Illustrative NAV (INR)', fund.illustrativeNAV.toFixed(2)]);
  rows.push(['Total Holding Units', fund.totalUnits.toFixed(3)]);
  rows.push(['Total Holding Value (INR)', fund.holdingValue.toFixed(2)]);
  rows.push([]);

  // Redemption Summary
  rows.push(['REDEMPTION CONSEQUENCE SUMMARY']);
  rows.push(['Gross Redemption Amount Entered (INR)', result.grossRedemptionValue.toFixed(2)]);
  rows.push(['Units Redeemed', result.unitsRedeemed.toFixed(3)]);
  rows.push(['Estimated Proceeds (INR)', result.estimatedProceeds.toFixed(2)]);
  rows.push(['Total Deductions (INR)', result.totalDeductions.toFixed(2)]);
  rows.push(['Exit Load Deducted (INR)', result.exitLoadAmount.toFixed(2)]);
  rows.push(['STT Deducted (0.001%) (INR)', result.STTAmount.toFixed(2)]);
  rows.push(['Remaining Units', result.remainingUnits.toFixed(3)]);
  rows.push(['Remaining Holding Value at Illustrative NAV (INR)', result.remainingValueAtIllustrativeNAV.toFixed(2)]);
  rows.push(['Payout Window', result.payoutWindow]);
  rows.push(['Tax Note', 'Capital gains tax is not included in this prototype estimate.']);
  rows.push([]);

  // Lot Allocation (FIFO)
  rows.push(['FIFO LOT ALLOCATION BREAKDOWN']);
  rows.push([
    'Lot ID',
    'Lot Name',
    'Allotment Date',
    'Units Held In Lot',
    'Units Liquidated',
    'Units Remaining',
    'Redemption Value (INR)',
    'Exit Load Rate',
    'Exit Load Amount (INR)',
  ]);

  for (const lot of result.lotBreakdown) {
    rows.push([
      lot.lotId,
      lot.lotName,
      lot.allotmentDate,
      lot.unitsHeldInLot.toFixed(3),
      lot.unitsRedeemedFromLot.toFixed(3),
      lot.unitsRemainingInLot.toFixed(3),
      lot.redemptionValueFromLot.toFixed(2),
      lot.applicableExitLoadRate > 0 ? `${(lot.applicableExitLoadRate * 100).toFixed(0)}%` : '0%',
      lot.exitLoadAmount.toFixed(2),
    ]);
  }
  rows.push([]);

  // Decision Trace Steps
  rows.push(['DECISION TRACE']);
  rows.push(['Stage', 'Step Name', 'Formula / Reference', 'Result']);
  result.calculationTrace.forEach((step, idx) => {
    rows.push([`0${idx + 1}`, step.label, step.formula, step.result]);
  });

  rows.push([]);
  rows.push(['DISCLAIMER']);
  rows.push(['"Prototype uses illustrative data and stops before transaction confirmation. It is not investment advice or a transaction confirmation."']);

  // Convert array of rows to CSV string with quotes where necessary
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const str = (cell ?? '').toString();
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',')
    )
    .join('\r\n');
}

/**
 * Triggers a browser download of the CSV string.
 */
export function downloadCSVFile(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers the browser print dialog for PDF generation.
 */
export function triggerPrintDialog(): void {
  window.print();
}
