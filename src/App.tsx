/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import OfficeGallery from './components/OfficeGallery';
import PracticeAreas from './components/PracticeAreas';
import CourtsSection from './components/CourtsSection';
import ClientTestimonials from './components/ClientTestimonials';
import BookingSystem from './components/BookingSystem';
import AdminPortal from './components/AdminPortal';
import LegalBlog from './components/LegalBlog';
import FaqSection from './components/FaqSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import BarCouncilModal from './components/BarCouncilModal';
import { LAWYER_PROFILE } from './data/legalData';

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedPracticeForBooking, setSelectedPracticeForBooking] = useState('');

  const openBookingModal = (practiceTitle?: string) => {
    if (practiceTitle) {
      setSelectedPracticeForBooking(practiceTitle);
    }
    setIsBookingModalOpen(true);
  };

  const scrollToPractice = () => {
    const practiceElement = document.getElementById('practice-areas');
    if (practiceElement) {
      practiceElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const whatsappUrl = `https://wa.me/${LAWYER_PROFILE.whatsappNumber}?text=Hello%20Advocate%20Varun%20Aggarwal,%20I%20would%20like%20to%20consult%20regarding%20a%20legal%20matter.`;

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col font-sans selection:bg-[#c5a880]/30 selection:text-white relative">
      {/* Bar Council of India Compliance Modal */}
      <BarCouncilModal />

      {/* Top Navigation with Logo, Call & WhatsApp Buttons */}
      <Navbar
        onOpenBooking={() => openBookingModal()}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Hero Section with 3D Depth, Chandigarh & Tricity Presence */}
        <Hero
          onOpenBooking={() => openBookingModal()}
          onExplorePractice={scrollToPractice}
        />

        {/* 2. About the Lawyer (Advocate Varun Aggarwal, LL.M) */}
        <AboutSection />

        {/* 3. Professional Images & Office Chambers Gallery */}
        <OfficeGallery
          onOpenBooking={() => openBookingModal()}
        />

        {/* 4. Practice Areas with Interactive 3D Cards */}
        <PracticeAreas
          onSelectPracticeForBooking={(title) => openBookingModal(title)}
        />

        {/* 5. Courts & Legal Expertise (High Court, DRT, RERA, CAT, Tricity) */}
        <CourtsSection />

        {/* 6. Professional Client Feedback & 3D Testimonials Carousel (BCI Compliant) */}
        <ClientTestimonials
          onOpenBooking={() => openBookingModal()}
        />

        {/* 7. Appointment Booking System (Date/Time Slot, Duplicate Prevention, Confirmation) */}
        <BookingSystem
          isModalOpen={isBookingModalOpen}
          onCloseModal={() => setIsBookingModalOpen(false)}
          onOpenModal={(title) => openBookingModal(title)}
          initialPracticeArea={selectedPracticeForBooking}
        />

        {/* 8. Legal Blog & Thought Leadership */}
        <LegalBlog
          onOpenBooking={() => openBookingModal()}
        />

        {/* 9. Frequently Asked Questions */}
        <FaqSection />

        {/* 10. Contact & Chamber Details */}
        <ContactSection />
      </main>

      {/* Footer & Bar Council Disclaimers */}
      <Footer
        onOpenBooking={() => openBookingModal()}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Chambers Administrative Docket Portal Modal */}
      <AdminPortal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* Floating Quick Action Contact Bar (Sticky on Desktop and Mobile) */}
      <aside aria-label="Quick contact" className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5 pointer-events-auto">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#25D366] text-slate-950 font-bold text-xs shadow-2xl hover:bg-[#20ba59] hover:scale-105 active:scale-95 transition-all shadow-[#25D366]/40"
          title="Chat on WhatsApp with Advocate Varun Aggarwal"
        >
          <MessageSquare className="w-4 h-4 fill-current" />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>

        <a
          href={`tel:${LAWYER_PROFILE.phone}`}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-[#d8be98] to-[#c5a880] text-[#070d1e] font-bold text-xs shadow-2xl hover:from-white hover:to-[#ebd8ba] hover:scale-105 active:scale-95 transition-all shadow-[#c5a880]/30"
          title="Direct Telephone: 8950503055"
        >
          <Phone className="w-4 h-4 fill-current" />
          <span className="hidden sm:inline font-mono">8950503055</span>
        </a>
      </aside>
    </div>
  );
}
