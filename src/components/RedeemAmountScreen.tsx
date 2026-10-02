import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, AlertCircle, Info, Sliders } from 'lucide-react';
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

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Fund Details
      </button>

      {/* Screen Title & Subheading */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block mb-1">
          Redemption Amount Entry
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          HOW MUCH WOULD YOU LIKE TO REDEEM?
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Enter an amount to see its estimated consequences before continuing.
        </p>
      </div>

      {/* Main Entry Card */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Available Holding Banner */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Available Holding Value
            </span>
            <span className="text-[11px] text-slate-400">1,200 units @ ₹152.00</span>
          </div>
          <span className="text-2xl font-extrabold font-mono text-slate-900">
            {formatCurrency(availableHolding)}
          </span>
        </div>

        {/* Input Box */}
        <div>
          <label
            htmlFor="redemption-input"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
          >
            Gross Redemption Value
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-2xl font-bold text-slate-400">
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
              className={`w-full pl-11 pr-4 py-4 text-3xl font-extrabold font-mono text-slate-900 bg-white border-2 ${
                validationError
                  ? 'border-rose-500 focus:ring-rose-200'
                  : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
              } rounded-xl outline-none transition-all placeholder:text-slate-300 shadow-2xs`}
            />
          </div>

          {/* Validation Error Message */}
          {validationError && (
            <div className="flex items-center gap-1.5 mt-2.5 text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <p className="text-[11px] text-slate-500 mt-2">
            The value of units selected for redemption before applicable exit load and STT deductions.
          </p>
        </div>

        {/* Quick Option Buttons */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
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
                className={`py-3 px-3 text-xs font-bold font-mono rounded-xl border-2 transition-all ${
                  inputValue === opt.val.toString()
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
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
            className="w-full py-4 px-4 bg-slate-900 hover:bg-blue-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
          >
            <span>Review consequences</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
