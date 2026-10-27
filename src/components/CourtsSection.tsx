import { useState } from 'react';
import { Landmark, MapPin, Scale, Shield, FileText, ChevronRight } from 'lucide-react';
import { COURT_FORUMS } from '../data/legalData';
import { CourtForum } from '../types';

export default function CourtsSection() {
  const [selectedForum, setSelectedForum] = useState<CourtForum>(COURT_FORUMS[0]);

  return (
    <section id="courts" className="py-24 bg-[#050a18] relative border-t border-[#c5a880]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#d8be98] font-semibold mb-3">
            <span>Jurisdictional Presence</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Benches & Tribunals</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mb-4">
            Courts & Legal Expertise
          </h2>
          <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed">
            Direct courtroom and tribunal advocacy based in Chandigarh and actively practicing across Chandigarh, Punjab, Haryana, and Delhi, representing clients before constitutional, statutory, and appellate benches.
          </p>
        </div>

        {/* 2-Column Split: Forum Selector + Detailed Judicial Scope Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive List of Judicial Forums */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {COURT_FORUMS.map((forum) => {
              const isSelected = selectedForum.id === forum.id;
              return (
                <button
                  key={forum.id}
                  onClick={() => setSelectedForum(forum)}
                  className={`text-left p-4.5 rounded-xl border transition-all duration-200 flex items-center justify-between group ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#101c3d] to-[#0c1630] border-[#c5a880] shadow-lg shadow-[#c5a880]/10'
                      : 'bg-[#091126] border-white/5 hover:border-white/20 hover:bg-[#0d1836]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'bg-[#c5a880] text-[#070d1e]' : 'bg-white/5 text-[#d8be98] group-hover:bg-[#c5a880]/20'
                    }`}>
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-serif font-bold text-white leading-tight">
                        {forum.name}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                        <MapPin className="w-3 h-3 text-[#c5a880]" />
                        <span>{forum.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <ChevronRight className={`w-4 h-4 transition-transform ${
                    isSelected ? 'text-[#c5a880] translate-x-1' : 'text-slate-600 group-hover:text-slate-300'
                  }`} />
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Forum In-Depth Profile */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-gradient-to-b from-[#0f1d40] to-[#070d1e] border border-[#c5a880]/30 p-6 sm:p-8 shadow-2xl relative">
              
              {/* Forum Classification Unboxed Text */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4 mb-6">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#d8be98] font-semibold block">
                    {selectedForum.type}
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-white mt-1">
                    {selectedForum.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  <MapPin className="w-3.5 h-3.5 text-[#c5a880]" />
                  <span>{selectedForum.location}</span>
                </div>
              </div>

              {/* Forum Description */}
              <div className="mb-6">
                <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                  Institutional Jurisdiction
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {selectedForum.description}
                </p>
              </div>

              {/* Varun's Scope of Representation */}
              <div className="mb-6 p-4 rounded-xl bg-[#09122a] border border-[#c5a880]/20">
                <h4 className="text-xs uppercase tracking-wider text-[#d8be98] font-semibold mb-2 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#c5a880]" />
                  Advocate Varun Aggarwal’s Appearance Scope
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {selectedForum.varunScope}
                </p>
              </div>

              {/* Bench Structure */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Bench Configuration & Procedural Standards
                </h4>
                <p className="text-xs text-slate-300">
                  {selectedForum.benchDetails}
                </p>
              </div>

              {/* Verification Seal */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span>Bar Council of Punjab & Haryana</span>
                <span className="text-[#d8be98]">Authorized Courtroom Practitioner</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
