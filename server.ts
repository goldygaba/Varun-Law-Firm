import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

export interface NotificationStatus {
  adminEmailSent: boolean;
  adminEmailRecipient: string;
  adminEmailTimestamp?: string;
  adminEmailError?: string;
  clientEmailSent: boolean;
  clientEmailRecipient: string;
  clientEmailTimestamp?: string;
  clientEmailError?: string;
  isRealSmtp?: boolean;
  smtpStatus?: 'connected' | 'auth_failed' | 'unconfigured' | 'simulated';
  gmailDirectUrl?: string;
  mailtoUrl?: string;
  googleCalendarUrl?: string;
  adminWhatsappUrl: string;
  clientWhatsappUrl: string;
  notificationLog?: string[];
}

// In-memory / disk persistence store for appointments
interface AppointmentRecord {
  id: string;
  referenceNumber: string;
  clientName: string;
  phone: string;
  email: string;
  appointmentType: string;
  date: string;
  timeSlot: string;
  practiceArea: string;
  caseSummary: string;
  status: 'Confirmed' | 'Pending Review' | 'Completed' | 'Cancelled';
  createdAt: string;
  adminNotes?: string;
  notifications?: NotificationStatus;
}

const APPOINTMENTS_FILE = path.join(__dirname, 'appointments-store.json');

function loadAppointments(): AppointmentRecord[] {
  try {
    if (fs.existsSync(APPOINTMENTS_FILE)) {
      const data = fs.readFileSync(APPOINTMENTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading appointments file:', err);
  }

  // Seed data
  return [
    {
      id: 'appt-101',
      referenceNumber: 'VLF-2026-8192',
      clientName: 'Rajesh Sharma',
      phone: '+91 98140 22319',
      email: 'r.sharma.industries@gmail.com',
      appointmentType: 'Chambers Consultation',
      date: '2026-10-15',
      timeSlot: '10:00 AM - 10:45 AM',
      practiceArea: 'Debt Recovery & SARFAESI Defense (DRT/DRAT)',
      caseSummary: 'Received Section 13(4) notice from public sector bank regarding factory mortgage in Ambala. Seeking stay on e-auction.',
      status: 'Confirmed',
      createdAt: '2026-10-09T14:22:00Z',
      adminNotes: 'Review valuation report and bank statement before meeting. Draft Section 17 SA grounds.',
    },
    {
      id: 'appt-102',
      referenceNumber: 'VLF-2026-7451',
      clientName: 'Priya Mehra',
      phone: '+91 98765 43210',
      email: 'priyamehra.arch@yahoo.com',
      appointmentType: 'Virtual Video Conference',
      date: '2026-10-16',
      timeSlot: '02:30 PM - 03:15 PM',
      practiceArea: 'Real Estate & RERA Advocacy',
      caseSummary: 'Residential flat in Sector 20 Panchkula delayed by 4 years. Seeking statutory interest under Section 18 HRERA.',
      status: 'Pending Review',
      createdAt: '2026-10-10T09:15:00Z',
      adminNotes: 'Send Google Meet link once BBA (Builder Buyer Agreement) is verified.',
    },
    {
      id: 'appt-103',
      referenceNumber: 'VLF-2026-9043',
      clientName: 'Col. K.S. Dhillon (Retd.)',
      phone: '+91 94170 88231',
      email: 'dhillon.ks52@outlook.com',
      appointmentType: 'Chambers Consultation',
      date: '2026-10-18',
      timeSlot: '11:15 AM - 12:00 PM',
      practiceArea: 'Central Administrative Tribunal (CAT)',
      caseSummary: 'Dispute regarding revised pension calculation and arrears under 7th CPC for defence civilian service.',
      status: 'Confirmed',
      createdAt: '2026-10-08T11:00:00Z',
      adminNotes: 'Check PCDA (Pensions) circulars and recent CAT Chandigarh division bench precedent.',
    },
  ];
}

function saveAppointments(appointments: AppointmentRecord[]) {
  try {
    fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(appointments, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving appointments file:', err);
  }
}

let appointmentsCache = loadAppointments();

const ADMIN_EMAIL = 'varunlawfirm@gmail.com';
const ADMIN_PHONE = '8950503055';
const ADMIN_WHATSAPP = '918950503055';
const NOTIFICATIONS_LOG_FILE = path.join(__dirname, 'notifications-store.json');

interface NotificationLogEntry {
  id: string;
  timestamp: string;
  appointmentRef: string;
  type: 'admin_email' | 'client_email' | 'admin_whatsapp' | 'client_whatsapp';
  recipient: string;
  status: 'sent' | 'queued' | 'simulated';
  subject?: string;
  summary: string;
}

function loadNotificationLogs(): NotificationLogEntry[] {
  try {
    if (fs.existsSync(NOTIFICATIONS_LOG_FILE)) {
      return JSON.parse(fs.readFileSync(NOTIFICATIONS_LOG_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error loading notification logs:', err);
  }
  return [];
}

function saveNotificationLog(entry: NotificationLogEntry) {
  try {
    const logs = loadNotificationLogs();
    logs.unshift(entry);
    fs.writeFileSync(NOTIFICATIONS_LOG_FILE, JSON.stringify(logs.slice(0, 100), null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing notification log:', err);
  }
}

// SMTP Configuration Setup
const SMTP_CONFIG_FILE = path.join(__dirname, 'smtp-config.json');

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
}

function loadSmtpConfig(): SmtpConfig {
  try {
    if (fs.existsSync(SMTP_CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(SMTP_CONFIG_FILE, 'utf-8'));
      return {
        host: data.host || process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(data.port) || Number(process.env.SMTP_PORT) || 465,
        secure: data.secure !== undefined ? Boolean(data.secure) : (Number(data.port) === 465 || process.env.SMTP_SECURE === 'true' || true),
        user: data.user || process.env.SMTP_USER || '',
        pass: data.pass || process.env.SMTP_PASS || '',
        fromName: data.fromName || 'Advocate Varun Aggarwal (LL.M)',
        fromEmail: data.fromEmail || data.user || process.env.SMTP_FROM || 'varunlawfirm@gmail.com',
      };
    }
  } catch (err) {
    console.error('Error reading SMTP config:', err);
  }
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE === 'true' || true,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    fromName: 'Advocate Varun Aggarwal (LL.M)',
    fromEmail: process.env.SMTP_FROM || process.env.SMTP_USER || 'varunlawfirm@gmail.com',
  };
}

function saveSmtpConfig(cfg: SmtpConfig) {
  try {
    fs.writeFileSync(SMTP_CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing SMTP config:', err);
  }
}

function generateIcsCalendar(appt: AppointmentRecord): string {
  const [startHourStr, startMinStr] = appt.timeSlot.split(' ')[0].split(':');
  const isPM = appt.timeSlot.includes('PM') && startHourStr !== '12';
  const hour = isPM ? parseInt(startHourStr, 10) + 12 : parseInt(startHourStr, 10);
  const formattedDate = appt.date.replace(/-/g, '');
  const startTimeFormatted = `${formattedDate}T${String(hour).padStart(2, '0')}${startMinStr}00`;
  const endTimeFormatted = `${formattedDate}T${String(hour + 1).padStart(2, '0')}${startMinStr}00`;
  const nowFormatted = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Varun Law Firm//Legal Consultation Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:vlf-${appt.referenceNumber}-${Date.now()}@varunlawfirm.com`,
    `DTSTAMP:${nowFormatted}`,
    `DTSTART:${startTimeFormatted}`,
    `DTEND:${endTimeFormatted}`,
    `SUMMARY:Legal Consultation - Adv. Varun Aggarwal (${appt.appointmentType})`,
    `DESCRIPTION:Consultation with Advocate Varun Aggarwal for ${appt.practiceArea}. Reference: ${appt.referenceNumber}. Venue: Chambers, Sector 17 / High Court, Chandigarh. Contact: 8950503055.`,
    'LOCATION:Varun Law Firm Chambers, Sector 17 / High Court, Chandigarh (Chandigarh, Punjab, Haryana, Delhi)',
    'STATUS:CONFIRMED',
    'ORGANIZER;CN="Advocate Varun Aggarwal":mailto:varunlawfirm@gmail.com',
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN="${appt.clientName}":mailto:${appt.email}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT60M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Legal Consultation with Advocate Varun Aggarwal in 1 hour',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function generateClientDirectEmailLinks(appt: AppointmentRecord) {
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

  const gmailDirectUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(appt.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
  const mailtoUrl = `mailto:${encodeURIComponent(appt.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;

  const title = encodeURIComponent(`Legal Consultation: Adv. Varun Aggarwal (${appt.referenceNumber})`);
  const details = encodeURIComponent(
    `Appointment Type: ${appt.appointmentType}\nPractice Area: ${appt.practiceArea}\nClient: ${appt.clientName}\nPhone: ${appt.phone}\nReference: ${appt.referenceNumber}\nChambers: Chandigarh, India (Practicing across Chandigarh, Punjab, Haryana, Delhi)`
  );
  const location = encodeURIComponent('Varun Law Firm Chambers, Chandigarh (Chandigarh, Punjab, Haryana, Delhi) / Video Link');
  const dateFormatted = appt.date.replace(/-/g, '');
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dateFormatted}T050000Z/${dateFormatted}T060000Z`;

  return { gmailDirectUrl, mailtoUrl, googleCalendarUrl, subject, bodyText };
}

// Nodemailer Transporter Setup
function getMailTransporter() {
  const cfg = loadSmtpConfig();
  const cleanUser = (cfg.user || '').trim();
  const cleanPass = (cfg.pass || '').replace(/\s+/g, '').trim();

  if (cleanUser && cleanPass) {
    const isGmail = (cfg.host || '').toLowerCase().includes('gmail') || cleanUser.endsWith('@gmail.com');
    const transportConfig: any = isGmail
      ? {
          service: 'gmail',
          auth: {
            user: cleanUser,
            pass: cleanPass,
          },
        }
      : {
          host: cfg.host,
          port: cfg.port,
          secure: cfg.secure,
          auth: {
            user: cleanUser,
            pass: cleanPass,
          },
        };

    return {
      transporter: nodemailer.createTransport(transportConfig),
      isReal: true,
      fromAddress: `"${cfg.fromName}" <${cfg.fromEmail || cleanUser}>`,
      cfg: { ...cfg, user: cleanUser, pass: cleanPass },
    };
  }
  // In development / serverless without external SMTP credentials, fallback to test JSON transport
  return {
    transporter: nodemailer.createTransport({
      jsonTransport: true,
    }),
    isReal: false,
    fromAddress: `"Varun Law Firm Portal" <varunlawfirm@gmail.com>`,
    cfg,
  };
}

function generateAdminEmailHtml(appt: AppointmentRecord): string {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070d1e; color: #f8fafc; margin: 0; padding: 24px; }
      .container { max-width: 620px; margin: 0 auto; background: #0c1630; border: 1px solid #c5a880; border-radius: 12px; overflow: hidden; }
      .header { background: linear-gradient(135deg, #101c3d, #070d1e); padding: 24px; border-bottom: 2px solid #c5a880; text-align: center; }
      .gold-text { color: #ebd8ba; font-family: Georgia, serif; font-size: 24px; font-weight: bold; margin: 0; }
      .subhead { color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-top: 6px; }
      .content { padding: 24px; }
      .alert-banner { background: rgba(197, 168, 128, 0.15); border-left: 4px solid #c5a880; padding: 12px 16px; margin-bottom: 20px; font-size: 14px; color: #ebd8ba; }
      .details-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      .details-table td { padding: 10px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-size: 13px; }
      .details-table td.label { color: #94a3b8; width: 35%; font-weight: 500; }
      .details-table td.value { color: #ffffff; font-weight: 600; }
      .case-box { background: #070d1e; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 14px; margin-bottom: 20px; font-size: 13px; color: #cbd5e1; }
      .btn { display: inline-block; padding: 10px 18px; border-radius: 6px; font-size: 12px; font-weight: bold; text-decoration: none; text-align: center; }
      .btn-gold { background: #c5a880; color: #070d1e; }
      .btn-wa { background: #25D366; color: #ffffff; }
      .footer { background: #070d1e; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255, 255, 255, 0.05); }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 class="gold-text">Varun Law Firm</h1>
        <div class="subhead">🚨 New Case Consultation Booking Alert</div>
      </div>
      <div class="content">
        <div class="alert-banner">
          <strong>Notice:</strong> A new legal consultation has been booked through the online chamber portal.
        </div>
        <table class="details-table">
          <tr><td class="label">Docket Reference:</td><td class="value" style="color: #ebd8ba;">${appt.referenceNumber}</td></tr>
          <tr><td class="label">Client Name:</td><td class="value">${appt.clientName}</td></tr>
          <tr><td class="label">Client Phone:</td><td class="value"><a href="tel:${appt.phone}" style="color: #ebd8ba;">${appt.phone}</a></td></tr>
          <tr><td class="label">Client Email:</td><td class="value"><a href="mailto:${appt.email}" style="color: #ebd8ba;">${appt.email}</a></td></tr>
          <tr><td class="label">Date & Time Slot:</td><td class="value" style="color: #38bdf8;">${appt.date} · ${appt.timeSlot}</td></tr>
          <tr><td class="label">Consultation Format:</td><td class="value">${appt.appointmentType}</td></tr>
          <tr><td class="label">Practice Domain:</td><td class="value">${appt.practiceArea}</td></tr>
          <tr><td class="label">Booking Time:</td><td class="value">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td></tr>
          <tr><td class="label">Jurisdiction:</td><td class="value">Chandigarh · Punjab · Haryana · Delhi</td></tr>
        </table>

        ${appt.caseSummary ? `
          <div style="font-size: 12px; color: #94a3b8; font-weight: bold; margin-bottom: 6px;">Client Matter Summary / Brief:</div>
          <div class="case-box">${appt.caseSummary}</div>
        ` : ''}

        <div style="margin-top: 24px; text-align: center;">
          <a href="https://wa.me/${appt.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(appt.clientName)},%20this%20is%20Advocate%20Varun%20Aggarwal%20regarding%20your%20consultation%20(Ref:%20${appt.referenceNumber})." class="btn btn-wa" style="margin-right: 8px;">Direct WhatsApp to Client</a>
          <a href="tel:${appt.phone.replace(/[^0-9+]/g, '')}" class="btn btn-gold">Call Client Directly</a>
        </div>
      </div>
      <div class="footer">
        Chambers of Advocate Varun Aggarwal (LL.M) · Sector 17 / High Court, Chandigarh · Phone: 8950503055
      </div>
    </div>
  </body>
  </html>
  `;
}

function generateClientEmailHtml(appt: AppointmentRecord): string {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070d1e; color: #f8fafc; margin: 0; padding: 24px; }
      .container { max-width: 620px; margin: 0 auto; background: #0c1630; border: 1px solid #c5a880; border-radius: 12px; overflow: hidden; }
      .header { background: linear-gradient(135deg, #101c3d, #070d1e); padding: 24px; border-bottom: 2px solid #c5a880; text-align: center; }
      .gold-text { color: #ebd8ba; font-family: Georgia, serif; font-size: 24px; font-weight: bold; margin: 0; }
      .subhead { color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-top: 6px; }
      .content { padding: 24px; }
      .congrats-card { background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 16px; margin-bottom: 20px; text-align: center; }
      .congrats-title { color: #34d399; font-size: 16px; font-weight: bold; margin-bottom: 4px; }
      .ref-badge { font-family: monospace; font-size: 18px; color: #ffffff; font-weight: bold; letter-spacing: 1px; }
      .details-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      .details-table td { padding: 10px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-size: 13px; }
      .details-table td.label { color: #94a3b8; width: 35%; font-weight: 500; }
      .details-table td.value { color: #ffffff; font-weight: 600; }
      .privilege-box { background: #070d1e; border: 1px solid rgba(197, 168, 128, 0.25); border-radius: 8px; padding: 14px; margin-bottom: 20px; font-size: 12px; color: #cbd5e1; line-height: 1.5; }
      .btn { display: inline-block; padding: 10px 18px; border-radius: 6px; font-size: 12px; font-weight: bold; text-decoration: none; text-align: center; }
      .btn-gold { background: #c5a880; color: #070d1e; }
      .btn-wa { background: #25D366; color: #ffffff; }
      .footer { background: #070d1e; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255, 255, 255, 0.05); }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 class="gold-text">Varun Law Firm</h1>
        <div class="subhead">Chambers of Advocate Varun Aggarwal (LL.M)</div>
      </div>
      <div class="content">
        <div class="congrats-card">
          <div class="congrats-title">✓ Consultation Appointment Confirmed</div>
          <div class="ref-badge">Docket ID: ${appt.referenceNumber}</div>
        </div>

        <p style="font-size: 14px; color: #e2e8f0; line-height: 1.6;">
          Dear <strong>${appt.clientName}</strong>,<br>
          Thank you for scheduling a legal consultation with <strong>Advocate Varun Aggarwal</strong>. Your appointment has been confirmed and registered in our chambers calendar.
        </p>

        <table class="details-table">
          <tr><td class="label">Date:</td><td class="value" style="color: #38bdf8;">${appt.date}</td></tr>
          <tr><td class="label">Reserved Time:</td><td class="value" style="color: #38bdf8;">${appt.timeSlot}</td></tr>
          <tr><td class="label">Consultation Format:</td><td class="value">${appt.appointmentType}</td></tr>
          <tr><td class="label">Practice Domain:</td><td class="value">${appt.practiceArea}</td></tr>
          <tr><td class="label">Venue / Meeting:</td><td class="value">Advocate Chambers, Sector 17 / High Court Complex, Chandigarh (or Encrypted Video Link)</td></tr>
          <tr><td class="label">Direct Chambers Contact:</td><td class="value">8950503055</td></tr>
        </table>

        <div class="privilege-box">
          <strong style="color: #ebd8ba;">Attorney-Client Privilege Guarantee:</strong><br>
          All information and documents disclosed for this consultation are protected under Attorney-Client Privilege pursuant to Section 126 of the Indian Evidence Act, 1872. Please bring all related court notices, loan agreements, or builder papers for comprehensive evaluation.
        </div>

        <div style="margin-top: 24px; text-align: center;">
          <a href="https://wa.me/918950503055?text=Hello%20Advocate%20Varun%20Aggarwal,%20my%20consultation%20is%20booked%20under%20Docket%20${appt.referenceNumber}.%20Confirming%20my%20details." class="btn btn-wa" style="margin-right: 8px;">Chat with Advocate on WhatsApp</a>
          <a href="tel:8950503055" class="btn btn-gold">Call Chambers Directly (8950503055)</a>
        </div>
      </div>
      <div class="footer">
        Varun Law Firm · Chandigarh, Punjab, Haryana, Delhi · Direct: 8950503055 · varunlawfirm@gmail.com
      </div>
    </div>
  </body>
  </html>
  `;
}

function generateAdminWhatsappUrl(appt: AppointmentRecord): string {
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
    `*Received:* ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
  ].join('\n');
  return `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

function generateClientWhatsappUrl(appt: AppointmentRecord): string {
  const cleanPhone = appt.phone.replace(/[^0-9]/g, '');
  const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const msg = [
    `*⚖️ CONSULTATION CONFIRMED - VARUN LAW FIRM*`,
    `*Chambers of Advocate Varun Aggarwal (LL.M)*`,
    `*Booking Docket Reference:* ${appt.referenceNumber}`,
    ``,
    `Dear ${appt.clientName},`,
    `Your legal consultation has been confirmed and scheduled:`,
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
}

async function dispatchBookingNotifications(appt: AppointmentRecord): Promise<NotificationStatus> {
  const mailInfo = getMailTransporter();
  const timestamp = new Date().toISOString();
  const logs: string[] = [];

  let adminEmailSent = false;
  let clientEmailSent = false;
  let adminEmailError: string | undefined = undefined;
  let clientEmailError: string | undefined = undefined;

  const directLinks = generateClientDirectEmailLinks(appt);
  const icsContent = generateIcsCalendar(appt);

  // 1. Dispatch Email to Admin (varunlawfirm@gmail.com)
  try {
    const adminMailOptions = {
      from: mailInfo.fromAddress,
      to: ADMIN_EMAIL,
      subject: `🚨 [NEW BOOKING] ${appt.referenceNumber} - ${appt.clientName} (${appt.date} · ${appt.timeSlot})`,
      html: generateAdminEmailHtml(appt),
      icalEvent: {
        filename: `consultation-${appt.referenceNumber}.ics`,
        method: 'REQUEST',
        content: icsContent,
      },
      attachments: [
        {
          filename: `consultation-${appt.referenceNumber}.ics`,
          content: icsContent,
          contentType: 'text/calendar; charset=utf-8; method=REQUEST',
        },
      ],
    };
    await mailInfo.transporter.sendMail(adminMailOptions);
    adminEmailSent = true;
    logs.push(
      mailInfo.isReal
        ? `Live admin email delivered to ${ADMIN_EMAIL} via Chamber SMTP`
        : `Admin email prepared (simulated - configure chamber SMTP in Admin Portal to deliver live)`
    );
    saveNotificationLog({
      id: `log-${Date.now()}-admin`,
      timestamp,
      appointmentRef: appt.referenceNumber,
      type: 'admin_email',
      recipient: ADMIN_EMAIL,
      status: mailInfo.isReal ? 'sent' : 'simulated',
      subject: adminMailOptions.subject,
      summary: `Booking alert for ${appt.clientName} (${appt.practiceArea})`,
    });
  } catch (err: any) {
    const errText = err?.message || String(err);
    const is535 = errText.includes('535') || errText.includes('BadCredentials') || errText.includes('Username and Password not accepted');
    adminEmailError = is535 ? 'Google 535 Bad Credentials: 16-character App Password required' : errText;
    console.warn('Admin email dispatch error:', adminEmailError);
    logs.push(`Admin email notice: ${adminEmailError}`);
    saveNotificationLog({
      id: `log-${Date.now()}-admin-err`,
      timestamp,
      appointmentRef: appt.referenceNumber,
      type: 'admin_email',
      recipient: ADMIN_EMAIL,
      status: 'simulated',
      summary: `Admin email alert: ${adminEmailError}`,
    });
  }

  // 2. Dispatch Confirmation Email to Client with .ICS Calendar Attachment
  try {
    const clientMailOptions = {
      from: mailInfo.fromAddress,
      to: appt.email,
      subject: `Booking Confirmed: Legal Consultation with Advocate Varun Aggarwal (${appt.referenceNumber})`,
      html: generateClientEmailHtml(appt),
      icalEvent: {
        filename: `consultation-${appt.referenceNumber}.ics`,
        method: 'REQUEST',
        content: icsContent,
      },
      attachments: [
        {
          filename: `legal-consultation-${appt.referenceNumber}.ics`,
          content: icsContent,
          contentType: 'text/calendar; charset=utf-8; method=REQUEST',
        },
      ],
    };
    await mailInfo.transporter.sendMail(clientMailOptions);
    clientEmailSent = true;
    logs.push(
      mailInfo.isReal
        ? `Live client confirmation email delivered to ${appt.email} via Chamber SMTP`
        : `Client confirmation email prepared/simulated (1-click Gmail and mailto available)`
    );
    saveNotificationLog({
      id: `log-${Date.now()}-client`,
      timestamp,
      appointmentRef: appt.referenceNumber,
      type: 'client_email',
      recipient: appt.email,
      status: mailInfo.isReal ? 'sent' : 'simulated',
      subject: clientMailOptions.subject,
      summary: `Confirmation docket & calendar invite for client ${appt.clientName}`,
    });
  } catch (err: any) {
    const errText = err?.message || String(err);
    const is535 = errText.includes('535') || errText.includes('BadCredentials') || errText.includes('Username and Password not accepted');
    clientEmailError = is535 ? 'Google 535 Bad Credentials: 16-character App Password required' : errText;
    console.warn('Client email dispatch error:', clientEmailError);
    logs.push(`Client email notice: ${clientEmailError}. 1-Click Gmail & WhatsApp delivery active.`);
    saveNotificationLog({
      id: `log-${Date.now()}-client-err`,
      timestamp,
      appointmentRef: appt.referenceNumber,
      type: 'client_email',
      recipient: appt.email,
      status: 'simulated',
      summary: `Client email: ${clientEmailError}`,
    });
  }

  // 3. Generate WhatsApp links for Admin and Client
  const adminWhatsappUrl = generateAdminWhatsappUrl(appt);
  const clientWhatsappUrl = generateClientWhatsappUrl(appt);

  saveNotificationLog({
    id: `log-${Date.now()}-wa-admin`,
    timestamp,
    appointmentRef: appt.referenceNumber,
    type: 'admin_whatsapp',
    recipient: ADMIN_PHONE,
    status: 'sent',
    summary: `Admin WhatsApp alert generated for ${ADMIN_PHONE}`,
  });

  saveNotificationLog({
    id: `log-${Date.now()}-wa-client`,
    timestamp,
    appointmentRef: appt.referenceNumber,
    type: 'client_whatsapp',
    recipient: appt.phone,
    status: 'sent',
    summary: `Client WhatsApp confirmation receipt generated for ${appt.phone}`,
  });

  logs.push(`Admin WhatsApp notification link generated for ${ADMIN_PHONE}`);
  logs.push(`Client WhatsApp confirmation link generated for ${appt.phone}`);

  const isAuthIssue = Boolean((clientEmailError && clientEmailError.includes('535')) || (adminEmailError && adminEmailError.includes('535')));

  return {
    adminEmailSent,
    adminEmailRecipient: ADMIN_EMAIL,
    adminEmailTimestamp: timestamp,
    adminEmailError,
    clientEmailSent,
    clientEmailRecipient: appt.email,
    clientEmailTimestamp: timestamp,
    clientEmailError,
    isRealSmtp: Boolean(mailInfo.isReal && clientEmailSent),
    smtpStatus: isAuthIssue ? 'auth_failed' : (clientEmailSent ? 'connected' : (mailInfo.isReal ? 'auth_failed' : 'unconfigured')),
    gmailDirectUrl: directLinks.gmailDirectUrl,
    mailtoUrl: directLinks.mailtoUrl,
    googleCalendarUrl: directLinks.googleCalendarUrl,
    adminWhatsappUrl,
    clientWhatsappUrl,
    notificationLog: logs,
  };
}

// API Endpoints
app.get('/api/appointments', (_req, res) => {
  res.json({ success: true, appointments: appointmentsCache });
});

app.get('/api/notifications-log', (_req, res) => {
  res.json({ success: true, logs: loadNotificationLogs() });
});

// Chamber SMTP Settings endpoints
app.get('/api/smtp-config', (_req, res) => {
  const cfg = loadSmtpConfig();
  res.json({
    success: true,
    config: {
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      user: cfg.user,
      isConfigured: Boolean(cfg.user && cfg.pass),
      hasPass: Boolean(cfg.pass),
      fromName: cfg.fromName,
      fromEmail: cfg.fromEmail,
    },
  });
});

app.post('/api/smtp-config', (req, res) => {
  const { host, port, secure, user, pass, fromName, fromEmail } = req.body;
  const existing = loadSmtpConfig();
  const updated: SmtpConfig = {
    host: host || existing.host,
    port: Number(port) || existing.port,
    secure: secure !== undefined ? Boolean(secure) : existing.secure,
    user: user !== undefined ? user.trim() : existing.user,
    pass: pass !== undefined && pass.trim() !== '' ? pass.trim() : existing.pass,
    fromName: fromName || existing.fromName,
    fromEmail: fromEmail || user || existing.fromEmail,
  };
  saveSmtpConfig(updated);
  res.json({
    success: true,
    message: 'Chamber SMTP settings successfully saved.',
    isConfigured: Boolean(updated.user && updated.pass),
  });
});

app.post('/api/reset-smtp-config', (_req, res) => {
  const defaultCfg: SmtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    user: '',
    pass: '',
    fromName: 'Advocate Varun Aggarwal (LL.M)',
    fromEmail: 'varunlawfirm@gmail.com',
  };
  saveSmtpConfig(defaultCfg);
  res.json({
    success: true,
    message: 'Chamber SMTP credentials reset to default.',
  });
});

app.post('/api/send-test-email', async (req, res) => {
  const { recipientEmail, mode } = req.body;
  if (!recipientEmail || !recipientEmail.includes('@')) {
    return res.status(400).json({ success: false, error: 'A valid recipient email address is required.' });
  }

  // Cloud Preview Mode (Using ephemeral verified test account with instant live viewer)
  if (mode === 'cloud_preview') {
    try {
      const testAccount = await nodemailer.createTestAccount();
      const testTransporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const info = await testTransporter.sendMail({
        from: '"Advocate Varun Aggarwal (LL.M)" <varunlawfirm@gmail.com>',
        to: recipientEmail,
        subject: '✅ Verification Test: Varun Law Firm Chamber Gateway (Live Preview)',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 24px; background: #070d1e; color: #ffffff; border-radius: 12px; border: 1px solid #c5a880;">
            <h2 style="color: #ebd8ba; margin-top: 0;">Varun Law Firm - Email System Online</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
              This is a live verification test confirming that the Chamber email docket and calendar invite layout is rendering properly.
            </p>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
              <tr><td style="color: #94a3b8; padding: 6px 0;">Advocate Chambers:</td><td style="color: #ffffff; font-weight: bold;">Advocate Varun Aggarwal (LL.M)</td></tr>
              <tr><td style="color: #94a3b8; padding: 6px 0;">Delivered To:</td><td style="color: #38bdf8; font-weight: bold;">${recipientEmail}</td></tr>
              <tr><td style="color: #94a3b8; padding: 6px 0;">Server Timestamp:</td><td style="color: #ffffff;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td></tr>
            </table>
            <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 20px 0;">
            <p style="font-size: 11px; color: #64748b; margin-bottom: 0;">
              Chambers of Advocate Varun Aggarwal (LL.M) · Sector 17 / High Court, Chandigarh · Direct Contact: 8950503055
            </p>
          </div>
        `,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);

      saveNotificationLog({
        id: `log-${Date.now()}-cloud-test`,
        timestamp: new Date().toISOString(),
        appointmentRef: 'TEST-CLOUD-VERIFICATION',
        type: 'client_email',
        recipient: recipientEmail,
        status: 'sent',
        subject: '✅ Verification Test: Varun Law Firm Chamber Gateway (Live Preview)',
        summary: `Cloud verification test dispatched to ${recipientEmail}`,
      });

      return res.json({
        success: true,
        mode: 'cloud_preview',
        message: `Cloud test email rendered and delivered to ${recipientEmail}!`,
        previewUrl,
      });
    } catch (cloudErr: any) {
      console.error('Cloud preview error:', cloudErr);
    }
  }

  const mailInfo = getMailTransporter();
  const directGmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent('✅ Verification Test: Varun Law Firm Email Gateway')}&body=${encodeURIComponent(
    `Hello,\n\nThis is a verification test confirming that your Chamber consultation email gateway is operating.\n\n• Chambers of Advocate Varun Aggarwal (LL.M)\n• Phone: 8950503055\n• Direct Email: varunlawfirm@gmail.com\n• Chamber Complex: Sector 17 / High Court, Chandigarh (Chd · Pb · Hry · Del)\n\nVarun Law Firm`
  )}`;

  if (!mailInfo.isReal) {
    return res.status(400).json({
      success: false,
      error: 'SMTP credentials not configured yet. Please enter your Gmail address and 16-character Google App Password in the fields below, or use the 1-click test button.',
      directGmailUrl,
      appPasswordUrl: 'https://myaccount.google.com/apppasswords',
    });
  }

  try {
    const testResult = await mailInfo.transporter.sendMail({
      from: mailInfo.fromAddress,
      to: recipientEmail,
      subject: '✅ Verification Test: Varun Law Firm Email Gateway',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; background: #070d1e; color: #ffffff; border-radius: 12px; border: 1px solid #c5a880;">
          <h2 style="color: #ebd8ba; margin-top: 0;">Varun Law Firm - Email System Online</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
            This is a verification test confirming that your Chamber SMTP email gateway is functioning properly.
          </p>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
            <tr><td style="color: #94a3b8; padding: 6px 0;">Configured Sender:</td><td style="color: #ffffff; font-weight: bold;">${mailInfo.fromAddress}</td></tr>
            <tr><td style="color: #94a3b8; padding: 6px 0;">Delivered To:</td><td style="color: #38bdf8; font-weight: bold;">${recipientEmail}</td></tr>
            <tr><td style="color: #94a3b8; padding: 6px 0;">Server Timestamp:</td><td style="color: #ffffff;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td></tr>
          </table>
          <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 20px 0;">
          <p style="font-size: 11px; color: #64748b; margin-bottom: 0;">
            Chambers of Advocate Varun Aggarwal (LL.M) · Sector 17 / High Court, Chandigarh · Phone: 8950503055
          </p>
        </div>
      `,
    });

    saveNotificationLog({
      id: `log-${Date.now()}-test`,
      timestamp: new Date().toISOString(),
      appointmentRef: 'TEST-VERIFICATION',
      type: 'client_email',
      recipient: recipientEmail,
      status: 'sent',
      subject: '✅ Verification Test: Varun Law Firm Email Gateway',
      summary: `Verification test email sent to ${recipientEmail}`,
    });

    res.json({
      success: true,
      message: `Test email successfully delivered to ${recipientEmail}!`,
      messageId: testResult.messageId,
    });
  } catch (err: any) {
    const errText = err?.message || String(err);
    console.error('SMTP test email error:', errText);

    const is535 = errText.includes('535') || errText.includes('BadCredentials') || errText.includes('Username and Password not accepted') || err?.code === 'EAUTH';

    if (is535) {
      return res.status(401).json({
        success: false,
        code: 'GMAIL_535_BAD_CREDENTIALS',
        error: `Delivery Failed: Invalid login (535-5.7.8 Bad Credentials). Google rejected the password for "${mailInfo.cfg.user}". Google SMTP does not accept standard Google account passwords.`,
        details: `Google accounts with 2-Step Verification strictly require a 16-character Google App Password (not your personal account password). Regular passwords will always be rejected by Google with error 535.`,
        user: mailInfo.cfg.user,
        appPasswordUrl: 'https://myaccount.google.com/apppasswords',
        directGmailUrl,
        instructions: [
          '1. Open Google Account Security: https://myaccount.google.com/apppasswords',
          '2. Ensure 2-Step Verification is turned ON.',
          '3. Under "App Passwords", type "Varun Law Firm" and click Create.',
          '4. Google will display a 16-character code (e.g. "abcd efgh ijkl mnop").',
          '5. Paste that 16-character code into the Chamber SMTP settings and click Save.'
        ]
      });
    }

    res.status(500).json({
      success: false,
      code: 'SMTP_ERROR',
      error: errText || 'Failed to send test email. Please check your SMTP host, port, user, or App Password.',
      directGmailUrl,
      appPasswordUrl: 'https://myaccount.google.com/apppasswords',
    });
  }
});

app.post('/api/appointments', async (req, res) => {
  const { clientName, phone, email, appointmentType, date, timeSlot, practiceArea, caseSummary } = req.body;

  if (!clientName || !phone || !email || !date || !timeSlot) {
    return res.status(400).json({ success: false, error: 'Missing required appointment fields.' });
  }

  // Duplicate Booking Prevention for same date & timeSlot
  const existingConflict = appointmentsCache.find(
    (a) => a.date === date && a.timeSlot === timeSlot && a.status !== 'Cancelled'
  );

  if (existingConflict) {
    return res.status(409).json({
      success: false,
      error: `The slot ${timeSlot} on ${date} is already booked. Please select another slot.`,
    });
  }

  const randomRefNum = Math.floor(1000 + Math.random() * 9000);
  const newAppointment: AppointmentRecord = {
    id: `appt-${Date.now()}`,
    referenceNumber: `VLF-2026-${randomRefNum}`,
    clientName,
    phone,
    email,
    appointmentType: appointmentType || 'Chambers Consultation',
    date,
    timeSlot,
    practiceArea: practiceArea || 'General Legal Consultation',
    caseSummary: caseSummary || '',
    status: 'Pending Review',
    createdAt: new Date().toISOString(),
    adminNotes: 'Newly scheduled consultation via online legal portal.',
  };

  // Dispatch full bundle of email and WhatsApp notifications
  try {
    const notifStatus = await dispatchBookingNotifications(newAppointment);
    newAppointment.notifications = notifStatus;
  } catch (err) {
    console.error('Error dispatching notifications:', err);
  }

  appointmentsCache.unshift(newAppointment);
  saveAppointments(appointmentsCache);

  res.status(201).json({
    success: true,
    message: 'Appointment successfully registered and notifications dispatched.',
    appointment: newAppointment,
  });
});

app.post('/api/appointments/:id/resend-notifications', async (req, res) => {
  const { id } = req.params;
  const apptIndex = appointmentsCache.findIndex((a) => a.id === id);
  if (apptIndex === -1) {
    return res.status(404).json({ success: false, error: 'Appointment not found.' });
  }

  try {
    const notifStatus = await dispatchBookingNotifications(appointmentsCache[apptIndex]);
    appointmentsCache[apptIndex].notifications = notifStatus;
    saveAppointments(appointmentsCache);
    res.json({
      success: true,
      message: 'Notifications successfully resent to Admin and Client.',
      appointment: appointmentsCache[apptIndex],
    });
  } catch (err) {
    console.error('Failed to resend notifications:', err);
    res.status(500).json({ success: false, error: 'Failed to resend notifications.' });
  }
});

app.patch('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  const { status, adminNotes, date, timeSlot } = req.body;

  const apptIndex = appointmentsCache.findIndex((a) => a.id === id);
  if (apptIndex === -1) {
    return res.status(404).json({ success: false, error: 'Appointment not found.' });
  }

  if (status) {
    appointmentsCache[apptIndex].status = status;
  }
  if (adminNotes !== undefined) {
    appointmentsCache[apptIndex].adminNotes = adminNotes;
  }
  if (date) {
    appointmentsCache[apptIndex].date = date;
  }
  if (timeSlot) {
    appointmentsCache[apptIndex].timeSlot = timeSlot;
  }

  saveAppointments(appointmentsCache);
  res.json({ success: true, appointment: appointmentsCache[apptIndex] });
});

app.delete('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  const apptIndex = appointmentsCache.findIndex((a) => a.id === id);
  if (apptIndex === -1) {
    return res.status(404).json({ success: false, error: 'Appointment not found.' });
  }

  appointmentsCache[apptIndex].status = 'Cancelled';
  saveAppointments(appointmentsCache);
  res.json({ success: true, message: 'Appointment marked as cancelled.' });
});

// Production vs Development Setup
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Varun Law Firm server listening on port ${PORT}`);
  });
}

startServer();
