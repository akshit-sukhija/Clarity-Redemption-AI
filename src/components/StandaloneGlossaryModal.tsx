import React, { useState, useEffect, useRef } from 'react';
import { X, BookOpen, ShieldCheck, Search } from 'lucide-react';
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
      className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity"
    >
      <div className="relative w-full max-w-3xl bg-[#FFFFFF] rounded-xl shadow-lg border border-[#DDD9D0] overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#DDD9D0] flex items-center justify-between bg-[#FFFFFF]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#F1EFE9] border border-[#DDD9D0] flex items-center justify-center text-[#666861]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8D86] block">
                Reference surface
              </span>
              <h2 id="glossary-modal-title" className="text-lg font-bold text-[#1E211F]">
                Financial glossary & scheme rules
              </h2>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1.5 text-[#666861] hover:text-[#1E211F] hover:bg-[#F1EFE9] rounded-lg transition-colors cursor-pointer"
            aria-label="Close glossary reference"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="px-6 py-3.5 bg-[#F1EFE9] border-b border-[#DDD9D0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex rounded-lg bg-[#E8E5DD] p-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('glossary')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'glossary'
                  ? 'bg-[#247A5A] text-white shadow-xs'
                  : 'text-[#666861] hover:text-[#1E211F]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Terms glossary ({STATIC_GLOSSARY.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'rules'
                  ? 'bg-[#247A5A] text-white shadow-xs'
                  : 'text-[#666861] hover:text-[#1E211F]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Scheme & statutory rules ({RULE_VERIFICATION_SOURCES.length})</span>
            </button>
          </div>

          {/* Search Filter */}
          <div className="relative sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A8D86]">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              placeholder="Filter terms or rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FFFFFF] text-[#1E211F] placeholder-[#8A8D86] rounded-md border border-[#DDD9D0] focus:outline-none focus:border-[#247A5A]"
            />
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FFFFFF]">
          {activeTab === 'glossary' && (
            <div className="space-y-3">
              <div className="text-xs text-[#666861] pb-1">
                Standard financial terminology used throughout the Clarity redemption prototype:
              </div>

              {filteredGlossary.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8A8D86] bg-[#F1EFE9] rounded-lg border border-[#DDD9D0]">
                  No glossary terms match "{searchQuery}".
                </div>
              ) : (
                filteredGlossary.map((item: GlossaryTerm) => (
                  <div
                    key={item.term}
                    className="p-4 bg-[#F1EFE9] rounded-lg border border-[#DDD9D0] space-y-1"
                  >
                    <h3 className="text-xs font-bold text-[#1E211F] font-sans">
                      {item.term}
                    </h3>
                    <p className="text-xs text-[#666861] leading-relaxed">
                      {item.definition}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#F1EFE9] border border-[#DDD9D0] rounded-lg text-xs text-[#666861]">
                <div className="flex items-center gap-1.5 font-bold text-[#1E211F] mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#247A5A]" />
                  <span>Scheme & statutory evidence register</span>
                </div>
                Deduction rates and holding windows mapped directly to statutory provisions and scheme specifications.
              </div>

              {filteredRules.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8A8D86] bg-[#F1EFE9] rounded-lg border border-[#DDD9D0]">
                  No statutory rules match "{searchQuery}".
                </div>
              ) : (
                filteredRules.map((rule: RuleVerificationSource) => (
                  <div
                    key={rule.ruleName}
                    className="p-4 bg-[#F1EFE9] rounded-lg border border-[#DDD9D0] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8A8D86]">
                        {rule.category}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-[#247A5A]/10 text-[#247A5A]">
                        {rule.verificationStatus}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#1E211F]">
                      {rule.ruleName}
                    </h4>

                    <div className="space-y-0.5 text-[11px] text-[#666861]">
                      <div><strong>Authority:</strong> {rule.sourceOrganization}</div>
                      <div><strong>Source document:</strong> {rule.sourceDocument}</div>
                      <div><strong>Applicability:</strong> {rule.applicabilityConditions}</div>
                    </div>

                    <p className="pt-2 border-t border-[#DDD9D0] text-[11px] text-[#666861] leading-relaxed">
                      {rule.summary}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#DDD9D0] bg-[#FFFFFF] flex items-center justify-between text-xs text-[#666861]">
          <span>Scenario as-of date: 2026-10-01</span>
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
