import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { runAllTestFixtures, TestResultItem } from '../services/testFixtures';

interface TestFixtureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestFixtureModal: React.FC<TestFixtureModalProps> = ({ isOpen, onClose }) => {
  const [suiteResult, setSuiteResult] = useState(() => runAllTestFixtures());

  if (!isOpen) return null;

  const handleRerun = () => {
    setSuiteResult(runAllTestFixtures());
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-[#15233A] rounded-3xl shadow-2xl border border-[#26385A] overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#26385A] flex items-center justify-between bg-[#101B2E] text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                Deterministic Engine Verification
              </span>
              <h2 className="text-lg font-bold text-[#F5F7FA]">
                Rule & Test Fixture Suite
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="Close test modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banner */}
        <div className="px-6 py-3.5 bg-[#15233A] border-b border-[#26385A] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-1.5 font-bold px-3 py-1 rounded-full text-xs ${
                suiteResult.allPassed
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              {suiteResult.passedTests} / {suiteResult.totalTests} Assertions Passed
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-300 font-semibold hidden sm:inline">100% Deterministic Arithmetic</span>
          </div>

          <button
            onClick={handleRerun}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-200 bg-[#101B2E] hover:bg-[#1A2C4A] border border-[#26385A] rounded-lg transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-run Suite</span>
          </button>
        </div>

        {/* Test List */}
        <div className="p-6 overflow-y-auto space-y-3 bg-[#0D1626]">
          {suiteResult.results.map((test: TestResultItem) => (
            <div
              key={test.id}
              className={`p-4 rounded-2xl border text-xs transition-colors ${
                test.passed
                  ? 'bg-[#15233A] border-[#26385A] hover:border-slate-500'
                  : 'bg-rose-950/40 border-rose-500/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle
                    className={`w-4 h-4 shrink-0 ${
                      test.passed ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  />
                  <span className="font-bold text-[#F5F7FA] text-xs sm:text-sm">{test.name}</span>
                </div>
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    test.passed
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {test.passed ? 'PASS' : 'FAIL'}
                </span>
              </div>

              <div className="space-y-1 font-mono text-[11px] pl-6 text-slate-300">
                <div>
                  <span className="text-slate-500 font-sans font-medium">Expected: </span>
                  {test.expected}
                </div>
                <div>
                  <span className="text-slate-500 font-sans font-medium">Actual: </span>
                  <span className="text-[#F5F7FA] font-bold">{test.actual}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#26385A] bg-[#101B2E] flex items-center justify-between text-xs text-slate-400">
          <span>All tests verify mathematical integrity without approximations.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
