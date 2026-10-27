import { Scale, ShieldCheck, Mail, Phone, MapPin, ArrowUp } from 'lucide-react';
import { LAWYER_PROFILE } from '../data/legalData';

interface FooterProps {
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
}

export default function Footer({ onOpenBooking, onOpenAdmin }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#050914] text-slate-400 border-t border-[#c5a880]/20 pt-16 pb-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand & Advocate Overview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <a
              href="/"
              className="text-2xl font-serif font-bold text-white tracking-tight flex items-center gap-2 hover:text-[#d8be98] transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#c5a880] inline-block"></span>
              <span>Varun Law Firm</span>
            </a>

            <p className="text-xs text-slate-300 leading-relaxed max-w-md font-light">
              Chambers of Advocate Varun Aggarwal, Master of Laws (LL.M). Dedicated legal practice providing strategic advocacy before the Punjab & Haryana High Court, specialized debt recovery tribunals, RERA authorities, and administrative commissions.
            </p>

            <div className="text-xs text-slate-400 space-y-1 font-mono pt-1">
              <div>Jurisdiction: <span className="text-white">Chandigarh · Punjab · Haryana · Delhi</span></div>
              <div>Bar Association: <span className="text-white">Punjab & Haryana High Court</span></div>
              <div>Academic Degree: <span className="text-white">LL.M, Kurukshetra University</span></div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={onOpenBooking}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#070d1e] bg-[#c5a880] hover:bg-white rounded-lg transition-colors"
              >
                Book Consultation
              </button>
            </div>
          </div>

          {/* Quick Navigation Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-white font-semibold">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#about" className="hover:text-[#c5a880] transition-colors">About Advocate</a></li>
              <li><a href="#practice-areas" className="hover:text-[#c5a880] transition-colors">Practice Areas</a></li>
              <li><a href="#courts" className="hover:text-[#c5a880] transition-colors">Courts & Tribunals</a></li>
              <li><a href="#testimonials" className="hover:text-[#c5a880] transition-colors">Client Feedback</a></li>
              <li><a href="#booking" className="hover:text-[#c5a880] transition-colors">Chambers Scheduling</a></li>
              <li><a href="#blog" className="hover:text-[#c5a880] transition-colors">Legal Articles</a></li>
              <li><a href="#faq" className="hover:text-[#c5a880] transition-colors">Frequently Asked</a></li>
              <li><a href="#contact" className="hover:text-[#c5a880] transition-colors">Chambers Contact</a></li>
            </ul>
          </div>

          {/* Key Practice Areas (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-white font-semibold">
              Key Focus
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li><span className="hover:text-white cursor-default">High Court Litigation</span></li>
              <li><span className="hover:text-white cursor-default">SARFAESI & DRT Defense</span></li>
              <li><span className="hover:text-white cursor-default">HRERA & Real Estate</span></li>
              <li><span className="hover:text-white cursor-default">CAT Service Grievances</span></li>
              <li><span className="hover:text-white cursor-default">Negotiable Instruments (Sec. 138)</span></li>
              <li><span className="hover:text-white cursor-default">Marriage Protection Petitions</span></li>
              <li><span className="hover:text-white cursor-default">Criminal Defense & Bail (482)</span></li>
              <li><span className="hover:text-white cursor-default">NRI Legal & Property Services</span></li>
              <li><span className="hover:text-white cursor-default">Family Law (498A, Maintenance, Custody)</span></li>
            </ul>
          </div>

          {/* Chamber Contact Information (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-white font-semibold">
              Chambers Details
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#c5a880] shrink-0 mt-0.5" />
                <span>Chamber Complex, Sector 17 / High Court, Chandigarh 160017, India (Practicing across Chandigarh, Punjab, Haryana, Delhi)</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#c5a880] shrink-0" />
                <a href="tel:8950503055" className="hover:text-white transition-colors font-mono">
                  8950503055
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#c5a880] shrink-0" />
                <a href="mailto:varunlawfirm@gmail.com" className="hover:text-white transition-colors truncate">
                  varunlawfirm@gmail.com
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Mandatory Bar Council of India Disclaimer & Legal Privilege Notice */}
        <div className="py-8 border-b border-white/5 text-[11px] text-slate-400 leading-relaxed space-y-2 font-light">
          <p>
            <strong className="text-slate-300">Bar Council of India Rule 36 Disclaimer:</strong> As per the rules of the Bar Council of India, advocates are not permitted to solicit work or advertise. By accessing this website, the visitor acknowledges that the information provided is solely for educational and informational purposes, and is accessed voluntarily upon request.
          </p>
          <p>
            <strong className="text-slate-300">Professional Privilege Notice:</strong> All discussions and disclosures submitted through the appointment booking portal are protected under Attorney-Client Privilege pursuant to Section 126 of the Indian Evidence Act, 1872 / relevant provisions of Bharatiya Sakshya Adhiniyam.
          </p>
        </div>

        {/* Bottom Row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span>© {new Date().getFullYear()} Varun Law Firm · Advocate Varun Aggarwal (LL.M). All rights reserved.</span>
            {/* Small discreet staff portal access */}
            <span className="text-slate-800">·</span>
            <button
              onClick={onOpenAdmin}
              className="text-[10px] text-slate-700 hover:text-slate-400 transition-colors select-none font-mono"
              title="Staff & Manager Authentication Portal"
            >
              staff / manager portal
            </button>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-slate-400">Chandigarh · Working in Tricity (Chandigarh · Mohali · Panchkula)</span>
            <button
              onClick={scrollToTop}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1"
              aria-label="Scroll to top of page"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
