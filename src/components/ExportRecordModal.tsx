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
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 text-center border border-slate-200">
          <h3 className="text-base font-bold text-slate-900 mb-2">Export Unavailable</h3>
          <p className="text-xs text-slate-500 mb-4">
            No active redemption scenario has been calculated yet. Please enter a redemption amount first to generate a snapshot record.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
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
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-2xs"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-600" />
              <span>Export as CSV</span>
            </button>
          </div>

          {downloadSuccess && (
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
              <Check className="w-3.5 h-3.5" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          <div className="text-[11px] text-slate-500 font-mono">
            Values identical to screen result object
          </div>
        </div>

        {/* Scrollable Document Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100">
          <div className="shadow-lg border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <PrintDocumentView result={result} fund={fund} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Single source of truth: deterministic calculation engine.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl font-bold text-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
