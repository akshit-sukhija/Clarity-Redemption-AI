import React from 'react';
import { BookOpen } from 'lucide-react';

interface HeaderProps {
  onOpenGlossary: () => void;
  activeScreen: string;
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenGlossary,
  activeScreen,
  onNavigateHome,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#DDD9D0]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#247A5A] rounded-md"
          >
            <div className="w-7 h-7 rounded bg-[#1E211F] flex items-center justify-center font-bold text-white text-sm">
              C
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-[#1E211F] group-hover:text-[#247A5A] transition-colors font-sans">
                Clarity
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-[#666861] font-normal">
                Redemption consequence explorer
              </span>
            </div>
          </button>

          <div className="h-4 w-px bg-[#DDD9D0] hidden sm:block" />

          {/* Prototype badge */}
          <span className="inline-flex items-center text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-[#F1EFE9] text-[#666861] border border-[#DDD9D0]">
            Illustrative prototype
          </span>
        </div>

        {/* Right side utility actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenGlossary}
            className="px-3 py-1.5 text-xs font-semibold text-[#1E211F] hover:bg-[#F1EFE9] rounded-md transition-colors flex items-center gap-1.5 border border-[#DDD9D0]"
            title="View financial glossary and demo scheme rules"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#666861]" />
            <span>Glossary</span>
          </button>
        </div>
      </div>
    </header>
  );
};
