import React from 'react';
import { BookOpen, ShieldCheck, Wrench } from 'lucide-react';

interface FooterProps {
  onOpenRules: () => void;
  onOpenGlossary: () => void;
  onOpenDiagnostics?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenRules,
  onOpenGlossary,
  onOpenDiagnostics,
}) => {
  return (
    <footer className="mt-auto border-t border-[#DDD9D0] bg-[#FFFFFF] py-8 text-center text-xs text-[#666861]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-3">
        <p className="max-w-2xl mx-auto leading-relaxed text-[#666861]">
          This prototype uses illustrative data to explore redemption consequences before transaction confirmation.
          It does not provide financial advice, recommend decisions, or execute orders.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-[#1E211F]">
          <button
            onClick={onOpenRules}
            className="hover:text-[#247A5A] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#666861]" />
            <span>Scheme & statutory rules</span>
          </button>
          <span className="text-[#DDD9D0]">•</span>
          <button
            onClick={onOpenGlossary}
            className="hover:text-[#247A5A] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#666861]" />
            <span>Financial glossary</span>
          </button>
          <span className="text-[#DDD9D0]">•</span>
          <span className="font-mono text-[#8A8D86]">Scenario date: 2026-10-01</span>

          {onOpenDiagnostics && (
            <>
              <span className="text-[#DDD9D0]">•</span>
              <button
                onClick={onOpenDiagnostics}
                className="text-[#8A8D86] hover:text-[#1E211F] flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
                title="Run automated deterministic verification fixtures"
              >
                <Wrench className="w-3 h-3 text-[#8A8D86]" />
                <span>Prototype diagnostics</span>
              </button>
            </>
          )}
        </div>
      </div>
    </footer>
  );
};
