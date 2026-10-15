import { Appointment, PaymentReceipt, PaymentMethod, PaymentStatus, AppointmentStatus } from '../types';
import { triggerRealNotification } from './notificationService';

const APPOINTMENTS_KEY = 'mediseva_appointments';
const RECEIPTS_KEY = 'mediseva_receipts';

export const getStoredAppointments = (): Appointment[] => {
  try {
    const raw = localStorage.getItem(APPOINTMENTS_KEY);
    if (!raw) {
      // Get current logged-in user name if available
      let defaultName = 'Citizen Patient';
      try {
        const u = localStorage.getItem('mediseva_current_user');
        if (u) {
          const parsed = JSON.parse(u);
          if (parsed?.name) defaultName = parsed.name;
        }
      } catch {}

      // Seed initial sample appointments for demonstration
      const initial: Appointment[] = [
        {
          id: 'apt-demo-01',
          bookingReference: 'MS-2026-DEL-8941',
          patientId: 'patient-demo-01',
          patientName: defaultName,
          patientPhone: '+91 98490 12345',
          patientEmail: 'patient@mediseva.in',
          patientAge: 32,
          patientGender: 'Female',
          hospitalId: 'hosp-del-01',
          hospitalName: 'All India Institute of Medical Sciences (AIIMS)',
          hospitalAddress: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi',
          doctorId: 'doc-01',
          doctorName: 'Dr. Randeep Guleria',
          doctorSpecialty: 'Pulmonology & Critical Care',
          consultationType: 'IN_PERSON',
          appointmentDate: '2026-10-18',
          timeSlot: '10:00 AM',
          consultationReason: 'Persistent dry cough and post-viral breathing difficulty',
          bookingFee: 300,
          paymentMethod: 'ONLINE',
          paymentStatus: 'PAID',
          appointmentStatus: 'CONFIRMED',
          createdAt: new Date().toISOString(),
          paymentTransactionId: 'pay_test_rzp_98418291'
        },
        {
          id: 'apt-demo-02',
          bookingReference: 'MS-2026-HYD-5120',
          patientId: 'patient-demo-01',
          patientName: defaultName,
          patientPhone: '+91 98490 12345',
          patientEmail: 'patient@mediseva.in',
          patientAge: 32,
          patientGender: 'Female',
          hospitalId: 'hosp-hyd-01',
          hospitalName: 'Apollo Hospitals, Jubilee Hills',
          hospitalAddress: 'Road No 72, Jubilee Hills, Hyderabad',
          doctorId: 'doc-04',
          doctorName: 'Dr. Vijay Dikshit',
          doctorSpecialty: 'Cardiology & Heart Surgery',
          consultationType: 'IN_PERSON',
          appointmentDate: '2026-10-20',
          timeSlot: '11:00 AM',
          consultationReason: 'Routine annual cardiac stress test & consultation',
          bookingFee: 1200,
          paymentMethod: 'OFFLINE',
          paymentStatus: 'UNPAID', // Pay at hospital counter
          appointmentStatus: 'CONFIRMED',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading appointments', err);
    return [];
  }
};

export const saveStoredAppointments = (appointments: Appointment[]) => {
  try {
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
    window.dispatchEvent(new CustomEvent('mediseva_appointments_updated'));
  } catch (err) {
    console.error('Failed saving appointments', err);
  }
};

export const getStoredReceipts = (): PaymentReceipt[] => {
  try {
    const raw = localStorage.getItem(RECEIPTS_KEY);
    if (!raw) {
      let defaultName = 'Citizen Patient';
      try {
        const u = localStorage.getItem('mediseva_current_user');
        if (u) {
          const parsed = JSON.parse(u);
          if (parsed?.name) defaultName = parsed.name;
        }
      } catch {}

      const initial: PaymentReceipt[] = [
        {
          receiptId: 'RCPT-ONLINE-2026-9841',
          appointmentId: 'apt-demo-01',
          bookingReference: 'MS-2026-DEL-8941',
          patientName: defaultName,
          hospitalName: 'AIIMS New Delhi',
          doctorName: 'Dr. Randeep Guleria',
          amount: 300,
          gstAmount: 0,
          totalAmount: 300,
          paymentMethod: 'ONLINE',
          paymentStatus: 'PAID',
          paymentChannel: 'Razorpay UPI (Verified Sandbox)',
          transactionReference: 'pay_test_rzp_98418291',
          date: '2026-10-15 09:30 AM'
        }
      ];
      localStorage.setItem(RECEIPTS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading receipts', err);
    return [];
  }
};

export const saveStoredReceipts = (receipts: PaymentReceipt[]) => {
  try {
    localStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));
    window.dispatchEvent(new CustomEvent('mediseva_receipts_updated'));
  } catch (err) {
    console.error('Failed saving receipts', err);
  }
};

// Create a new appointment
export const createAppointment = async (data: Omit<Appointment, 'id' | 'bookingReference' | 'createdAt'>): Promise<{ appointment: Appointment; receipt?: PaymentReceipt }> => {
  const appointments = getStoredAppointments();
  const id = 'apt-' + Date.now();
  const bookingReference = 'MS-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

  const newAppointment: Appointment = {
    ...data,
    id,
    bookingReference,
    createdAt: new Date().toISOString()
  };

  const updatedAppointments = [newAppointment, ...appointments];
  saveStoredAppointments(updatedAppointments);

  let receipt: PaymentReceipt | undefined;

  // If paid online, generate immediate official verified receipt
  if (data.paymentMethod === 'ONLINE' && data.paymentStatus === 'PAID') {
    receipt = {
      receiptId: 'RCPT-ONL-' + Date.now().toString().slice(-6),
      appointmentId: id,
      bookingReference,
      patientName: data.patientName,
      hospitalName: data.hospitalName,
      doctorName: data.doctorName,
      amount: data.bookingFee,
      gstAmount: Math.round(data.bookingFee * 0.18),
      totalAmount: Math.round(data.bookingFee * 1.18),
      paymentMethod: 'ONLINE',
      paymentStatus: 'PAID',
      paymentChannel: 'Razorpay PG Gateway (UPI/Card)',
      transactionReference: data.paymentTransactionId || 'pay_test_' + Math.random().toString(36).substring(2, 10),
      date: new Date().toLocaleString()
    };

    const receipts = getStoredReceipts();
    saveStoredReceipts([receipt, ...receipts]);

    await triggerRealNotification({
      title: 'Appointment & Payment Confirmed!',
      message: `Your appointment with ${data.doctorName} at ${data.hospitalName} on ${data.appointmentDate} at ${data.timeSlot} is confirmed. Ref: ${bookingReference}. Payment ₹${receipt.totalAmount} received.`,
      priority: 'HIGH',
      category: 'payment'
    });
  } else {
    // Pay offline at hospital
    await triggerRealNotification({
      title: 'Appointment Booked (Pay at Hospital)',
      message: `Appointment with ${data.doctorName} at ${data.hospitalName} booked for ${data.appointmentDate} at ${data.timeSlot}. Ref: ${bookingReference}. Please pay ₹${data.bookingFee} at hospital reception desk.`,
      priority: 'NORMAL',
      category: 'appointment'
    });
  }

  return { appointment: newAppointment, receipt };
};

// Hospital Staff action: Collect offline payment at hospital reception
export const recordHospitalOfflinePayment = async (
  appointmentId: string,
  staffName: string,
  paymentChannel: 'Cash at Counter' | 'UPI at Hospital' | 'POS Card Swipe'
): Promise<PaymentReceipt> => {
  const appointments = getStoredAppointments();
  const index = appointments.findIndex((a) => a.id === appointmentId);
  if (index === -1) {
    throw new Error('Appointment not found');
  }

  const apt = appointments[index];
  const offlineReceiptNumber = 'RCPT-HOSP-' + Date.now().toString().slice(-6);

  // Update appointment payment status to PAID
  apt.paymentStatus = 'PAID';
  apt.offlineReceiptNumber = offlineReceiptNumber;
  apt.collectedByStaff = staffName;
  apt.collectedAt = new Date().toISOString();
  appointments[index] = apt;
  saveStoredAppointments(appointments);

  // Generate official hospital physical/digital cash receipt
  const receipt: PaymentReceipt = {
    receiptId: offlineReceiptNumber,
    appointmentId: apt.id,
    bookingReference: apt.bookingReference,
    patientName: apt.patientName,
    hospitalName: apt.hospitalName,
    doctorName: apt.doctorName,
    amount: apt.bookingFee,
    gstAmount: 0, // In-hospital OPD registration exempt under standard healthcare exemption
    totalAmount: apt.bookingFee,
    paymentMethod: 'OFFLINE',
    paymentStatus: 'PAID',
    paymentChannel: `${paymentChannel} (Staff: ${staffName})`,
    transactionReference: offlineReceiptNumber,
    date: new Date().toLocaleString(),
    collectedBy: staffName
  };

  const receipts = getStoredReceipts();
  saveStoredReceipts([receipt, ...receipts]);

  // Trigger Real Notification to Patient and Hospital
  await triggerRealNotification({
    title: 'Hospital Counter Payment Received',
    message: `Payment of ₹${apt.bookingFee} for Booking ${apt.bookingReference} has been verified and recorded by ${staffName} (${paymentChannel}). Receipt: ${offlineReceiptNumber}.`,
    priority: 'HIGH',
    category: 'payment'
  });

  return receipt;
};

// Update appointment status (Confirm, Cancel, Reschedule)
export const updateAppointmentStatus = async (
  appointmentId: string,
  newStatus: AppointmentStatus,
  reason?: string
) => {
  const appointments = getStoredAppointments();
  const index = appointments.findIndex((a) => a.id === appointmentId);
  if (index === -1) return;

  const apt = appointments[index];
  apt.appointmentStatus = newStatus;
  appointments[index] = apt;
  saveStoredAppointments(appointments);

  await triggerRealNotification({
    title: `Appointment ${newStatus}`,
    message: `Appointment ${apt.bookingReference} with ${apt.doctorName} status updated to ${newStatus}${reason ? ': ' + reason : '.'}`,
    priority: newStatus === 'CANCELLED' ? 'HIGH' : 'NORMAL',
    category: 'appointment'
  });
};
