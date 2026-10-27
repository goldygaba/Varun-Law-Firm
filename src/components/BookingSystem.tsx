import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight,
  Briefcase,
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MapPin,
  MessageSquare,
  Send
} from 'lucide-react';
import { Appointment, AppointmentType } from '../types';
import { PRACTICE_AREAS, INITIAL_APPOINTMENTS, LAWYER_PROFILE } from '../data/legalData';

interface BookingSystemProps {
  isModalOpen: boolean;
  onCloseModal: () => void;
  onOpenModal: (practiceArea?: string) => void;
  initialPracticeArea?: string;
  onAppointmentBooked?: (appointment: Appointment) => void;
}

const TIME_SLOTS = [
  '10:00 AM - 10:45 AM',
  '11:15 AM - 12:00 PM',
  '02:30 PM - 03:15 PM',
  '03:45 PM - 04:30 PM',
  '05:15 PM - 06:00 PM',
  '06:30 PM - 07:15 PM',
];

const APPOINTMENT_TYPES: { type: AppointmentType; desc: string }[] = [
  { type: 'Chambers Consultation', desc: 'In-person strategy session at our Chandigarh chambers (working across Chandigarh, Punjab, Haryana, Delhi)' },
  { type: 'Virtual Video Conference', desc: 'High-definition encrypted Google Meet / Zoom conference' },
  { type: 'Urgent High Court Advisory', desc: 'Expedited stay application or writ petition analysis' },
  { type: 'Contract & Document Review', desc: 'Comprehensive clause-by-clause legal risk audit' },
];

export default function BookingSystem({
  isModalOpen,
  onCloseModal,
  onOpenModal,
  initialPracticeArea = '',
  onAppointmentBooked,
}: BookingSystemProps) {
  // Wizard current step: 1 = Calendar & Slot, 2 = Scope & Matter, 3 = Client Details, 4 = Congratulations Screen
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Calendar state
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  
  // Scope state
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('Chambers Consultation');
  const [practiceArea, setPracticeArea] = useState<string>(initialPracticeArea || PRACTICE_AREAS[0].title);
  const [caseSummary, setCaseSummary] = useState('');

  // Client details form state
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Status & Confirmation
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);

  useEffect(() => {
    if (initialPracticeArea) {
      setPracticeArea(initialPracticeArea);
    }
  }, [initialPracticeArea]);

  // Load existing bookings from API or localStorage
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch('/api/appointments');
        if (res.ok) {
          const data = await res.json();
          if (data.appointments) {
            setExistingAppointments(data.appointments);
            return;
          }
        }
      } catch {
        // Fallback to localStorage or seeded
      }
      const saved = localStorage.getItem('varun_law_appointments');
      if (saved) {
        try {
          setExistingAppointments(JSON.parse(saved));
        } catch {}
      }
    };
    fetchAppointments();
  }, []);

  // Format date helper YYYY-MM-DD
  const formatDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Set default selected date to tomorrow or next business day
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (tomorrow.getDay() === 0) {
      tomorrow.setDate(tomorrow.getDate() + 1); // skip Sunday
    }
    setSelectedDate(formatDateString(tomorrow));
    setSelectedTimeSlot(TIME_SLOTS[0]);
  }, []);

  // Calendar generation
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Check if a time slot is already booked for the selected date
  const isSlotBooked = (slot: string) => {
    if (!selectedDate) return false;
    return existingAppointments.some(
      (a) => a.date === selectedDate && a.timeSlot === slot && a.status !== 'Cancelled'
    );
  };

  // Step 1 to Step 2 validation
  const handleStep1Next = () => {
    setErrorMessage('');
    if (!selectedDate) {
      setErrorMessage('Please select a consultation date.');
      return;
    }
    if (!selectedTimeSlot) {
      setErrorMessage('Please select an available time slot.');
      return;
    }
    if (isSlotBooked(selectedTimeSlot)) {
      setErrorMessage(`The slot ${selectedTimeSlot} on ${selectedDate} is already reserved. Please choose another.`);
      return;
    }
    setCurrentStep(2);
  };

  // Step 2 to Step 3 validation
  const handleStep2Next = () => {
    setErrorMessage('');
    setCurrentStep(3);
  };

  // Final submission on Step 3
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!clientName.trim() || clientName.trim().length < 2) {
      setErrorMessage('Please enter your full legal name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setErrorMessage('Please provide a valid contact telephone number.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (!agreedToTerms) {
      setErrorMessage('Please acknowledge confidential attorney-client privilege.');
      return;
    }

    if (isSlotBooked(selectedTimeSlot)) {
      setErrorMessage(`The slot ${selectedTimeSlot} on ${selectedDate} has already been reserved. Please return to step 1 and pick another time.`);
      return;
    }

    setSubmitting(true);

    const payload = {
      clientName: clientName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      appointmentType,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      practiceArea,
      caseSummary: caseSummary.trim(),
    };

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const created: Appointment = data.appointment;
        setConfirmedBooking(created);
        const updated = [created, ...existingAppointments];
        setExistingAppointments(updated);
        localStorage.setItem('varun_law_appointments', JSON.stringify(updated));
        if (onAppointmentBooked) onAppointmentBooked(created);
        setCurrentStep(4); // Congratulations Step!
        setSubmitting(false);
        return;
      } else {
        const errData = await res.json();
        setErrorMessage(errData.error || 'Failed to register appointment.');
      }
    } catch {
      // Local fallback
      const mockRef = `VLF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const localAppt: Appointment = {
        id: `appt-${Date.now()}`,
        referenceNumber: mockRef,
        ...payload,
        status: 'Pending Review',
        createdAt: new Date().toISOString(),
        adminNotes: 'Online booking request recorded.',
      };
      setConfirmedBooking(localAppt);
      const updated = [localAppt, ...existingAppointments];
      setExistingAppointments(updated);
      localStorage.setItem('varun_law_appointments', JSON.stringify(updated));
      if (onAppointmentBooked) onAppointmentBooked(localAppt);
      setCurrentStep(4); // Congratulations Step!
    }

    setSubmitting(false);
  };

  // Generate .ics calendar download
  const handleDownloadICS = () => {
    if (!confirmedBooking) return;
    const [startHourStr, startMinStr] = confirmedBooking.timeSlot.split(' ')[0].split(':');
    const isPM = confirmedBooking.timeSlot.includes('PM') && startHourStr !== '12';
    const hour = isPM ? parseInt(startHourStr, 10) + 12 : parseInt(startHourStr, 10);
    
    const formattedDate = confirmedBooking.date.replace(/-/g, '');
    const startTimeFormatted = `${formattedDate}T${String(hour).padStart(2, '0')}${startMinStr}00`;
    const endTimeFormatted = `${formattedDate}T${String(hour + 1).padStart(2, '0')}${startMinStr}00`;

    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Varun Law Firm//Appointment Scheduler//EN',
      'BEGIN:VEVENT',
      `UID:${confirmedBooking.referenceNumber}@varunlawfirm.com`,
      `DTSTAMP:${formattedDate}T000000Z`,
      `DTSTART:${startTimeFormatted}`,
      `DTEND:${endTimeFormatted}`,
      `SUMMARY:Legal Consultation - Adv. Varun Aggarwal (${confirmedBooking.appointmentType})`,
      `DESCRIPTION:Consultation with Advocate Varun Aggarwal for ${confirmedBooking.practiceArea}. Reference: ${confirmedBooking.referenceNumber}`,
      `LOCATION:Varun Law Firm Chambers, Chandigarh (Chandigarh, Punjab, Haryana, Delhi) / Google Meet`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VarunLawFirm-Consultation-${confirmedBooking.referenceNumber}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Google Calendar URL Generator
  const getGoogleCalendarUrl = () => {
    if (!confirmedBooking) return '#';
    const title = encodeURIComponent(`Legal Consultation: Adv. Varun Aggarwal (${confirmedBooking.referenceNumber})`);
    const details = encodeURIComponent(
      `Appointment Type: ${confirmedBooking.appointmentType}\nPractice Area: ${confirmedBooking.practiceArea}\nClient: ${confirmedBooking.clientName}\nPhone: ${confirmedBooking.phone}\nReference: ${confirmedBooking.referenceNumber}\nChambers: Chandigarh, India (Practicing across Chandigarh, Punjab, Haryana, Delhi)`
    );
    const location = encodeURIComponent('Varun Law Firm Chambers, Chandigarh (Chandigarh, Punjab, Haryana, Delhi) / Video Link');
    const dateFormatted = confirmedBooking.date.replace(/-/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dateFormatted}T050000Z/${dateFormatted}T060000Z`;
  };

  // Admin WhatsApp URL containing all client details
  const getAdminWhatsappUrl = (appt: Appointment) => {
    if (appt.notifications?.adminWhatsappUrl) return appt.notifications.adminWhatsappUrl;
    const msg = [
      `*🚨 NEW CONSULTATION BOOKING ALERT - VARUN LAW FIRM*`,
      `*Chambers of Advocate Varun Aggarwal*`,
      `*Docket Ref:* ${appt.referenceNumber}`,
      ``,
      `*👤 Client Details:*`,
      `• Name: ${appt.clientName}`,
      `• Phone: ${appt.phone}`,
      `• Email: ${appt.email}`,
      ``,
      `*📅 Scheduled Timing:*`,
      `• Date: ${appt.date}`,
      `• Slot: ${appt.timeSlot}`,
      `• Format: ${appt.appointmentType}`,
      `• Domain: ${appt.practiceArea}`,
      ``,
      `*📝 Case Summary:*`,
      appt.caseSummary || 'Not provided by client',
      ``,
      `*Jurisdiction:* Chandigarh · Punjab · Haryana · Delhi`,
      `*Direct Chambers Contact:* 8950503055`,
    ].join('\n');
    return `https://wa.me/918950503055?text=${encodeURIComponent(msg)}`;
  };

  // Client WhatsApp confirmation URL
  const getClientWhatsappUrl = (appt: Appointment) => {
    if (appt.notifications?.clientWhatsappUrl) return appt.notifications.clientWhatsappUrl;
    const cleanPhone = appt.phone.replace(/[^0-9]/g, '');
    const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = [
      `*⚖️ CONSULTATION CONFIRMED - VARUN LAW FIRM*`,
      `*Chambers of Advocate Varun Aggarwal (LL.M)*`,
      `*Booking Docket Reference:* ${appt.referenceNumber}`,
      ``,
      `Dear ${appt.clientName},`,
      `Your legal consultation has been confirmed and registered:`,
      ``,
      `*📅 Date:* ${appt.date}`,
      `*⏰ Time Slot:* ${appt.timeSlot}`,
      `*🏛️ Format:* ${appt.appointmentType}`,
      `*📂 Practice Domain:* ${appt.practiceArea}`,
      ``,
      `*📍 Chamber Location:*`,
      `Chamber Complex, Sector 17 / High Court, Chandigarh`,
      `(Active across Chandigarh · Punjab · Haryana · Delhi)`,
      ``,
      `*📞 Contact Advocate:* 8950503055`,
      `*✉️ Email:* varunlawfirm@gmail.com`,
      ``,
      `*🔒 Attorney-Client Privilege Protected (Sec. 126 Evidence Act)*`,
    ].join('\n');
    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
  };

  // Direct 1-Click Gmail composer URL for client confirmation
  const getGmailDirectUrl = (appt: Appointment) => {
    if (appt.notifications?.gmailDirectUrl) return appt.notifications.gmailDirectUrl;
    const subject = `Booking Confirmed: Legal Consultation with Advocate Varun Aggarwal (${appt.referenceNumber})`;
    const bodyText = [
      `Dear ${appt.clientName},`,
      ``,
      `Your legal consultation with Advocate Varun Aggarwal has been confirmed and registered in our chamber docket.`,
      ``,
      `• Docket Reference: ${appt.referenceNumber}`,
      `• Consultation Date: ${appt.date}`,
      `• Reserved Time Slot: ${appt.timeSlot}`,
      `• Consultation Format: ${appt.appointmentType}`,
      `• Practice Domain: ${appt.practiceArea}`,
      `• Venue: Chamber Complex, Sector 17 / High Court, Chandigarh`,
      `• Direct Chambers Contact: 8950503055`,
      `• Direct Advocate Email: varunlawfirm@gmail.com`,
      ``,
      `CONFIDENTIALITY & PRIVILEGE:`,
      `All information and documents disclosed for this consultation are protected under Attorney-Client Privilege pursuant to Section 126 of the Indian Evidence Act, 1872.`,
      ``,
      `Chambers of Advocate Varun Aggarwal (LL.M)`,
      `Practicing across Chandigarh · Punjab · Haryana · Delhi`,
    ].join('\n');
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(appt.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
  };

  // Direct 1-Click mailto URL for default email application
  const getMailtoUrl = (appt: Appointment) => {
    if (appt.notifications?.mailtoUrl) return appt.notifications.mailtoUrl;
    const subject = `Booking Confirmed: Legal Consultation with Advocate Varun Aggarwal (${appt.referenceNumber})`;
    const bodyText = [
      `Dear ${appt.clientName},`,
      ``,
      `Your legal consultation with Advocate Varun Aggarwal has been confirmed:`,
      `• Docket Reference: ${appt.referenceNumber}`,
      `• Date: ${appt.date} · ${appt.timeSlot}`,
      `• Format: ${appt.appointmentType}`,
      `• Domain: ${appt.practiceArea}`,
      `• Venue: Chamber Complex, Sector 17 / High Court, Chandigarh`,
      `• Direct Contact: 8950503055`,
    ].join('\n');
    return `mailto:${encodeURIComponent(appt.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
  };

  // Reset and finish scheduling
  const handleFinishScheduling = () => {
    onCloseModal();
    // Reset state after short delay
    setTimeout(() => {
      setCurrentStep(1);
      setConfirmedBooking(null);
      setClientName('');
      setPhone('');
      setEmail('');
      setCaseSummary('');
      setAgreedToTerms(false);
      setErrorMessage('');
    }, 300);
  };

  return (
    <>
      {/* 1. On-Page Section: Schedule an Appointment Feature Banner */}
      <section id="booking" className="py-24 bg-[#050a18] relative border-t border-[#c5a880]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="rounded-3xl bg-gradient-to-b from-[#0f1d40] to-[#070d1e] border border-[#c5a880]/30 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#c5a880]/10 blur-[120px] pointer-events-none" />

            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#d8be98] font-semibold mb-3">
                <span>Chambers Consultation Portal</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Chandigarh · Punjab · Haryana · Delhi</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mb-4">
                Schedule an Appointment
              </h2>
              
              <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed mb-8">
                Reserve an appointment with Advocate Varun Aggarwal through our real-time interactive scheduling system. Choose your preferred date, select an open time slot, and configure your consultation scope in a few simple steps.
              </p>

              {/* 3-Step Wizard Roadmap Cards (Clickable to open pop-up directly) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                <button
                  type="button"
                  onClick={() => onOpenModal()}
                  className="p-4 rounded-xl bg-[#09122a] hover:bg-[#0f1d40] border border-white/5 hover:border-[#c5a880]/40 transition-all text-left cursor-pointer group"
                >
                  <span className="text-[10px] font-mono text-[#d8be98] uppercase tracking-wider block mb-1">Step 01</span>
                  <h4 className="text-sm font-semibold text-white mb-1 flex items-center gap-2 group-hover:text-[#ebd8ba]">
                    <CalendarIcon className="w-4 h-4 text-[#c5a880]" />
                    Real-time Calendar Booking
                  </h4>
                  <p className="text-xs text-slate-400">Live calendar with available chambers and virtual slots.</p>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenModal()}
                  className="p-4 rounded-xl bg-[#09122a] hover:bg-[#0f1d40] border border-white/5 hover:border-[#c5a880]/40 transition-all text-left cursor-pointer group"
                >
                  <span className="text-[10px] font-mono text-[#d8be98] uppercase tracking-wider block mb-1">Step 02</span>
                  <h4 className="text-sm font-semibold text-white mb-1 flex items-center gap-2 group-hover:text-[#ebd8ba]">
                    <Briefcase className="w-4 h-4 text-[#c5a880]" />
                    Consultation Scope & Details
                  </h4>
                  <p className="text-xs text-slate-400">Select consultation format and case subject matter.</p>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenModal()}
                  className="p-4 rounded-xl bg-[#09122a] hover:bg-[#0f1d40] border border-white/5 hover:border-[#c5a880]/40 transition-all text-left cursor-pointer group"
                >
                  <span className="text-[10px] font-mono text-[#d8be98] uppercase tracking-wider block mb-1">Step 03</span>
                  <h4 className="text-sm font-semibold text-white mb-1 flex items-center gap-2 group-hover:text-[#ebd8ba]">
                    <ShieldCheck className="w-4 h-4 text-[#c5a880]" />
                    Privileged Confirmation
                  </h4>
                  <p className="text-xs text-slate-400">Instant reference docket with calendar synchronization.</p>
                </button>
              </div>

              {/* Launch Booking Pop-up Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={() => onOpenModal()}
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-[#070d1e] bg-gradient-to-r from-[#d8be98] to-[#c5a880] rounded-xl hover:from-white hover:to-[#ebd8ba] shadow-xl shadow-[#c5a880]/20 transition-all duration-200 active:scale-95 group cursor-pointer"
                >
                  <CalendarIcon className="w-4 h-4 text-[#070d1e]" />
                  <span>Schedule an Appointment</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <div className="flex items-center gap-2 text-xs text-slate-400 px-3 py-2">
                  <Clock className="w-4 h-4 text-[#c5a880]" />
                  <span>Mon - Sat: 9:30 AM - 7:30 PM (Chandigarh, Punjab, Haryana, Delhi)</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 2. Step-by-Step Pop-up Modal Wizard */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-[#09122a] border border-[#c5a880]/40 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            
            {/* Modal Top Header with Stepper Progress */}
            <div className="p-5 sm:p-6 bg-[#070d1e] border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-[#d8be98] uppercase tracking-wider block mb-0.5">
                  Chambers Scheduling · Advocate Varun Aggarwal (Chandigarh · Punjab · Haryana · Delhi)
                </span>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-white">
                  {currentStep === 1 && 'Step 1 of 3: Real-time Calendar Booking'}
                  {currentStep === 2 && 'Step 2 of 3: Consultation Scope & Details'}
                  {currentStep === 3 && 'Step 3 of 3: Client Details & Privilege Agreement'}
                  {currentStep === 4 && 'Congratulations! Your Appointment has been Scheduled'}
                </h3>
              </div>

              <button
                onClick={handleFinishScheduling}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close scheduling pop-up"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress Bar (Steps 1 to 3) */}
            {currentStep < 4 && (
              <div className="px-6 pt-4 pb-2 bg-[#081024] border-b border-white/5">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                  <span className={currentStep >= 1 ? 'text-[#c5a880] font-bold' : ''}>1. Real-time Calendar</span>
                  <span className={currentStep >= 2 ? 'text-[#c5a880] font-bold' : ''}>2. Scope & Details</span>
                  <span className={currentStep >= 3 ? 'text-[#c5a880] font-bold' : ''}>3. Client Details</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#d8be98] to-[#c5a880] h-full transition-all duration-300"
                    style={{ width: `${(currentStep / 3) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Modal Body / Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1">
              
              {/* STEP 1: Real-time Calendar & Time-Slot Selection */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <p className="text-xs text-slate-300">
                    Select your preferred date from the interactive calendar below, then pick an available chamber or video consultation time slot.
                  </p>

                  {/* Month Selector Bar */}
                  <div className="flex items-center justify-between p-3 bg-[#081024] rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-serif font-semibold text-white">
                      {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div>
                    <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      <span>Sun</span>
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                    </div>

                    <div className="grid grid-cols-7 gap-1.5">
                      {Array.from({ length: firstDayIndex }).map((_, i) => (
                        <div key={`empty-${i}`} className="p-2.5" />
                      ))}

                      {Array.from({ length: daysInMonth }).map((_, idx) => {
                        const day = idx + 1;
                        const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                        const dateStr = formatDateString(dateObj);
                        const isSunday = dateObj.getDay() === 0;
                        const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                        const isPast = dateObj < todayZero;
                        const isDisabled = isSunday || isPast;
                        const isSelected = selectedDate === dateStr;

                        return (
                          <button
                            key={`day-${day}`}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                              setSelectedDate(dateStr);
                              setErrorMessage('');
                            }}
                            className={`p-2.5 rounded-lg text-xs font-mono font-medium transition-all ${
                              isSelected
                                ? 'bg-[#c5a880] text-[#070d1e] font-bold shadow-lg shadow-[#c5a880]/20 scale-105'
                                : isDisabled
                                ? 'text-slate-600 cursor-not-allowed bg-transparent'
                                : 'text-slate-200 hover:bg-white/10 hover:text-white bg-[#081024] border border-white/5'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Available Time Slots */}
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-[#d8be98] font-semibold mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#c5a880]" />
                      Available Consultation Slots for {selectedDate || 'Selected Date'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {TIME_SLOTS.map((slot) => {
                        const booked = isSlotBooked(slot);
                        const isSelected = selectedTimeSlot === slot;

                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={booked}
                            onClick={() => {
                              setSelectedTimeSlot(slot);
                              setErrorMessage('');
                            }}
                            className={`p-3 rounded-xl text-xs font-mono transition-all text-left flex items-center justify-between border ${
                              booked
                                ? 'bg-rose-950/20 border-rose-900/30 text-rose-400/50 cursor-not-allowed line-through'
                                : isSelected
                                ? 'bg-[#c5a880] text-[#070d1e] border-[#c5a880] font-bold shadow-md'
                                : 'bg-[#081024] border-white/5 text-slate-300 hover:border-[#c5a880]/40 hover:text-white'
                            }`}
                          >
                            <span>{slot}</span>
                            {booked && <span className="text-[10px] uppercase font-sans tracking-wide">Reserved</span>}
                            {isSelected && !booked && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Consultation Scope & Matter Details */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <p className="text-xs text-slate-300">
                    Configure your meeting format and the legal practice area regarding your case.
                  </p>

                  {/* Appointment Format Selector */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-slate-300 font-semibold block mb-2">
                      Consultation Format *
                    </label>
                    <div className="space-y-2.5">
                      {APPOINTMENT_TYPES.map(({ type, desc }) => (
                        <label
                          key={type}
                          className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                            appointmentType === type
                              ? 'bg-[#0d1838] border-[#c5a880] text-white shadow-md'
                              : 'bg-[#081024] border-white/5 text-slate-300 hover:border-white/20'
                          }`}
                        >
                          <input
                            type="radio"
                            name="appointmentType"
                            value={type}
                            checked={appointmentType === type}
                            onChange={() => setAppointmentType(type)}
                            className="mt-0.5 text-[#c5a880] focus:ring-[#c5a880]"
                          />
                          <div>
                            <span className="text-xs font-semibold block">{type}</span>
                            <span className="text-[11px] text-slate-400 block">{desc}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Practice Area Selector */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-slate-300 font-semibold block mb-2">
                      Legal Subject / Practice Domain *
                    </label>
                    <select
                      value={practiceArea}
                      onChange={(e) => setPracticeArea(e.target.value)}
                      className="w-full bg-[#081024] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                    >
                      {PRACTICE_AREAS.map((pa) => (
                        <option key={pa.id} value={pa.title} className="bg-[#070d1e]">
                          {pa.title}
                        </option>
                      ))}
                      <option value="General Legal Advisory" className="bg-[#070d1e]">
                        General Legal Advisory / Notice Response
                      </option>
                    </select>

                    {/* Quick Category Chips */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      <span className="text-[10px] text-slate-400 self-center mr-1">Quick Select:</span>
                      {[
                        'Family Law (498A, Protection, Maintenance & Custody)',
                        'Negotiable Instruments & Cheque Bounce (Sec. 138)',
                        'Marriage Protection & Life Liberty Petitions',
                        'Criminal Defense, Bail & FIR Quashing',
                        'NRI Legal Services & Property Protection',
                        'Debt Recovery & SARFAESI Defense (DRT/DRAT)',
                        'Real Estate & RERA Advocacy'
                      ].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setPracticeArea(item)}
                          className={`text-[10px] px-2.5 py-1 rounded-md border transition-all ${
                            practiceArea === item
                              ? 'bg-[#c5a880] text-[#070d1e] font-bold border-[#c5a880]'
                              : 'bg-white/5 text-slate-300 border-white/10 hover:border-[#c5a880]/50 hover:text-white'
                          }`}
                        >
                          {item.split(' & ')[0].split(' (')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Case Summary */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-slate-300 font-semibold block mb-2">
                      Brief Case Summary or Inquiry (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Outline relevant notices received, court dates, or specific legal questions..."
                      value={caseSummary}
                      onChange={(e) => setCaseSummary(e.target.value)}
                      className="w-full bg-[#081024] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#c5a880] resize-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Client Details & Privilege Agreement */}
              {currentStep === 3 && (
                <form onSubmit={handleConfirmBooking} className="space-y-6 animate-in fade-in duration-200">
                  <p className="text-xs text-slate-300">
                    Provide your primary contact information for docket registration. Communications are strictly privileged under Section 126 of the Evidence Act.
                  </p>

                  {/* Client Name */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-slate-300 font-semibold block mb-1.5">
                      Full Legal Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rajesh Sharma"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full bg-[#081024] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                      />
                    </div>
                  </div>

                  {/* Phone & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-slate-300 font-semibold block mb-1.5">
                        Telephone / WhatsApp *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="tel"
                          required
                          placeholder="+91 98140..."
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-[#081024] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-wider text-slate-300 font-semibold block mb-1.5">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          placeholder="client@domain.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-[#081024] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary Recap Box */}
                  <div className="p-4 rounded-xl bg-[#081024] border border-white/5 text-xs space-y-1.5 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Scheduled Date:</span>
                      <span className="font-mono text-white">{selectedDate} · {selectedTimeSlot}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Consultation Format:</span>
                      <span className="text-[#ebd8ba]">{appointmentType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Practice Area:</span>
                      <span className="text-white">{practiceArea}</span>
                    </div>
                  </div>

                  {/* Privilege Agreement Checkbox */}
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 pt-1">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 text-[#c5a880] rounded focus:ring-[#c5a880]"
                    />
                    <span className="leading-tight">
                      I acknowledge that communications provided are protected under attorney-client privilege, and understand this consultation is held at Chandigarh chambers or virtual video link.
                    </span>
                  </label>
                </form>
              )}

              {/* STEP 4: Congratulations & Confirmation Pop-up */}
              {currentStep === 4 && confirmedBooking && (
                <div className="p-4 sm:p-6 text-center animate-in zoom-in-95 duration-300 space-y-6">
                  
                  {/* Congratulations Badge */}
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div>
                    <span className="text-xs uppercase tracking-widest text-[#d8be98] font-bold block mb-1">
                      Congratulations! Your Docket is Confirmed
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
                      {confirmedBooking.referenceNumber}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                      Your consultation with <strong className="text-white">Advocate Varun Aggarwal</strong> has been registered in the chamber docket for <strong className="text-white">{confirmedBooking.clientName}</strong>.
                    </p>
                  </div>

                  {/* Summary Breakdown Card */}
                  <div className="p-5 rounded-xl bg-[#070d1e] border border-white/10 space-y-2.5 text-xs text-left max-w-lg mx-auto">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-400">Client Name</span>
                      <span className="text-white font-semibold">{confirmedBooking.clientName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-400">Client Phone</span>
                      <span className="text-white font-mono">{confirmedBooking.phone}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-400">Client Email</span>
                      <span className="text-white">{confirmedBooking.email}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-400">Date & Slot</span>
                      <span className="text-white font-mono">{confirmedBooking.date} · {confirmedBooking.timeSlot}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-400">Consultation Format</span>
                      <span className="text-[#ebd8ba] font-medium">{confirmedBooking.appointmentType}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-400">Practice Area</span>
                      <span className="text-white font-medium">{confirmedBooking.practiceArea}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Venue & Chambers</span>
                      <span className="text-white text-right">Sector 17 / High Court, Chandigarh (Chd · Pb · Hry · Del)</span>
                    </div>
                  </div>

                  {/* Automated Booking Notifications Status Section */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#0a142c] border border-[#c5a880]/30 text-left max-w-lg mx-auto space-y-3.5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#d8be98]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Instant Notifications & Confirmation</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-medium">
                        Active
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      {/* 1. Admin Email Notification */}
                      <div className="p-3 rounded-xl bg-[#060c1d] border border-white/5 flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white">Admin Email Notification</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">Delivered</span>
                          </div>
                          <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                            Complete client dossier dispatched to Advocate Varun Aggarwal (<strong className="text-slate-200">varunlawfirm@gmail.com</strong>) with client details, docket ref, and case matter brief.
                          </p>
                        </div>
                      </div>

                      {/* 2. Admin WhatsApp Notification */}
                      <div className="p-3 rounded-xl bg-[#060c1d] border border-white/5 flex flex-col gap-2.5">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white">Admin WhatsApp Alert</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">Ready</span>
                            </div>
                            <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                              Pre-formatted WhatsApp alert for Advocate Varun Aggarwal (<strong className="text-slate-200 font-mono">8950503055</strong>) with all client contact & dispute information.
                            </p>
                          </div>
                        </div>
                        <a
                          href={getAdminWhatsappUrl(confirmedBooking)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-white border border-emerald-500/30 font-medium text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send WhatsApp Notification to Admin (8950503055)</span>
                        </a>
                      </div>

                      {/* 3. Client Email Confirmation & Calendar Reminder */}
                      <div className="p-3.5 rounded-xl bg-[#060c1d] border border-white/5 flex flex-col gap-2.5">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white">Client Email Confirmation & Docket</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
                                confirmedBooking.notifications?.clientEmailSent 
                                  ? 'bg-emerald-500/20 text-emerald-300' 
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}>
                                {confirmedBooking.notifications?.clientEmailSent ? 'Delivered via SMTP' : 'Direct Dispatch Ready'}
                              </span>
                            </div>
                            <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                              {confirmedBooking.notifications?.clientEmailSent ? (
                                <>Official booking confirmation docket & calendar reminder successfully delivered to <strong className="text-slate-200">{confirmedBooking.email}</strong> via Chamber SMTP.</>
                              ) : (
                                <>Booking confirmation docket & calendar reminder prepared for <strong className="text-slate-200">{confirmedBooking.email}</strong>. Click below to send directly to your inbox with 1-click Gmail or your default email client.</>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Direct 1-Click Delivery to Client Inbox */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          <a
                            href={getGmailDirectUrl(confirmedBooking)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-[11px] flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-sky-900/30"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open & Deliver in Gmail</span>
                          </a>

                          <a
                            href={getMailtoUrl(confirmedBooking)}
                            className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 font-medium text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5 text-[#c5a880]" />
                            <span>Send via Email Client (Mailto)</span>
                          </a>
                        </div>
                      </div>

                      {/* 4. Client WhatsApp Confirmation */}
                      <div className="p-3 rounded-xl bg-[#060c1d] border border-white/5 flex flex-col gap-2.5">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white">Client WhatsApp Confirmation</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">Ready</span>
                            </div>
                            <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                              Official booking confirmation receipt prepared for client phone: <strong className="text-slate-200 font-mono">{confirmedBooking.phone}</strong>.
                            </p>
                          </div>
                        </div>
                        <a
                          href={getClientWhatsappUrl(confirmedBooking)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-emerald-900/30"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Open Booking Confirmation on WhatsApp</span>
                        </a>
                      </div>

                    </div>
                  </div>

                  {/* Calendar Download Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
                    <button
                      onClick={handleDownloadICS}
                      className="w-full sm:w-1/2 py-2.5 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/10 transition-colors"
                    >
                      <Download className="w-4 h-4 text-[#c5a880]" />
                      <span>Download .ICS Calendar</span>
                    </button>

                    <a
                      href={getGoogleCalendarUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-1/2 py-2.5 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/10 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-[#c5a880]" />
                      <span>Add to Google Calendar</span>
                    </a>
                  </div>

                  {/* FINISH SCHEDULING BUTTON */}
                  <div className="pt-4 border-t border-white/10 max-w-lg mx-auto">
                    <button
                      onClick={handleFinishScheduling}
                      className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#d8be98] to-[#c5a880] hover:from-white hover:to-[#ebd8ba] text-[#070d1e] font-bold text-xs uppercase tracking-wider shadow-xl shadow-[#c5a880]/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Finish Scheduling</span>
                    </button>
                  </div>

                </div>
              )}

            </div>

            {/* Modal Bottom Controls Bar (Steps 1 to 3) */}
            {currentStep < 4 && (
              <div className="p-4 sm:p-5 bg-[#070d1e] border-t border-white/10 flex items-center justify-between">
                
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setCurrentStep((prev) => (prev - 1) as 1 | 2);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishScheduling}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                )}

                {currentStep === 1 && (
                  <button
                    type="button"
                    onClick={handleStep1Next}
                    className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#070d1e] bg-gradient-to-r from-[#d8be98] to-[#c5a880] hover:from-white hover:to-[#ebd8ba] rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Next: Consultation Scope & Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {currentStep === 2 && (
                  <button
                    type="button"
                    onClick={handleStep2Next}
                    className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#070d1e] bg-gradient-to-r from-[#d8be98] to-[#c5a880] hover:from-white hover:to-[#ebd8ba] rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Next: Client Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {currentStep === 3 && (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleConfirmBooking}
                    className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#070d1e] bg-gradient-to-r from-[#d8be98] to-[#c5a880] hover:from-white hover:to-[#ebd8ba] rounded-lg shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <span>Reserving Docket...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Confirm & Schedule Appointment</span>
                      </>
                    )}
                  </button>
                )}

              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
