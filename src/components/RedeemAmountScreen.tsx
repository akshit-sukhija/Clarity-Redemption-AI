import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, AlertCircle, Info, Sliders, Layers } from 'lucide-react';
import { DEMO_FUND } from '../data/fundData';
import { formatCurrency, formatIndianNumber } from '../services/calculationEngine';

interface RedeemAmountScreenProps {
  onBack: () => void;
  onProceed: (amount: number) => void;
  initialAmount?: number | null;
}

export const RedeemAmountScreen: React.FC<RedeemAmountScreenProps> = ({
  onBack,
  onProceed,
  initialAmount = null,
}) => {
  // Starts EMPTY per strict specification ("The redemption amount input must start EMPTY. Do NOT pre-fill ₹50,000.")
  const [inputValue, setInputValue] = useState<string>(
    initialAmount ? initialAmount.toString() : ''
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const availableHolding = DEMO_FUND.holdingValue;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9.]/g, '');
    setInputValue(rawVal);
    setValidationError(null);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setValidationError(null);
  };

  const handleQuickSelect = (amt: number) => {
    setInputValue(amt.toString());
    setValidationError(null);
  };

  const handleReviewConsequences = () => {
    if (!inputValue || inputValue.trim() === '') {
      setValidationError('Please enter a redemption amount.');
      return;
    }

    const numericAmount = parseFloat(inputValue);

    if (isNaN(numericAmount)) {
      setValidationError('Please enter a valid monetary amount.');
      return;
    }

    if (numericAmount <= 0) {
      setValidationError('Redemption amount must be greater than ₹0.');
      return;
    }

    if (numericAmount > availableHolding) {
      setValidationError(
        `Amount cannot exceed your available holding value of ${formatCurrency(availableHolding)}.`
      );
      return;
    }

    setValidationError(null);
    onProceed(numericAmount);
  };

  const currentNumeric = parseFloat(inputValue) || 0;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-blue-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Fund Details
      </button>

      {/* Screen Title & Subheading */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block mb-1">
          Redemption Amount Entry
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
          HOW MUCH DO YOU WANT TO EXPLORE?
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Enter an amount or adjust the slider to see its estimated consequences before continuing.
        </p>
      </div>

      {/* Main Entry Card */}
      <div className="bg-[#15233A] border border-[#26385A] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Available Holding Context Banner */}
        <div className="p-4 bg-[#101B2E] border border-[#26385A] rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Redeem From Holding
            </span>
            <span className="text-sm font-bold text-[#F5F7FA] block mt-0.5">
              {DEMO_FUND.name}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              1,200.000 units @ ₹152.00 NAV
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase block">Available Value</span>
            <span className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-400 block mt-0.5">
              {formatCurrency(availableHolding)}
            </span>
          </div>
        </div>

        {/* Input Box */}
        <div>
          <label
            htmlFor="redemption-input"
            className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2"
          >
            Gross Redemption Value
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-2xl font-bold text-slate-500">
              ₹
            </div>
            <input
              id="redemption-input"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleReviewConsequences();
              }}
              className={`w-full pl-11 pr-4 py-4 text-3xl font-extrabold font-mono text-[#F5F7FA] bg-[#101B2E] border-2 ${
                validationError
                  ? 'border-rose-500 focus:ring-rose-400/30'
                  : 'border-[#26385A] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              } rounded-xl outline-none transition-all placeholder:text-slate-600 shadow-inner`}
            />
          </div>

          {/* Validation Error Message */}
          {validationError && (
            <div className="flex items-center gap-1.5 mt-2.5 text-xs font-bold text-rose-300 bg-rose-950/60 p-2.5 rounded-lg border border-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{validationError}</span>
            </div>
          )}

          <p className="text-[11px] text-slate-400 mt-2">
            The gross value of units selected for liquidation before applicable exit load and STT deductions.
          </p>
        </div>

        {/* Interactive Exploration Slider */}
        <div className="p-4 bg-[#101B2E] border border-[#26385A] rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5 font-bold">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              Interactive Amount Scrub:
            </span>
            <span className="font-mono text-emerald-400 font-bold">
              {currentNumeric > 0 ? formatCurrency(currentNumeric, 0) : '₹0'}
            </span>
          </div>

          <input
            type="range"
            min="5000"
            max={availableHolding}
            step="1000"
            value={currentNumeric > 0 ? currentNumeric : 5000}
            onChange={handleSliderChange}
            className="w-full h-2 bg-[#0D1626] rounded-lg appearance-none cursor-pointer accent-blue-500"
            aria-label="Amount scrubber slider"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>₹5K</span>
            <span className="text-amber-400">Lot A Boundary: ₹45,600 (0% Load)</span>
            <span>₹1.82L (Full)</span>
          </div>
        </div>

        {/* Quick Scenario Shortcuts */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Quick Scenarios:
            </span>
            <span className="text-[11px] text-slate-400 italic">
              Scenario shortcuts, not recommendations
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { label: '₹25,000', val: 25000 },
              { label: '₹50,000', val: 50000 },
              { label: '₹75,000', val: 75000 },
              { label: 'Full (₹1.82L)', val: availableHolding },
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => handleQuickSelect(opt.val)}
                className={`py-3 px-3 text-xs font-bold font-mono rounded-xl border transition-all ${
                  inputValue === opt.val.toString()
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-1 ring-blue-400'
                    : 'bg-[#101B2E] hover:bg-[#1A2C4A] text-slate-300 border-[#26385A]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleReviewConsequences}
            className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
          >
            <span>Review consequences</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
