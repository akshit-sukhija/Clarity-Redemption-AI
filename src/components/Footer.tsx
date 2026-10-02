import React from 'react';
import { Info, BookOpen, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenRules: () => void;
  onOpenGlossary: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenRules, onOpenGlossary }) => {
  return (
    <footer className="mt-auto border-t border-[#26385A] bg-[#0D1626] py-8 text-center text-xs text-slate-400">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-3">
        <p className="max-w-2xl mx-auto leading-relaxed text-slate-400 font-medium">
          Prototype uses illustrative data and stops before transaction confirmation. It is not investment advice or a transaction confirmation.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-300">
          <button
            onClick={onOpenRules}
            className="hover:text-blue-400 flex items-center gap-1 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Statutory Rules Reference</span>
          </button>
          <span>•</span>
          <button
            onClick={onOpenGlossary}
            className="hover:text-blue-400 flex items-center gap-1 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>Approved Glossary</span>
          </button>
          <span>•</span>
          <span className="font-mono text-slate-500">Fixed As-of Date: 2026-10-01</span>
        </div>
      </div>
    </footer>
  );
};
