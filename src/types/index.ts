export type AppointmentType = 
  | 'Chambers Consultation'
  | 'Virtual Video Conference'
  | 'Urgent High Court Advisory'
  | 'Contract & Document Review';

export type AppointmentStatus = 'Confirmed' | 'Pending Review' | 'Completed' | 'Cancelled';

export interface NotificationStatus {
  adminEmailSent: boolean;
  adminEmailRecipient: string;
  adminEmailTimestamp?: string;
  clientEmailSent: boolean;
  clientEmailRecipient: string;
  clientEmailTimestamp?: string;
  isRealSmtp?: boolean;
  clientEmailError?: string;
  adminEmailError?: string;
  smtpStatus?: 'connected' | 'auth_failed' | 'unconfigured' | 'simulated';
  gmailDirectUrl?: string;
  mailtoUrl?: string;
  googleCalendarUrl?: string;
  adminWhatsappUrl: string;
  clientWhatsappUrl: string;
  notificationLog?: string[];
}

export interface OfficeScene {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  attire: string;
  setting: string;
  category: string;
  imageUrl?: string;
  altText?: string;
}

export interface Appointment {
  id: string;
  referenceNumber: string;
  clientName: string;
  phone: string;
  email: string;
  appointmentType: AppointmentType;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  practiceArea: string;
  caseSummary: string;
  status: AppointmentStatus;
  createdAt: string;
  adminNotes?: string;
  notifications?: NotificationStatus;
}

export interface PracticeArea {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  statutes: string[];
  keyServices: string[];
  forums: string[];
  caseTypeExamples: string[];
}

export interface CourtForum {
  id: string;
  name: string;
  location: string;
  type: 'Constitutional & Appellate' | 'Specialized Tribunal' | 'Regulatory Commission' | 'Subordinate Judiciary';
  description: string;
  varunScope: string;
  benchDetails: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  readTime: string;
  publishedDate: string;
  excerpt: string;
  content: string[];
  keyTakeaways: string[];
  applicableLaws: string[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'Consultation' | 'Litigation' | 'Fees & Billing' | 'Confidentiality';
}

export interface Testimonial {
  id: string;
  clientNameOrInitials: string;
  clientRole: string;
  location: string;
  practiceArea: string;
  reviewText: string;
  keyAttribute: string;
  year: string;
}
