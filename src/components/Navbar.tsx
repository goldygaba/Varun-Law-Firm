import { useState, useEffect } from 'react';
import { Menu, X, Phone, MessageSquare, Calendar } from 'lucide-react';
import { LAWYER_PROFILE } from '../data/legalData';

interface NavbarProps {
  onOpenBooking: () => void;
  hasAdminSession?: boolean;
}

export default function Navbar({ onOpenBooking }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About Advocate', href: '#about' },
    { name: 'Office & Chambers', href: '#office-gallery' },
    { name: 'Practice Areas', href: '#practice-areas' },
    { name: 'Courts & Jurisdiction', href: '#courts' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Articles', href: '#blog' },
    { name: 'Contact', href: '#contact' },
  ];

  const whatsappUrl = `https://wa.me/${LAWYER_PROFILE.whatsappNumber}?text=Hello%20Advocate%20Varun%20Aggarwal,%20I%20would%20like%20to%20consult%20regarding%20a%20legal%20matter.`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#070d1e]/96 backdrop-blur-md border-b border-[#c5a880]/20 shadow-2xl shadow-black/50 py-3'
          : 'bg-[#070d1e]/80 backdrop-blur-sm border-b border-white/5 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          
          {/* Zone 1: Brand Wordmark with Official Golden Scales Crest Logo */}
          <a
            href="/"
            className="flex items-center gap-3 shrink-0 group py-1"
            title="Varun Law Firm · Advocate Varun Aggarwal, Chandigarh"
          >
            {/* Custom SVG Judicial Scales & Column Logo Seal */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#1b2b52] to-[#0c1630] border border-[#c5a880]/60 p-1.5 flex items-center justify-center shadow-lg shadow-[#c5a880]/15 group-hover:border-[#c5a880] transition-colors">
              <svg viewBox="0 0 40 40" className="w-full h-full text-[#ebd8ba]" fill="none" stroke="currentColor">
                {/* Neoclassical Pediment & Scales Emblem */}
                <path d="M20 5 L34 11 L6 11 Z" fill="currentColor" fillOpacity="0.25" stroke="#c5a880" strokeWidth="1.2" />
                <path d="M20 11 L20 33" stroke="#c5a880" strokeWidth="2" strokeLinecap="round" />
                <path d="M11 16 L29 16" stroke="#c5a880" strokeWidth="1.5" strokeLinecap="round" />
                {/* Left Pan */}
                <path d="M11 16 L8 23 M11 16 L14 23" stroke="#c5a880" strokeWidth="1" />
                <path d="M6 23 C6 26 16 26 16 23 Z" fill="currentColor" fillOpacity="0.4" stroke="#c5a880" strokeWidth="1" />
                {/* Right Pan */}
                <path d="M29 16 L26 23 M29 16 L32 23" stroke="#c5a880" strokeWidth="1" />
                <path d="M24 23 C24 26 34 26 34 23 Z" fill="currentColor" fillOpacity="0.4" stroke="#c5a880" strokeWidth="1" />
                {/* Plinth Base */}
                <path d="M12 33 L28 33 M9 36 L31 36" stroke="#c5a880" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-serif font-bold tracking-tight text-white group-hover:text-[#ebd8ba] transition-colors leading-tight">
                Varun Law Firm
              </span>
              <span className="text-[10px] tracking-wide text-[#d8be98] font-medium leading-tight">
                Chandigarh-Punjab-Haryana-Delhi
              </span>
            </div>
          </a>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden xl:flex items-center gap-7 text-xs font-medium text-slate-300">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="hover:text-[#ebd8ba] transition-colors whitespace-nowrap tracking-wide py-1"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Zone 3: Call & WhatsApp Buttons + Primary Consultation Action */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Direct Phone Call Button */}
            <a
              href={`tel:${LAWYER_PROFILE.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 text-xs font-semibold text-white bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-[#c5a880]/50 rounded-lg transition-all shadow-sm group"
              title="Call Advocate Varun Aggarwal directly"
            >
              <Phone className="w-3.5 h-3.5 text-[#c5a880] group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline font-mono tracking-tight">8950503055</span>
              <span className="sm:hidden font-mono text-[11px]">Call</span>
            </a>

            {/* Direct WhatsApp Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 text-xs font-semibold text-white bg-[#25D366]/20 hover:bg-[#25D366]/35 border border-[#25D366]/40 hover:border-[#25D366] rounded-lg text-[#4ade80] hover:text-white transition-all shadow-sm group"
              title="Chat with Advocate Varun Aggarwal on WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#25D366] group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline font-medium tracking-tight">WhatsApp</span>
            </a>

            {/* Primary Consultation Booking Button */}
            <button
              onClick={onOpenBooking}
              className="hidden lg:inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#070d1e] bg-gradient-to-r from-[#d8be98] to-[#c5a880] rounded-lg hover:from-white hover:to-[#ebd8ba] shadow-md shadow-[#c5a880]/20 transition-all duration-200 active:scale-95 whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-slate-300 hover:text-white rounded-lg focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-x-0 top-full bg-[#070d1e]/98 backdrop-blur-2xl border-b border-[#c5a880]/20 px-6 py-6 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-top-4 duration-200">
          
          {/* Quick Contact Bar on Mobile */}
          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-white/10">
            <a
              href={`tel:${LAWYER_PROFILE.phone}`}
              className="py-2.5 px-3 rounded-lg bg-slate-800 text-white font-mono text-xs flex items-center justify-center gap-2 border border-slate-700"
            >
              <Phone className="w-3.5 h-3.5 text-[#c5a880]" />
              <span>Call Advocate</span>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-lg bg-[#25D366]/20 text-[#4ade80] text-xs font-semibold flex items-center justify-center gap-2 border border-[#25D366]/40"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
              <span>WhatsApp</span>
            </a>
          </div>

          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-200 hover:text-[#c5a880] py-2 border-b border-white/5 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#070d1e] bg-[#c5a880] rounded-lg hover:bg-white transition-colors"
            >
              Schedule Consultation
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
