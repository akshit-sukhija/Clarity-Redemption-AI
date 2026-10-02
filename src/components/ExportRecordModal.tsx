import React, { useState } from 'react';
import { X, FileDown, Printer, Check } from 'lucide-react';
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
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-[#FFFFFF] rounded-xl shadow-lg p-6 text-center border border-[#DDD9D0]">
          <h3 className="text-base font-bold text-[#1E211F] mb-2">Export unavailable</h3>
          <p className="text-xs text-[#666861] mb-4">
            No active redemption scenario has been calculated yet. Please enter a redemption amount first to generate a snapshot.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#247A5A] text-white rounded-lg text-xs font-semibold cursor-pointer"
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
      setDownloadSuccess('CSV snapshot downloaded successfully');
      setTimeout(() => setDownloadSuccess(null), 3500);
    } catch {
      alert('Unable to generate CSV for this snapshot.');
    }
  };

  const handlePrint = () => {
    triggerPrintDialog();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-[#FFFFFF] rounded-xl shadow-lg border border-[#DDD9D0] overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#DDD9D0] flex items-center justify-between bg-[#FFFFFF]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8A8D86]">
              Save or export snapshot
            </span>
            <span className="text-xs text-[#DDD9D0]">•</span>
            <span className="text-xs font-semibold text-[#1E211F]">
              {formatCurrency(result.grossRedemptionValue)} redemption
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#666861] hover:text-[#1E211F] hover:bg-[#F1EFE9] rounded-lg transition-colors cursor-pointer"
            aria-label="Close export modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-3 bg-[#F1EFE9] border-b border-[#DDD9D0] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#247A5A] hover:bg-[#1D6349] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FFFFFF] hover:bg-[#E8E5DD] text-[#1E211F] border border-[#DDD9D0] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 text-[#666861]" />
              <span>Export as CSV</span>
            </button>

            {downloadSuccess && (
              <span className="text-xs text-[#247A5A] flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5 text-[#247A5A]" />
                {downloadSuccess}
              </span>
            )}
          </div>

          <span className="text-[11px] text-[#8A8D86] font-mono">
            Derived from canonical engine result
          </span>
        </div>

        {/* Document Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F7F5F0]">
          <div className="border border-[#DDD9D0] rounded-lg shadow-xs overflow-hidden bg-white">
            <PrintDocumentView result={result} fund={fund} />
          </div>
        </div>
      </div>
    </div>
  );
};
