export type UserRole = 'patient' | 'hospital_staff';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  abhaId?: string;
  hospitalId?: string; // If hospital staff
  state: string;
  city: string;
}

export type HospitalType = 'Government' | 'Private' | 'Charitable' | 'Autonomous Institute';

export interface Hospital {
  id: string;
  name: string;
  type: HospitalType;
  state: string;
  city: string;
  district: string;
  pincode: string;
  address: string;
  phone: string;
  emergencyPhone: string;
  email: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  totalBeds: number;
  icuBeds: number;
  availableBeds: number;
  availableIcuBeds: number;
  rating: number;
  accreditations: string[]; // e.g. ['NABH', 'NABL', 'AB-PMJAY', 'Aarogyasri']
  schemesSupported: string[]; // e.g. ['Ayushman Bharat PM-JAY', 'Aarogyasri', 'CGHS', 'ECHS']
  specialties: string[];
  hasBloodBank: boolean;
  has24x7Emergency: boolean;
  hasTelemedicine: boolean;
  verified: boolean;
  description: string;
  doctorsCount: number;
  opdTimings: string;
}

export interface Doctor {
  id: string;
  hospitalId: string;
  hospitalName: string;
  name: string;
  qualification: string;
  specialty: string;
  experienceYears: number;
  languages: string[];
  consultationFee: number;
  rating: number;
  availableDays: string[];
  availableSlots: string[];
  avatarUrl?: string;
}

export type AppointmentStatus = 'CONFIRMED' | 'PENDING_CONFIRMATION' | 'COMPLETED' | 'CANCELLED';
export type PaymentMethod = 'ONLINE' | 'OFFLINE';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED';

export interface Appointment {
  id: string;
  bookingReference: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  patientAge: number;
  patientGender: string;
  hospitalId: string;
  hospitalName: string;
  hospitalAddress: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  consultationType: 'IN_PERSON' | 'TELEMEDICINE';
  appointmentDate: string;
  timeSlot: string;
  consultationReason: string;
  bookingFee: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  appointmentStatus: AppointmentStatus;
  createdAt: string;
  paymentTransactionId?: string;
  offlineReceiptNumber?: string;
  collectedByStaff?: string;
  collectedAt?: string;
}

export interface PaymentReceipt {
  receiptId: string;
  appointmentId: string;
  bookingReference: string;
  patientName: string;
  hospitalName: string;
  doctorName: string;
  amount: number;
  gstAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentChannel: string; // e.g., 'UPI (Razorpay)', 'Credit Card', 'Cash at Counter', 'UPI at Hospital'
  transactionReference: string;
  date: string;
  collectedBy?: string;
}

export type HealthRecordType = 'Prescription' | 'Lab Report' | 'Scan & Imaging' | 'Discharge Summary' | 'Vaccination' | 'Other';

export interface HealthRecord {
  id: string;
  patientId: string;
  title: string;
  type: HealthRecordType;
  hospitalOrLab: string;
  doctorName?: string;
  date: string;
  fileSize: string;
  fileName: string;
  fileUrl?: string;
  notes?: string;
}

export interface FamilyMember {
  id: string;
  patientId: string;
  fullName: string;
  relationship: 'Parent' | 'Spouse' | 'Child' | 'Sibling' | 'Other';
  age: number;
  bloodGroup: string;
  existingConditions?: string;
  emergencyContact: boolean;
}

export type NotificationPriority = 'CRITICAL' | 'HIGH' | 'NORMAL';

export interface AppNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  timestamp: string;
  priority: NotificationPriority;
  read: boolean;
  category: 'appointment' | 'payment' | 'emergency' | 'report' | 'health_alert' | 'system';
  actionUrl?: string;
}

export interface BloodStockItem {
  id: string;
  bloodBankName: string;
  city: string;
  state: string;
  contactNumber: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  unitsAvailable: number;
  lastUpdated: string;
  verified: boolean;
}

export interface LabTestPackage {
  id: string;
  testName: string;
  category: string;
  description: string;
  fastingRequired: boolean;
  sampleType: string;
  reportWithinHours: number;
  price: number;
  homeCollectionAvailable: boolean;
}

export interface GovernmentScheme {
  id: string;
  schemeName: string;
  level: 'Central' | 'State';
  state?: string;
  coverageAmount: string;
  eligibility: string;
  benefits: string;
  requiredDocuments: string[];
  officialPortalUrl: string;
  helpline: string;
}
