import { useState, useEffect } from 'react';
import { Scale, ShieldCheck } from 'lucide-react';

export default function BarCouncilModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show disclaimer if not previously acknowledged in this session
    const acknowledged = sessionStorage.getItem('bci_disclaimer_accepted');
    if (!acknowledged) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    sessionStorage.setItem('bci_disclaimer_accepted', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl bg-[#09122a] border border-[#c5a880]/40 rounded-2xl p-6 sm:p-8 shadow-2xl">
        
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#c5a880]/15 border border-[#c5a880]/30 flex items-center justify-center text-[#ebd8ba] shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-white">
              Bar Council of India Disclaimer
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">Compliance with Rule 36, Advocates Act, 1961</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-light mb-6 border-t border-b border-white/10 py-4 max-h-60 overflow-y-auto">
          <p>
            Under the rules of the Bar Council of India, advocates are strictly prohibited from soliciting work or advertising their professional services in any form or manner.
          </p>
          <p>
            By accessing this website (<strong className="text-white">Varun Law Firm</strong>), the user acknowledges that:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-1 text-slate-200">
            <li>The user is seeking information regarding Advocate Varun Aggarwal voluntarily for their own knowledge.</li>
            <li>There has been no advertisement, personal communication, solicitation, invitation, or inducement of any sort whatsoever.</li>
            <li>The contents of this website do not constitute legal advice and do not create an advocate-client relationship.</li>
            <li>All appointment requests submitted are confidential communications subject to professional privilege.</li>
          </ul>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleAccept}
            className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#070d1e] bg-gradient-to-r from-[#d8be98] to-[#c5a880] hover:from-white hover:to-[#ebd8ba] rounded-lg transition-all shadow-md"
          >
            I Acknowledge & Agree
          </button>
        </div>

      </div>
    </div>
  );
}
