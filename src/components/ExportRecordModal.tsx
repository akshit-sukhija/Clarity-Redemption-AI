import React, { useState } from 'react';
import { X, FileDown, Printer, FileText, Check, ShieldCheck } from 'lucide-react';
import { CalculationResult, FundHolding } from '../types';
import { generateSnapshotCSV, downloadCSVFile, triggerPrintDialog } from '../services/exportService';
import { PrintDocumentView } from './PrintDocumentView';
import { formatCurrency } from '../services/calculationEngine';

interface ExportRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CalculationResult | null;
  fund: FundHolding;
}

export const ExportRecordModal: React.FC<ExportRecordModalProps> = ({
  isOpen,
  onClose,
  result,
  fund,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  if (!result) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-[#15233A] rounded-2xl shadow-xl p-6 text-center border border-[#26385A]">
          <h3 className="text-base font-bold text-[#F5F7FA] mb-2">Export Unavailable</h3>
          <p className="text-xs text-slate-400 mb-4">
            No active redemption scenario has been calculated yet. Please enter a redemption amount first to generate a snapshot record.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleDownloadCSV = () => {
    try {
      const csv = generateSnapshotCSV(result, fund);
      const filename = `Clarity_Redemption_Snapshot_${result.grossRedemptionValue}_${fund.demoAsOfDate}.csv`;
      downloadCSVFile(csv, filename);
      setDownloadSuccess('CSV record downloaded successfully');
      setTimeout(() => setDownloadSuccess(null), 3500);
    } catch {
      alert('Unable to generate CSV for this snapshot.');
    }
  };

  const handlePrint = () => {
    triggerPrintDialog();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-[#15233A] rounded-3xl shadow-2xl border border-[#26385A] overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#26385A] flex items-center justify-between bg-[#101B2E] text-white">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Record & Export Utility
            </span>
            <span className="text-[11px] text-slate-500">•</span>
            <span className="text-xs font-semibold text-slate-300">
              Snapshot for {formatCurrency(result.grossRedemptionValue)}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="Close export modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-3 bg-[#15233A] border-b border-[#26385A] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#101B2E] hover:bg-[#1A2C4A] text-slate-300 hover:text-white border border-[#26385A] rounded-xl text-xs font-bold transition-all shadow-2xs"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-400" />
              <span>Export as CSV</span>
            </button>
          </div>

          {downloadSuccess && (
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/40">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          <div className="text-[11px] text-slate-400 font-mono">
            Values identical to screen result object
          </div>
        </div>

        {/* Scrollable Document Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0D1626]">
          <div className="shadow-lg border border-slate-300 rounded-2xl overflow-hidden bg-white text-slate-900">
            <PrintDocumentView result={result} fund={fund} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#26385A] bg-[#101B2E] flex items-center justify-between text-xs text-slate-400">
          <span>Single source of truth: deterministic calculation engine.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#15233A] hover:bg-[#1A2C4A] border border-[#26385A] rounded-xl font-bold text-slate-300 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
