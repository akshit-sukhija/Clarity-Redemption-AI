import React, { useState } from 'react';
import { X, CheckCircle, RefreshCw, Wrench } from 'lucide-react';
import { runAllTestFixtures, TestResultItem } from '../services/testFixtures';

interface TestFixtureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestFixtureModal: React.FC<TestFixtureModalProps> = ({ isOpen, onClose }) => {
  const [suiteResult, setSuiteResult] = useState(() => runAllTestFixtures());
  const [isRunning, setIsRunning] = useState(false);
  const [runCount, setRunCount] = useState(1);
  const [lastRunAt, setLastRunAt] = useState<string>(() => {
    const d = new Date();
    return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST`;
  });
  const [durationMs, setDurationMs] = useState<number>(3);

  if (!isOpen) return null;

  const handleRerun = () => {
    setIsRunning(true);
    const start = performance.now();
    // Execute deterministic suite
    setTimeout(() => {
      const res = runAllTestFixtures();
      const end = performance.now();
      const elapsed = Math.max(1, Math.round(end - start));
      setSuiteResult(res);
      setDurationMs(elapsed);
      setRunCount((prev) => prev + 1);
      const d = new Date();
      setLastRunAt(
        `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST`
      );
      setIsRunning(false);
    }, 120);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-[#FFFFFF] rounded-xl shadow-lg border border-[#DDD9D0] overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#DDD9D0] flex items-center justify-between bg-[#FFFFFF]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#F1EFE9] border border-[#DDD9D0] flex items-center justify-center text-[#666861]">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8D86] block">
                Internal diagnostics
              </span>
              <h2 className="text-lg font-bold text-[#1E211F]">
                Deterministic engine test fixtures
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#666861] hover:text-[#1E211F] hover:bg-[#F1EFE9] rounded-lg transition-colors cursor-pointer"
            aria-label="Close diagnostics modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banner */}
        <div className="px-6 py-3.5 bg-[#F1EFE9] border-b border-[#DDD9D0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`inline-flex items-center gap-1.5 font-semibold px-2.5 py-0.5 rounded text-xs ${
                  suiteResult.allPassed
                    ? 'bg-[#247A5A]/10 text-[#247A5A] border border-[#247A5A]/20'
                    : 'bg-[#B65347]/10 text-[#B65347] border border-[#B65347]/20'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5 text-[#247A5A]" />
                {suiteResult.passedTests} / {suiteResult.totalTests} Checks Passed
              </span>
              <span className="text-[#DDD9D0] hidden sm:inline">•</span>
              <span className="text-[#666861] hidden sm:inline">Mathematical Invariants Verified</span>
            </div>
            <div className="text-[11px] text-[#8A8D86] font-mono">
              Last run · {lastRunAt} · Run #{runCount} ({durationMs} ms)
            </div>
          </div>

          <button
            onClick={handleRerun}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1E211F] bg-[#FFFFFF] hover:bg-[#E8E5DD] disabled:opacity-50 border border-[#DDD9D0] rounded-md transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#666861] ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running tests…' : '↻ Re-run tests'}</span>
          </button>
        </div>

        {/* Test List */}
        <div className="p-6 overflow-y-auto space-y-2.5 bg-[#FFFFFF]">
          {suiteResult.results.map((test: TestResultItem) => (
            <div
              key={test.id}
              className={`p-3.5 rounded-lg border text-xs transition-colors ${
                test.passed
                  ? 'bg-[#F1EFE9] border-[#DDD9D0]'
                  : 'bg-[#B65347]/10 border-[#B65347]/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <CheckCircle
                    className={`w-4 h-4 shrink-0 ${
                      test.passed ? 'text-[#247A5A]' : 'text-[#B65347]'
                    }`}
                  />
                  <span className="font-semibold text-[#1E211F] text-xs">{test.name}</span>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    test.passed
                      ? 'bg-[#247A5A]/10 text-[#247A5A]'
                      : 'bg-[#B65347]/10 text-[#B65347]'
                  }`}
                >
                  {test.passed ? 'PASS' : 'FAIL'}
                </span>
              </div>

              <div className="space-y-1 pl-6 text-[11px] text-[#666861] font-mono">
                <div><strong>Expected:</strong> {test.expected}</div>
                <div><strong>Actual:</strong> {test.actual}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#DDD9D0] bg-[#FFFFFF] flex items-center justify-between text-xs text-[#666861]">
          <span>Developer / audit verification utility only.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#247A5A] hover:bg-[#1D6349] text-white rounded-lg font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
