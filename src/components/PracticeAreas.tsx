import { useState, useEffect } from 'react';
import { 
  Scale, 
  ShieldAlert, 
  Building2, 
  Briefcase, 
  FileCheck, 
  FileText, 
  ShieldCheck, 
  HeartHandshake, 
  ArrowRight, 
  X, 
  CheckCircle2, 
  BookOpen,
  ReceiptText,
  Gavel,
  Globe,
  Shield
} from 'lucide-react';
import { PRACTICE_AREAS } from '../data/legalData';
import { PracticeArea } from '../types';

interface PracticeAreasProps {
  onSelectPracticeForBooking: (practiceTitle: string) => void;
}

export default function PracticeAreas({ onSelectPracticeForBooking }: PracticeAreasProps) {
  const [selectedPractice, setSelectedPractice] = useState<PracticeArea | null>(null);

  // Sync with initial URL hash if pointing to a practice area
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const match = PRACTICE_AREAS.find((p) => p.id === hash);
      if (match) {
        setSelectedPractice(match);
        if (typeof (window as unknown as { __syncPracticeAreaMeta?: (k: string) => void }).__syncPracticeAreaMeta === 'function') {
          (window as unknown as { __syncPracticeAreaMeta: (k: string) => void }).__syncPracticeAreaMeta(match.id);
        }
      }
    }
  }, []);

  const handleOpenPractice = (practice: PracticeArea) => {
    setSelectedPractice(practice);
    window.history.replaceState(null, '', '#' + practice.id);
    if (typeof (window as unknown as { __syncPracticeAreaMeta?: (k: string) => void }).__syncPracticeAreaMeta === 'function') {
      (window as unknown as { __syncPracticeAreaMeta: (k: string) => void }).__syncPracticeAreaMeta(practice.id);
    }
  };

  const handleClosePractice = () => {
    setSelectedPractice(null);
    window.history.replaceState(null, '', window.location.pathname);
    if (typeof (window as unknown as { __syncPracticeAreaMeta?: (k: string | null) => void }).__syncPracticeAreaMeta === 'function') {
      (window as unknown as { __syncPracticeAreaMeta: (k: string | null) => void }).__syncPracticeAreaMeta(null);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Scale': return <Scale className="w-6 h-6" />;
      case 'ShieldAlert': return <ShieldAlert className="w-6 h-6" />;
      case 'Building2': return <Building2 className="w-6 h-6" />;
      case 'Briefcase': return <Briefcase className="w-6 h-6" />;
      case 'FileCheck': return <FileCheck className="w-6 h-6" />;
      case 'FileText': return <FileText className="w-6 h-6" />;
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6" />;
      case 'HeartHandshake': return <HeartHandshake className="w-6 h-6" />;
      case 'ReceiptText': return <ReceiptText className="w-6 h-6" />;
      case 'Gavel': return <Gavel className="w-6 h-6" />;
      case 'Globe': return <Globe className="w-6 h-6" />;
      case 'Shield': return <Shield className="w-6 h-6" />;
      default: return <Scale className="w-6 h-6" />;
    }
  };

  return (
    <section id="practice-areas" className="py-24 bg-[#070d1e] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#d8be98] font-semibold mb-3">
            <span>Specialized Legal Practice</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Litigation & Advisory</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mb-4">
            Practice Areas & Legal Services
          </h2>
          <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed">
            Delivering precise statutory strategy, aggressive representation, and thorough transactional documentation across complex legal arenas.
          </p>
        </div>

        {/* 12 Interactive 3D Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 perspective-1200">
          {PRACTICE_AREAS.map((practice, index) => (
            <div
              key={practice.id}
              onClick={() => handleOpenPractice(practice)}
              className="group relative rounded-2xl bg-gradient-to-b from-[#0e1a38] to-[#070f24] border border-[#c5a880]/20 hover:border-[#c5a880]/60 p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1.5 shadow-xl hover:shadow-[#c5a880]/10 glass-panel-hover"
            >
              <div>
                {/* Editorial Human Numbering */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#c5a880]/15 border border-[#c5a880]/30 flex items-center justify-center text-[#ebd8ba] group-hover:scale-110 group-hover:bg-[#c5a880] group-hover:text-[#070d1e] transition-all duration-300">
                    {getIcon(practice.iconName)}
                  </div>
                  <span className="text-xs font-mono text-slate-400 group-hover:text-[#d8be98] transition-colors">
                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-serif font-bold text-white group-hover:text-[#ebd8ba] transition-colors mb-2.5 leading-snug">
                  {practice.title}
                </h3>

                {/* Short Description */}
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
                  {practice.shortDesc}
                </p>
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#d8be98] font-medium">
                <span>View Full Scope</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Interactive Detail Modal / Drawer */}
      {selectedPractice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#09122a] border border-[#c5a880]/40 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            
            {/* Close Button */}
            <button
              onClick={handleClosePractice}
              className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#c5a880]/20 border border-[#c5a880]/40 flex items-center justify-center text-[#ebd8ba]">
                {getIcon(selectedPractice.iconName)}
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#d8be98] font-semibold block">Practice Domain</span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">{selectedPractice.title}</h3>
              </div>
            </div>

            {/* Comprehensive Description */}
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {selectedPractice.fullDesc}
            </p>

            {/* Key Services & Approach */}
            <div className="mb-6">
              <h4 className="text-xs uppercase tracking-wider text-[#d8be98] font-semibold mb-3">
                Key Services & Judicial Remedies
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
                {selectedPractice.keyServices.map((service, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white/5 p-2.5 rounded-lg border border-white/5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a880] shrink-0 mt-0.5" />
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Governing Statutes & Laws */}
            <div className="mb-6">
              <h4 className="text-xs uppercase tracking-wider text-[#d8be98] font-semibold mb-2">
                Governing Acts & Statutes
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedPractice.statutes.map((statute, idx) => (
                  <span
                    key={idx}
                    className="text-xs text-slate-300 bg-[#060b18] px-3 py-1.5 rounded-md border border-white/10 font-mono"
                  >
                    {statute}
                  </span>
                ))}
              </div>
            </div>

            {/* Primary Forums */}
            <div className="mb-8 p-3.5 rounded-lg bg-[#060b18] border border-white/10 text-xs text-slate-300">
              <span className="text-slate-400 font-medium block mb-1">Adjudicating Forums & Benches:</span>
              <span className="text-white font-medium">{selectedPractice.forums.join(' · ')}</span>
            </div>

            {/* CTA in Modal */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
              <button
                onClick={handleClosePractice}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-medium text-slate-400 hover:text-white"
              >
                Close Details
              </button>
              
              <button
                onClick={() => {
                  const title = selectedPractice.title;
                  handleClosePractice();
                  onSelectPracticeForBooking(title);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#070d1e] bg-gradient-to-r from-[#d8be98] to-[#c5a880] rounded-lg hover:from-white hover:to-[#ebd8ba] shadow-lg transition-all"
              >
                <span>Schedule Consultation for this Matter</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
