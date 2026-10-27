import { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Quote, 
  ShieldCheck, 
  Scale, 
  CheckCircle2, 
  MapPin, 
  Play, 
  Pause,
  Award
} from 'lucide-react';
import { TESTIMONIALS } from '../data/legalData';
import { Testimonial } from '../types';

interface ClientTestimonialsProps {
  onOpenBooking: () => void;
}

export default function ClientTestimonials({ onOpenBooking }: ClientTestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const total = TESTIMONIALS.length;

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  useEffect(() => {
    if (isAutoPlaying) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, 6000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoPlaying, activeIndex]);

  // Calculate 3D carousel transform style for each card
  const getCardStyle = (index: number) => {
    // Relative offset from activeIndex
    let offset = (index - activeIndex + total) % total;
    if (offset > total / 2) {
      offset -= total; // e.g. -1, 0, 1, 2...
    }

    const isActive = offset === 0;
    const isPrev = offset === -1 || (offset < 0 && Math.abs(offset) === 1);
    const isNext = offset === 1 || (offset > 0 && offset === 1);

    if (isActive) {
      return {
        transform: 'translateX(0%) translateZ(0px) rotateY(0deg) scale(1)',
        opacity: 1,
        zIndex: 30,
        pointerEvents: 'auto' as const,
      };
    } else if (isPrev) {
      return {
        transform: 'translateX(-55%) translateZ(-140px) rotateY(24deg) scale(0.88)',
        opacity: 0.65,
        zIndex: 20,
        pointerEvents: 'auto' as const,
      };
    } else if (isNext) {
      return {
        transform: 'translateX(55%) translateZ(-140px) rotateY(-24deg) scale(0.88)',
        opacity: 0.65,
        zIndex: 20,
        pointerEvents: 'auto' as const,
      };
    } else {
      // Outlying cards
      const direction = offset > 0 ? 1 : -1;
      return {
        transform: `translateX(${direction * 90}%) translateZ(-260px) rotateY(${
          direction * -35
        }deg) scale(0.72)`,
        opacity: 0.15,
        zIndex: 10,
        pointerEvents: 'none' as const,
      };
    }
  };

  return (
    <section id="testimonials" className="py-24 bg-[#050914] relative border-t border-[#c5a880]/15 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-[#1a2d5a]/20 blur-[140px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#d8be98] font-semibold mb-3">
            <span>Professional Client Feedback</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Ethical Standards</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mb-4">
            Client Testimonials & Feedback
          </h2>
          <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed">
            Observations from individuals, entrepreneurs, and institutions regarding procedural clarity, transparent reporting, and courtroom diligence.
          </p>
        </div>

        {/* Mandatory Bar Council of India Rule 36 Ethical Notice */}
        <div className="mb-12 p-4 sm:p-5 rounded-xl bg-[#09122a] border border-[#c5a880]/25 text-xs text-slate-300 flex items-start gap-3.5 shadow-md">
          <ShieldCheck className="w-5 h-5 text-[#c5a880] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-white block uppercase tracking-wider text-[11px]">
              Bar Council of India Rule 36 Compliance Disclosure
            </span>
            <p className="text-slate-400 leading-relaxed font-light text-[11.5px]">
              Under the rules formulated by the Bar Council of India pursuant to the Advocates Act, 1961, advocates are prohibited from advertising or soliciting briefs. The client statements displayed herein represent individual evaluations of professional demeanor, responsiveness, and drafting diligence. They do not constitute advertisements, endorsements, or guarantees regarding judicial outcomes in any tribunal or court of law.
            </p>
          </div>
        </div>

        {/* 3D Carousel Stage */}
        <div 
          className="relative w-full max-w-4xl mx-auto h-[480px] sm:h-[420px] flex items-center justify-center perspective-1200 select-none"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {TESTIMONIALS.map((item, index) => {
            const style = getCardStyle(index);
            const isActive = index === activeIndex;

            return (
              <div
                key={item.id}
                onClick={() => setActiveIndex(index)}
                style={style}
                className={`absolute w-[90%] sm:w-[580px] rounded-2xl bg-gradient-to-b from-[#0f1d40] to-[#070d1e] border p-6 sm:p-8 shadow-2xl transition-all duration-500 ease-out flex flex-col justify-between cursor-pointer ${
                  isActive
                    ? 'border-[#c5a880]/70 shadow-[#c5a880]/15 ring-1 ring-[#c5a880]/30'
                    : 'border-white/10 hover:border-[#c5a880]/40'
                }`}
              >
                <div>
                  {/* Card Top: Forum & Key Professional Attribute */}
                  <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 mb-5">
                    <div>
                      <span className="text-[11px] font-mono text-[#d8be98] block uppercase tracking-wider mb-1">
                        {item.practiceArea}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-white font-medium">
                        <Award className="w-3.5 h-3.5 text-[#c5a880]" />
                        <span>{item.keyAttribute}</span>
                      </div>
                    </div>

                    <div className="w-9 h-9 rounded-lg bg-[#c5a880]/15 flex items-center justify-center text-[#ebd8ba] shrink-0">
                      <Quote className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Review Text */}
                  <blockquote className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light italic mb-6">
                    "{item.reviewText}"
                  </blockquote>
                </div>

                {/* Card Bottom: Client Attribution & Ethics Note */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1b2b52] border border-[#c5a880]/50 flex items-center justify-center text-xs font-serif font-bold text-white shrink-0">
                      {item.clientNameOrInitials.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-serif font-bold text-white leading-tight">
                        {item.clientNameOrInitials}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {item.clientRole} · <span className="text-slate-300">{item.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400 block font-semibold flex items-center gap-1 justify-end">
                      <CheckCircle2 className="w-3 h-3 inline" /> Verified
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      Matter Docket · {item.year}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Carousel Navigation Controls */}
        <div className="flex items-center justify-center gap-6 mt-8">
          
          <button
            onClick={prevSlide}
            aria-label="Previous testimonial"
            className="p-3 rounded-full bg-[#0a142e] hover:bg-[#101d40] text-slate-300 hover:text-white border border-[#c5a880]/30 hover:border-[#c5a880] transition-colors shadow-lg active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIndex === idx
                    ? 'w-7 bg-[#c5a880]'
                    : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            aria-label="Next testimonial"
            className="p-3 rounded-full bg-[#0a142e] hover:bg-[#101d40] text-slate-300 hover:text-white border border-[#c5a880]/30 hover:border-[#c5a880] transition-colors shadow-lg active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Auto-play pause / play toggle */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            aria-label={isAutoPlaying ? "Pause 3D rotation" : "Play 3D rotation"}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-[#c5a880] transition-colors ml-2"
            title={isAutoPlaying ? "Pause 3D Carousel" : "Auto-rotate 3D Carousel"}
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

        </div>

        {/* Call to Action Bar */}
        <div className="mt-14 text-center">
          <p className="text-xs text-slate-400 mb-4 font-light">
            Every legal matter requires individualized assessment under applicable statutes and High Court precedents.
          </p>
          <button
            onClick={onOpenBooking}
            className="inline-flex items-center justify-center px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#070d1e] bg-gradient-to-r from-[#d8be98] to-[#c5a880] hover:from-white hover:to-[#ebd8ba] rounded-lg shadow-lg shadow-[#c5a880]/20 transition-all active:scale-95"
          >
            Schedule Private Case Assessment
          </button>
        </div>

      </div>
    </section>
  );
}
