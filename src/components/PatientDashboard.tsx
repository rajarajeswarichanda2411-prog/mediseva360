import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CreditCard, 
  FileText, 
  Users, 
  FlaskConical, 
  ShieldCheck, 
  Plus, 
  Download, 
  Trash2, 
  Clock, 
  Building2, 
  Eye, 
  AlertCircle,
  CheckCircle2,
  Phone,
  QrCode
} from 'lucide-react';
import { Appointment, PaymentReceipt, HealthRecord, FamilyMember, User } from '../types';
import { updateAppointmentStatus } from '../services/paymentService';
import { triggerRealNotification } from '../services/notificationService';

interface PatientDashboardProps {
  currentUser: User | null;
  appointments: Appointment[];
  receipts: PaymentReceipt[];
  onViewReceipt: (receipt: PaymentReceipt) => void;
  onBookNew: () => void;
  onOpenAuth: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  currentUser,
  appointments,
  receipts,
  onViewReceipt,
  onBookNew,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'receipts' | 'locker' | 'family' | 'abha'>('appointments');

  // Live Token Tracking State synchronized with hospital
  const [servingToken, setServingToken] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('mediseva_opd_current_token');
      return saved ? parseInt(saved, 10) : 14;
    } catch {
      return 14;
    }
  });

  useEffect(() => {
    const handleTokenChange = (e: any) => {
      if (e?.detail?.token) {
        setServingToken(e.detail.token);
      } else {
        const saved = localStorage.getItem('mediseva_opd_current_token');
        if (saved) setServingToken(parseInt(saved, 10));
      }
    };
    window.addEventListener('mediseva_token_advanced', handleTokenChange);
    return () => {
      window.removeEventListener('mediseva_token_advanced', handleTokenChange);
    };
  }, []);

  // Digital Health Locker State
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([
    {
      id: 'rec-01',
      patientId: currentUser?.id || 'patient-demo-01',
      title: 'Pulmonary Function Spirometry Report',
      type: 'Lab Report',
      hospitalOrLab: 'AIIMS New Delhi Diagnostics',
      doctorName: 'Dr. Randeep Guleria',
      date: '2026-09-12',
      fileSize: '1.8 MB',
      fileName: 'AIIMS_Pulm_Spirometry_9812.pdf'
    },
    {
      id: 'rec-02',
      patientId: currentUser?.id || 'patient-demo-01',
      title: 'Digital e-Prescription & Follow-Up Regimen',
      type: 'Prescription',
      hospitalOrLab: 'Apollo Hospitals Jubilee Hills',
      doctorName: 'Dr. Vijay Dikshit',
      date: '2026-08-20',
      fileSize: '420 KB',
      fileName: 'Apollo_Prescription_Aug2026.pdf'
    },
    {
      id: 'rec-03',
      patientId: currentUser?.id || 'patient-demo-01',
      title: 'Cardiac 2D Echo Doppler Evaluation',
      type: 'Scan & Imaging',
      hospitalOrLab: 'KIMS Secunderabad Echo Lab',
      doctorName: 'Dr. K. Manohar',
      date: '2026-07-15',
      fileSize: '3.4 MB',
      fileName: 'Echo_Doppler_KIMS_7741.pdf'
    }
  ]);

  // Family Members State
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      id: 'fam-01',
      patientId: currentUser?.id || 'patient-demo-01',
      fullName: 'Venkata Subrahmanyam',
      relationship: 'Parent',
      age: 64,
      bloodGroup: 'B+',
      existingConditions: 'Type 2 Diabetes, Hypertension',
      emergencyContact: true
    },
    {
      id: 'fam-02',
      patientId: currentUser?.id || 'patient-demo-01',
      fullName: 'Lakshmi Devi',
      relationship: 'Parent',
      age: 58,
      bloodGroup: 'O+',
      existingConditions: 'Thyroid, Osteoarthritis',
      emergencyContact: false
    }
  ]);

  const [newFamName, setNewFamName] = useState('');
  const [newFamRel, setNewFamRel] = useState<FamilyMember['relationship']>('Child');
  const [newFamAge, setNewFamAge] = useState<number>(10);
  const [newFamBlood, setNewFamBlood] = useState('O+');
  const [showAddFam, setShowAddFam] = useState(false);

  // New Record Upload Simulator
  const handleUploadRecord = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newRec: HealthRecord = {
      id: 'rec-' + Date.now(),
      patientId: currentUser?.id || 'patient-demo-01',
      title: file.name.replace(/\.[^/.]+$/, ''),
      type: 'Lab Report',
      hospitalOrLab: 'Uploaded via Digital Locker',
      date: new Date().toISOString().split('T')[0],
      fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
      fileName: file.name
    };

    setHealthRecords([newRec, ...healthRecords]);
    triggerRealNotification({
      title: 'Medical Document Uploaded',
      message: `"${file.name}" has been securely encrypted and stored in your Digital Health Locker.`,
      priority: 'NORMAL',
      category: 'report'
    });
  };

  const handleAddFamilyMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamName.trim()) return;

    const newMember: FamilyMember = {
      id: 'fam-' + Date.now(),
      patientId: currentUser?.id || 'patient-demo-01',
      fullName: newFamName,
      relationship: newFamRel,
      age: newFamAge,
      bloodGroup: newFamBlood,
      emergencyContact: false
    };

    setFamilyMembers([...familyMembers, newMember]);
    setNewFamName('');
    setShowAddFam(false);

    triggerRealNotification({
      title: 'Family Member Added',
      message: `${newMember.fullName} (${newMember.relationship}) profile linked for quick appointment bookings and medical history.`,
      priority: 'NORMAL',
      category: 'system'
    });
  };

  const handleCancelAppointment = async (aptId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    await updateAppointmentStatus(aptId, 'CANCELLED', 'Cancelled by Patient');
  };

  return (
    <div className="space-y-6">
      {/* Patient Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 rounded-2xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-white/20 rounded text-[11px] font-bold uppercase tracking-wider backdrop-blur-xs">
              {currentUser ? 'Verified Patient Profile' : 'Guest Patient View'}
            </span>
            <span className="text-xs text-teal-100">{currentUser?.abhaId ? 'ABHA Linked' : 'ABHA Ready'}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {currentUser ? `Welcome back, ${currentUser.name}` : 'Welcome to Patient Healthcare Portal'}
          </h2>
          <p className="text-xs text-teal-100 mt-1 max-w-xl">
            {currentUser
              ? 'Manage your all-India hospital appointments, official tax receipts, encrypted medical health locker records, and family health circle.'
              : 'Please sign in or register to synchronize your appointments, view digital health locker, and link your ABHA card.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!currentUser && (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-slate-800 transition-colors shrink-0"
            >
              Sign In with Your Name
            </button>
          )}
          <button
            onClick={onBookNew}
            className="px-4 py-2.5 bg-white text-teal-900 rounded-xl text-xs font-bold shadow-xs hover:bg-teal-50 transition-colors shrink-0"
          >
            + Book New Appointment
          </button>
        </div>
      </div>

      {/* Dashboard Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'appointments'
              ? 'bg-teal-700 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>My Appointments ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('receipts')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'receipts'
              ? 'bg-teal-700 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Payments & Receipts ({receipts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('locker')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'locker'
              ? 'bg-teal-700 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Digital Health Locker ({healthRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('family')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'family'
              ? 'bg-teal-700 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Family Health Dashboard ({familyMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('abha')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'abha'
              ? 'bg-teal-700 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Digital ABHA Card</span>
        </button>
      </div>

      {/* Tab 1: Appointments List */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          {/* LIVE OPD TOKEN DISPLAY RADAR (User Explicit Request!) */}
          <div className="p-4 bg-gradient-to-r from-teal-900 via-teal-950 to-slate-900 text-white rounded-2xl shadow-md border border-teal-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                  Live Hospital OPD Token Radar
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Hospital Doctor Cabin is currently consulting Token:{' '}
                <strong className="text-amber-300 font-mono text-base">#{servingToken}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-teal-700/40 text-xs">
              <span className="text-slate-400">Your Active OPD Token:</span>
              <span className="font-mono font-black text-emerald-400 text-base">
                #{servingToken + 3}
              </span>
              <span className="text-[11px] text-amber-300 font-semibold ml-1">
                (3 ahead · ~36m wait)
              </span>
            </div>
          </div>

          {appointments.length === 0 ? (
            <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-slate-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold text-slate-700">No appointments booked yet</p>
              <button
                onClick={onBookNew}
                className="mt-3 px-4 py-2 bg-teal-700 text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-teal-800"
              >
                Find Hospital & Book Slot
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map((apt, index) => {
                const isPaid = apt.paymentStatus === 'PAID';
                const isOffline = apt.paymentMethod === 'OFFLINE';
                const isCancelled = apt.appointmentStatus === 'CANCELLED';
                const myTokenNumber = servingToken + 2 + index;
                const tokensAhead = Math.max(0, myTokenNumber - servingToken);

                return (
                  <div
                    key={apt.id}
                    className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3"
                  >
                    {/* Live OPD Token Badge on Each Appointment */}
                    <div className="p-3 bg-gradient-to-r from-teal-900 to-indigo-900 text-white rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-teal-300 uppercase font-black tracking-wider block">
                          Live OPD Token Number
                        </span>
                        <strong className="text-2xl font-black font-mono text-amber-300">
                          #{myTokenNumber}
                        </strong>
                      </div>
                      <div className="text-right text-[11px]">
                        <span className="text-slate-300 block">
                          Doctor Now Serving:{' '}
                          <strong className="text-white font-mono">#{servingToken}</strong>
                        </span>
                        <span
                          className={`font-bold ${
                            tokensAhead === 0
                              ? 'text-emerald-400 animate-pulse'
                              : tokensAhead === 1
                              ? 'text-amber-300'
                              : 'text-teal-200'
                          }`}
                        >
                          {tokensAhead === 0
                            ? '🟢 YOUR TURN! Enter Room 4'
                            : tokensAhead === 1
                            ? '🟡 YOU ARE NEXT! Stand by door'
                            : `🔵 ${tokensAhead} patients ahead (~${tokensAhead * 12}m)`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                          {apt.bookingReference}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{apt.doctorName}</h4>
                        <span className="text-xs text-teal-700 font-semibold block">{apt.doctorSpecialty}</span>
                        <span className="text-xs text-slate-500">📍 {apt.hospitalName}</span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            isCancelled
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {apt.appointmentStatus}
                        </span>
                        <span className="block text-xs font-mono font-bold text-slate-900 mt-1">
                          ₹{apt.bookingFee}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg text-xs grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Slot Time</span>
                        <strong className="text-slate-800">{apt.appointmentDate} at {apt.timeSlot}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Consultation Mode</span>
                        <strong className="text-slate-800">{apt.consultationType === 'IN_PERSON' ? 'In-Person Hospital' : 'Virtual Telemedicine'}</strong>
                      </div>
                    </div>

                    {/* Payment Status Pill */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-1.5">
                        {isPaid ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Payment: PAID ({apt.paymentMethod})</span>
                          </span>
                        ) : (
                          <span className="text-amber-700 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Payment: UNPAID (Pay at Hospital Desk)</span>
                          </span>
                        )}
                      </div>

                      {!isCancelled && (
                        <button
                          onClick={() => handleCancelAppointment(apt.id)}
                          className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Payments & Receipts */}
      {activeTab === 'receipts' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <div>
              <h4 className="font-bold text-slate-900">Official Payment Receipts & Audit Invoices</h4>
              <p className="text-slate-500 mt-0.5">
                Verifiable digital receipts for Online Gateway payments and In-Hospital Cash counter collections.
              </p>
            </div>
            <span className="font-mono text-teal-800 font-bold bg-teal-100 px-2.5 py-1 rounded">
              {receipts.length} Settled Invoices
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {receipts.map((rcpt) => (
              <div key={rcpt.receiptId} className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      {rcpt.receiptId}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 mt-0.5">{rcpt.hospitalName}</h5>
                    <p className="text-xs text-slate-500">Dr. {rcpt.doctorName}</p>
                  </div>
                  <strong className="text-sm font-mono font-extrabold text-teal-800">
                    ₹{rcpt.totalAmount}
                  </strong>
                </div>

                <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-100">
                  <span>Method: {rcpt.paymentChannel}</span>
                  <span className="tabular-nums">{rcpt.date}</span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onViewReceipt(rcpt)}
                    className="w-full py-1.5 bg-slate-100 hover:bg-teal-50 text-teal-800 font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View & Download Official Receipt</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Digital Health Locker */}
      {activeTab === 'locker' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-emerald-950">ABDM-Compliant Digital Health Records Storage</h4>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Encrypted storage for lab reports, e-prescriptions, and discharge summaries.
              </p>
            </div>
            <label className="cursor-pointer px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Document</span>
              <input type="file" onChange={handleUploadRecord} className="hidden" accept=".pdf,.jpg,.png" />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {healthRecords.map((rec) => (
              <div key={rec.id} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-2">
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded uppercase">
                  {rec.type}
                </span>
                <h5 className="text-xs font-bold text-slate-900">{rec.title}</h5>
                <p className="text-[11px] text-slate-500">📍 {rec.hospitalOrLab}</p>
                <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-100">
                  <span>Size: {rec.fileSize}</span>
                  <span className="tabular-nums">{rec.date}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => alert(`Opening ${rec.fileName} in secure medical viewer.`)}
                    className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold"
                  >
                    View File
                  </button>
                  <button
                    onClick={() => alert(`Downloading encrypted copy of ${rec.fileName}`)}
                    className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded"
                    title="Download document"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Family Health Dashboard */}
      {activeTab === 'family' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">Family Health Circle</h4>
            <button
              onClick={() => setShowAddFam(!showAddFam)}
              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </div>

          {showAddFam && (
            <form onSubmit={handleAddFamilyMember} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h5 className="text-xs font-bold text-slate-900">Add Dependent Profile</h5>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newFamName}
                  onChange={(e) => setNewFamName(e.target.value)}
                  required
                  className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                />
                <select
                  value={newFamRel}
                  onChange={(e) => setNewFamRel(e.target.value as any)}
                  className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="Parent">Parent</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                </select>
                <input
                  type="number"
                  placeholder="Age"
                  value={newFamAge}
                  onChange={(e) => setNewFamAge(parseInt(e.target.value) || 0)}
                  className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                />
                <select
                  value={newFamBlood}
                  onChange={(e) => setNewFamBlood(e.target.value)}
                  className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="A+">A+</option>
                  <option value="B+">B+</option>
                  <option value="O+">O+</option>
                  <option value="AB+">AB+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddFam(false)}
                  className="px-3 py-1.5 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-700 text-white rounded-lg text-xs font-semibold"
                >
                  Save Dependent
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {familyMembers.map((fam) => (
              <div key={fam.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{fam.fullName}</h5>
                    <span className="text-[11px] text-teal-700 font-semibold">{fam.relationship} · {fam.age} yrs</span>
                  </div>
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-mono">
                    Blood: {fam.bloodGroup}
                  </span>
                </div>

                {fam.existingConditions && (
                  <p className="text-[11px] text-slate-500">Conditions: {fam.existingConditions}</p>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${fam.emergencyContact ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'}`}>
                    {fam.emergencyContact ? 'Primary Emergency Contact' : 'Standard Dependent'}
                  </span>
                  <button
                    onClick={onBookNew}
                    className="text-xs text-teal-700 font-semibold hover:text-teal-900"
                  >
                    Book for {fam.fullName.split(' ')[0]}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: ABHA Card */}
      {activeTab === 'abha' && (
        <div className="max-w-md mx-auto p-6 bg-gradient-to-tr from-slate-900 to-teal-950 text-white rounded-2xl shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-teal-800/60 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-teal-400">
                National Health Authority (NHA)
              </span>
              <h4 className="text-sm font-extrabold tracking-tight">Ayushman Bharat Health Account</h4>
            </div>
            <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-400 flex items-center justify-center font-bold text-xs">
              ABHA
            </div>
          </div>

          <div className="flex items-center gap-4 py-2">
            <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
              <QrCode className="w-10 h-10 text-teal-300" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-white">{currentUser?.name || 'Citizen Healthcare Card'}</h5>
              <span className="text-xs font-mono text-teal-300 block tracking-wider mt-0.5">
                ABHA ID: {currentUser?.abhaId || '91-4820-1923-5812'}
              </span>
              <span className="text-[11px] text-teal-200 block">PHR: {currentUser?.email ? currentUser.email.split('@')[0] + '@abdm' : 'citizen@abdm'}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-teal-800/60 flex justify-between text-[11px] text-teal-200">
            <span>Gender: Female · Age: 32</span>
            <span>Status: Verified Active</span>
          </div>
        </div>
      )}
    </div>
  );
};
