import { useState } from 'react';
import { ArrowRight, ShieldCheck, Scale, Award, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import ThreeJusticeScene from './ThreeJusticeScene';
import { LAWYER_PROFILE } from '../data/legalData';

interface HeroProps {
  onOpenBooking: () => void;
  onExplorePractice: () => void;
}

export default function Hero({ onOpenBooking, onExplorePractice }: HeroProps) {
  const [cardMousePos, setCardMousePos] = useState({ x: 0, y: 0 });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setCardMousePos({ x: x * 14, y: -y * 14 });
  };

  const handleCardMouseLeave = () => {
    setCardMousePos({ x: 0, y: 0 });
  };

  return (
    <section className="relative min-h-[92vh] pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden flex flex-col justify-center">
      {/* Background Architectural Atmosphere & Radial Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-[#1a2d5a]/25 blur-[140px] rounded-full" />
        <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] bg-[#c5a880]/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-[#0c1a3b]/40 blur-[100px] rounded-full" />
        
        {/* Subtle geometric architectural lines */}
        <div 
          className="absolute inset-0 opacity-[0.035]" 
          style={{
            backgroundImage: `linear-gradient(to right, #c5a880 1px, transparent 1px), linear-gradient(to bottom, #c5a880 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* Hero 2-Column Split: Editorial Legal Statement & Interactive 3D Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Value Proposition & Advocate Credentials */}
          <div className="lg:col-span-7 flex flex-col items-start">
            
            {/* Clean unboxed metadata kicker with Website & Lawyer Identity */}
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-[#d8be98] font-semibold mb-4">
              <span className="text-white font-bold">Varun Law Firm</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Chambers of Advocate Varun Aggarwal (LL.M)</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Punjab & Haryana High Court</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-[#ebd8ba]">Chandigarh · Punjab · Haryana · Delhi</span>
            </div>

            {/* Hero Headline with clamp and balance */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[1.12] mb-6 [text-wrap:balance]">
              Strategic Legal Counsel.<br />
              <span className="gold-gradient-text font-normal italic">
                Chambers of Advocate Varun Aggarwal
              </span>
            </h1>

            {/* Concrete Value Statement with top legal issues for Google ranking */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mb-8 font-light">
              Led by <strong className="text-white font-medium">Advocate Varun Aggarwal (LL.M)</strong>, <strong className="text-white font-medium">Varun Law Firm</strong> delivers formidable litigation before the{' '}
              <strong className="text-white font-medium">Punjab & Haryana High Court</strong>,{' '}
              <strong className="text-white font-medium">DRT Debt Recovery Tribunals</strong>,{' '}
              <strong className="text-white font-medium">RERA Authorities</strong>,{' '}
              <strong className="text-white font-medium">Sec. 138 Cheque Bounce Courts</strong>,{' '}
              <strong className="text-white font-medium">Criminal Bail & FIR Quashing Benches</strong>,{' '}
              <strong className="text-white font-medium">High Court Marriage Protection</strong>, and{' '}
              <strong className="text-white font-medium">NRI Property Dispute Forums</strong> across Chandigarh, Punjab, Haryana, and Delhi.
            </p>

            {/* Primary Action Buttons + Direct Call & WhatsApp */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mb-6">
              <button
                onClick={onOpenBooking}
                className="inline-flex items-center justify-center gap-3 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-[#070d1e] bg-gradient-to-r from-[#d8be98] to-[#c5a880] rounded-md hover:from-white hover:to-[#ebd8ba] shadow-xl shadow-[#c5a880]/20 transition-all duration-200 active:scale-95 whitespace-nowrap group"
              >
                <span>Schedule Consultation</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${LAWYER_PROFILE.phone}`}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3.5 text-xs font-semibold text-white bg-[#0e172e] hover:bg-[#132042] border border-[#c5a880]/30 hover:border-[#c5a880]/60 rounded-md transition-all shadow-sm"
                  title="Call Advocate Varun Aggarwal"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Call: 8950503055</span>
                </a>

                <a
                  href={`https://wa.me/${LAWYER_PROFILE.whatsappNumber}?text=Hello%20Advocate%20Varun%20Aggarwal,%20I%20would%20like%20to%20consult%20regarding%20a%20legal%20matter.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3.5 text-xs font-semibold text-emerald-300 hover:text-white bg-[#25D366]/15 hover:bg-[#25D366]/30 border border-[#25D366]/40 rounded-md transition-all shadow-sm"
                  title="WhatsApp Consultation"
                >
                  <span>WhatsApp Chat</span>
                </a>
              </div>
            </div>

            {/* Quote / Legal Motto */}
            <div className="border-l-2 border-[#c5a880]/60 pl-4 py-1 text-slate-300 text-sm italic font-serif">
              "{LAWYER_PROFILE.motto}"
              <span className="block not-italic text-xs text-slate-400 font-sans mt-1">
                — Adv. Varun Aggarwal, Master of Laws (LL.M)
              </span>
            </div>
          </div>

          {/* Right Column: Interactive 3D Justice Installation & Layered Advocate Card */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* 3D WebGL Canvas Layer */}
            <div className="relative w-full aspect-square max-w-[460px] flex items-center justify-center">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-[#0f1d40]/40 to-[#070d1e]/80 border border-[#c5a880]/20 shadow-2xl overflow-hidden">
                <ThreeJusticeScene className="w-full h-full" />
              </div>

              {/* Floating 3D Interactive Badge (Layered Depth) */}
              <div
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                style={{
                  transform: `perspective(1000px) rotateY(${cardMousePos.x}deg) rotateX(${cardMousePos.y}deg)`,
                  transition: 'transform 0.15s ease-out',
                }}
                className="absolute -bottom-6 -left-4 sm:-bottom-8 sm:-left-6 max-w-[280px] p-4 rounded-xl glass-panel border border-[#c5a880]/30 shadow-2xl backdrop-blur-xl z-20 cursor-default"
              >
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-11 h-11 rounded-lg border border-[#c5a880]/60 overflow-hidden shrink-0 shadow-md bg-[#0a1226]">
                    <img
                      src="/assets/aistudio/Gemini_Generated_Image_lq2uhjlq2uhjlq2u_aed156f1.png"
                      alt="Adv. Varun Aggarwal"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-[center_20%]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/office_desk.jpg';
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white leading-tight">Adv. Varun Aggarwal</h4>
                    <p className="text-[11px] text-[#c5a880]">High Court Advocate (LL.M)</p>
                  </div>
                </div>
                <div className="text-[11px] text-slate-300 border-t border-white/10 pt-2 flex items-center justify-between">
                  <span>Advocate & Legal Counsel</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 inline" /> Verified Counsel
                  </span>
                </div>
              </div>

              {/* Floating Chambers Badge */}
              <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 px-3.5 py-2 rounded-lg glass-panel border border-[#c5a880]/30 text-xs text-slate-200 shadow-xl flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#c5a880]" />
                <span className="font-medium">Chandigarh · Punjab · Haryana · Delhi</span>
              </div>
            </div>

          </div>
        </div>

        {/* Full-Width 4-Column Proof & Adjacency Strip Below Split */}
        <div className="mt-16 pt-10 border-t border-[#c5a880]/15 grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-slate-400 mb-1">Active Jurisdiction</span>
            <span className="text-xl sm:text-2xl font-serif font-bold text-white">4 Regions</span>
            <span className="text-xs text-slate-400 mt-0.5">Chandigarh · Punjab · Haryana · Delhi</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-slate-400 mb-1">Academic Credential</span>
            <span className="text-xl sm:text-2xl font-serif font-bold text-white">Master of Laws (LL.M)</span>
            <span className="text-xs text-slate-400 mt-0.5">Kurukshetra University</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-slate-400 mb-1">Tribunal Exposure</span>
            <span className="text-xl sm:text-2xl font-serif font-bold text-white">5+ Judicial Forums</span>
            <span className="text-xs text-slate-400 mt-0.5">High Court · DRT · RERA · CAT · Consumer</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-slate-400 mb-1">Privilege Guarantee</span>
            <span className="text-xl sm:text-2xl font-serif font-bold text-white">100% Confidential</span>
            <span className="text-xs text-slate-400 mt-0.5">Sec. 126 Evidence Act Privilege</span>
          </div>

        </div>

      </div>
    </section>
  );
}
