import React, { useState, useEffect, useRef } from 'react';
import { X, BookOpen, ShieldCheck, Search, FileText, CheckCircle2 } from 'lucide-react';
import { STATIC_GLOSSARY, RULE_VERIFICATION_SOURCES } from '../data/fundData';
import { GlossaryTerm, RuleVerificationSource } from '../types';

interface StandaloneGlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'glossary' | 'rules';
}

export const StandaloneGlossaryModal: React.FC<StandaloneGlossaryModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'glossary',
}) => {
  const [activeTab, setActiveTab] = useState<'glossary' | 'rules'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Sync initial tab when opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSearchQuery('');
      // Accessible focus
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialTab]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedQuery = searchQuery.toLowerCase().trim();

  const filteredGlossary = STATIC_GLOSSARY.filter(
    (item) =>
      item.term.toLowerCase().includes(normalizedQuery) ||
      item.definition.toLowerCase().includes(normalizedQuery)
  );

  const filteredRules = RULE_VERIFICATION_SOURCES.filter(
    (rule) =>
      rule.ruleName.toLowerCase().includes(normalizedQuery) ||
      rule.category.toLowerCase().includes(normalizedQuery) ||
      rule.summary.toLowerCase().includes(normalizedQuery) ||
      rule.sourceOrganization.toLowerCase().includes(normalizedQuery)
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="glossary-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity"
    >
      <div className="relative w-full max-w-3xl bg-[#15233A] rounded-3xl shadow-2xl border border-[#26385A] overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#26385A] flex items-center justify-between bg-[#101B2E] text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                Canonical Reference Surface
              </span>
              <h2 id="glossary-modal-title" className="text-lg font-bold text-[#F5F7FA]">
                Financial Glossary & Statutory Rules
              </h2>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            aria-label="Close glossary reference"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="px-6 py-3.5 bg-[#15233A] border-b border-[#26385A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex rounded-xl bg-[#101B2E] p-1 border border-[#26385A] text-xs font-bold">
            <button
              onClick={() => setActiveTab('glossary')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'glossary'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Terms Glossary ({STATIC_GLOSSARY.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'rules'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Statutory Rules ({RULE_VERIFICATION_SOURCES.length})</span>
            </button>
          </div>

          {/* Search Filter */}
          <div className="relative sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              placeholder="Filter terms or rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#101B2E] text-slate-200 placeholder-slate-500 rounded-lg border border-[#26385A] focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400"
            />
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'glossary' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 pb-1">
                Authoritative definitions from the approved CLARITY financial model. Concise, neutral, and without speculative claims.
              </div>

              {filteredGlossary.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-[#101B2E] rounded-xl border border-[#26385A]">
                  No glossary terms match "{searchQuery}".
                </div>
              ) : (
                filteredGlossary.map((item: GlossaryTerm) => (
                  <div
                    key={item.term}
                    className="p-4 bg-[#101B2E] rounded-xl border border-[#26385A] space-y-1.5 transition-colors hover:border-[#364B73]"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#F5F7FA] font-sans">
                        {item.term}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      {item.definition}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-200">
                <div className="flex items-center gap-1.5 font-bold mb-1 text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Approved Statutory Evidence Register</span>
                </div>
                All deduction formulas, holding windows, and tax levies are grounded in primary statutory acts and SEBI regulations.
              </div>

              {filteredRules.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-[#101B2E] rounded-xl border border-[#26385A]">
                  No statutory rules match "{searchQuery}".
                </div>
              ) : (
                filteredRules.map((rule: RuleVerificationSource) => (
                  <div
                    key={rule.ruleName}
                    className="p-4 bg-[#101B2E] rounded-2xl border border-[#26385A] space-y-2.5 transition-colors hover:border-[#364B73]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {rule.category}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded">
                        {rule.verificationStatus}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#F5F7FA] font-sans">
                      {rule.ruleName}
                    </h4>

                    <div className="space-y-1 text-[11px] text-slate-300">
                      <div>
                        <strong className="text-slate-400">Authority: </strong>
                        {rule.sourceOrganization}
                      </div>
                      <div>
                        <strong className="text-slate-400">Statutory Citation: </strong>
                        {rule.sourceDocument}
                      </div>
                      <div>
                        <strong className="text-slate-400">Applicability: </strong>
                        {rule.applicabilityConditions}
                      </div>
                    </div>

                    <p className="pt-2 border-t border-[#26385A] text-[11px] text-slate-400 italic leading-relaxed">
                      {rule.summary}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#26385A] bg-[#101B2E] flex items-center justify-between text-xs text-slate-400">
          <span>Single Canonical Dataset · Verified As of 2026-10-01</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors shadow-sm"
          >
            Close Reference
          </button>
        </div>
      </div>
    </div>
  );
};
