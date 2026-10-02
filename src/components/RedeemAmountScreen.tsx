import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, AlertCircle, Info } from 'lucide-react';
import { DEMO_FUND } from '../data/fundData';
import { formatCurrency } from '../services/calculationEngine';

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
        `Amount cannot exceed available holding value of ${formatCurrency(availableHolding)}.`
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
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#666861] hover:text-[#1E211F] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to scheme details
      </button>

      {/* Screen Title */}
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8D86] block mb-1">
          Redemption amount
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1E211F] tracking-tight">
          How much do you intend to redeem?
        </h1>
        <p className="text-sm text-[#666861] mt-1">
          Enter an amount or adjust the slider to see its estimated consequences before continuing.
        </p>
      </div>

      {/* Main Entry Card */}
      <div className="bg-[#FFFFFF] border border-[#DDD9D0] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Available Holding Context Banner */}
        <div className="p-4 bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg flex items-center justify-between text-xs">
          <div>
            <span className="text-[#8A8D86] block">Available holding value</span>
            <strong className="text-base font-bold font-mono text-[#1E211F]">
              {formatCurrency(availableHolding)}
            </strong>
          </div>
          <div className="text-right text-[#666861]">
            <span className="block font-mono">{DEMO_FUND.totalUnits} units</span>
            <span className="text-[11px] text-[#8A8D86]">@ {formatCurrency(DEMO_FUND.illustrativeNAV)}</span>
          </div>
        </div>

        {/* Amount Input Field */}
        <div className="space-y-2">
          <label htmlFor="redemption-amount" className="block text-xs font-semibold text-[#1E211F]">
            Redemption amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[#666861]">
              ₹
            </span>
            <input
              id="redemption-amount"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 50,000"
              value={inputValue}
              onChange={handleInputChange}
              className="w-full bg-[#FFFFFF] border border-[#DDD9D0] rounded-lg pl-9 pr-4 py-3 text-xl font-bold font-mono text-[#1E211F] placeholder-[#8A8D86] focus:outline-none focus:border-[#247A5A] transition-colors"
            />
          </div>

          {validationError && (
            <div className="flex items-center gap-1.5 text-xs text-[#B65347] pt-1">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Range Slider for Amount Exploration */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-[#666861]">
            Adjust with slider
          </label>
          <input
            type="range"
            min="1000"
            max={availableHolding}
            step="1000"
            value={currentNumeric || 0}
            onChange={handleSliderChange}
            className="w-full cursor-pointer"
            aria-label="Adjust redemption amount"
          />
          <div className="flex justify-between text-[11px] font-mono text-[#8A8D86]">
            <span>Min: ₹1,000</span>
            <span>Max: {formatCurrency(availableHolding)}</span>
          </div>
        </div>

        {/* Quick Amount Chips */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold text-[#666861] block">
            Quick amounts:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
            {[25000, 50000, 75000, availableHolding].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleQuickSelect(amt)}
                className={`py-2 px-3 rounded-lg border text-center transition-colors cursor-pointer ${
                  currentNumeric === amt
                    ? 'border-[#247A5A] bg-[#247A5A]/10 text-[#247A5A] font-bold'
                    : 'border-[#DDD9D0] bg-[#F1EFE9] text-[#1E211F] hover:bg-[#E8E5DD]'
                }`}
              >
                {amt === availableHolding ? 'Full amount' : formatCurrency(amt, 0)}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-[#DDD9D0]">
          <button
            type="button"
            onClick={handleReviewConsequences}
            className="w-full py-3.5 px-4 bg-[#247A5A] hover:bg-[#1D6349] text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <span>Review consequences</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
