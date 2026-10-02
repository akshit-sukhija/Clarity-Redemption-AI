import React from 'react';
import { ShieldCheck, BookOpen } from 'lucide-react';

interface HeaderProps {
  onOpenTestFixtures: () => void;
  onOpenGlossary: () => void;
  activeScreen: string;
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenTestFixtures,
  onOpenGlossary,
  activeScreen,
  onNavigateHome,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0D1626]/95 backdrop-blur-md border-b border-[#26385A] shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-md"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-extrabold text-white text-base shadow-xs">
              C
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-[#F5F7FA] group-hover:text-blue-300 transition-colors font-sans">
                CLARITY
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] text-slate-400 font-medium">
                Mutual-fund decision intelligence
              </span>
            </div>
          </button>

          <div className="h-4 w-px bg-[#26385A] hidden sm:block" />

          {/* Persistent Subtle Badge */}
          <span className="inline-flex items-center text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#15233A] text-slate-300 border border-[#26385A]">
            PROTOTYPE · ILLUSTRATIVE DATA
          </span>
        </div>

        {/* Right side utility actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenGlossary}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#15233A] rounded-lg transition-colors flex items-center gap-1.5 border border-transparent hover:border-[#26385A]"
            title="View approved financial glossary"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Glossary</span>
          </button>

          <button
            onClick={onOpenTestFixtures}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 rounded-lg transition-colors shadow-2xs"
            title="Run programmatic verification against PDF test fixtures"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verification Suite</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>
      </div>
    </header>
  );
};
