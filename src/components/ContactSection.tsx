import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, MessageSquare, ShieldCheck } from 'lucide-react';
import { LAWYER_PROFILE, PRACTICE_AREAS } from '../data/legalData';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <section id="contact" className="py-24 bg-[#070d1e] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#d8be98] font-semibold mb-3">
            <span>Direct Chambers Communications</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Legal Inquiries</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mb-4">
            Contact Varun Law Firm
          </h2>
          <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed">
            Reach our chambers in Chandigarh directly for confidential case evaluations, High Court briefings, or urgent stay inquiries across Chandigarh, Punjab, Haryana, and Delhi.
          </p>
        </div>

        {/* 2-Column Grid: Contact Information & Inquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Direct Chamber Details (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0f1d40] to-[#070d1e] border border-[#c5a880]/30 shadow-xl space-y-6">
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#c5a880]/15 border border-[#c5a880]/30 flex items-center justify-center text-[#ebd8ba] shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Chamber Location</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Advocate Chambers & Legal Advisory Offices<br />
                    Sector 17 / High Court Complex Vicinity<br />
                    Chandigarh 160017, India
                  </p>
                  <span className="text-[11px] text-[#c5a880] block mt-1 font-medium">
                    Practicing across Chandigarh · Punjab · Haryana · Delhi
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#c5a880]/15 border border-[#c5a880]/30 flex items-center justify-center text-[#ebd8ba] shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Direct Telephone & WhatsApp</h4>
                  <a
                    href="tel:8950503055"
                    className="text-xs sm:text-sm font-mono text-[#d8be98] hover:text-white transition-colors block mt-1"
                  >
                    8950503055
                  </a>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Available for urgent court listings & briefings
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#c5a880]/15 border border-[#c5a880]/30 flex items-center justify-center text-[#ebd8ba] shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Official Case Correspondence</h4>
                  <a
                    href="mailto:varunlawfirm@gmail.com"
                    className="text-xs sm:text-sm text-[#d8be98] hover:text-white transition-colors block mt-1 break-all"
                  >
                    varunlawfirm@gmail.com
                  </a>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    For vakalatnama, petition vetting & case records
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#c5a880]/15 border border-[#c5a880]/30 flex items-center justify-center text-[#ebd8ba] shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Chamber Consultation Hours</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Monday to Saturday: <strong className="text-white">9:30 AM – 7:30 PM</strong><br />
                    Sunday: <span className="text-slate-400">By prior High Court appointment only</span>
                  </p>
                </div>
              </div>

            </div>

            {/* Quick WhatsApp Direct Connect */}
            <a
              href="https://wa.me/918950503055?text=Hello%20Advocate%20Varun%20Aggarwal,%20I%20would%20like%20to%20inquire%20about%20a%20legal%20consultation."
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-[#09152e] hover:bg-[#0c1d42] border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300 hover:text-white transition-all group"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <span>Message Directly on WhatsApp: <strong>8950503055</strong></span>
              </div>
              <span className="font-semibold text-[#c5a880] group-hover:translate-x-1 transition-transform">→</span>
            </a>

          </div>

          {/* Right Column: Interactive Inquiry Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-gradient-to-b from-[#0f1d40] to-[#070d1e] border border-[#c5a880]/30 p-6 sm:p-8 shadow-2xl">
              
              <h3 className="text-xl font-serif font-bold text-white mb-2">
                Send a Direct Case Inquiry
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                All communications sent through this form are strictly confidential and treated under attorney-client privilege.
              </p>

              {submitted ? (
                <div className="p-8 text-center bg-[#070d1e] border border-emerald-500/30 rounded-xl animate-in zoom-in-95">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-lg font-serif font-bold text-white mb-1">Inquiry Dispatched</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto mb-6">
                    Thank you. Your message has been routed to Advocate Varun Aggarwal’s desk. We will review your inquiry and contact you via telephone or email within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
                    }}
                    className="px-5 py-2 text-xs text-[#c5a880] hover:text-white border border-[#c5a880]/30 rounded-lg"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-slate-300 font-semibold block mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Amit Kumar"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-[#081024] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                      />
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-wider text-slate-300 font-semibold block mb-1">
                        Telephone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98140..."
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-[#081024] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-slate-300 font-semibold block mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="client@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-[#081024] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                      />
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-wider text-slate-300 font-semibold block mb-1">
                        Legal Subject Category *
                      </label>
                      <select
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-[#081024] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                      >
                        <option value="" className="bg-[#070d1e] text-slate-400">Select Legal Subject / Practice Domain...</option>
                        {PRACTICE_AREAS.map((pa) => (
                          <option key={pa.id} value={pa.title} className="bg-[#070d1e]">
                            {pa.title}
                          </option>
                        ))}
                        <option value="General Legal Advisory / Notice Response" className="bg-[#070d1e]">
                          General Legal Advisory / Notice Response
                        </option>
                        <option value="Other Legal Matter" className="bg-[#070d1e]">
                          Other Legal Matter
                        </option>
                      </select>

                      {/* Quick Category Chips */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {[
                          'Family Law (498A, Protection, Maintenance & Custody)',
                          'Negotiable Instruments & Cheque Bounce (Sec. 138)',
                          'Marriage Protection & Life Liberty Petitions',
                          'Criminal Defense, Bail & FIR Quashing',
                          'NRI Legal Services & Property Protection',
                        ].map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setFormData({ ...formData, subject: item })}
                            className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                              formData.subject === item
                                ? 'bg-[#c5a880] text-[#070d1e] font-bold border-[#c5a880]'
                                : 'bg-white/5 text-slate-300 border-white/10 hover:border-[#c5a880]/50 hover:text-white'
                            }`}
                          >
                            {item.split(' & ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider text-slate-300 font-semibold block mb-1">
                      Case Details or Inquiry Summary *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Please outline the nature of your dispute, relevant courts involved, or urgent deadlines..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-[#081024] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#c5a880] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#d8be98] to-[#c5a880] hover:from-white hover:to-[#ebd8ba] text-[#070d1e] font-semibold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span>Transmitting...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Confidential Case Inquiry</span>
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
