import React from 'react';
import { CalculationResult, FundHolding } from '../types';
import { formatCurrency, formatUnits, formatIndianNumber } from '../services/calculationEngine';
import { RULE_VERIFICATION_SOURCES } from '../data/fundData';

interface PrintDocumentViewProps {
  result: CalculationResult;
  fund: FundHolding;
}

export const PrintDocumentView: React.FC<PrintDocumentViewProps> = ({ result, fund }) => {
  return (
    <div className="print-document bg-white text-[#111827] p-8 max-w-3xl mx-auto font-sans leading-normal">
      {/* Header */}
      <div className="border-b-2 border-[#111827] pb-4 mb-6 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-[#111827]">CLARITY</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#F1F3F5] text-[#55606E] border border-[#E2E6EA]">
              SIMULATION MODE · ILLUSTRATIVE DATA
            </span>
          </div>
          <h1 className="text-base font-semibold text-[#475569] mt-1">
            Redemption Consequence Snapshot Record
          </h1>
        </div>
        <div className="text-right text-xs text-[#64748B]">
          <div>Fixed As-Of Date: <strong className="font-mono text-[#111827]">{fund.demoAsOfDate}</strong></div>
          <div>Record Generated: <span className="font-mono">{new Date().toLocaleDateString('en-IN')}</span></div>
        </div>
      </div>

      {/* Fund Metadata */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-[11px] text-[#64748B] block">Fund Name</span>
          <span className="font-semibold text-[#0F172A] block mt-0.5">{fund.name}</span>
        </div>
        <div>
          <span className="text-[11px] text-[#64748B] block">Category & Plan</span>
          <span className="font-semibold text-[#0F172A] block mt-0.5">{fund.category} · {fund.plan}</span>
        </div>
        <div>
          <span className="text-[11px] text-[#64748B] block">Illustrative NAV</span>
          <span className="font-mono font-semibold text-[#0F172A] block mt-0.5">{formatCurrency(fund.illustrativeNAV)}</span>
        </div>
        <div>
          <span className="text-[11px] text-[#64748B] block">Total Units Held</span>
          <span className="font-mono font-semibold text-[#0F172A] block mt-0.5">{formatUnits(fund.totalUnits)}</span>
        </div>
      </div>

      {/* Primary Consequence Numbers */}
      <div className="border border-[#CBD5E1] rounded-lg p-5 mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">
          Consequence Summary
        </h2>
        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <span className="text-xs text-[#64748B] block">Gross Redemption Value Entered</span>
            <span className="text-2xl font-bold font-mono text-[#334155] mt-1 block">
              {formatCurrency(result.grossRedemptionValue)}
            </span>
          </div>
          <div>
            <span className="text-xs font-bold text-[#0F172A] block">Estimated Proceeds (You May Receive)</span>
            <span className="text-2xl font-extrabold font-mono text-[#0F172A] mt-1 block">
              {formatCurrency(result.estimatedProceeds)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 text-xs">
          <div>
            <span className="text-[#64748B] block">Total Deductions</span>
            <span className="font-mono font-bold text-[#0F172A] text-sm block mt-0.5">
              {formatCurrency(result.totalDeductions)}
            </span>
            <div className="text-[11px] text-[#64748B] mt-1">
              Exit Load: {formatCurrency(result.exitLoadAmount)}<br />
              STT (0.001%): {formatCurrency(result.STTAmount)}
            </div>
          </div>

          <div>
            <span className="text-[#64748B] block">Units Liquidated</span>
            <span className="font-mono font-bold text-[#0F172A] text-sm block mt-0.5">
              {formatUnits(result.unitsRedeemed)}
            </span>
            <div className="text-[11px] text-[#64748B] mt-1">
              Derived: Gross ÷ NAV (₹{fund.illustrativeNAV.toFixed(2)})
            </div>
          </div>

          <div>
            <span className="text-[#64748B] block">Remaining Holding</span>
            <span className="font-mono font-bold text-[#0F172A] text-sm block mt-0.5">
              {formatUnits(result.remainingUnits)} units
            </span>
            <div className="text-[11px] font-mono text-[#0F172A] mt-1">
              {formatCurrency(result.remainingValueAtIllustrativeNAV)} at illustrative NAV
            </div>
          </div>
        </div>
      </div>

      {/* Decision Trace Table */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#475569] mb-2">
          Decision Trace (01 – 06)
        </h3>
        <table className="w-full text-xs border border-[#E2E8F0] rounded">
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-left text-[11px] text-[#64748B]">
            <tr>
              <th className="p-2 w-12">Stage</th>
              <th className="p-2">Item</th>
              <th className="p-2">Calculation / Allocation Rule</th>
              <th className="p-2 text-right">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9] font-mono">
            {result.calculationTrace.map((step, idx) => (
              <tr key={idx}>
                <td className="p-2 text-[#64748B] font-bold">0{idx + 1}</td>
                <td className="p-2 font-sans font-semibold text-[#1E293B]">{step.label}</td>
                <td className="p-2 text-[#475569] text-[11px]">{step.formula}</td>
                <td className="p-2 text-right font-bold text-[#0F172A]">{step.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Lot Level FIFO Breakdown */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#475569] mb-2">
          FIFO Lot Allocation Breakdown
        </h3>
        <table className="w-full text-xs border border-[#E2E8F0] rounded">
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-left text-[11px] text-[#64748B]">
            <tr>
              <th className="p-2">Lot</th>
              <th className="p-2">Allotment</th>
              <th className="p-2 text-right">Units Liquidated</th>
              <th className="p-2 text-right">Gross Value</th>
              <th className="p-2 text-right">Exit Load Rate</th>
              <th className="p-2 text-right">Exit Load Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9] font-mono">
            {result.lotBreakdown.map((lot) => (
              <tr key={lot.lotId}>
                <td className="p-2 font-sans font-medium text-[#1E293B]">{lot.lotName}</td>
                <td className="p-2 text-[#64748B]">{lot.allotmentDate}</td>
                <td className="p-2 text-right text-[#0F172A]">{formatUnits(lot.unitsRedeemedFromLot)}</td>
                <td className="p-2 text-right text-[#0F172A]">{formatCurrency(lot.redemptionValueFromLot)}</td>
                <td className="p-2 text-right text-[#64748B]">
                  {lot.applicableExitLoadRate > 0 ? `${(lot.applicableExitLoadRate * 100).toFixed(0)}%` : '0%'}
                </td>
                <td className="p-2 text-right font-bold text-[#0F172A]">{formatCurrency(lot.exitLoadAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Decision Support Record Verification (Section 26) */}
      <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-4 mb-6 text-xs space-y-2">
        <div className="font-bold text-xs uppercase tracking-wider text-[#0F172A] border-b border-[#E2E8F0] pb-1.5 flex items-center justify-between">
          <span>Decision-Support Snapshot Record</span>
          <span className="text-[10px] font-mono text-[#64748B]">INFORMATIONAL ONLY</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] pt-1">
          <div>
            <span className="text-[#64748B] block">Redemption Considered:</span>
            <strong className="text-[#0F172A] font-mono">{formatCurrency(result.grossRedemptionValue)}</strong>
          </div>
          <div>
            <span className="text-[#64748B] block">Estimated Proceeds:</span>
            <strong className="text-[#0F172A] font-mono">{formatCurrency(result.estimatedProceeds)}</strong>
          </div>
          <div>
            <span className="text-[#64748B] block">Context Reviewed:</span>
            <span className="text-[#0F172A] font-medium">3 market signals</span>
          </div>
          <div>
            <span className="text-[#64748B] block">Evidence Reviewed:</span>
            <span className="text-[#0F172A] font-medium">3 statutory sources</span>
          </div>
        </div>
        <div className="pt-2 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#475569]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#247A5A]" />
            <span>Calculation: <strong>Deterministic</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#247A5A]" />
            <span>AI: <strong>Scenario / Grounded Explainer</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#247A5A] font-bold">✓</span>
            <span>No recommendation made (Self-directed)</span>
          </div>
        </div>
      </div>

      {/* Rule & Source Metadata */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 mb-6 text-[11px] text-[#475569] space-y-2">
        <div className="font-semibold text-xs text-[#0F172A] mb-1">Authoritative Rule Evidence & Statutory Sources:</div>
        <div>
          <strong>STT (0.001%): </strong>Section 98, Finance (No. 2) Act, 2004 (CBDT statutory rate on equity-oriented fund repurchase).
        </div>
        <div>
          <strong>Exit Load: </strong>Scheme Information Document (SID) illustrative rule. 1% within 365 days; 0% thereafter. Lot A held 412 days (0%); Lot B held 214 days (1%) as of 2026-10-01.
        </div>
        <div>
          <strong>Settlement Timeline: </strong>Indicative processing timeline; actual timing depends on scheme terms, applicable processing rules, cut-off timing, and business days.
        </div>
        <div>
          <strong>Tax Note: </strong>Capital gains tax is not calculated in this prototype estimate.
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="border-t border-[#CBD5E1] pt-4 text-center text-[10px] text-[#64748B] italic leading-relaxed">
        "Prototype uses illustrative data and stops before transaction confirmation. It is not investment advice or a transaction confirmation."
      </div>
    </div>
  );
};
