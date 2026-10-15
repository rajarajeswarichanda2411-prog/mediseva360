import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Calendar, 
  CreditCard, 
  Banknote, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Bed, 
  Activity, 
  ShieldCheck, 
  Plus, 
  Printer, 
  RefreshCw,
  Search,
  Volume2,
  BellRing,
  FastForward,
  UserCheck,
  PhoneCall
} from 'lucide-react';
import { Appointment, PaymentReceipt, Doctor, Hospital, User } from '../types';
import { ALL_INDIA_HOSPITALS, ALL_INDIA_DOCTORS } from '../data/hospitalsData';
import { recordHospitalOfflinePayment, updateAppointmentStatus } from '../services/paymentService';
import { triggerRealNotification } from '../services/notificationService';

interface HospitalDashboardProps {
  currentUser: User | null;
  appointments: Appointment[];
  receipts: PaymentReceipt[];
  onViewReceipt: (receipt: PaymentReceipt) => void;
  onSwitchToPatientDashboard?: () => void;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({
  currentUser,
  appointments,
  receipts,
  onViewReceipt,
  onSwitchToPatientDashboard,
}) => {
  // Active hospital organization
  const [selectedHospital, setSelectedHospital] = useState<Hospital>(ALL_INDIA_HOSPITALS[0]);
  const [activeTab, setActiveTab] = useState<'queue' | 'offline_cash' | 'appointments' | 'beds' | 'doctors'>('queue');

  // Live OPD Token Queue System state
  const [servingToken, setServingToken] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('mediseva_opd_current_token');
      return saved ? parseInt(saved, 10) : 14;
    } catch {
      return 14;
    }
  });

  const [queueDoctor, setQueueDoctor] = useState('Dr. Anand Verma (General Medicine)');
  const [roomNumber, setRoomNumber] = useState('Room #04, OPD Block B');

  // Bed allocation state
  const [availableBeds, setAvailableBeds] = useState(selectedHospital.availableBeds);
  const [availableIcuBeds, setAvailableIcuBeds] = useState(selectedHospital.availableIcuBeds);

  // Offline payment collection form modal
  const [selectedAptForCollection, setSelectedAptForCollection] = useState<Appointment | null>(null);
  const [staffName, setStaffName] = useState(currentUser?.name || 'Dr. K. Srinivas (Duty Medical Officer)');
  const [paymentChannel, setPaymentChannel] = useState<'Cash at Counter' | 'UPI at Hospital' | 'POS Card Swipe'>('Cash at Counter');
  const [isCollecting, setIsCollecting] = useState(false);

  // Sync staff name if user logs in
  useEffect(() => {
    if (currentUser?.name) {
      setStaffName(currentUser.name);
    }
  }, [currentUser]);

  // Filter unpaid offline appointments (Pay Offline at Hospital)
  const pendingOfflineAppointments = appointments.filter(
    (a) => a.paymentMethod === 'OFFLINE' && a.paymentStatus === 'UNPAID' && a.appointmentStatus !== 'CANCELLED'
  );

  const totalRevenue = receipts.reduce((sum, r) => sum + r.totalAmount, 0);

  // Call Next Token in OPD Queue
  const handleCallNextToken = () => {
    const nextToken = servingToken + 1;
    setServingToken(nextToken);
    localStorage.setItem('mediseva_opd_current_token', nextToken.toString());

    // Dispatch event so Patient Dashboard synchronizes live token
    window.dispatchEvent(
      new CustomEvent('mediseva_token_advanced', { detail: { token: nextToken } })
    );

    triggerRealNotification({
      title: `🔔 OPD Token #${nextToken} Called!`,
      message: `Token #${nextToken} called for consultation with ${queueDoctor} at ${roomNumber}. Next patient please enter.`,
      priority: 'HIGH',
      category: 'system'
    });
  };

  // Emergency Priority Jump
  const handleEmergencyPriorityJump = () => {
    triggerRealNotification({
      title: '🚨 EMERGENCY TRAUMA PRIORITY CALL',
      message: 'Critical emergency trauma code activated. OPD queue paused for immediate ICU casualty intake.',
      priority: 'HIGH',
      category: 'emergency'
    });
  };

  const handleCollectOfflinePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAptForCollection) return;

    setIsCollecting(true);
    try {
      const receipt = await recordHospitalOfflinePayment(
        selectedAptForCollection.id,
        staffName,
        paymentChannel
      );

      setIsCollecting(false);
      setSelectedAptForCollection(null);
      onViewReceipt(receipt);
    } catch (err) {
      setIsCollecting(false);
      console.error('Failed to record offline payment', err);
      alert('Failed to record payment');
    }
  };

  const handleUpdateBedCount = (deltaBeds: number, deltaIcu: number) => {
    const newBeds = Math.max(0, Math.min(selectedHospital.totalBeds, availableBeds + deltaBeds));
    const newIcu = Math.max(0, Math.min(selectedHospital.icuBeds, availableIcuBeds + deltaIcu));
    setAvailableBeds(newBeds);
    setAvailableIcuBeds(newIcu);

    triggerRealNotification({
      title: 'Live Bed Census Updated',
      message: `${selectedHospital.name} live bed census updated: ${newBeds} General Beds, ${newIcu} ICU Emergency Beds available.`,
      priority: 'NORMAL',
      category: 'system'
    });
  };

  return (
    <div className="space-y-6">
      {/* Hospital Organization Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl shadow-lg border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded text-[11px] font-bold uppercase tracking-wider">
              Verified Hospital Portal · 24/7 Command Console
            </span>
            <span className="text-xs text-slate-400 font-mono">HFR-ID: IN-MED-2026</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {selectedHospital.name}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            📍 {selectedHospital.address}, {selectedHospital.city}, {selectedHospital.state} · 24/7 Emergency Line: <strong className="text-white">{selectedHospital.emergencyPhone}</strong>
          </p>
        </div>

        {/* Facility Selector */}
        <div className="flex flex-col gap-1 sm:items-end shrink-0">
          <span className="text-[11px] font-semibold text-slate-300">Select Hospital to Manage:</span>
          <select
            value={selectedHospital.id}
            onChange={(e) => {
              const h = ALL_INDIA_HOSPITALS.find((x) => x.id === e.target.value);
              if (h) {
                setSelectedHospital(h);
                setAvailableBeds(h.availableBeds);
                setAvailableIcuBeds(h.availableIcuBeds);
              }
            }}
            className="text-xs bg-slate-800 border border-slate-600 text-white rounded-xl px-3 py-2 font-semibold focus:ring-2 focus:ring-teal-400 max-w-xs truncate"
          >
            {ALL_INDIA_HOSPITALS.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hospital Staff Login & Authorization Badge */}
      <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-indigo-950 font-bold">
                {currentUser ? currentUser.name : 'Duty Medical Superintendent & Reception Officer'}
              </strong>
              <span className="px-2 py-0.5 rounded-full bg-indigo-200/70 text-indigo-900 font-bold text-[10px] uppercase">
                {currentUser?.role === 'hospital_staff' ? 'Verified Staff' : 'Hospital Desk Officer'}
              </span>
            </div>
            <p className="text-[11px] text-indigo-800">
              Department: Clinical Operations & Cashier Desk · Access Level: Full OPD, Bed Allocation & Billing Control
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onSwitchToPatientDashboard && (
            <button
              onClick={onSwitchToPatientDashboard}
              className="px-3 py-1.5 bg-white border border-indigo-300 text-indigo-900 rounded-xl font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              👤 Switch to Patient Portal
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <span className="text-slate-400 text-xs font-semibold block">Now Serving Token</span>
          <div className="flex items-baseline justify-between mt-1">
            <strong className="text-2xl font-black text-indigo-700 font-mono tabular-nums">
              #{servingToken}
            </strong>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full animate-pulse">
              LIVE OPD
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Dr. Anand Verma · Cabin 4</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <span className="text-amber-800 text-xs font-semibold block">Pending Offline Payments</span>
          <div className="flex items-baseline justify-between mt-1">
            <strong className="text-2xl font-bold text-amber-700 font-mono tabular-nums">
              {pendingOfflineAppointments.length}
            </strong>
            <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">Action Req</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Pay at Hospital Counter</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <span className="text-emerald-800 text-xs font-semibold block">Reconciled Cash Revenue</span>
          <div className="flex items-baseline justify-between mt-1">
            <strong className="text-2xl font-bold text-emerald-800 font-mono tabular-nums">
              ₹{totalRevenue}
            </strong>
            <span className="text-xs font-semibold text-emerald-700">Settled</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">{receipts.length} Official Tax Receipts</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <span className="text-slate-500 text-xs font-semibold block">Emergency ICU Status</span>
          <div className="flex items-baseline justify-between mt-1">
            <strong className="text-2xl font-bold text-rose-700 font-mono tabular-nums">
              {availableIcuBeds} / {selectedHospital.icuBeds}
            </strong>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">Critical</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">24/7 Level-1 Trauma Ready</span>
        </div>
      </div>

      {/* Hospital Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'queue'
              ? 'bg-indigo-700 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BellRing className="w-3.5 h-3.5" />
          <span>Live OPD Token Queue Desk</span>
        </button>

        <button
          onClick={() => setActiveTab('offline_cash')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'offline_cash'
              ? 'bg-amber-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Banknote className="w-3.5 h-3.5" />
          <span>Offline Cashier Counter ({pendingOfflineAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'appointments'
              ? 'bg-slate-900 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>All Appointments Schedule ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('beds')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'beds'
              ? 'bg-slate-900 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Bed className="w-3.5 h-3.5" />
          <span>Bed & ICU Emergency Allocation</span>
        </button>

        <button
          onClick={() => setActiveTab('doctors')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'doctors'
              ? 'bg-slate-900 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Doctor Roster</span>
        </button>
      </div>

      {/* TAB 1: LIVE OPD TOKEN QUEUE DESK (User Explicit Request!) */}
      {activeTab === 'queue' && (
        <div className="space-y-5">
          {/* Real-time Token Calling Controller */}
          <div className="p-6 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-xl border border-indigo-800/60 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  Live OPD Electronic Token Display
                </span>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-slate-300 text-sm font-semibold">Now Calling Token:</span>
                <span className="text-5xl font-black font-mono text-amber-300 tracking-tight drop-shadow-md">
                  #{servingToken}
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Next in Queue: <strong className="text-white font-mono">#{servingToken + 1}</strong> · Department: <strong className="text-white">{queueDoctor}</strong> ({roomNumber})
              </p>
            </div>

            {/* Quick Action Buttons for Staff */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleCallNextToken}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-lg transition-all text-sm cursor-pointer active:scale-95"
              >
                <Volume2 className="w-4 h-4" />
                <span>📢 Call Next Token (#{servingToken + 1})</span>
              </button>

              <button
                onClick={handleEmergencyPriorityJump}
                className="flex items-center gap-1.5 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-lg transition-all text-xs cursor-pointer active:scale-95"
              >
                <AlertCircle className="w-4 h-4" />
                <span>🚨 Priority Emergency Jump</span>
              </button>

              <button
                onClick={() => {
                  setServingToken(1);
                  localStorage.setItem('mediseva_opd_current_token', '1');
                  triggerRealNotification({
                    title: 'Queue Reset',
                    message: 'OPD Queue reset to Token #1 for the morning shift.',
                    priority: 'NORMAL',
                    category: 'system'
                  });
                }}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-colors cursor-pointer"
                title="Reset Queue for Shift"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Live Queue Table: Both hospital and patient can see who is at what token */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Live OPD Consultation Roster</h4>
                <p className="text-xs text-slate-500">
                  Real-time status visible to both Hospital Staff and Patient Dashboards.
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-xl">
                Average Wait Time: ~12 Mins
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 font-bold">Token #</th>
                    <th className="p-3.5 font-bold">Patient Name</th>
                    <th className="p-3.5 font-bold">Consulting Doctor</th>
                    <th className="p-3.5 font-bold">Time Slot</th>
                    <th className="p-3.5 font-bold">Queue Status</th>
                    <th className="p-3.5 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {/* Now Calling Row */}
                  <tr className="bg-amber-50/70">
                    <td className="p-3.5 font-mono font-black text-amber-700 text-sm">
                      #{servingToken}
                    </td>
                    <td className="p-3.5">
                      <strong className="text-slate-900">Current In-Cabin Patient</strong>
                      <span className="block text-[11px] text-slate-500">+91 98490 22110 · General OPD</span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800">{queueDoctor}</td>
                    <td className="p-3.5 text-slate-600">10:00 AM</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse">
                        ● In Consultation
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={handleCallNextToken}
                        className="px-3 py-1 bg-indigo-700 text-white rounded-lg text-xs font-bold hover:bg-indigo-800"
                      >
                        Complete & Call Next
                      </button>
                    </td>
                  </tr>

                  {/* Next up row */}
                  <tr className="bg-indigo-50/40">
                    <td className="p-3.5 font-mono font-bold text-indigo-700 text-sm">
                      #{servingToken + 1}
                    </td>
                    <td className="p-3.5">
                      <strong className="text-slate-900">Next In Line Patient</strong>
                      <span className="block text-[11px] text-slate-500">Waiting Hall Cabin 4</span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800">{queueDoctor}</td>
                    <td className="p-3.5 text-slate-600">10:15 AM</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 bg-indigo-100 text-indigo-900 rounded-full text-[10px] font-bold">
                        Next Patient
                      </span>
                    </td>
                    <td className="p-3.5 text-right text-slate-400">
                      ~3 mins wait
                    </td>
                  </tr>

                  {/* Following appointments */}
                  {appointments.slice(0, 4).map((apt, idx) => (
                    <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-700">
                        #{servingToken + 2 + idx}
                      </td>
                      <td className="p-3.5">
                        <strong className="text-slate-900">{apt.patientName}</strong>
                        <span className="block text-[11px] text-slate-500">{apt.patientPhone} · {apt.bookingReference}</span>
                      </td>
                      <td className="p-3.5 text-slate-700">{apt.doctorName}</td>
                      <td className="p-3.5 text-slate-600">{apt.timeSlot}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-[10px] font-semibold">
                          Waiting ({idx + 2} ahead)
                        </span>
                      </td>
                      <td className="p-3.5 text-right text-slate-500 text-[11px]">
                        ~{(idx + 2) * 12} mins wait
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Offline Cashier & Reconciliation Desk */}
      {activeTab === 'offline_cash' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <Banknote className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                Hospital Reception & Cash Counter Payment Reconciliation
              </h4>
              <p className="text-xs text-amber-800 mt-1">
                Patients who selected <strong>&quot;Pay Offline at Hospital&quot;</strong> have confirmed appointments but an <strong>UNPAID</strong> balance. Billing staff can collect cash or swipe cards to issue official GST receipts and settle the account.
              </p>
            </div>
          </div>

          {pendingOfflineAppointments.length === 0 ? (
            <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
              <p className="text-sm font-semibold text-slate-700">All offline counter payments are reconciled!</p>
              <p className="text-xs text-slate-500 mt-1">
                No pending pay-at-hospital collections outstanding.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-3 font-bold">Booking Ref</th>
                      <th className="p-3 font-bold">Patient Details</th>
                      <th className="p-3 font-bold">Doctor / Specialty</th>
                      <th className="p-3 font-bold">Slot Date & Time</th>
                      <th className="p-3 font-bold">Amount Due</th>
                      <th className="p-3 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingOfflineAppointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="p-3 font-mono font-bold text-teal-800">
                          {apt.bookingReference}
                        </td>
                        <td className="p-3">
                          <strong className="text-slate-900 block">{apt.patientName}</strong>
                          <span className="text-[11px] text-slate-500">{apt.patientPhone} · {apt.patientAge}y/{apt.patientGender}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-800 block">{apt.doctorName}</span>
                          <span className="text-[11px] text-slate-500">{apt.hospitalName}</span>
                        </td>
                        <td className="p-3 tabular-nums">
                          {apt.appointmentDate} <br />
                          <span className="text-slate-500">{apt.timeSlot}</span>
                        </td>
                        <td className="p-3">
                          <strong className="text-amber-800 font-mono text-sm">₹{apt.bookingFee}</strong>
                          <span className="block text-[10px] text-amber-700 font-semibold uppercase">UNPAID (Offline)</span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedAptForCollection(apt)}
                            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                          >
                            Collect ₹{apt.bookingFee} & Print Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Appointments */}
      {activeTab === 'appointments' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">All Scheduled Consultations</h4>
            <span className="text-xs text-slate-500 font-semibold">{appointments.length} Total Bookings</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3 font-bold">Booking Ref</th>
                  <th className="p-3 font-bold">Patient</th>
                  <th className="p-3 font-bold">Doctor</th>
                  <th className="p-3 font-bold">Date & Slot</th>
                  <th className="p-3 font-bold">Payment</th>
                  <th className="p-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-teal-800">{apt.bookingReference}</td>
                    <td className="p-3 font-medium text-slate-900">{apt.patientName}</td>
                    <td className="p-3">{apt.doctorName}</td>
                    <td className="p-3">{apt.appointmentDate} · {apt.timeSlot}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${apt.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {apt.paymentStatus} ({apt.paymentMethod})
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        {apt.appointmentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Bed & ICU Allocation */}
      {activeTab === 'beds' && (
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Hospital Bed & ICU Live Availability Desk</h4>
              <p className="text-xs text-slate-500">Update vacant beds in real-time to reflect on national emergency dashboards.</p>
            </div>
            <button
              onClick={() => handleUpdateBedCount(0, 0)}
              className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Broadcast Census Update
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-xs font-bold text-slate-500 uppercase block">General Inpatient Beds</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black font-mono text-slate-900">{availableBeds}</span>
                <span className="text-xs text-slate-400">/ {selectedHospital.totalBeds} Total Capacity</span>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleUpdateBedCount(-1, 0)}
                  className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold hover:bg-slate-100"
                >
                  - 1 Discharge
                </button>
                <button
                  onClick={() => handleUpdateBedCount(1, 0)}
                  className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold hover:bg-slate-100"
                >
                  + 1 Vacant
                </button>
              </div>
            </div>

            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl">
              <span className="text-xs font-bold text-rose-800 uppercase block">Emergency ICU Beds</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black font-mono text-rose-700">{availableIcuBeds}</span>
                <span className="text-xs text-rose-400">/ {selectedHospital.icuBeds} Total ICU Beds</span>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleUpdateBedCount(0, -1)}
                  className="px-3 py-1 bg-white border border-rose-300 text-rose-900 rounded-lg text-xs font-bold hover:bg-rose-100"
                >
                  - 1 ICU Occupied
                </button>
                <button
                  onClick={() => handleUpdateBedCount(0, 1)}
                  className="px-3 py-1 bg-white border border-rose-300 text-rose-900 rounded-lg text-xs font-bold hover:bg-rose-100"
                >
                  + 1 ICU Vacant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Doctor Roster */}
      {activeTab === 'doctors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ALL_INDIA_DOCTORS.map((doc) => (
            <div key={doc.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
              <h5 className="font-bold text-slate-900 text-xs">{doc.name}</h5>
              <p className="text-xs text-indigo-700 font-semibold">{doc.specialty}</p>
              <p className="text-[11px] text-slate-500 mt-1">📍 {doc.hospitalName}</p>
              <div className="mt-2 text-xs flex justify-between text-slate-600">
                <span>Fee: ₹{doc.consultationFee}</span>
                <span className="text-emerald-700 font-bold">On Duty</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cashier Payment Modal */}
      {selectedAptForCollection && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Hospital Cashier Desk: Record Payment</h4>
            <p className="text-xs text-slate-600">
              Collect payment for <strong className="text-slate-900">{selectedAptForCollection.patientName}</strong> (Ref: {selectedAptForCollection.bookingReference})
            </p>

            <form onSubmit={handleCollectOfflinePayment} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Collection Channel</label>
                <select
                  value={paymentChannel}
                  onChange={(e) => setPaymentChannel(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                >
                  <option value="Cash at Counter">Cash at Counter</option>
                  <option value="UPI at Hospital">UPI Hospital QR Code</option>
                  <option value="POS Card Swipe">POS Debit/Credit Card Swipe</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Billing Officer Name</label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl flex justify-between items-center text-xs font-bold">
                <span>Total Due:</span>
                <span className="text-base font-mono text-amber-800">₹{selectedAptForCollection.bookingFee}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAptForCollection(null)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCollecting}
                  className="flex-1 py-2 bg-emerald-700 text-white rounded-xl font-bold"
                >
                  {isCollecting ? 'Processing...' : 'Confirm & Print Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
