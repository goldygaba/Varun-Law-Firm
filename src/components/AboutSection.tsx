import { useState, useRef, useEffect } from 'react';
import { Award, GraduationCap, Building2, Languages, BookOpen, CheckCircle, Briefcase, FileText, Scale, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { LAWYER_PROFILE } from '../data/legalData';

export default function AboutSection() {
  const [activeTab, setActiveTab] = useState<'profile' | 'experience' | 'education' | 'competencies'>('profile');
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const videoIframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Send postMessage command to YouTube iframe player
  const postToPlayer = (func: string, args: any = '') => {
    try {
      videoIframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    } catch (_) {}
  };

  // Ensure audio is unmuted and set to full volume whenever video plays
  const playWithAudio = () => {
    postToPlayer('unMute');
    postToPlayer('setVolume', [100]);
    postToPlayer('playVideo');
    setIsPlaying(true);
    setIsMuted(false);
  };

  // Scroll-based auto-play when in view, auto-pause when out of view
  useEffect(() => {
    const el = videoContainerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
            // In screen -> Auto play with audio ON
            playWithAudio();
          } else if (!entry.isIntersecting || entry.intersectionRatio < 0.2) {
            // Out of screen -> Auto pause
            postToPlayer('pauseVideo');
            setIsPlaying(false);
          }
        });
      },
      {
        threshold: [0, 0.15, 0.35, 0.6],
      }
    );

    observer.observe(el);

    // One-time interaction unlock to satisfy browser media policies
    const unlockAudio = () => {
      postToPlayer('unMute');
      postToPlayer('setVolume', [100]);
      setIsMuted(false);
    };

    window.addEventListener('click', unlockAudio, { once: true, passive: true });
    window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
    window.addEventListener('scroll', unlockAudio, { once: true, passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('scroll', unlockAudio);
    };
  }, []);

  const handleTogglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isPlaying) {
      postToPlayer('pauseVideo');
      setIsPlaying(false);
    } else {
      playWithAudio();
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMuted) {
      postToPlayer('unMute');
      postToPlayer('setVolume', [100]);
      setIsMuted(false);
    } else {
      postToPlayer('mute');
      setIsMuted(true);
    }
  };

  return (
    <section id="about" className="py-24 bg-[#050a18] relative border-t border-[#c5a880]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#d8be98] font-semibold mb-3">
            <span>Advocate Profile</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Biography & Credentials</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mb-4">
            Advocate Varun Aggarwal
          </h2>
          <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed">
            Advocate & Legal Consultant practicing before the Punjab & Haryana High Court, specialized debt recovery tribunals, RERA authorities, and administrative commissions.
          </p>
        </div>

        {/* 2-Column Layout: Visual Profile Card + Structured Biography */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Interactive 3D Visual Dossier Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-gradient-to-b from-[#0f1d40] to-[#070d1e] border border-[#c5a880]/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
              
              {/* Subtle gold accent lighting */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#c5a880]/10 blur-3xl pointer-events-none" />

              {/* Advocate Portrait Visual Showcase & Intro Video */}
              <div className="relative rounded-xl overflow-hidden mb-6 bg-[#0a1128] border border-[#c5a880]/20 flex flex-col items-center p-5 sm:p-6 text-center">
                {/* Advocate Portrait Image Showcase */}
                <div className="relative mb-3 group/img">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-2 border-[#c5a880] overflow-hidden shadow-2xl relative bg-[#0e1a38]">
                    <img 
                      src="/assets/aistudio/Gemini_Generated_Image_lq2uhjlq2uhjlq2u_aed156f1.png"
                      alt="Advocate Varun Aggarwal (LL.M) Executive Portrait"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-[center_20%] transition-transform duration-500 group-hover/img:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/office_desk.jpg';
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-md bg-[#c5a880] text-[#070d1e] font-bold text-[10px] tracking-wider shadow-lg border border-black/20">
                    LL.M
                  </div>
                </div>

                <h3 className="text-xl font-serif font-bold text-white mb-0.5">
                  Varun Aggarwal
                </h3>
                <p className="text-xs uppercase tracking-wider text-[#d8be98] font-medium mb-1">
                  Advocate & Legal Consultant
                </p>

                <p className="text-xs text-slate-300 italic mb-4 max-w-xs font-serif">
                  "Justice, Guidance and Practical Solutions"
                </p>

                {/* Introduction Video with Scroll Auto-Play / Pause and Clean Chrome */}
                <div ref={videoContainerRef} className="w-full mb-5">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#d8be98] font-semibold flex items-center gap-1.5">
                      <Play className="w-3 h-3 text-[#c5a880] fill-[#c5a880]" />
                      Introduction Video
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                      {isPlaying ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Auto-Playing
                        </span>
                      ) : (
                        <span className="text-slate-400">Paused on Scroll</span>
                      )}
                    </span>
                  </div>

                  <div 
                    onClick={() => handleTogglePlay()}
                    className="relative aspect-video w-full rounded-xl overflow-hidden border border-[#c5a880]/30 shadow-2xl bg-black group/video cursor-pointer select-none"
                    title={isPlaying ? "Click to Pause" : "Click to Play"}
                  >
                    {/* YouTube IFrame:
                        - controls=0: eliminates default YouTube controls
                        - modestbranding=1 & showinfo=0: removes branding & title
                        - rel=0: no outside related videos
                        - iv_load_policy=3: no annotations
                        - scale-[1.18] & -mt-[54px] h-[calc(100%+108px)]: crops outer 9% edges to eliminate corner AI watermarks
                    */}
                    <iframe
                      ref={videoIframeRef}
                      src="https://www.youtube.com/embed/LQMkvij6Smw?enablejsapi=1&autoplay=0&mute=0&controls=0&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0&disablekb=1&fs=0&playsinline=1&loop=1&playlist=LQMkvij6Smw"
                      title="Advocate Varun Aggarwal Introduction Video"
                      className="w-full h-[calc(100%+108px)] -mt-[54px] border-0 pointer-events-none scale-[1.18] origin-center"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />

                    {/* Corner Shields to eliminate any residual corner AI watermarks */}
                    <div className="absolute top-0 right-0 z-10 w-44 h-24 bg-gradient-to-bl from-black via-black/70 to-transparent pointer-events-none" />
                    <div className="absolute top-0 left-0 z-10 w-44 h-24 bg-gradient-to-br from-black via-black/70 to-transparent pointer-events-none" />
                    <div className="absolute bottom-0 right-0 z-10 w-56 h-28 bg-gradient-to-tl from-black via-black/85 to-transparent pointer-events-none" />
                    <div className="absolute bottom-0 left-0 z-10 w-48 h-24 bg-gradient-to-tr from-black via-black/75 to-transparent pointer-events-none" />

                    {/* Transparent Click Overlay to handle Play/Pause without external YouTube redirection */}
                    <div className="absolute inset-0 z-10" />

                    {/* Big Center Play Icon when paused */}
                    {!isPlaying && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all">
                        <div className="w-14 h-14 rounded-full bg-[#c5a880] text-[#070d1e] flex items-center justify-center shadow-xl shadow-black/60 group-hover/video:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-current ml-1" />
                        </div>
                      </div>
                    )}

                    {/* Bottom Custom Control Bar */}
                    <div className="absolute bottom-0 left-0 right-0 z-20 px-3 py-2.5 bg-gradient-to-t from-black via-black/90 to-transparent flex items-center justify-between pointer-events-auto">
                      {/* Play/Pause Button */}
                      <button
                        type="button"
                        onClick={handleTogglePlay}
                        className="px-2.5 py-1 rounded-md bg-black/60 hover:bg-[#c5a880] text-slate-200 hover:text-[#070d1e] border border-white/10 hover:border-[#c5a880] text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-current" />
                            <span className="text-[10px]">Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span className="text-[10px]">Play</span>
                          </>
                        )}
                      </button>

                      {/* Sound Mute/Unmute Button */}
                      <button
                        type="button"
                        onClick={handleToggleMute}
                        className="px-2.5 py-1 rounded-md bg-black/60 hover:bg-white/20 text-slate-200 hover:text-white border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        {isMuted ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-rose-300" />
                            <span className="text-[10px] text-rose-200">Unmute Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] text-emerald-300">Sound On</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Key Quick Facts */}
                <div className="w-full grid grid-cols-2 gap-2 text-left text-xs text-slate-300 border-t border-white/10 pt-4">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">Jurisdiction</span>
                    <strong className="text-white">Chd · Pb · Hry · Del</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">Bar Council</span>
                    <strong className="text-white">Punjab & Haryana</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">Chambers</span>
                    <strong className="text-white">Chandigarh</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">Languages</span>
                    <strong className="text-white">En, Hi, Pb</strong>
                  </div>
                </div>

              </div>

              {/* Bar Council Compliance Verified Stamp */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Award className="w-4 h-4 text-[#c5a880]" />
                  <span>Licensed Advocate under Advocates Act, 1961</span>
                </div>
                <span className="text-emerald-400 font-semibold text-[11px]">ACTIVE</span>
              </div>

            </div>
          </div>

          {/* Right Column: Tabbed Detailed Biography & Experience */}
          <div className="lg:col-span-7 flex flex-col">
            
            {/* Interactive Tab Navigation (Segmented Functional Buttons) */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#0a1128] border border-[#c5a880]/20 rounded-xl mb-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                  activeTab === 'profile'
                    ? 'bg-[#c5a880] text-[#070d1e] font-semibold shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Executive Summary
              </button>
              <button
                onClick={() => setActiveTab('experience')}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                  activeTab === 'experience'
                    ? 'bg-[#c5a880] text-[#070d1e] font-semibold shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Practice Experience
              </button>
              <button
                onClick={() => setActiveTab('education')}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                  activeTab === 'education'
                    ? 'bg-[#c5a880] text-[#070d1e] font-semibold shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Qualifications & Bar
              </button>
              <button
                onClick={() => setActiveTab('competencies')}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                  activeTab === 'competencies'
                    ? 'bg-[#c5a880] text-[#070d1e] font-semibold shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Core Competencies
              </button>
            </div>

            {/* Tab 1: Executive Summary */}
            {activeTab === 'profile' && (
              <div className="space-y-6 text-slate-300 leading-relaxed text-sm sm:text-base">
                <p>
                  <strong className="text-white font-medium">Advocate Varun Aggarwal</strong> is a dynamic, results-oriented litigation counsel with deep expertise across High Court civil proceedings, specialized financial recovery tribunals, real estate authority actions, and administrative service jurisprudence.
                </p>
                <p>
                  Recognized for persuasive courtroom advocacy, thorough statutory research, and relentless attention to procedural detail, Adv. Aggarwal provides clients with strategic clarity at every stage of their dispute—from pre-litigation notices and emergency stay applications to full-dress appellate arguments.
                </p>
                <p>
                  Operating out of Chandigarh and actively working across the entire Tricity (Chandigarh, Mohali, Panchkula) and surrounding regions, his practice regularly represents clients before the <span className="text-[#ebd8ba]">Punjab & Haryana High Court</span>, <span className="text-[#ebd8ba]">Debt Recovery Tribunal (DRT & DRAT)</span>, <span className="text-[#ebd8ba]">Criminal & Sessions Benches</span>, <span className="text-[#ebd8ba]">Haryana & Punjab RERA</span>, <span className="text-[#ebd8ba]">Central Administrative Tribunal (CAT)</span>, and handles specialized <span className="text-[#ebd8ba]">Section 138 NI Act</span>, <span className="text-[#ebd8ba]">Marriage Protection</span>, <span className="text-[#ebd8ba]">NRI Legal Matters</span>, and <span className="text-[#ebd8ba]">Family Law (498A, Maintenance & Custody)</span>.
                </p>

                {/* Key Philosophical Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div className="p-4 rounded-xl bg-[#0a1128] border border-white/5">
                    <h4 className="text-white font-serif font-semibold text-sm mb-1 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-[#c5a880]" />
                      Empirical Case Strategy
                    </h4>
                    <p className="text-xs text-slate-400">
                      Every argument is grounded in statutory provisions, recent High Court and Supreme Court precedents, and strict procedural compliance.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0a1128] border border-white/5">
                    <h4 className="text-white font-serif font-semibold text-sm mb-1 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#c5a880]" />
                      Rigorous Pleadings
                    </h4>
                    <p className="text-xs text-slate-400">
                      Precision drafting of petitions, applications, and legal notices that leave zero ambiguities for the opposing party to exploit.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Practice Experience & Courtroom Practice */}
            {activeTab === 'experience' && (
              <div className="space-y-6">
                <div className="p-5 rounded-xl bg-[#0a1128] border border-[#c5a880]/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#d8be98] font-mono block">Chambers Practice</span>
                      <h4 className="text-base font-serif font-bold text-white">Chambers of Advocate Varun Aggarwal</h4>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#c5a880]/15 text-[#ebd8ba] border border-[#c5a880]/30 text-[11px] font-mono">
                      Chandigarh Chambers
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Dedicated litigation practice appearing regularly before the Punjab & Haryana High Court, Debt Recovery Tribunals (DRT & DRAT), RERA authorities, Criminal & Sessions Courts, and Central Administrative Tribunal. Providing strategic dispute resolution, urgent stay petitions, and trial advocacy for businesses, NRIs, and individuals.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-slate-400 border-t border-white/5">
                    <span>Active Jurisdiction:</span>
                    <span className="text-[#ebd8ba]">Chandigarh</span>
                    <span>·</span>
                    <span className="text-[#ebd8ba]">Punjab</span>
                    <span>·</span>
                    <span className="text-[#ebd8ba]">Haryana</span>
                    <span>·</span>
                    <span className="text-[#ebd8ba]">Delhi</span>
                  </div>
                </div>

                {/* Key Highlight Bullets */}
                <div className="pt-2">
                  <h4 className="text-xs uppercase tracking-wider text-slate-400 mb-3">Key Practice Highlights</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                    {LAWYER_PROFILE.experienceHighlights.map((hl, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                        <CheckCircle className="w-3.5 h-3.5 text-[#c5a880] shrink-0 mt-0.5" />
                        <span className="leading-snug">{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Tab 3: Qualifications & Bar Credentials */}
            {activeTab === 'education' && (
              <div className="space-y-6">
                <div className="p-5 rounded-xl bg-[#0a1128] border border-[#c5a880]/20 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#c5a880]/15 flex items-center justify-center text-[#ebd8ba] shrink-0">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-[#d8be98] font-mono block">Postgraduate Credential</span>
                    <h4 className="text-base font-serif font-bold text-white">Master of Laws (LL.M)</h4>
                    <p className="text-xs text-slate-400">Kurukshetra University, Kurukshetra, Haryana</p>
                    <p className="text-xs text-slate-300 mt-2">
                      Advanced post-graduate specialization in constitutional jurisprudence, corporate legal structures, and procedural litigation statutes.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[#0a1128] border border-[#c5a880]/20 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#c5a880]/15 flex items-center justify-center text-[#ebd8ba] shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-[#d8be98] font-mono block">Bar Council Admission</span>
                    <h4 className="text-base font-serif font-bold text-white">Bar Council of Punjab & Haryana</h4>
                    <p className="text-xs text-slate-400">Enrolled Advocate & Legal Counsel</p>
                    <p className="text-xs text-slate-300 mt-2">
                      Advocate empowered to practice in High Courts, Subordinate Courts, and Tribunals across the Republic of India under the Advocates Act, 1961.
                    </p>
                  </div>
                </div>

                {/* Linguistic Proficiencies */}
                <div className="p-5 rounded-xl bg-[#0a1128] border border-white/5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-[#c5a880] shrink-0">
                    <Languages className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Language Proficiencies</h4>
                    <p className="text-xs text-slate-400">Fluent in English, Hindi, and Punjabi for seamless client consultation and bilingual courtroom proceedings.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Core Competencies */}
            {activeTab === 'competencies' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LAWYER_PROFILE.coreCompetencies.map((comp, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-[#0a1128] border border-white/10 hover:border-[#c5a880]/40 transition-colors flex items-center gap-3 text-xs text-slate-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880]" />
                    <span className="font-medium">{comp}</span>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
