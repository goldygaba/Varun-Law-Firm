import { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download, 
  Lock, 
  Eye, 
  EyeOff,
  FileEdit, 
  Calendar, 
  User, 
  Phone, 
  Mail,
  ShieldAlert,
  ShieldCheck,
  LogOut,
  MessageSquare,
  Send,
  RefreshCw,
  Bell,
  Server,
  Key,
  ExternalLink,
  AlertCircle,
  AlertTriangle,
  Check
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '../types';
import { INITIAL_APPOINTMENTS } from '../data/legalData';

const TIME_SLOTS = [
  '10:00 AM - 10:45 AM',
  '11:15 AM - 12:00 PM',
  '02:30 PM - 03:15 PM',
  '03:45 PM - 04:30 PM',
  '05:15 PM - 06:00 PM',
  '06:30 PM - 07:15 PM',
];

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentsUpdated?: () => void;
}

interface NotificationLogItem {
  id: string;
  timestamp: string;
  appointmentRef: string;
  type: 'admin_email' | 'client_email' | 'admin_whatsapp' | 'client_whatsapp';
  recipient: string;
  status: 'sent' | 'queued' | 'simulated';
  subject?: string;
  summary: string;
}

export default function AdminPortal({ isOpen, onClose, onAppointmentsUpdated }: AdminPortalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'manager' | 'admin'>('manager');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [adminUnlockKey, setAdminUnlockKey] = useState('');
  const [showAdminUnlockModal, setShowAdminUnlockModal] = useState(false);
  const [adminUnlockError, setAdminUnlockError] = useState('');
  
  const [activeTab, setActiveTab] = useState<'dockets' | 'notifications' | 'smtp'>('dockets');
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [selectedFilter, setSelectedFilter] = useState<'All' | AppointmentStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [noteEdit, setNoteEdit] = useState('');
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ text: string; type: 'success' | 'danger' | 'info' } | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLogItem[]>([]);

  // SMTP Settings State
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(465);
  const [smtpSecure, setSmtpSecure] = useState(true);
  const [smtpUser, setSmtpUser] = useState('varunlawfirm@gmail.com');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFromName, setSmtpFromName] = useState('Advocate Varun Aggarwal (LL.M)');
  const [smtpFromEmail, setSmtpFromEmail] = useState('varunlawfirm@gmail.com');
  const [isSmtpConfigured, setIsSmtpConfigured] = useState(false);
  const [smtpLoading, setSmtpLoading] = useState(false);
  const [smtpMessage, setSmtpMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'warning';
    code?: string;
    details?: string;
    isBadCredentials?: boolean;
    appPasswordUrl?: string;
    directGmailUrl?: string;
    previewUrl?: string;
    instructions?: string[];
  } | null>(null);
  const [testEmailRecipient, setTestEmailRecipient] = useState('goldygaba123@gmail.com');
  const [testingEmail, setTestingEmail] = useState(false);

  // Load appointments from backend or local storage
  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments');
      if (res.ok) {
        const data = await res.json();
        if (data.appointments) {
          setAppointments(data.appointments);
          return;
        }
      }
    } catch {
      // Local fallback
    }
    const saved = localStorage.getItem('varun_law_appointments');
    if (saved) {
      try {
        setAppointments(JSON.parse(saved));
      } catch {}
    }
  };

  const fetchNotificationLogs = async () => {
    try {
      const res = await fetch('/api/notifications-log');
      if (res.ok) {
        const data = await res.json();
        if (data.logs) {
          setNotificationLogs(data.logs);
        }
      }
    } catch {
      // fallback
    }
  };

  const fetchSmtpConfig = async () => {
    try {
      const res = await fetch('/api/smtp-config');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setSmtpHost(data.config.host || 'smtp.gmail.com');
          setSmtpPort(data.config.port || 465);
          setSmtpSecure(data.config.secure !== undefined ? data.config.secure : true);
          setSmtpUser(data.config.user || 'varunlawfirm@gmail.com');
          setSmtpFromName(data.config.fromName || 'Advocate Varun Aggarwal (LL.M)');
          setSmtpFromEmail(data.config.fromEmail || 'varunlawfirm@gmail.com');
          setIsSmtpConfigured(Boolean(data.config.isConfigured));
        }
      }
    } catch {}
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmtpLoading(true);
    setSmtpMessage(null);
    try {
      const res = await fetch('/api/smtp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          user: smtpUser,
          pass: smtpPass,
          fromName: smtpFromName,
          fromEmail: smtpFromEmail || smtpUser,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsSmtpConfigured(data.isConfigured);
        setSmtpMessage({ 
          text: 'Chamber SMTP settings saved successfully! Live emails will be delivered over SMTP.', 
          type: 'success' 
        });
        setSmtpPass('');
      } else {
        setSmtpMessage({ text: data.error || 'Failed to save SMTP settings.', type: 'error' });
      }
    } catch {
      setSmtpMessage({ text: 'Error connecting to server.', type: 'error' });
    } finally {
      setSmtpLoading(false);
    }
  };

  const handleResetSmtp = async () => {
    if (!window.confirm('Reset saved SMTP credentials? Direct 1-click delivery and preview modes will remain active.')) return;
    try {
      const res = await fetch('/api/reset-smtp-config', { method: 'POST' });
      if (res.ok) {
        setIsSmtpConfigured(false);
        setSmtpPass('');
        setSmtpMessage({
          text: 'SMTP credentials cleared. Direct 1-click webmail and client dispatch are active.',
          type: 'success',
        });
        fetchSmtpConfig();
      }
    } catch {
      setSmtpMessage({ text: 'Failed to reset SMTP settings.', type: 'error' });
    }
  };

  const handleSendTestEmail = async (mode: 'smtp' | 'cloud_preview' = 'smtp') => {
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) {
      setSmtpMessage({ text: 'Please enter a valid recipient email address for testing.', type: 'error' });
      return;
    }
    setTestingEmail(true);
    setSmtpMessage(null);
    try {
      const res = await fetch('/api/send-test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail: testEmailRecipient, mode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSmtpMessage({ 
          text: `Delivery Succeeded: ${data.message}`, 
          type: 'success',
          previewUrl: data.previewUrl,
        });
        fetchNotificationLogs();
      } else {
        const isBad = data.code === 'GMAIL_535_BAD_CREDENTIALS' || (data.error && data.error.includes('535'));
        setSmtpMessage({ 
          text: isBad
            ? 'Google SMTP Authentication Failed (Error 535: Bad Credentials)'
            : `Delivery Failed: ${data.error}`, 
          type: 'error',
          code: data.code,
          details: data.details || data.error,
          isBadCredentials: isBad,
          appPasswordUrl: data.appPasswordUrl || 'https://myaccount.google.com/apppasswords',
          directGmailUrl: data.directGmailUrl,
          instructions: data.instructions,
        });
      }
    } catch {
      setSmtpMessage({ text: 'Failed to communicate with test email service.', type: 'error' });
    } finally {
      setTestingEmail(false);
    }
  };

  useEffect(() => {
    const saved = sessionStorage.getItem('vlf_staff_auth');
    const savedRole = sessionStorage.getItem('vlf_staff_role');
    if (saved === 'true') {
      setIsAuthenticated(true);
      setUserRole(savedRole === 'admin' ? 'admin' : 'manager');
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchAppointments();
      fetchNotificationLogs();
      fetchSmtpConfig();
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeAppointment) {
      setRescheduleDate(activeAppointment.date);
      setRescheduleSlot(activeAppointment.timeSlot);
    }
  }, [activeAppointment]);

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
      `*Chambers Direct Phone:* 8950503055`,
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

  const getClientGmailUrl = (appt: Appointment) => {
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
      `All disclosures submitted are protected under Attorney-Client Privilege pursuant to Section 126 of the Indian Evidence Act, 1872.`,
      ``,
      `Chambers of Advocate Varun Aggarwal (LL.M)`,
      `Practicing across Chandigarh · Punjab · Haryana · Delhi`,
    ].join('\n');
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(appt.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
  };

  const getClientMailtoUrl = (appt: Appointment) => {
    if (appt.notifications?.mailtoUrl) return appt.notifications.mailtoUrl;
    const subject = `Booking Confirmed: Legal Consultation with Advocate Varun Aggarwal (${appt.referenceNumber})`;
    const bodyText = [
      `Dear ${appt.clientName},`,
      ``,
      `Your legal consultation with Advocate Varun Aggarwal has been confirmed.`,
      `Docket Reference: ${appt.referenceNumber}`,
      `Date: ${appt.date} · ${appt.timeSlot}`,
      `Venue: Sector 17 / High Court, Chandigarh`,
      `Contact: 8950503055`,
    ].join('\n');
    return `mailto:${encodeURIComponent(appt.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
  };

  const handleResendNotifications = async (id: string) => {
    setResendingId(id);
    setResendNotice(null);
    try {
      const res = await fetch(`/api/appointments/${id}/resend-notifications`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setAppointments((prev) => prev.map((a) => (a.id === id ? data.appointment : a)));
        if (activeAppointment && activeAppointment.id === id) {
          setActiveAppointment(data.appointment);
        }
        setResendNotice('Notification bundle successfully dispatched to Admin (varunlawfirm@gmail.com & WhatsApp 8950503055) and Client!');
        fetchNotificationLogs();
      }
    } catch {
      setResendNotice('Failed to connect to notification service.');
    } finally {
      setResendingId(null);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const u = username.trim().toLowerCase();
    const p = password.trim();

    // Direct Administrator Authentication (Advocate master key)
    if ((u === 'admin' || u === 'advocate' || u === 'varun') && (p === 'varun2026' || p === 'lawyer2026')) {
      setIsAuthenticated(true);
      setUserRole('admin');
      setAuthError('');
      sessionStorage.setItem('vlf_staff_auth', 'true');
      sessionStorage.setItem('vlf_staff_role', 'admin');
      sessionStorage.setItem('vlf_staff_user', 'Admin');
      return;
    }

    // Staff Manager Authentication
    if (u === 'admin' && (p === 'varun2027' || p === '1234')) {
      setIsAuthenticated(true);
      setUserRole('manager');
      setActiveTab('dockets');
      setAuthError('');
      sessionStorage.setItem('vlf_staff_auth', 'true');
      sessionStorage.setItem('vlf_staff_role', 'manager');
      sessionStorage.setItem('vlf_staff_user', 'Manager');
      return;
    }

    if (u !== 'admin' && u !== 'advocate' && u !== 'varun') {
      setAuthError('Invalid username. Access denied.');
    } else {
      setAuthError('Incorrect password. Access denied.');
    }
  };

  const handleAdminUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const k = adminUnlockKey.trim();
    if (k === 'varun2026' || k === 'lawyer2026' || k === '1234') {
      setUserRole('admin');
      sessionStorage.setItem('vlf_staff_role', 'admin');
      setShowAdminUnlockModal(false);
      setAdminUnlockKey('');
      setAdminUnlockError('');
      setActiveTab('smtp');
      fetchSmtpConfig();
      setActionNotice({ text: 'Admin authorization confirmed. Email & SMTP Gateway unlocked.', type: 'success' });
      setTimeout(() => setActionNotice(null), 4000);
    } else {
      setAdminUnlockError('Invalid administrator passcode.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('vlf_staff_auth');
    sessionStorage.removeItem('vlf_staff_user');
    sessionStorage.removeItem('vlf_staff_role');
    setIsAuthenticated(false);
    setUserRole('manager');
    setUsername('');
    setPassword('');
    setAuthError('');
    setActionNotice(null);
    setActiveTab('dockets');
    setShowAdminUnlockModal(false);
  };

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(appointments.map((a) => (a.id === id ? data.appointment : a)));
        if (activeAppointment && activeAppointment.id === id) {
          setActiveAppointment(data.appointment);
        }
      } else {
        throw new Error();
      }
    } catch {
      const updated = appointments.map((a) => (a.id === id ? { ...a, status: newStatus } : a));
      setAppointments(updated);
      localStorage.setItem('varun_law_appointments', JSON.stringify(updated));
      if (activeAppointment && activeAppointment.id === id) {
        setActiveAppointment({ ...activeAppointment, status: newStatus });
      }
    }

    if (newStatus === 'Confirmed') {
      setActionNotice({ text: 'Appointment Approved & Confirmed into Chamber Docket!', type: 'success' });
    } else if (newStatus === 'Cancelled') {
      setActionNotice({ text: 'Appointment Disapproved / Declined.', type: 'danger' });
    } else if (newStatus === 'Completed') {
      setActionNotice({ text: 'Appointment marked as Consultation Completed.', type: 'info' });
    } else {
      setActionNotice({ text: `Appointment status set to ${newStatus}.`, type: 'info' });
    }

    setTimeout(() => {
      setActionNotice(null);
    }, 4000);

    if (onAppointmentsUpdated) onAppointmentsUpdated();
  };

  const handleReschedule = async () => {
    if (!activeAppointment || !rescheduleDate || !rescheduleSlot) {
      alert('Please select both a new consultation date and time slot.');
      return;
    }
    setIsRescheduling(true);
    try {
      const res = await fetch(`/api/appointments/${activeAppointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: rescheduleDate,
          timeSlot: rescheduleSlot,
          status: 'Confirmed'
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(appointments.map((a) => (a.id === activeAppointment.id ? data.appointment : a)));
        setActiveAppointment(data.appointment);
      } else {
        throw new Error();
      }
    } catch {
      const updated = appointments.map((a) =>
        a.id === activeAppointment.id
          ? { ...a, date: rescheduleDate, timeSlot: rescheduleSlot, status: 'Confirmed' as AppointmentStatus }
          : a
      );
      setAppointments(updated);
      localStorage.setItem('varun_law_appointments', JSON.stringify(updated));
      setActiveAppointment({ ...activeAppointment, date: rescheduleDate, timeSlot: rescheduleSlot, status: 'Confirmed' });
    } finally {
      setIsRescheduling(false);
      setActionNotice({
        text: `Consultation rescheduled to ${rescheduleDate} (${rescheduleSlot}) and Approved!`,
        type: 'success',
      });
      setTimeout(() => setActionNotice(null), 4000);
      if (onAppointmentsUpdated) onAppointmentsUpdated();
    }
  };

  const handleSaveNotes = async () => {
    if (!activeAppointment) return;
    try {
      const res = await fetch(`/api/appointments/${activeAppointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: noteEdit }),
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(appointments.map((a) => (a.id === activeAppointment.id ? data.appointment : a)));
        setActiveAppointment(data.appointment);
      }
    } catch {
      const updated = appointments.map((a) =>
        a.id === activeAppointment.id ? { ...a, adminNotes: noteEdit } : a
      );
      setAppointments(updated);
      localStorage.setItem('varun_law_appointments', JSON.stringify(updated));
      setActiveAppointment({ ...activeAppointment, adminNotes: noteEdit });
    }
  };

  const handleExportCSV = () => {
    const headers = ['Reference', 'Client Name', 'Phone', 'Email', 'Type', 'Date', 'Time Slot', 'Practice Area', 'Status', 'Created At'];
    const rows = appointments.map((a) => [
      `"${a.referenceNumber}"`,
      `"${a.clientName}"`,
      `"${a.phone}"`,
      `"${a.email}"`,
      `"${a.appointmentType}"`,
      `"${a.date}"`,
      `"${a.timeSlot}"`,
      `"${a.practiceArea}"`,
      `"${a.status}"`,
      `"${a.createdAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VarunLawFirm_Appointments_Docket_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAppointments = appointments.filter((a) => {
    const matchesFilter = selectedFilter === 'All' || a.status === selectedFilter;
    const matchesQuery =
      a.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.phone.includes(searchQuery) ||
      a.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.practiceArea.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-[#09122a] border border-[#c5a880]/30 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-[#070d1e] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#c5a880]/15 border border-[#c5a880]/30 flex items-center justify-center text-[#ebd8ba]">
              <ShieldCheck className="w-5 h-5 text-[#c5a880]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-serif font-bold text-white">Chamber Staff & Manager Portal</h3>
                {isAuthenticated && (
                  <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                    userRole === 'admin'
                      ? 'bg-purple-950/70 text-purple-300 border border-purple-700/40'
                      : 'bg-emerald-950/70 text-emerald-300 border border-emerald-700/40'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {userRole === 'admin' ? 'Chamber Administrator' : 'Staff Manager'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Appointment Management & Scheduling Docket · Advocate Varun Aggarwal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-white/10 hover:border-rose-800/40 text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close Admin Portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Auth Gate if not logged in */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto w-full">
            <div className="w-16 h-16 rounded-2xl bg-[#c5a880]/10 border border-[#c5a880]/30 flex items-center justify-center text-[#c5a880] mb-4 shadow-lg shadow-[#c5a880]/10">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#c5a880]/20 text-[#ebd8ba] border border-[#c5a880]/30 uppercase tracking-wider mb-2">
              Chambers Authentication
            </div>
            <h4 className="text-xl font-serif font-bold text-white mb-1.5">Portal Sign In</h4>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Sign in with your authorized credentials to manage consultation schedules and client dockets.
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-4 text-left">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#070d1e] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#070d1e] border border-white/15 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800/40 text-rose-300 text-xs text-center font-medium">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#c5a880] hover:bg-white text-[#070d1e] font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#c5a880]/15"
              >
                Sign In to Portal
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-6">
            
            {/* Top Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveTab('dockets')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'dockets'
                      ? 'bg-[#c5a880] text-[#070d1e] shadow-lg shadow-[#c5a880]/15'
                      : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Consultation Dockets</span>
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-black/30 font-mono">
                    {appointments.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('notifications');
                    fetchNotificationLogs();
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'notifications'
                      ? 'bg-[#c5a880] text-[#070d1e] shadow-lg shadow-[#c5a880]/15'
                      : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  <span>Notification Audit Log</span>
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-black/30 font-mono">
                    {notificationLogs.length}
                  </span>
                </button>

                {/* Email & SMTP Gateway - ONLY FOR ADMIN */}
                {userRole === 'admin' ? (
                  <button
                    onClick={() => {
                      setActiveTab('smtp');
                      fetchSmtpConfig();
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'smtp'
                        ? 'bg-[#c5a880] text-[#070d1e] shadow-lg shadow-[#c5a880]/15'
                        : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Server className="w-4 h-4" />
                    <span>Email & SMTP Gateway</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-mono font-medium">ADMIN</span>
                    <span className={`ml-1 w-2 h-2 rounded-full ${isSmtpConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAdminUnlockKey('');
                      setAdminUnlockError('');
                      setShowAdminUnlockModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                    title="Email & SMTP Gateway is restricted to Administrator only"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-400/80" />
                    <span>Email & SMTP Gateway</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Admin Only
                    </span>
                  </button>
                )}
              </div>

              {/* Status indicator / Admin Unlock */}
              {userRole === 'manager' ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminUnlockKey('');
                      setAdminUnlockError('');
                      setShowAdminUnlockModal(true);
                    }}
                    className="text-[11px] text-[#ebd8ba] hover:text-white flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#c5a880]/10 hover:bg-[#c5a880]/20 border border-[#c5a880]/30 transition-colors font-medium"
                    title="Administrator Passcode required to configure SMTP Gateway"
                  >
                    <Lock className="w-3 h-3 text-[#c5a880]" />
                    <span>Admin Mode Unlock</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-emerald-300 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/40 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Admin Mode Active</span>
                  </span>
                </div>
              )}
            </div>

            {activeTab === 'smtp' ? (
              userRole !== 'admin' ? (
                /* Blocked for non-admin */
                <div className="p-8 sm:p-12 max-w-md mx-auto my-8 text-center bg-[#070d1e] border border-amber-500/30 rounded-2xl space-y-4 shadow-xl">
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                    <Lock className="w-7 h-7" />
                  </div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                    Restricted Feature
                  </div>
                  <h4 className="text-lg font-serif font-bold text-white">Administrator Access Required</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The Email & SMTP Gateway feature is reserved exclusively for the Chamber Administrator / Senior Advocate. Staff Managers do not have permission to view or configure live SMTP server credentials or outbound dispatch gateways.
                  </p>
                  <button
                    onClick={() => {
                      setAdminUnlockKey('');
                      setAdminUnlockError('');
                      setShowAdminUnlockModal(true);
                    }}
                    className="px-5 py-2.5 bg-[#c5a880] hover:bg-white text-[#070d1e] font-semibold text-xs rounded-xl transition-all shadow-md shadow-[#c5a880]/15"
                  >
                    Authenticate as Administrator
                  </button>
                </div>
              ) : (
              <div className="flex flex-col gap-6 max-w-4xl">
                {/* Status Header Card */}
                <div className={`p-5 rounded-2xl border ${
                  isSmtpConfigured 
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200' 
                    : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isSmtpConfigured ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-white">
                          {isSmtpConfigured ? 'Chamber SMTP Email Gateway: Active & Connected' : 'Chamber SMTP Email Gateway: Simulation Mode'}
                        </h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
                          isSmtpConfigured ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {isSmtpConfigured ? 'ONLINE' : 'CONFIG REQUIRED'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {isSmtpConfigured
                          ? 'Background SMTP delivery is active. Consultation dockets, client confirmations, and .ICS calendar invites are delivered automatically to email inboxes.'
                          : 'Configure your Gmail or SMTP credentials below to dispatch real background emails from the server, or use the 1-click Gmail direct delivery button.'}
                      </p>
                    </div>
                  </div>
                </div>

                {smtpMessage && (
                  smtpMessage.isBadCredentials ? (
                    <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/60 border border-amber-500/50 text-xs text-amber-200 space-y-3.5 shadow-xl animate-in fade-in duration-300">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="font-bold text-white text-sm">
                              Google SMTP Authentication Failed (Error 535: Bad Credentials)
                            </h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/30 text-rose-200 border border-rose-500/30">
                              535-5.7.8 BadCredentials
                            </span>
                          </div>
                          <p className="text-amber-100/90 text-xs mt-1 leading-relaxed">
                            Google rejected the login for <strong>{smtpUser || 'varunlawfirm@gmail.com'}</strong>.
                            Google Mail strictly disallows standard account passwords (such as plain passwords with numbers like 'varunlawform2026').
                            Google requires a <strong>16-character Google App Password</strong> because 2-Factor Authentication is active on Google accounts.
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2 text-[11px] text-slate-300">
                        <div className="font-semibold text-[#ebd8ba] flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5" />
                          <span>How to resolve this in 30 seconds:</span>
                        </div>
                        <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed text-slate-300">
                          <li>Click the button below to open <strong className="text-white">Google App Passwords</strong>.</li>
                          <li>Under App Name, type <code className="bg-white/10 px-1 py-0.5 rounded text-white font-mono">Varun Law Firm</code> and click <strong>Create</strong>.</li>
                          <li>Google will show a 16-character code (e.g. <code className="bg-white/10 px-1 py-0.5 rounded text-[#ebd8ba] font-mono">abcd efgh ijkl mnop</code>).</li>
                          <li>Paste that 16-letter code into the <strong>Password</strong> field below and click <strong>Save Chamber SMTP Settings</strong>.</li>
                        </ol>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 pt-1">
                        <a
                          href="https://myaccount.google.com/apppasswords"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-3.5 rounded-lg bg-[#c5a880] hover:bg-white text-[#070d1e] font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Generate 16-Digit Google App Password ↗</span>
                        </a>

                        {smtpMessage.directGmailUrl && (
                          <a
                            href={smtpMessage.directGmailUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-md"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Send Test to {testEmailRecipient} via 1-Click Gmail</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleSendTestEmail('cloud_preview')}
                          disabled={testingEmail}
                          className="py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-1.5 transition-colors border border-white/10"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${testingEmail ? 'animate-spin' : ''}`} />
                          <span>Test via Cloud Preview Gateway</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={`p-4 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2.5 border ${
                      smtpMessage.type === 'success' 
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                        : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        {smtpMessage.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span>{smtpMessage.text}</span>
                      </div>
                      {smtpMessage.previewUrl && (
                        <a
                          href={smtpMessage.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded bg-sky-500/20 text-sky-300 hover:text-white border border-sky-500/30 font-semibold flex items-center gap-1 transition-colors"
                        >
                          <span>Open Live Rendered Email ↗</span>
                        </a>
                      )}
                    </div>
                  )
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Configuration Form */}
                  <div className="lg:col-span-7 bg-[#070d1e] p-5 sm:p-6 rounded-2xl border border-white/10 space-y-5">
                    <div>
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Key className="w-4 h-4 text-[#c5a880]" />
                        <span>Chamber Mail Server Credentials</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Choose your email provider and enter your authentication details.
                      </p>
                    </div>

                    {/* Quick Provider Presets */}
                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-slate-400 block mb-2 font-medium">
                        Quick Provider Presets:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setSmtpHost('smtp.gmail.com');
                            setSmtpPort(465);
                            setSmtpSecure(true);
                          }}
                          className={`p-2 rounded-lg border text-left transition-colors ${
                            smtpHost === 'smtp.gmail.com'
                              ? 'bg-[#c5a880]/20 border-[#c5a880] text-white font-medium'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="font-semibold block">Gmail</span>
                          <span className="text-[10px] text-slate-400">smtp.gmail.com</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSmtpHost('smtp.office365.com');
                            setSmtpPort(587);
                            setSmtpSecure(false);
                          }}
                          className={`p-2 rounded-lg border text-left transition-colors ${
                            smtpHost === 'smtp.office365.com'
                              ? 'bg-[#c5a880]/20 border-[#c5a880] text-white font-medium'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="font-semibold block">Outlook / 365</span>
                          <span className="text-[10px] text-slate-400">Office 365</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSmtpHost('smtp-relay.brevo.com');
                            setSmtpPort(587);
                            setSmtpSecure(false);
                          }}
                          className={`p-2 rounded-lg border text-left transition-colors ${
                            smtpHost === 'smtp-relay.brevo.com'
                              ? 'bg-[#c5a880]/20 border-[#c5a880] text-white font-medium'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="font-semibold block">Brevo</span>
                          <span className="text-[10px] text-slate-400">Sendinblue</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSmtpPort(587);
                            setSmtpSecure(false);
                          }}
                          className={`p-2 rounded-lg border text-left transition-colors ${
                            !['smtp.gmail.com', 'smtp.office365.com', 'smtp-relay.brevo.com'].includes(smtpHost)
                              ? 'bg-[#c5a880]/20 border-[#c5a880] text-white font-medium'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="font-semibold block">Custom</span>
                          <span className="text-[10px] text-slate-400">Own Server</span>
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleSaveSmtp} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-slate-300 block mb-1 font-medium">SMTP Server Host</label>
                          <input
                            type="text"
                            value={smtpHost}
                            onChange={(e) => setSmtpHost(e.target.value)}
                            placeholder="smtp.gmail.com"
                            className="w-full bg-[#050914] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c5a880]"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-slate-300 block mb-1 font-medium">Port & Encryption</label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={smtpPort}
                              onChange={(e) => setSmtpPort(Number(e.target.value))}
                              placeholder="465"
                              className="w-24 bg-[#050914] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c5a880]"
                              required
                            />
                            <label className="flex-1 flex items-center gap-2 bg-[#050914] border border-white/15 rounded-lg px-3 py-2 text-slate-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={smtpSecure}
                                onChange={(e) => setSmtpSecure(e.target.checked)}
                                className="rounded text-[#c5a880] focus:ring-0"
                              />
                              <span className="text-[11px]">SSL/TLS</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-300 block mb-1 font-medium">
                          Chamber Email Address / Username
                        </label>
                        <input
                          type="email"
                          value={smtpUser}
                          onChange={(e) => setSmtpUser(e.target.value)}
                          placeholder="varunlawfirm@gmail.com"
                          className="w-full bg-[#050914] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c5a880]"
                          required
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-slate-300 font-medium">
                            Google App Password (16 Letters)
                          </label>
                          <a
                            href="https://myaccount.google.com/apppasswords"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[#ebd8ba] hover:underline flex items-center gap-1"
                          >
                            <span>Get App Password ↗</span>
                          </a>
                        </div>
                        <input
                          type="password"
                          value={smtpPass}
                          onChange={(e) => setSmtpPass(e.target.value)}
                          placeholder={isSmtpConfigured ? '•••••••••••••••• (Leave blank to keep existing)' : 'e.g. abcd efgh ijkl mnop'}
                          className="w-full bg-[#050914] border border-white/15 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#c5a880]"
                          {...(!isSmtpConfigured ? { required: true } : {})}
                        />
                        {smtpPass.length > 0 ? (
                          <div className="mt-1.5 text-[11px]">
                            {smtpPass.replace(/\s+/g, '').length === 16 && /^[a-zA-Z]+$/.test(smtpPass.replace(/\s+/g, '')) ? (
                              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Valid 16-letter Google App Password format.
                              </span>
                            ) : (
                              <span className="text-amber-300/90 flex items-start gap-1 leading-snug">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                                <span>Note: Google App Passwords are strictly 16 letters (e.g. <code className="bg-white/10 px-1 py-0.2 rounded font-mono text-white">abcd efgh ijkl mnop</code>). Regular passwords or passwords with numbers/symbols (like 'varunlawform2026') will always fail with Google error 535 Bad Credentials.</span>
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 mt-1 block">
                            Tip: For Gmail, regular passwords do not work. Generate a 16-character <strong>App Password</strong> from your Google Account settings.
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-slate-300 block mb-1 font-medium">Sender Display Name</label>
                          <input
                            type="text"
                            value={smtpFromName}
                            onChange={(e) => setSmtpFromName(e.target.value)}
                            placeholder="Advocate Varun Aggarwal (LL.M)"
                            className="w-full bg-[#050914] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c5a880]"
                          />
                        </div>

                        <div>
                          <label className="text-slate-300 block mb-1 font-medium">From Reply Email</label>
                          <input
                            type="email"
                            value={smtpFromEmail}
                            onChange={(e) => setSmtpFromEmail(e.target.value)}
                            placeholder="varunlawfirm@gmail.com"
                            className="w-full bg-[#050914] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c5a880]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                        <button
                          type="submit"
                          disabled={smtpLoading}
                          className="w-full sm:flex-1 py-2.5 bg-[#c5a880] hover:bg-white text-[#070d1e] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#c5a880]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {smtpLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                          <span>Save Chamber SMTP Settings</span>
                        </button>

                        {isSmtpConfigured && (
                          <button
                            type="button"
                            onClick={handleResetSmtp}
                            className="w-full sm:w-auto py-2.5 px-4 bg-white/5 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 text-xs font-medium rounded-xl transition-colors"
                            title="Clear saved SMTP credentials"
                          >
                            <span>Clear / Reset</span>
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Right Column: Live Testing & Gmail Instructions */}
                  <div className="lg:col-span-5 flex flex-col gap-5">
                    {/* Test Email Box */}
                    <div className="bg-[#070d1e] p-5 rounded-2xl border border-white/10 space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                          <Send className="w-4 h-4 text-sky-400" />
                          <span>Dispatch Verification Test Email</span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Test delivering a live verification email to any client mailbox.
                        </p>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="text-slate-300 block mb-1 font-medium">Test Recipient Email</label>
                          <input
                            type="email"
                            value={testEmailRecipient}
                            onChange={(e) => setTestEmailRecipient(e.target.value)}
                            placeholder="client@gmail.com"
                            className="w-full bg-[#050914] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c5a880]"
                          />
                        </div>

                        {/* Test Options Buttons */}
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => handleSendTestEmail('smtp')}
                            disabled={testingEmail || !isSmtpConfigured}
                            className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
                          >
                            {testingEmail ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Mail className="w-3.5 h-3.5" />
                            )}
                            <span>Send Test via Chamber SMTP</span>
                          </button>

                          {/* 1-Click Direct Gmail button that always works */}
                          <a
                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(testEmailRecipient)}&su=${encodeURIComponent('✅ Verification Test: Varun Law Firm Email Gateway')}&body=${encodeURIComponent(
                              `Hello,\n\nThis is a verification test confirming that your Chamber consultation email gateway is operating.\n\n• Chambers of Advocate Varun Aggarwal (LL.M)\n• Phone: 8950503055\n• Direct Email: varunlawfirm@gmail.com\n• Chamber Complex: Sector 17 / High Court, Chandigarh\n\nVarun Law Firm`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-white border border-emerald-500/30 font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Send to {testEmailRecipient} via 1-Click Gmail</span>
                          </a>

                          {/* Cloud Preview Gateway button */}
                          <button
                            type="button"
                            onClick={() => handleSendTestEmail('cloud_preview')}
                            disabled={testingEmail}
                            className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Server className="w-3.5 h-3.5 text-[#c5a880]" />
                            <span>Verify Layout via Cloud Test Gateway (Preview)</span>
                          </button>
                        </div>

                        {!isSmtpConfigured && (
                          <span className="text-[11px] text-amber-300/80 block leading-tight">
                            Save your 16-character Google App Password to enable live background SMTP dispatch, or use the 1-Click Gmail button above.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* How to Get Gmail App Password */}
                    <div className="bg-[#070d1e] p-5 rounded-2xl border border-white/10 space-y-3 text-xs">
                      <h4 className="font-semibold text-white flex items-center gap-2">
                        <Key className="w-4 h-4 text-[#c5a880]" />
                        <span>Google App Password Setup (60 Seconds)</span>
                      </h4>
                      <ol className="list-decimal list-inside space-y-2 text-slate-300 text-[11px] leading-relaxed">
                        <li>Visit <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="text-[#ebd8ba] underline inline-flex items-center gap-1">Google Account Security <ExternalLink className="w-2.5 h-2.5" /></a>.</li>
                        <li>Turn on <strong>2-Step Verification</strong> if not already enabled.</li>
                        <li>Search for <strong>"App Passwords"</strong> in the search bar.</li>
                        <li>Create a new app name (e.g., <em>Varun Law Firm</em>).</li>
                        <li>Google displays a <strong>16-character code</strong> (e.g., <code className="bg-white/10 px-1 py-0.5 rounded text-white font-mono">abcd efgh ijkl mnop</code>).</li>
                        <li>Paste that 16-character code into the password field above and click <strong>Save</strong>!</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
              )
            ) : activeTab === 'notifications' ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[#070d1e] p-4 rounded-xl border border-white/10">
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#c5a880]" />
                      <span>Consultation Notification Audit Trail</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Live dispatch logs for Admin Email (<strong className="text-slate-300">varunlawfirm@gmail.com</strong>), Admin WhatsApp (<strong className="text-slate-300 font-mono">8950503055</strong>), and Client channels.
                    </p>
                  </div>
                  <button
                    onClick={fetchNotificationLogs}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 border border-white/10 flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#c5a880]" />
                    <span>Refresh Logs</span>
                  </button>
                </div>

                <div className="border border-white/10 rounded-xl overflow-hidden bg-[#070d1e]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-[#0b1530] text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
                        <tr>
                          <th className="py-3 px-4">Time</th>
                          <th className="py-3 px-4">Channel</th>
                          <th className="py-3 px-4">Recipient</th>
                          <th className="py-3 px-4">Docket Ref</th>
                          <th className="py-3 px-4">Summary</th>
                          <th className="py-3 px-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-sans">
                        {notificationLogs.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                              No notification records logged yet. New consultation bookings will automatically appear here.
                            </td>
                          </tr>
                        ) : (
                          notificationLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-white/5 transition-colors">
                              <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                                  log.type.includes('email') 
                                    ? 'bg-blue-950/60 text-blue-300 border border-blue-800/40' 
                                    : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                                }`}>
                                  {log.type.includes('email') ? <Mail className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                                  {log.type.replace('_', ' ').toUpperCase()}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-mono text-white text-[11px]">
                                {log.recipient}
                              </td>
                              <td className="py-3 px-4 font-mono text-[#ebd8ba]">
                                {log.appointmentRef}
                              </td>
                              <td className="py-3 px-4 text-slate-300 max-w-sm truncate">
                                {log.summary}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                                  {log.status.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Toolbar: Filter Buttons + Search Bar + CSV Export */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                  
                  {/* Segmented Filter Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#060b18] border border-white/10 rounded-xl">
                {(['All', 'Pending Review', 'Confirmed', 'Completed', 'Cancelled'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      selectedFilter === filter
                        ? 'bg-[#c5a880] text-[#070d1e] font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Search Query Input */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name, phone, ref..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#060b18] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-200 flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  title="Export appointments to CSV file"
                >
                  <Download className="w-3.5 h-3.5 text-[#c5a880]" />
                  <span>Export CSV</span>
                </button>
              </div>

            </div>

            {/* Manager Action Notice Banner */}
            {actionNotice && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 animate-in fade-in duration-150 ${
                  actionNotice.type === 'success'
                    ? 'bg-emerald-950/80 border-emerald-600/50 text-emerald-200'
                    : actionNotice.type === 'danger'
                    ? 'bg-rose-950/80 border-rose-600/50 text-rose-200'
                    : 'bg-blue-950/80 border-blue-600/50 text-blue-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {actionNotice.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : actionNotice.type === 'danger' ? (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
                  )}
                  <span className="font-medium">{actionNotice.text}</span>
                </div>
                <button
                  onClick={() => setActionNotice(null)}
                  className="text-slate-400 hover:text-white p-0.5"
                  aria-label="Dismiss notice"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Appointments Table */}
            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#070d1e]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0b1530] text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">Reference</th>
                      <th className="py-3 px-4">Client Name</th>
                      <th className="py-3 px-4">Date & Slot</th>
                      <th className="py-3 px-4">Practice Domain</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Manager Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                          No appointment records found matching the criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((appt) => (
                        <tr key={appt.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-medium text-[#ebd8ba]">
                            {appt.referenceNumber}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white">{appt.clientName}</div>
                            <div className="text-[11px] text-slate-400">{appt.phone}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-mono text-slate-200">{appt.date}</div>
                            <div className="text-[11px] text-slate-400">{appt.timeSlot}</div>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs truncate text-slate-300">
                            {appt.practiceArea}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-medium ${
                                appt.status === 'Confirmed'
                                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                                  : appt.status === 'Pending Review'
                                  ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                                  : appt.status === 'Completed'
                                  ? 'bg-blue-950/60 text-blue-300 border border-blue-800/40'
                                  : 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                              }`}
                            >
                              {appt.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {appt.status !== 'Confirmed' && (
                                <button
                                  onClick={() => handleStatusChange(appt.id, 'Confirmed')}
                                  className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-medium text-[11px] flex items-center gap-1 transition-colors border border-emerald-500/30"
                                  title="Approve & Confirm this appointment"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Approve</span>
                                </button>
                              )}
                              {appt.status !== 'Cancelled' && (
                                <button
                                  onClick={() => handleStatusChange(appt.id, 'Cancelled')}
                                  className="px-2 py-1 rounded bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-medium text-[11px] flex items-center gap-1 transition-colors border border-rose-500/30"
                                  title="Disapprove / Decline this appointment"
                                >
                                  <X className="w-3 h-3" />
                                  <span>Disapprove</span>
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setActiveAppointment(appt);
                                  setNoteEdit(appt.adminNotes || '');
                                }}
                                className="px-2.5 py-1 rounded bg-[#c5a880]/15 hover:bg-[#c5a880] text-[#ebd8ba] hover:text-[#070d1e] font-medium text-[11px] transition-colors"
                              >
                                Manage
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Active Appointment Detail & Action Modal Drawer */}
            {activeAppointment && (
              <div className="p-5 rounded-xl bg-[#070d1e] border border-[#c5a880]/40 flex flex-col gap-4 animate-in slide-in-from-bottom-2 duration-200">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[11px] font-mono text-[#d8be98] block">
                      Docket #{activeAppointment.referenceNumber}
                    </span>
                    <h4 className="text-base font-serif font-bold text-white">
                      {activeAppointment.clientName}
                    </h4>
                  </div>

                  {/* Status Toggle Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleStatusChange(activeAppointment.id, 'Confirmed')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        activeAppointment.status === 'Confirmed'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950 ring-1 ring-emerald-400'
                          : 'bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white border border-emerald-500/40'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Confirm</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(activeAppointment.id, 'Cancelled')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        activeAppointment.status === 'Cancelled'
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-950 ring-1 ring-rose-400'
                          : 'bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/40'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Disapprove / Decline</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(activeAppointment.id, 'Pending Review')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        activeAppointment.status === 'Pending Review'
                          ? 'bg-amber-600 text-white shadow-md shadow-amber-950 ring-1 ring-amber-400'
                          : 'bg-amber-600/20 hover:bg-amber-600/40 text-amber-200 border border-amber-500/30'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(activeAppointment.id, 'Completed')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        activeAppointment.status === 'Completed'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-600/20 hover:bg-blue-600/40 text-blue-200 border border-blue-500/30'
                      }`}
                    >
                      Completed
                    </button>
                    <button
                      onClick={() => setActiveAppointment(null)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 ml-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Contact Info:</span>
                    <span className="text-white block font-medium">{activeAppointment.phone}</span>
                    <span className="text-slate-300 block">{activeAppointment.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Consultation Format:</span>
                    <span className="text-[#ebd8ba] block font-medium">{activeAppointment.appointmentType}</span>
                    <span className="text-slate-300 block">{activeAppointment.date} · {activeAppointment.timeSlot}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Practice Domain:</span>
                    <span className="text-white block font-medium">{activeAppointment.practiceArea}</span>
                  </div>
                </div>

                {activeAppointment.caseSummary && (
                  <div className="p-3 bg-[#09122a] rounded-lg border border-white/5 text-xs text-slate-300">
                    <span className="text-slate-400 block mb-1 font-semibold">Client Matter Summary:</span>
                    <p>{activeAppointment.caseSummary}</p>
                  </div>
                )}

                {/* Real-time Notifications & WhatsApp Dispatch Console */}
                <div className="p-4 rounded-xl bg-[#09142d] border border-[#c5a880]/30 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#d8be98]">
                      <Bell className="w-4 h-4 text-[#c5a880]" />
                      <span>Notifications & WhatsApp Console</span>
                    </div>
                    <button
                      onClick={() => handleResendNotifications(activeAppointment.id)}
                      disabled={resendingId === activeAppointment.id}
                      className="px-3 py-1.5 rounded-lg bg-[#c5a880]/20 hover:bg-[#c5a880] text-[#ebd8ba] hover:text-[#070d1e] text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${resendingId === activeAppointment.id ? 'animate-spin' : ''}`} />
                      <span>{resendingId === activeAppointment.id ? 'Dispatching...' : 'Resend All Notifications'}</span>
                    </button>
                  </div>

                  {resendNotice && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{resendNotice}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Admin Channel Card */}
                    <div className="p-3 rounded-lg bg-[#060c1d] border border-white/5 flex flex-col justify-between gap-2.5">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-white flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-blue-400" />
                            <span>Admin Notification Channels</span>
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                            Delivered
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          • Email: <strong className="text-slate-200">varunlawfirm@gmail.com</strong><br />
                          • WhatsApp: <strong className="text-slate-200 font-mono">8950503055</strong>
                        </p>
                      </div>
                      <a
                        href={getAdminWhatsappUrl(activeAppointment)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-white border border-emerald-500/30 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Send WhatsApp Alert to Admin (8950503055)</span>
                      </a>
                    </div>

                    {/* Client Channel Card */}
                    <div className="p-3 rounded-lg bg-[#060c1d] border border-white/5 flex flex-col justify-between gap-2.5">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-white flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-sky-400" />
                            <span>Client Confirmation Channels</span>
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            activeAppointment.notifications?.clientEmailSent 
                              ? 'bg-emerald-500/20 text-emerald-300' 
                              : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {activeAppointment.notifications?.clientEmailSent ? 'Delivered via SMTP' : 'Direct Dispatch Ready'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          • Email: <strong className="text-slate-200">{activeAppointment.email}</strong><br />
                          • Phone: <strong className="text-slate-200 font-mono">{activeAppointment.phone}</strong>
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <a
                          href={getClientGmailUrl(activeAppointment)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-1.5 px-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Deliver Docket via 1-Click Gmail</span>
                        </a>

                        <a
                          href={getClientMailtoUrl(activeAppointment)}
                          className="w-full py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5 text-[#c5a880]" />
                          <span>Send via Email Client (Mailto)</span>
                        </a>

                        <a
                          href={getClientWhatsappUrl(activeAppointment)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send WhatsApp Confirmation</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Manager Reschedule & Slot Management Controls */}
                <div className="p-4 rounded-xl bg-[#08132d] border border-[#c5a880]/30 space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#d8be98]">
                      <Calendar className="w-4 h-4 text-[#c5a880]" />
                      <span>Manager Schedule & Rescheduling Controls</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Current: {activeAppointment.date} · {activeAppointment.timeSlot}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">New Consultation Date:</label>
                      <input
                        type="date"
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        className="w-full bg-[#060b18] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">New Time Slot:</label>
                      <select
                        value={rescheduleSlot}
                        onChange={(e) => setRescheduleSlot(e.target.value)}
                        className="w-full bg-[#060b18] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                      >
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot} className="bg-[#09122a] text-white">
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleReschedule}
                        disabled={isRescheduling}
                        className="w-full py-2 px-3 bg-amber-600/30 hover:bg-amber-600 text-amber-200 hover:text-white border border-amber-500/40 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRescheduling ? 'animate-spin' : ''}`} />
                        <span>{isRescheduling ? 'Updating...' : 'Reschedule & Confirm'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Advocate Internal Notes Field */}
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1 flex items-center gap-1.5">
                    <FileEdit className="w-3.5 h-3.5 text-[#c5a880]" />
                    Internal Advocate Case Notes:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add case preparation notes, precedents to look up, or fee notes..."
                      value={noteEdit}
                      onChange={(e) => setNoteEdit(e.target.value)}
                      className="flex-1 bg-[#09122a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                    />
                    <button
                      onClick={handleSaveNotes}
                      className="px-4 py-2 bg-[#c5a880] text-[#070d1e] font-semibold text-xs rounded-lg hover:bg-white transition-colors"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>

              </div>
            )}
            </>
          )}

          </div>
        )}

      </div>

      {/* Admin Unlock Modal Dialog */}
      {showAdminUnlockModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#09122a] border border-[#c5a880]/40 rounded-2xl p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowAdminUnlockModal(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 absolute right-4 top-4 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-[#c5a880]/15 border border-[#c5a880]/30 flex items-center justify-center text-[#ebd8ba] mx-auto">
              <Lock className="w-6 h-6 text-[#c5a880]" />
            </div>

            <div className="text-center">
              <h4 className="text-base font-serif font-bold text-white">Administrator Authorization</h4>
              <p className="text-xs text-slate-400 mt-1">
                Email & SMTP Gateway configuration is restricted to Administrator only.
              </p>
            </div>

            <form onSubmit={handleAdminUnlock} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Admin Passcode
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter administrator passcode"
                  value={adminUnlockKey}
                  onChange={(e) => setAdminUnlockKey(e.target.value)}
                  className="w-full bg-[#070d1e] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] text-center"
                />
              </div>

              {adminUnlockError && (
                <p className="text-xs text-rose-400 text-center font-medium">{adminUnlockError}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdminUnlockModal(false)}
                  className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 text-slate-300 text-xs rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-[#c5a880] hover:bg-white text-[#070d1e] font-semibold text-xs rounded-xl transition-colors"
                >
                  Verify Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
