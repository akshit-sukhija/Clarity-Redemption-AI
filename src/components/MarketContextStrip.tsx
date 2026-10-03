import React, { useState, useEffect } from 'react';
import { MarketInstrument, MarketStatus } from '../types';
import { marketProvider } from '../services/marketDataProvider';
import { Info, X, TrendingUp, TrendingDown, Clock, ShieldCheck } from 'lucide-react';

export const MarketContextStrip: React.FC = () => {
  const [instruments, setInstruments] = useState<MarketInstrument[]>([]);
  const [status, setStatus] = useState<MarketStatus>('CLOSED');
  const [hoveredInstrument, setHoveredInstrument] = useState<MarketInstrument | null>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<MarketInstrument | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedInstrument(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const unsubscribe = marketProvider.subscribe((insts, stat) => {
      setInstruments(insts);
      setStatus(stat);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-[#FFFFFF] border border-[#DDD9D0] rounded-xl p-3 sm:p-4 shadow-xs space-y-2.5">
      {/* Strip Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-[#DDD9D0]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#A66A16]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E211F]">
            Market Context
          </span>
          <span className="text-[10px] text-[#666861] bg-[#F1EFE9] px-2 py-0.5 rounded border border-[#DDD9D0]">
            Demo snapshot · Context only
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#8A8D86]">
          <span>Does not alter redemption calculation</span>
        </div>
      </div>

      {/* 6 Market Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {instruments.map((inst) => {
          const isPositive = inst.change >= 0;
          return (
            <div
              key={inst.id}
              tabIndex={0}
              onMouseEnter={() => setHoveredInstrument(inst)}
              onMouseLeave={() => setHoveredInstrument(null)}
              onFocus={() => setHoveredInstrument(inst)}
              onBlur={() => setHoveredInstrument(null)}
              onClick={() => setSelectedInstrument(inst)}
              className="relative bg-[#F1EFE9] hover:bg-[#E8E5DD] focus:bg-[#E8E5DD] focus:outline-none focus:ring-1 focus:ring-[#247A5A] p-2.5 rounded-lg border border-[#DDD9D0] transition-colors cursor-pointer text-left"
              role="button"
              aria-label={`${inst.symbol} ${inst.formattedValue}, ${isPositive ? '+' : ''}${inst.changePercent}%. Click for details.`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-[#1E211F] truncate">
                  {inst.symbol}
                </span>
                <span className="text-[9px] font-mono text-[#8A8D86]">
                  {inst.marketStatus}
                </span>
              </div>

              <div className="mt-1 flex items-baseline justify-between font-mono">
                <span className="text-sm font-bold text-[#1E211F]">
                  {inst.formattedValue}
                </span>
                <span
                  className={`text-[11px] font-semibold flex items-center gap-0.5 ${
                    isPositive ? 'text-[#247A5A]' : 'text-[#B65347]'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {inst.changePercent}%
                </span>
              </div>

              <span className="block text-[9px] text-[#8A8D86] truncate mt-0.5 font-sans">
                {inst.source}
              </span>

              {/* Hover / Focus Tooltip (Pure inspection - NO mutation) */}
              {hoveredInstrument?.id === inst.id && (
                <div className="absolute left-0 bottom-full mb-1.5 z-40 w-56 p-2.5 bg-[#FFFFFF] border border-[#DDD9D0] rounded-lg shadow-md text-xs pointer-events-none">
                  <div className="font-bold text-[#1E211F] pb-1 border-b border-[#DDD9D0] flex justify-between">
                    <span>{inst.name}</span>
                    <span className="text-[10px] text-[#8A8D86] font-normal">Inspection</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 py-1 text-[11px] font-mono text-[#666861]">
                    <div>Open: {inst.open.toLocaleString('en-IN')}</div>
                    <div>High: {inst.high.toLocaleString('en-IN')}</div>
                    <div>Low: {inst.low.toLocaleString('en-IN')}</div>
                    <div>Prev: {inst.previousClose.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="pt-1 border-t border-[#DDD9D0] text-[10px] text-[#8A8D86] font-sans">
                    <div>As of {inst.timestamp}</div>
                    <div className="truncate">Source: {inst.source}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Drill-down Modal on Tile Click */}
      {selectedInstrument && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#FFFFFF] rounded-xl shadow-lg border border-[#DDD9D0] p-6 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#DDD9D0]">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8D86] block">
                  Market instrument context
                </span>
                <h3 className="text-lg font-bold text-[#1E211F]">
                  {selectedInstrument.name} ({selectedInstrument.symbol})
                </h3>
              </div>
              <button
                onClick={() => setSelectedInstrument(null)}
                className="p-1 text-[#666861] hover:text-[#1E211F] rounded-lg cursor-pointer"
                aria-label="Close instrument detail"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price Snapshot */}
            <div className="p-4 bg-[#F1EFE9] rounded-lg border border-[#DDD9D0] flex justify-between items-center font-mono">
              <div>
                <span className="text-xs text-[#8A8D86] font-sans block">Current quote</span>
                <span className="text-2xl font-bold text-[#1E211F]">
                  {selectedInstrument.formattedValue}
                </span>
              </div>
              <div className="text-right">
                <span
                  className={`text-sm font-bold block ${
                    selectedInstrument.change >= 0 ? 'text-[#247A5A]' : 'text-[#B65347]'
                  }`}
                >
                  {selectedInstrument.change >= 0 ? '+' : ''}
                  {selectedInstrument.change} ({selectedInstrument.changePercent}%)
                </span>
                <span className="text-[10px] text-[#8A8D86] font-sans">
                  Status: {selectedInstrument.marketStatus}
                </span>
              </div>
            </div>

            {/* Intraday Range Section (Section 19, 20, 47: No fabricated curve) */}
            <div className="p-3 bg-[#FFFFFF] border border-[#DDD9D0] rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1E211F]">Session Range & Level</span>
                <span className="text-[10px] text-[#8A8D86] font-mono">
                  {selectedInstrument.marketStatus === 'CLOSED' ? 'Market Closed' : 'Demo Snapshot'}
                </span>
              </div>

              {/* Honest Range Bar derived strictly from Low, Open, High, Close */}
              <div className="py-1">
                <div className="flex justify-between text-[10px] text-[#8A8D86] font-mono mb-1">
                  <span>Day Low: {selectedInstrument.low.toLocaleString('en-IN')}</span>
                  <span>Day High: {selectedInstrument.high.toLocaleString('en-IN')}</span>
                </div>
                <div className="relative h-2.5 w-full bg-[#E8E5DD] rounded-full overflow-hidden border border-[#DDD9D0]">
                  {/* Calibrated position indicator */}
                  {(() => {
                    const range = Math.max(0.01, selectedInstrument.high - selectedInstrument.low);
                    const currentPos = Math.max(0, Math.min(100, ((selectedInstrument.value - selectedInstrument.low) / range) * 100));
                    return (
                      <div
                        style={{ left: `${currentPos}%` }}
                        className={`absolute top-0 bottom-0 w-2.5 -ml-1.25 rounded-full ${
                          selectedInstrument.change >= 0 ? 'bg-[#247A5A]' : 'bg-[#B65347]'
                        }`}
                        title={`Close: ${selectedInstrument.formattedValue}`}
                      />
                    );
                  })()}
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-[#666861] mt-1.5">
                  <span>Prev Close: {selectedInstrument.previousClose.toLocaleString('en-IN')}</span>
                  <span className="font-bold text-[#1E211F]">Close: {selectedInstrument.formattedValue}</span>
                </div>
              </div>

              {/* Truthful provenance notice */}
              <div className="pt-1.5 border-t border-[#DDD9D0] text-[10px] text-[#8A8D86] leading-relaxed">
                Historical tick series unavailable in this prototype. Reference benchmark values reflect the official market close snapshot as of {selectedInstrument.timestamp}.
              </div>
            </div>

            {/* OHLC Table */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 bg-[#FFFFFF] border border-[#DDD9D0] rounded">
                <span className="text-[10px] text-[#8A8D86] font-sans block">Day Open</span>
                <span className="font-bold text-[#1E211F]">{selectedInstrument.open.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2.5 bg-[#FFFFFF] border border-[#DDD9D0] rounded">
                <span className="text-[10px] text-[#8A8D86] font-sans block">Day High</span>
                <span className="font-bold text-[#1E211F]">{selectedInstrument.high.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2.5 bg-[#FFFFFF] border border-[#DDD9D0] rounded">
                <span className="text-[10px] text-[#8A8D86] font-sans block">Day Low</span>
                <span className="font-bold text-[#1E211F]">{selectedInstrument.low.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2.5 bg-[#FFFFFF] border border-[#DDD9D0] rounded">
                <span className="text-[10px] text-[#8A8D86] font-sans block">Previous Close</span>
                <span className="font-bold text-[#1E211F]">{selectedInstrument.previousClose.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Why This is Shown */}
            <div className="p-3 bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-[#1E211F]">
                <Info className="w-3.5 h-3.5 text-[#247A5A]" />
                <span>Why this context is shown:</span>
              </div>
              <p className="text-[#666861] leading-relaxed">
                {selectedInstrument.relevanceExplanation}
              </p>
              <div className="text-[10px] text-[#8A8D86] pt-1">
                Source: {selectedInstrument.source} · As of {selectedInstrument.timestamp}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedInstrument(null)}
                className="px-4 py-2 bg-[#247A5A] hover:bg-[#1D6349] text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
