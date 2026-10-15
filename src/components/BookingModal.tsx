import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User as UserIcon, 
  CreditCard, 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  Banknote,
  AlertCircle
} from 'lucide-react';
import { Hospital, Doctor, PaymentMethod, PaymentStatus, User } from '../types';
import { createAppointment } from '../services/paymentService';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospital: Hospital | null;
  doctor: Doctor | null;
  currentUser: User | null;
  onSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  hospital,
  doctor,
  currentUser,
  onSuccess,
}) => {
  const [patientName, setPatientName] = useState(currentUser?.name || '');
  const [patientPhone, setPatientPhone] = useState(currentUser?.phone || '');
  const [patientEmail, setPatientEmail] = useState(currentUser?.email || '');
  const [patientAge, setPatientAge] = useState<number>(30);
  const [patientGender, setPatientGender] = useState('Female');
  const [consultationReason, setConsultationReason] = useState('General medical consultation');
  const [consultationType, setConsultationType] = useState<'IN_PERSON' | 'TELEMEDICINE'>('IN_PERSON');
  const [appointmentDate, setAppointmentDate] = useState('2026-10-18');
  const [selectedSlot, setSelectedSlot] = useState(doctor?.availableSlots?.[0] || '10:00 AM');
  
  // Payment Method: 'ONLINE' or 'OFFLINE'
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ONLINE');
  const [onlineChannel, setOnlineChannel] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (currentUser?.name) {
      setPatientName(currentUser.name);
      setPatientPhone(currentUser.phone || '');
      setPatientEmail(currentUser.email || '');
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !hospital) return null;

  const bookingFee = doctor ? doctor.consultationFee : 300;
  const gstAmount = paymentMethod === 'ONLINE' ? Math.round(bookingFee * 0.18) : 0;
  const totalAmount = bookingFee + gstAmount;

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      alert('Please enter patient name');
      return;
    }

    setIsProcessing(true);

    try {
      const patientId = currentUser?.id || 'pat-' + Date.now();

      if (paymentMethod === 'ONLINE') {
        // Razorpay Sandbox checkout simulation
        await new Promise((resolve) => setTimeout(resolve, 900));
        
        await createAppointment({
          patientId,
          patientName,
          patientPhone: patientPhone || '+91 98490 12345',
          patientEmail: patientEmail || 'patient@mediseva.in',
          patientAge,
          patientGender,
          hospitalId: hospital.id,
          hospitalName: hospital.name,
          hospitalAddress: hospital.address,
          doctorId: doctor?.id || 'doc-gen',
          doctorName: doctor?.name || 'Senior Consultant OPD',
          doctorSpecialty: doctor?.specialty || 'General Medicine',
          consultationType,
          appointmentDate,
          timeSlot: selectedSlot,
          consultationReason,
          bookingFee,
          paymentMethod: 'ONLINE',
          paymentStatus: 'PAID',
          appointmentStatus: 'CONFIRMED',
          paymentTransactionId: 'pay_rzp_sand_' + Math.random().toString(36).substring(2, 10),
        });
      } else {
        // Pay Offline at Hospital Counter
        await new Promise((resolve) => setTimeout(resolve, 600));

        await createAppointment({
          patientId,
          patientName,
          patientPhone: patientPhone || '+91 98490 12345',
          patientEmail: patientEmail || 'patient@mediseva.in',
          patientAge,
          patientGender,
          hospitalId: hospital.id,
          hospitalName: hospital.name,
          hospitalAddress: hospital.address,
          doctorId: doctor?.id || 'doc-gen',
          doctorName: doctor?.name || 'Senior Consultant OPD',
          doctorSpecialty: doctor?.specialty || 'General Medicine',
          consultationType,
          appointmentDate,
          timeSlot: selectedSlot,
          consultationReason,
          bookingFee,
          paymentMethod: 'OFFLINE',
          paymentStatus: 'UNPAID', // Must be paid at hospital desk
          appointmentStatus: 'CONFIRMED',
        });
      }

      setIsProcessing(false);
      onSuccess();
      onClose();
    } catch (err) {
      setIsProcessing(false);
      console.error('Booking failed', err);
      alert('Booking failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Book Medical Appointment
            </h3>
            <p className="text-xs text-slate-500">
              {hospital.name} · {doctor ? doctor.name : 'OPD Consultation'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirmBooking} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Consultation Type */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Consultation Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConsultationType('IN_PERSON')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  consultationType === 'IN_PERSON'
                    ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Building2 className="w-4 h-4 text-teal-600" />
                <span>In-Person Hospital Visit</span>
              </button>

              <button
                type="button"
                onClick={() => setConsultationType('TELEMEDICINE')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  consultationType === 'TELEMEDICINE'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Virtual Telemedicine Video</span>
              </button>
            </div>
          </div>

          {/* Date & Slot selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Appointment Date</label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Available Time Slot</label>
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
              >
                {(doctor?.availableSlots || ['09:30 AM', '10:30 AM', '11:45 AM', '02:00 PM', '04:30 PM']).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Patient Details */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <h4 className="text-xs font-bold text-slate-800">Patient Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Full Patient Legal Name *"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
                className="text-xs border border-slate-300 rounded-lg px-3 py-2"
              />
              <input
                type="tel"
                placeholder="Mobile Number (+91) *"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                required
                className="text-xs border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                placeholder="Age"
                value={patientAge}
                onChange={(e) => setPatientAge(parseInt(e.target.value) || 0)}
                required
                className="text-xs border border-slate-300 rounded-lg px-3 py-2"
              />
              <select
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="email"
                placeholder="Email Address"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>

            <textarea
              placeholder="Reason for consultation or key symptoms..."
              value={consultationReason}
              onChange={(e) => setConsultationReason(e.target.value)}
              rows={2}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>

          {/* CRITICAL REQUIREMENT: Payment Method Choice (Online vs Offline) */}
          <div className="border-t border-slate-100 pt-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Payment Method Selection (Required)
              </label>
              <span className="text-[11px] text-teal-700 font-semibold">2 Options Available</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option 1: Pay Online */}
              <div
                onClick={() => setPaymentMethod('ONLINE')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'ONLINE'
                    ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-teal-700" />
                    <span className="text-xs font-bold text-slate-900">1. Pay Online</span>
                  </div>
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded">
                    Instant
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Razorpay Sandbox: UPI (GPay/PhonePe), Credit/Debit Card, NetBanking.
                </p>
                {paymentMethod === 'ONLINE' && (
                  <div className="mt-2 pt-2 border-t border-teal-200/60 flex items-center gap-1.5 text-[11px] text-teal-900 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Instant Digital Receipt Generated</span>
                  </div>
                )}
              </div>

              {/* Option 2: Pay Offline at Hospital */}
              <div
                onClick={() => setPaymentMethod('OFFLINE')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'OFFLINE'
                    ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold text-slate-900">2. Pay Offline at Hospital</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                    Pay at Desk
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Pay at hospital reception/cashier counter upon arrival with Cash or UPI.
                </p>
                {paymentMethod === 'OFFLINE' && (
                  <div className="mt-2 pt-2 border-t border-amber-200/60 flex items-center gap-1.5 text-[11px] text-amber-900 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Staff will record payment upon arrival</span>
                  </div>
                )}
              </div>
            </div>

            {/* Online Payment Channels preview */}
            {paymentMethod === 'ONLINE' && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                <span className="text-[11px] text-slate-500 font-semibold block">Select Online Gateway Channel:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOnlineChannel('UPI')}
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      onlineChannel === 'UPI' ? 'bg-teal-700 text-white' : 'bg-white border text-slate-700'
                    }`}
                  >
                    UPI QR / GPay / PhonePe
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnlineChannel('CARD')}
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      onlineChannel === 'CARD' ? 'bg-teal-700 text-white' : 'bg-white border text-slate-700'
                    }`}
                  >
                    Credit / Debit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnlineChannel('NETBANKING')}
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      onlineChannel === 'NETBANKING' ? 'bg-teal-700 text-white' : 'bg-white border text-slate-700'
                    }`}
                  >
                    Net Banking
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Doctor Consultation Fee:</span>
              <span className="font-mono font-medium">₹{bookingFee}</span>
            </div>
            {paymentMethod === 'ONLINE' && (
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Platform GST (18%):</span>
                <span className="font-mono">₹{gstAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-200 text-sm">
              <span>{paymentMethod === 'ONLINE' ? 'Total Payable Now:' : 'Amount Due at Hospital:'}</span>
              <span className="font-mono text-teal-800">₹{paymentMethod === 'ONLINE' ? totalAmount : bookingFee}</span>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full py-3 rounded-xl text-white font-bold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2 ${
                paymentMethod === 'ONLINE'
                  ? 'bg-teal-700 hover:bg-teal-800'
                  : 'bg-amber-700 hover:bg-amber-800'
              }`}
            >
              {isProcessing ? (
                <span>Confirming Booking...</span>
              ) : paymentMethod === 'ONLINE' ? (
                <span>Pay ₹{totalAmount} Online & Confirm Booking</span>
              ) : (
                <span>Book Now & Pay ₹{bookingFee} Offline at Hospital</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
