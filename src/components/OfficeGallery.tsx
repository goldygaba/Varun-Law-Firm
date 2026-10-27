import { useState } from 'react';
import { 
  Building2, 
  Laptop, 
  Users, 
  BookOpen, 
  Scale, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Phone,
  MessageSquare,
  Maximize2,
  X
} from 'lucide-react';
import { LAWYER_PROFILE } from '../data/legalData';

interface OfficeGalleryProps {
  onOpenBooking: () => void;
}

export default function OfficeGallery({ onOpenBooking }: OfficeGalleryProps) {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const scenes = LAWYER_PROFILE.officeScenes || [];
  const currentScene = scenes[activeSceneIndex] || scenes[0];

  return (
    <section id="office-gallery" className="py-24 bg-[#070d1e] relative border-t border-[#c5a880]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#d8be98] font-semibold mb-3">
            <span>Executive Chambers · Chandigarh</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Chandigarh · Punjab · Haryana · Delhi</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mb-4">
            Advocate Varun Aggarwal in Office
          </h2>
          <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed">
            A glimpse into the professional work environment at our Chandigarh chambers. Here, case research, document drafting, and client consultations are conducted with utmost confidentiality.
          </p>
        </div>

        {/* Interactive Scene Showcase (2-Column Architecture) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
          
          {/* Left Column: Visual Scene Photography & Full View (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl bg-gradient-to-b from-[#0f1d40] to-[#070d1e] border border-[#c5a880]/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
            
            {/* Background ambient lighting */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#c5a880]/10 blur-[100px] pointer-events-none" />

            {/* Visual Frame: Real Photographic Scene */}
            <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#0a1226] border border-[#c5a880]/30 shadow-2xl mb-6 group/img">
              <img
                key={currentScene.id}
                src={currentScene.imageUrl}
                alt={currentScene.altText || currentScene.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover/img:scale-105"
                onError={(e) => {
                  if (currentScene.id === 'scene-courtroom') {
                    (e.target as HTMLImageElement).src = '/courtroom_justice.jpg';
                  } else if (currentScene.id === 'scene-consultation') {
                    (e.target as HTMLImageElement).src = '/office_consultation.jpg';
                  } else if (currentScene.id === 'scene-research') {
                    (e.target as HTMLImageElement).src = '/legal_library.jpg';
                  } else {
                    (e.target as HTMLImageElement).src = '/office_desk.jpg';
                  }
                }}
              />

              {/* Gradient Vignette for Text & Badges */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#070d1e] via-transparent to-black/40 pointer-events-none" />

              {/* Badges on Top */}
              <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-black/70 border border-white/10 backdrop-blur-md text-[11px] text-slate-200 font-mono flex items-center gap-1.5 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{currentScene.category}</span>
              </div>

              <div className="absolute top-4 right-4 flex items-center gap-2">
                <div className="px-3 py-1 rounded-lg bg-black/70 border border-white/10 backdrop-blur-md text-[11px] text-[#ebd8ba] flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-[#c5a880]" />
                  <span>Chandigarh</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="p-1.5 rounded-lg bg-black/70 hover:bg-[#c5a880] text-white hover:text-[#070d1e] border border-white/10 backdrop-blur-md transition-colors shadow-lg"
                  title="Expand to Fullscreen View"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom Caption Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#d8be98] block">
                    Advocate Varun Aggarwal (LL.M)
                  </span>
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-white drop-shadow-md">
                    {currentScene.title}
                  </h3>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-md bg-[#c5a880] text-[#070d1e] font-bold tracking-wider shadow">
                  LL.M
                </span>
              </div>
            </div>

            {/* Thumbnail Navigation Strip */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {scenes.map((scene, idx) => {
                const isSelected = activeSceneIndex === idx;
                return (
                  <button
                    key={`thumb-${scene.id}`}
                    type="button"
                    onClick={() => setActiveSceneIndex(idx)}
                    className={`relative aspect-[16/10] rounded-lg overflow-hidden border transition-all ${
                      isSelected
                        ? 'border-[#c5a880] ring-2 ring-[#c5a880]/50 scale-[1.02]'
                        : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={scene.imageUrl}
                      alt={scene.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        if (scene.id === 'scene-courtroom') {
                          (e.target as HTMLImageElement).src = '/courtroom_justice.jpg';
                        } else if (scene.id === 'scene-consultation') {
                          (e.target as HTMLImageElement).src = '/office_consultation.jpg';
                        } else if (scene.id === 'scene-research') {
                          (e.target as HTMLImageElement).src = '/legal_library.jpg';
                        } else {
                          (e.target as HTMLImageElement).src = '/office_desk.jpg';
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-black/30" />
                    <span className="absolute bottom-1 left-1 text-[9px] font-mono text-white/90 truncate max-w-[90%]">
                      0{idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Scene Description & Attire Reference from Character Sheet */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/10 pb-2">
                <span>Setting: <strong className="text-white">{currentScene.setting}</strong></span>
                <span className="text-[#c5a880] font-mono">{currentScene.category}</span>
              </div>
              
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
                {currentScene.description}
              </p>

              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#c5a880] shrink-0 mt-0.5" />
                <span><strong>Professional Demeanor:</strong> {currentScene.attire}</span>
              </div>
            </div>

          </div>

          {/* Right Column: Scene Switcher & Consultation Booking Actions (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-[#d8be98] font-semibold mb-1">
                Select Chamber Environment
              </h4>

              {scenes.map((scene, idx) => {
                const isActive = activeSceneIndex === idx;
                return (
                  <button
                    key={scene.id}
                    onClick={() => setActiveSceneIndex(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 group ${
                      isActive
                        ? 'bg-gradient-to-r from-[#122046] to-[#0c1633] border-[#c5a880] shadow-lg shadow-[#c5a880]/10'
                        : 'bg-[#091126] border-white/5 hover:border-white/20 hover:bg-[#0e1938]'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? 'bg-[#c5a880] text-[#070d1e]' : 'bg-white/5 text-[#d8be98] group-hover:bg-[#c5a880]/20'
                    }`}>
                      {idx === 0 && <Laptop className="w-4 h-4" />}
                      {idx === 1 && <Users className="w-4 h-4" />}
                      {idx === 2 && <BookOpen className="w-4 h-4" />}
                      {idx === 3 && <Scale className="w-4 h-4" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-serif font-bold text-white group-hover:text-[#ebd8ba] transition-colors">
                          {scene.title}
                        </h5>
                        <span className="text-[10px] font-mono text-slate-400">0{idx + 1}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {scene.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Direct Connect & Booking Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#111e40] to-[#081024] border border-[#c5a880]/40 space-y-4 shadow-xl">
              <div>
                <h4 className="text-sm font-serif font-bold text-white">
                  Visit Chambers in Chandigarh
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Conveniently situated in Chandigarh and actively serving Chandigarh, Punjab, Haryana, and Delhi. Reach out directly or book an appointment online.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 pt-1">
                <button
                  onClick={onOpenBooking}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#d8be98] to-[#c5a880] hover:from-white hover:to-[#ebd8ba] text-[#070d1e] font-semibold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Chambers Consultation</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${LAWYER_PROFILE.phone}`}
                    className="py-2.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-white font-mono text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#c5a880]" />
                    <span>Call Advocate</span>
                  </a>

                  <a
                    href={`https://wa.me/${LAWYER_PROFILE.whatsappNumber}?text=Hello%20Advocate%20Varun%20Aggarwal,%20I%20would%20like%20to%20consult%20regarding%20a%20legal%20matter.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#4ade80] text-xs font-semibold flex items-center justify-center gap-1.5 border border-[#25D366]/40 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* 4 Regions Practice Coverage Banner */}
        <div className="p-6 rounded-2xl bg-[#09122a] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#c5a880]/15 flex items-center justify-center text-[#ebd8ba] shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-serif font-bold text-white">
                Active Across Chandigarh, Punjab, Haryana & Delhi
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Representing clients before High Court, DRT, CAT, RERA, and Courts & Tribunals across Chandigarh, Punjab, Haryana, and Delhi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto text-xs text-[#d8be98] font-mono">
            <span>Chandigarh</span>
            <span>·</span>
            <span>Punjab</span>
            <span>·</span>
            <span>Haryana</span>
            <span>·</span>
            <span>Delhi</span>
          </div>
        </div>

      </div>

      {/* Full-Screen Image Lightbox Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="relative max-w-5xl w-full flex flex-col items-center">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-12 right-0 p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              title="Close Fullscreen View"
            >
              <X className="w-5 h-5" />
            </button>

            {/* High-Resolution Expanded Frame */}
            <div className="w-full rounded-2xl overflow-hidden border border-[#c5a880]/40 shadow-2xl bg-[#070d1e] max-h-[80vh] flex items-center justify-center">
              <img
                src={currentScene.imageUrl}
                alt={currentScene.altText || currentScene.title}
                referrerPolicy="no-referrer"
                className="w-full h-full max-h-[75vh] object-contain"
                onError={(e) => {
                  if (currentScene.id === 'scene-courtroom') {
                    (e.target as HTMLImageElement).src = '/courtroom_justice.jpg';
                  } else if (currentScene.id === 'scene-consultation') {
                    (e.target as HTMLImageElement).src = '/office_consultation.jpg';
                  } else if (currentScene.id === 'scene-research') {
                    (e.target as HTMLImageElement).src = '/legal_library.jpg';
                  } else {
                    (e.target as HTMLImageElement).src = '/office_desk.jpg';
                  }
                }}
              />
            </div>

            {/* Modal Caption */}
            <div className="w-full mt-4 flex items-center justify-between text-xs text-slate-300 px-2">
              <div>
                <strong className="text-white text-sm font-serif block">{currentScene.title}</strong>
                <span className="text-[#c5a880]">{currentScene.setting}</span>
              </div>
              <span className="px-3 py-1 rounded bg-[#c5a880]/20 text-[#ebd8ba] border border-[#c5a880]/30 font-mono text-[11px]">
                {currentScene.category}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
