import { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';
import { FAQ_ITEMS } from '../data/legalData';

export default function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0].id);

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-24 bg-[#050a18] relative border-t border-[#c5a880]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#d8be98] font-semibold mb-3">
            <span>Client Inquiries & Clarifications</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mb-4">
            Legal Consultations & Practice FAQ
          </h2>
          <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed">
            Essential information regarding representation procedures, attorney-client privilege, document preparation, and tribunal jurisdiction.
          </p>
        </div>

        {/* Accordion List */}
        <div className="max-w-4xl mx-auto space-y-3.5">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-[#0a142e] border-[#c5a880]/50 shadow-xl'
                    : 'bg-[#080f22] border-white/5 hover:border-white/15'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(item.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[#d8be98] font-medium shrink-0">
                      {item.category} ·
                    </span>
                    <h3 className="text-sm sm:text-base font-serif font-semibold text-white leading-snug">
                      {item.question}
                    </h3>
                  </div>

                  <div className={`p-1.5 rounded-full bg-white/5 text-[#ebd8ba] shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-[#c5a880] text-[#070d1e]' : ''
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 pt-0 text-xs sm:text-sm text-slate-300 leading-relaxed font-light border-t border-white/5 mt-1 pt-4">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
